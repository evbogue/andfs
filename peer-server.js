import { joinRoom } from 'trystero'
import { RTCPeerConnection } from 'werift'
import { createAndFS, validHash } from './andfs.js'
import { diskStore } from './stores.js'

const manifestHash = Deno.args[0]
if (!validHash(manifestHash)) {
  throw new Error('Usage: deno task peer <manifest-hash>')
}

const store = await diskStore(Deno.env.get('ANDFS_DATA') || './andfs-data')
const files = createAndFS({ store })
const manifest = await files.manifest(manifestHash)
const allowedBlocks = new Set([manifestHash, ...manifest.chunks])
// Werift is Trystero's documented server-side connector; its constructor type
// omits the static method that Trystero's browser-oriented type requires.
const rtcPolyfill = /** @type {typeof globalThis.RTCPeerConnection} */ (
  /** @type {unknown} */ (RTCPeerConnection)
)
const room = joinRoom(
  { appId: 'andfs-peer-demo', rtcPolyfill },
  'andfs-peer-demo-room',
)
const block = room.makeAction('andfs-block-v1', {
  kind: 'request',
  onRequest: async (id) => {
    if (!validHash(id) || !allowedBlocks.has(id)) return null
    const bytes = await store.get(id)
    return bytes && bytes.length <= 1024 * 1024 ? bytes : null
  },
})
room.makeAction('andfs-share-v1', {
  kind: 'request',
  onRequest: async (data, { peerId, signal }) => {
    const id = data && typeof data === 'object' && 'manifestHash' in data
      ? data.manifestHash
      : undefined
    if (typeof id !== 'string' || !validHash(id)) {
      throw new Error('Invalid manifest hash')
    }
    const source = {
      get: (hash, options = {}) =>
        block.request(hash, {
          target: peerId,
          timeoutMs: 15000,
          signal: options.signal || signal,
        }),
    }
    const incoming = createAndFS({ store, sources: [source] })
    const received = await incoming.manifest(id, { signal })
    for await (const _chunk of incoming.read(id, { signal })) {
      // Reading streams each chunk through hash verification and disk caching.
    }
    allowedBlocks.add(id)
    for (const hash of received.chunks) allowedBlocks.add(hash)
    console.log(
      'Received verified file:',
      id,
      '| chunks:',
      received.chunks.length,
    )
    return { manifestHash: id, chunks: received.chunks.length }
  },
})

room.onPeerJoin = (peerId) => {
  console.log('Client connected:', peerId)
}
room.onPeerLeave = (peerId) => {
  console.log('Client disconnected:', peerId)
}

console.log('Serving AndFS manifest:', manifestHash)
console.log('Chunks:', manifest.chunks.length, '| room: andfs-peer-demo-room')
console.log('Press Ctrl-C to stop.')

await new Promise(() => {})
