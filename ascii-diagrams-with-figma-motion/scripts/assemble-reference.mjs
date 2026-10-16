import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { inflateSync } from 'node:zlib'

const [inputDirectory, stem, outputFile] = process.argv.slice(2)
if (!inputDirectory || !stem || !outputFile) {
  console.error('Usage: node assemble-reference.mjs <chunk-directory> <stem> <output.json>')
  process.exit(2)
}
const first = JSON.parse(readFileSync(join(inputDirectory, `${stem}-0.json`), 'utf8'))
if (first.encoding !== 'json-dag-zlib-base64-v1') throw new Error('Unsupported encoding')
const chunks = []
for (let index = 0; index < first.chunkCount; index++) {
  const chunk = JSON.parse(readFileSync(join(inputDirectory, `${stem}-${index}.json`), 'utf8'))
  for (const key of ['encoding', 'chunkCount', 'checksum', 'sourceLength', 'encodedLength']) {
    if (chunk[key] !== first[key]) throw new Error(`Mixed captures: ${key}`)
  }
  if (chunk.chunkIndex !== index) throw new Error('Chunk index mismatch')
  chunks.push(chunk.data)
}
const encoded = chunks.join('')
if (encoded.length !== first.encodedLength) throw new Error('Incomplete encoded data')
const packed = JSON.parse(inflateSync(Buffer.from(encoded, 'base64')).toString('utf8'))
const memo = new Map()
const resolving = new Set()
function expand(node) {
  if (Object.hasOwn(node, 'literal')) return node.literal
  if (Object.hasOwn(node, 'array')) return node.array.map(expand)
  if (Object.hasOwn(node, 'object'))
    return Object.fromEntries(node.object.map(([k, v]) => [k, expand(v)]))
  const index = node.ref
  if (!Number.isInteger(index) || index < 0 || index >= packed.entries.length) {
    throw new Error('Invalid dictionary reference')
  }
  if (memo.has(index)) return memo.get(index)
  if (resolving.has(index)) throw new Error('Cyclic dictionary reference')
  resolving.add(index)
  const value = expand(packed.entries[index])
  resolving.delete(index)
  memo.set(index, value)
  return value
}
const payload = expand(packed.root)
const source = JSON.stringify(payload).replace(
  /[\u007f-\uffff]/g,
  (char) => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')
)
if (source.length !== first.sourceLength) throw new Error('Decoded length mismatch')
let checksum = 2166136261
for (let i = 0; i < source.length; i++) {
  checksum = Math.imul(checksum ^ source.charCodeAt(i), 16777619) >>> 0
}
if (checksum.toString(16) !== first.checksum) throw new Error('Decoded checksum mismatch')
if (payload.nodes.length !== first.nodeCount) throw new Error('Node count mismatch')
mkdirSync(dirname(outputFile), { recursive: true })
writeFileSync(outputFile, JSON.stringify(payload, null, 2) + '\n')
console.log(`${stem}: restored ${payload.nodes.length} nodes; checksum verified`)
