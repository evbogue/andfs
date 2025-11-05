import { apds } from 'https://esm.sh/gh/evbogue/apds/apds.js'
import { encode, decode } from 'https://esm.sh/gh/evbogue/anproto/lib/base64.js'

export const SIZE = 60000

export const add = async (file, onProgress) => {
  const bytes = file instanceof Uint8Array
    ? file
    : new Uint8Array(await file.arrayBuffer())

  const chunks = []
  for (let i = 0; i < bytes.length; i += SIZE) {
    chunks.push(bytes.slice(i, i + SIZE))
  }

  const chunkHashes = []
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const chunkBase64 = encode(chunk)
    const h = await apds.make(chunkBase64)
    chunkHashes.push(h)
    if (onProgress) onProgress({ step: 'upload', index: i + 1, total: chunks.length })
  }

  const concatenatedHashes = chunkHashes.join('')
  const filehash = await apds.make(concatenatedHashes)

  async function createParts(concatHashes) {
    const parts = []
    let offset = 0
    const HASH_LENGTH = 44

    while (offset < concatHashes.length) {
      const slice = concatHashes.slice(offset, offset + 800 * HASH_LENGTH)
      const part = { concatenatedHashes: slice }
      const yamlText = await apds.createYaml(part)
      const partHash = await apds.make(yamlText)
      part.hash = partHash
      parts.push(part)
      offset += 800 * HASH_LENGTH
    }

    for (let i = 0; i < parts.length - 1; i++) {
      parts[i].next = parts[i + 1].hash
    }

    return parts
  }

  // Create YAML manifest
  const rootManifest = { hash: filehash }
  const yamlText = await apds.createYaml({ concatenatedHashes })

  if (yamlText.length > SIZE) {
    const parts = await createParts(concatenatedHashes)
    rootManifest.next = parts[0].hash
    rootManifest.parts = parts
  } else {
    rootManifest.concatenatedHashes = concatenatedHashes
  }

  // Final YAML manifest text
  const manifestYaml = await apds.createYaml(rootManifest)
  // Store manifest in apds
  const manifestHash = await apds.make(manifestYaml)

  // Output to terminal
  console.log('📄 Manifest Hash:', manifestHash)
  console.log('🧾 Manifest YAML:\n', manifestYaml)

  return { manifestHash, manifestYaml }
}

export const get = async (manifestInput, onProgress) => {
  const HASH_LENGTH = 44
  const chunks = []

  const manifest = typeof manifestInput === 'string'
    ? await apds.parseYaml(manifestInput)
    : manifestInput

  async function loadHashes(m) {
    if (m.concatenatedHashes) {
      const hashes = []
      for (let i = 0; i < m.concatenatedHashes.length; i += HASH_LENGTH) {
        hashes.push(m.concatenatedHashes.slice(i, i + HASH_LENGTH))
      }

      for (let i = 0; i < hashes.length; i++) {
        const h = hashes[i]
        const chunkBase64 = await apds.get(h)
        if (!chunkBase64) throw new Error(`Missing chunk: ${h}`)
        const chunk = decode(chunkBase64)
        chunks.push(chunk)
        if (onProgress) onProgress({ step: 'recreate', index: i + 1, total: hashes.length })
      }
    }

    if (m.next) {
      const nextYamlText = await apds.get(m.next)
      if (!nextYamlText) throw new Error(`Missing linked manifest: ${m.next}`)
      const nextManifest = await apds.parseYaml(nextYamlText)
      await loadHashes(nextManifest)
    }
  }

  await loadHashes(manifest)

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}

