import { createAndFS, hash, MAX_MANIFEST, validHash } from './andfs.js'

async function bodyBytes(request, limit) {
  const reader = request.body?.getReader()
  if (!reader) return new Uint8Array()
  const parts = []
  let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.length
      if (size > limit) throw new Error('Body too large')
      parts.push(value)
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
  const result = new Uint8Array(size)
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }
  return result
}

export function httpSource(base) {
  const root = base.replace(/\/$/, '')
  return {
    /** @param {string} id @param {{ signal?: AbortSignal }} [options] */
    async get(id, { signal } = {}) {
      const response = await fetch(root + '/blobs/' + id, { signal })
      if (!response.ok) throw new Error('HTTP ' + response.status)
      return new Uint8Array(await response.arrayBuffer())
    },
  }
}

export function createHandler({ store }) {
  const files = createAndFS({ store })
  return async (request) => {
    const url = new URL(request.url)
    const match = /^\/(blobs|media)\/([A-Za-z0-9_-]{43})$/.exec(url.pathname)
    if (!match) return null
    const [, kind, id] = match
    try {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response(null, { status: 405 })
      }
      if (kind === 'blobs') {
        const bytes = await files.getBlock(id, { maxBytes: MAX_MANIFEST })
        return new Response(request.method === 'HEAD' ? null : bytes, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(bytes.length),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
      const manifest = await files.manifest(id)
      let start = 0
      let end = manifest.size
      let status = 200
      const headers = new Headers({
        'Accept-Ranges': 'bytes',
        'Content-Length': String(end),
        'Content-Type': url.searchParams.get('mime') ||
          'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
      })
      const range = request.headers.get('range')
      if (range) {
        const matchRange = /^bytes=(\d*)-(\d*)$/.exec(range)
        if (!matchRange) {
          return new Response(null, {
            status: 416,
            headers: { 'Content-Range': 'bytes */' + manifest.size },
          })
        }
        if (matchRange[1]) start = Number(matchRange[1])
        else start = Math.max(0, manifest.size - Number(matchRange[2]))
        if (matchRange[2]) {
          end = Math.min(manifest.size, Number(matchRange[2]) + 1)
        }
        if (
          !Number.isSafeInteger(start) || !Number.isSafeInteger(end) ||
          start < 0 || start >= end || end > manifest.size
        ) {
          return new Response(null, {
            status: 416,
            headers: { 'Content-Range': 'bytes */' + manifest.size },
          })
        }
        status = 206
        headers.set(
          'Content-Range',
          'bytes ' + start + '-' + (end - 1) + '/' + manifest.size,
        )
        headers.set('Content-Length', String(end - start))
      }
      return new Response(
        request.method === 'HEAD' ? null : files.read(id, { start, end }),
        { status, headers },
      )
    } catch (error) {
      return new Response(error.message, { status: 404 })
    }
  }
}

export { bodyBytes, hash, validHash }
