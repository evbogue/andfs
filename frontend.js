import { h } from 'https://esm.sh/gh/evbogue/apds@e091911502c46feaff8f18ec9865c23f42a7dc40/lib/h.js'
import { apds } from 'https://esm.sh/gh/evbogue/apds@e091911502c46feaff8f18ec9865c23f42a7dc40/apds.js'
import { add, get, parseManifest } from './andfs.js'

export async function andfsUploader(appname) {
  await apds.start(appname)

  const button = h('button', { innerText: 'Upload Media' })
  const input = h('input', {
    type: 'file',
    accept: 'image/*,video/*,audio/*,text/*,text/markdown',
    multiple: true,
    style: 'display:none;',
  })

  const output = h('div')

  button.addEventListener('click', () => input.click())

  input.addEventListener('change', async (e) => {
    const files = e.target.files

    for (const file of files) {
      const url = URL.createObjectURL(file)
      let mediaEl

      if (file.type.startsWith('image/')) {
        mediaEl = h('img', {
          src: url,
          style: 'max-width:300px;display:block;',
        })
      } else if (file.type.startsWith('video/')) {
        mediaEl = h('video', {
          src: url,
          controls: true,
          style: 'max-width:300px;display:block;',
        })
      } else if (file.type.startsWith('audio/')) {
        mediaEl = h('audio', { src: url, controls: true })
      } else if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        const text = await file.text()
        mediaEl = h('pre', { innerText: text.slice(0, 500) })
      } else {
        mediaEl = h('div', { innerText: `Unsupported file type: ${file.type}` })
      }

      const uploadProgress = h('progress', {
        value: 0,
        max: 100,
        style: 'display:block;width:300px;margin:5px 0;',
      })
      output.appendChild(uploadProgress)

      const manifest = await add(file, ({ index, total }) => {
        uploadProgress.value = Math.floor((index / total) * 100)
      })

      const { size, chunks } = parseManifest(manifest.manifest)
      const hashField = h('input', {
        type: 'text',
        value: manifest.manifestHash,
        readOnly: true,
        style:
          'display:block;width:100%;box-sizing:border-box;font-family:monospace;',
      })
      const copyStatus = h('span')
      copyStatus.setAttribute('role', 'status')
      const copyButton = h('button', { innerText: 'Copy hash' })
      copyButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(manifest.manifestHash)
          copyStatus.innerText = ' Hash copied.'
        } catch {
          hashField.focus()
          hashField.select()
          copyStatus.innerText =
            ' Copy unavailable. The hash is selected; copy it manually.'
        }
      })
      const details = h('details', [
        h('summary', { innerText: 'Chunk hashes' }),
        chunks.length
          ? h(
            'ol',
            chunks.map((chunk) => h('li', [h('code', { innerText: chunk })])),
          )
          : h('p', { innerText: 'This file is empty and has no chunks.' }),
      ])
      const info = h('div', [
        h('label', [h('strong', { innerText: 'Manifest hash' }), hashField]),
        copyButton,
        copyStatus,
        h('p', {
          innerText:
            `${size.toLocaleString()} bytes · ${chunks.length.toLocaleString()} ${
              chunks.length === 1 ? 'chunk' : 'chunks'
            }`,
        }),
        details,
      ])

      const recreateBtn = h('button', { innerText: 'Recreate File' })
      recreateBtn.addEventListener('click', async () => {
        const recreateProgress = h('progress', {
          value: 0,
          max: 100,
          style: 'display:block;width:300px;margin:5px 0;',
        })
        output.appendChild(recreateProgress)

        const bytes = await get(manifest, ({ index, total }) => {
          recreateProgress.value = Math.floor((index / total) * 100)
        })

        const blob = new Blob([bytes], { type: file.type })
        const recreatedUrl = URL.createObjectURL(blob)

        const reEl = file.type.startsWith('image/')
          ? h('img', {
            src: recreatedUrl,
            style: 'max-width:300px;display:block;',
          })
          : file.type.startsWith('video/')
          ? h('video', {
            src: recreatedUrl,
            controls: true,
            style: 'max-width:300px;display:block;',
          })
          : file.type.startsWith('audio/')
          ? h('audio', { src: recreatedUrl, controls: true })
          : h('pre', { innerText: await blob.text() })

        output.appendChild(
          h('div', [
            h('h4', { innerText: 'Recreated:' }),
            recreateProgress,
            reEl,
          ]),
        )
      })

      output.appendChild(h('div', [
        h('h3', { innerText: file.name }),
        h('br'),
        mediaEl,
        uploadProgress,
        info,
        recreateBtn,
      ]))
    }
  })

  return h('div', [
    button,
    input,
    output,
  ])
}
