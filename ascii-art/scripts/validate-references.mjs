import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const library = resolve(skillRoot, 'references')
const index = JSON.parse(readFileSync(resolve(library, 'index.json'), 'utf8'))
let totalNodes = 0
let totalKeyframes = 0
function keyframes(value) {
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, item]) =>
    key === 'keyframes' && Array.isArray(item) ? item : keyframes(item)
  )
}
for (const reference of index.references) {
  const bytes = readFileSync(resolve(library, reference.payload.path))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), reference.payload.sha256)
  const payload = JSON.parse(bytes)
  assert.equal(payload.schemaVersion, 1)
  assert.equal(payload.capture.truncated, false)
  assert.deepEqual(payload.capture.errors, [])
  assert.equal(payload.capture.nodeCount, payload.nodes.length)
  assert.equal(payload.source.frameId, reference.source.frameId)
  const nodes = new Map(payload.nodes.map((node) => [node.id, node]))
  assert.equal(nodes.size, payload.nodes.length, 'Node IDs must be unique')
  const visited = new Set()
  function visit(id) {
    assert.ok(nodes.has(id), `Missing node ${id}`)
    assert.ok(!visited.has(id), `Repeated child or cycle at ${id}`)
    visited.add(id)
    const node = nodes.get(id)
    for (const childId of node.childIds) {
      assert.equal(nodes.get(childId)?.parentId, id)
      visit(childId)
    }
    if (node.type === 'TEXT') {
      assert.equal(typeof node.text.characters, 'string')
      let position = 0
      for (const segment of node.text.segments) {
        assert.equal(segment.start, position, `Gap in text ranges: ${id}`)
        assert.equal(segment.characters, node.text.characters.slice(segment.start, segment.end))
        position = segment.end
      }
      assert.equal(position, node.text.characters.length, `Incomplete text ranges: ${id}`)
    }
    assert.ok(Array.isArray(node.motion.timelines))
    assert.ok(node.motion.manualKeyframeTracks)
    for (const frame of keyframes(node.motion.manualKeyframeTracks)) {
      assert.ok(Number.isFinite(frame.timelinePosition))
      assert.ok(frame.timelinePosition >= 0)
      assert.ok(frame.value && frame.easing)
      totalKeyframes++
    }
  }
  visit(payload.source.frameId)
  assert.equal(visited.size, nodes.size, 'Every captured node must be reachable')
  const png = readFileSync(resolve(library, reference.image.path))
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  assert.equal(createHash('sha256').update(png).digest('hex'), reference.image.sha256)
  assert.equal(png.readUInt32BE(16), reference.image.width)
  assert.equal(png.readUInt32BE(20), reference.image.height)
  totalNodes += nodes.size
  console.log(`${reference.id}: complete tree, text ranges, tracks, and image verified`)
}
console.log(
  `Validated ${index.references.length} references, ${totalNodes} nodes, ${totalKeyframes} manual keyframes`
)
