import { h } from 'https://esm.sh/gh/evbogue/apds/lib/h.js'
import { apds } from 'https://esm.sh/gh/evbogue/apds/apds.js'
import { make, recreate } from './andfs.js'

export async function andfsUploader(appname) {
  await apds.start(appname)

  const container = h('div')
  const button = h('button', { innerText: 'Upload Media' })
  const input = h('input', {
    type: 'file',
    accept: 'image/*,video/*,audio/*,text/*,text/markdown',
    multiple: true,
    style: 'display:none;'
  })
  const output = h('div', [])

  button.addEventListener('click', () => input.click())

  input.addEventListener('change', async (e) => {
    output.innerHTML = ''
    const files = e.target.files

    for (const file of files) {
      const url = URL.createObjectURL(file)
      let mediaEl

      if (file.type.startsWith('image/')) {
        mediaEl = h('img', { src: url, style: 'max-width:300px;display:block;' })
      } else if (file.type.startsWith('video/')) {
        mediaEl = h('video', { src: url, controls: true, style: 'max-width:300px;display:block;' })
      } else if (file.type.startsWith('audio/')) {
        mediaEl = h('audio', { src: url, controls: true })
      } else if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        const text = await file.text()
        mediaEl = h('pre', { innerText: text.slice(0, 500) })
      } else {
        mediaEl = h('div', { innerText: `Unsupported file type: ${file.type}` })
      }

      // Progress bar for upload
      const uploadProgress = h('progress', { value: 0, max: 100, style: 'display:block;width:300px;margin:5px 0;' })
      output.appendChild(uploadProgress)

      const manifest = await make(file, ({ step, index, total }) => {
        uploadProgress.value = Math.floor((index / total) * 100)
      })

      const info = h('pre', { innerText: JSON.stringify(manifest, null, 2) })

      const recreateBtn = h('button', { innerText: 'Recreate File' })
      recreateBtn.addEventListener('click', async () => {
        const recreateProgress = h('progress', { value: 0, max: 100, style: 'display:block;width:300px;margin:5px 0;' })
        output.appendChild(recreateProgress)

        const bytes = await recreate(manifest, ({ step, index, total }) => {
          recreateProgress.value = Math.floor((index / total) * 100)
        })

        const blob = new Blob([bytes], { type: file.type })
        const recreatedUrl = URL.createObjectURL(blob)

        const reEl =
          file.type.startsWith('image/') ? h('img', { src: recreatedUrl, style: 'max-width:300px;display:block;' })
        : file.type.startsWith('video/') ? h('video', { src: recreatedUrl, controls: true, style: 'max-width:300px;display:block;' })
        : file.type.startsWith('audio/') ? h('audio', { src: recreatedUrl, controls: true })
        : h('pre', { innerText: await blob.text() })

        output.appendChild(h('div', [h('h4', { innerText: 'Recreated:' }), recreateProgress, reEl]))
      })

      output.appendChild(h('div', [
        h('h3', { innerText: file.name }),
        mediaEl,
        h('h4', { innerText: `File hash: ${manifest.hash}` }),
        uploadProgress,
        info,
        recreateBtn
      ]))
    }
  })

  container.appendChild(button)
  container.appendChild(input)
  container.appendChild(output)
  return container
}

