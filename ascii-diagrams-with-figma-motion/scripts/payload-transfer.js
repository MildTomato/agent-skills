// Lossless transport for Figma MCP's bounded text responses.
// Stored reference artifacts are ordinary, fully expanded JSON.
// Supply a standard zlib encoder, for example pako.deflate.
function encodePayloadChunk(payload, deflate, chunkIndex = 0, chunkSize = 18000) {
  const input = JSON.stringify(payload).replace(
    /[\u007f-\uffff]/g,
    (char) => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')
  )
  // Intern repeated objects and long strings before compression. Decoding
  // restores the exact tree; no nodes, properties, or keyframes are removed.
  const entries = []
  const known = new Map()
  function intern(value) {
    const serialized = JSON.stringify(value)
    if (
      serialized.length < 24 ||
      value === null ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    )
      return { literal: value }
    if (known.has(serialized)) return { ref: known.get(serialized) }
    let entry
    if (Array.isArray(value)) entry = { array: value.map(intern) }
    else if (typeof value === 'object') {
      entry = { object: Object.entries(value).map(([key, item]) => [key, intern(item)]) }
    } else entry = { literal: value }
    const index = entries.length
    entries.push(entry)
    known.set(serialized, index)
    return { ref: index }
  }
  const root = intern(JSON.parse(input))
  const packed = JSON.stringify({ root, entries })
  const bytes = deflate(packed, { level: 9 })
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let encoded = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const value = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0)
    encoded += alphabet[(value >> 18) & 63] + alphabet[(value >> 12) & 63]
    encoded += i + 1 < bytes.length ? alphabet[(value >> 6) & 63] : '='
    encoded += i + 2 < bytes.length ? alphabet[value & 63] : '='
  }
  let checksum = 2166136261
  for (let i = 0; i < input.length; i++) {
    checksum = Math.imul(checksum ^ input.charCodeAt(i), 16777619) >>> 0
  }
  const chunkCount = Math.ceil(encoded.length / chunkSize)
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0 || chunkIndex >= chunkCount) {
    throw new Error('Payload chunk index out of range')
  }
  return {
    encoding: 'json-dag-zlib-base64-v1',
    chunkIndex,
    chunkCount,
    checksum: checksum.toString(16),
    sourceLength: input.length,
    encodedLength: encoded.length,
    nodeCount: payload.capture.nodeCount,
    errors: payload.capture.errors,
    data: encoded.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize),
  }
}
