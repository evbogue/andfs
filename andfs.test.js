import { assert, assertEquals, assertRejects } from 'jsr:@std/assert'
import { SIZE, createAndFS, hash, parseManifest } from './andfs.js'
import { memoryStore } from './stores.js'

const bytes = length => Uint8Array.from({ length }, (_, i) => i % 251)

Deno.test('uploads, verifies, and reconstructs across chunk boundaries', async () => {
  const store = memoryStore()
  const fs = createAndFS({ store })
  const source = bytes(SIZE * 2 + 17)
  const result = await fs.add(source)
  assertEquals((await fs.get(result)).length, source.length)
  assertEquals([...await fs.get(result)], [...source])
  assertEquals((await fs.manifest(result)).chunks.length, 3)
})

Deno.test('reads a bounded range without reconstructing the whole file', async () => {
  const fs = createAndFS({ store: memoryStore() })
  const source = bytes(SIZE + 100)
  const result = await fs.add(source)
  const reader = fs.read(result.manifestHash, { start: SIZE - 4, end: SIZE + 8 }).getReader()
  const parts = []
  while (true) { const next = await reader.read(); if (next.done) break; parts.push(...next.value) }
  assertEquals(parts, [...source.slice(SIZE - 4, SIZE + 8)])
})

Deno.test('rejects corruption from local storage and accepts a verified source', async () => {
  const good = memoryStore()
  const fs = createAndFS({ store: good })
  const result = await fs.add(bytes(80))
  const manifest = await fs.manifest(result.manifestHash)
  const original = await good.get(manifest.chunks[0])
  await good.put(manifest.chunks[0], bytes(80))
  const source = { get: async id => id === manifest.chunks[0] ? original : undefined }
  const recovered = createAndFS({ store: good, sources: [source] })
  assertEquals([...await recovered.get(result.manifestHash)], [...bytes(80)])
})

Deno.test('rejects malformed manifests', async () => {
  await assertRejects(async () => parseManifest(new TextEncoder().encode('{}')))
  assertEquals(typeof await hash(new Uint8Array()), 'string')
})
