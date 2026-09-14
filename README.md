# 📤 AndFS

A lightweight browser and server file store built on content-addressed chunks. Files are split into 256 KiB chunks, stored by SHA-256 hash, and reconstructed with verification. Supports images, video, audio, and text/markdown files.

AndFS v1 uses one flat JSON manifest containing the file size, chunk size, and ordered chunk hashes. The manifest is itself content addressed. createAndFS accepts any byte store and optional remote sources, so the same reader works with browser storage, a server filesystem, HTTP, WebRTC, or another peer transport. read(hash, { start, end }) returns a verified ReadableStream for byte-range playback.

The legacy add() and get() exports remain available and use APDS as a text-compatible store through the apdsAndFS adapter.

---

## ✨ Features

- Chunked file storage for efficient handling of large files.  
- Reliable reconstruction of files from APDS storage.  
- Progress bars during upload (`add`) and reconstruction (`get`).  
- Multi-file support.  
- Works with images, video, audio, text, and markdown.  
- Fully frontend, no server required — all storage handled via APDS/ISO-DB.  
- Modular design: frontend can be embedded in any app with `andfsUploader(appname)`.

---

## 🚀 Installation & Running

Clone or download the repository. Start the server using **Deno**:

```bash
deno run -A serve.js
```

Open your browser to the indicated local address.

---

## 🖥️ Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AndFS Uploader Demo</title>
  <script type="module">
    import { andfsUploader } from './frontend.js'

    document.body.appendChild(await andfsUploader('myAppName'))
  </script>
</head>
<body>
</body>
</html>
```

- `appname` is a unique string identifying your app’s storage namespace in APDS/ISO-DB.  
- The uploader returns a DOM element that is appended directly to `document.body`.  

---

## 📂 File API

- **`add(file, onProgress)`** — Splits a file into chunks, stores in APDS.  
  - `file`: `File` or `Uint8Array`  
  - `onProgress`: optional callback `{ step: 'upload', index, total }`  

- **`get(manifest, onProgress)`** — Reconstructs a file from its manifest.  
  - `manifest`: returned from `make()`  
  - `onProgress`: optional callback `{ step: 'recreate', index, total }`  

---

## 🌐 Frontend API

- **`andfsUploader(appname)`** — Returns a DOM element containing upload UI.  
  ```js
  const uploader = await andfsUploader('myAppName')
  document.body.appendChild(uploader)
  ```

---

## 🗂️ Project Structure

```
/frontend.js      # Main frontend wrapper and UI
/andfs.js         # Core chunking & reconstruction module
/index.html       # Demo page
```

---
MIT
