import { apds } from 'https://esm.sh/gh/evbogue/apds/apds.js'

export const CHUNK_SIZE = 60000
export const MANIFEST_SIZE_LIMIT = 60000

// Convert Uint8Array to string (1 char per byte)
function uint8ToStr(bytes) {
  return Array.from(bytes, b => String.fromCharCode(b)).join('')
}

// Convert string back to Uint8Array
function strToUint8(str) {
  const bytes = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i)
  }
  return bytes
}

export async function make(file, onProgress) {
  const bytes = file instanceof Uint8Array
    ? file
    : new Uint8Array(await file.arrayBuffer())

  const chunks = []
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    chunks.push(bytes.slice(i, i + CHUNK_SIZE))
  }

  const chunkHashes = []
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const chunkStr = uint8ToStr(chunk)
    const h = await apds.make(chunkStr)
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

  const rootManifest = { hash: filehash }
  const yamlText = await apds.createYaml({ concatenatedHashes })

  if (yamlText.length > MANIFEST_SIZE_LIMIT) {
    const parts = await createParts(concatenatedHashes)
    rootManifest.next = parts[0].hash
    rootManifest.parts = parts
  } else {
    rootManifest.concatenatedHashes = concatenatedHashes
  }

  return rootManifest
}

export async function recreate(manifest, onProgress) {
  const HASH_LENGTH = 44
  const chunks = []

  async function loadHashes(m) {
    if (m.concatenatedHashes) {
      const hashes = []
      for (let i = 0; i < m.concatenatedHashes.length; i += HASH_LENGTH) {
        hashes.push(m.concatenatedHashes.slice(i, i + HASH_LENGTH))
      }

      for (let i = 0; i < hashes.length; i++) {
        const h = hashes[i]
        const chunkStr = await apds.get(h)
        if (!chunkStr) throw new Error(`Missing chunk: ${h}`)
        const chunk = strToUint8(chunkStr)
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

