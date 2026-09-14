import { assert, assertEquals, assertRejects, assertThrows } from '@std/assert'
import { apdsAndFS, createAndFS, hash, parseManifest, SIZE } from './andfs.js'
import { memoryStore } from './stores.js'

const bytes = (length) => Uint8Array.from({ length }, (_, i) => i % 251)

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
  const reader = fs.read(result.manifestHash, {
    start: SIZE - 4,
    end: SIZE + 8,
  }).getReader()
  const parts = []
  while (true) {
    const next = await reader.read()
    if (next.done) break
    parts.push(...next.value)
  }
  assertEquals(parts, [...source.slice(SIZE - 4, SIZE + 8)])
})

Deno.test('rejects corruption from local storage and accepts a verified source', async () => {
  const good = memoryStore()
  const fs = createAndFS({ store: good })
  const result = await fs.add(bytes(80))
  const manifest = await fs.manifest(result.manifestHash)
  const original = await good.get(manifest.chunks[0])
  await good.put(manifest.chunks[0], bytes(80))
  const source = {
    get: (id) =>
      Promise.resolve(id === manifest.chunks[0] ? original : undefined),
  }
  const recovered = createAndFS({ store: good, sources: [source] })
  assertEquals([...await recovered.get(result.manifestHash)], [...bytes(80)])
})

Deno.test('rejects malformed manifests', async () => {
  assertThrows(() => parseManifest(new TextEncoder().encode('{}')))
  assertEquals(typeof await hash(new Uint8Array()), 'string')
})

Deno.test('memory store and APDS adapter retain promise and rejection behavior', async () => {
  const store = memoryStore()
  const put = store.put('example', new Uint8Array([1]))
  assert(put instanceof Promise)
  assertEquals(await put, undefined)
  const get = store.get('example')
  const has = store.has('example')
  assert(get instanceof Promise)
  assert(has instanceof Promise)
  assertEquals(await get, new Uint8Array([1]))
  assertEquals(await has, true)

  const failure = new Error('copy failed')
  class BrokenBytes extends Uint8Array {
    /** @override @returns {never} */
    slice() {
      throw failure
    }
  }
  const rejected = store.put('broken', new BrokenBytes())
  assert(rejected instanceof Promise)
  await assertRejects(() => rejected, Error, 'copy failed')

  const textBlocks = new Map()
  const adapter = apdsAndFS({
    get: (id) => Promise.resolve(textBlocks.get(id)),
    put: (id, value) => {
      textBlocks.set(id, value)
      return Promise.resolve()
    },
  })
  assert(adapter instanceof Promise)
  const fs = await adapter
  const added = await fs.add(new Uint8Array([2, 3]))
  assertEquals(await fs.get(added), new Uint8Array([2, 3]))
})
