import { serveDir } from 'https://deno.land/std@0.224.0/http/file_server.ts'
import { createHandler } from './http.js'
import { diskStore } from './stores.js'

const store = await diskStore(Deno.env.get('ANDFS_DATA') || './andfs-data')
const handler = createHandler({ store })

Deno.serve(async (r) => {
  const media = await handler(r)
  if (media) return media
  return serveDir(r, { quiet: true })
})
