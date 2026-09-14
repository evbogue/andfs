# AndFS — And File System

Store bytes in chunks, identify a file with one hash, and verify its contents when reading it back.

AndFS is an early JavaScript prototype for browsers and Deno. It splits files into 256 KiB chunks, hashes each chunk with SHA-256, and stores an ordered JSON manifest under its own hash. Hashes use URL-safe base64 without padding. Filenames and MIME types are not part of the content identity.

**Working today:** local browser add/recreate, a streaming core, storage adapters, and a development server that reads blocks from disk. **Still planned:** browser-to-server upload, a dependable CLI, and an agreed [anproto](https://github.com/evbogue/anproto) reference format. See [WORK_ORDER.md](WORK_ORDER.md) for the implementation sequence.

## Try the browser demo

Use **Deno 2.7.13**, the version used by CI. From this repository's root:

```sh
deno task serve
```

Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

1. Click **Upload Media** and choose a file.
2. See its filename, preview, manifest hash, byte size, and chunk count.
3. Use **Copy hash**, or expand **Chunk hashes** to inspect the individual hashes.
4. Click **Recreate File** to retrieve and verify the bytes and display the result.

The demo accepts images, video, audio, and text files. Its upload button adds content to browser-local storage through the legacy APDS adapter. **It does not upload content to the server.** The page does not yet offer retrieval by pasting a hash, or a catalog of previously added files after reload. Recreating a file currently buffers the whole result in memory.

If you see another project's page, check the listening process and the URL before stopping any server. `localhost` and `127.0.0.1` are different browser origins: an old cache or service worker on one can show stale content, and their browser storage is separate.

The development server binds to all interfaces on port 8000 and serves the repository directory, including paths that may contain source or stored data. It has no authentication or production isolation. Run it only in a trusted development environment. Dependencies load from external CDNs; offline startup is not guaranteed.

## Browser storage and server storage are separate

| Path                    | Where bytes go               | Current behavior                                                             |
| ----------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| Demo's **Upload Media** | Browser-local APDS storage   | Add and recreate in that browser origin                                      |
| `browserStore(name)`    | IndexedDB                    | Explicit store for your own `createAndFS()` instance                         |
| `memoryStore()`         | Process memory               | Temporary byte storage                                                       |
| `diskStore(directory)`  | `directory/blocks/`          | Store and retrieve bytes on disk                                             |
| `httpSource(baseURL)`   | Reads a remote HTTP endpoint | Core verifies downloaded blocks and caches accepted bytes in its local store |

Copying a manifest hash does not transfer its blocks. Another device needs a source containing both the manifest and its chunks before it can retrieve the file. An HTTP destination/upload adapter is not implemented yet.

## Use the core

Run this as a JavaScript module in Deno from the repository root, or adapt the relative imports for a browser module:

```js
import { createAndFS, parseManifest } from './andfs.js'
import { memoryStore } from './stores.js'

const files = createAndFS({ store: memoryStore() })
const added = await files.add(new TextEncoder().encode('Hello, AndFS!'))

console.log(added.manifestHash)
console.log(parseManifest(added.manifest)) // size, chunkSize, and ordered chunk hashes

const restored = await files.get(added.manifestHash)
console.log(new TextDecoder().decode(restored))

// Byte ranges use an inclusive start and exclusive end.
const stream = files.read(added.manifestHash, { start: 0, end: 5 })
console.log(await new Response(stream).text()) // Hello
```

`add()` accepts a `Blob`/`File`, `Uint8Array`, `ArrayBuffer`, or readable byte stream. The current format allows up to 16,384 chunks (4 GiB). `read()` returns a verified `ReadableStream`; `get()` collects the full file into a `Uint8Array`. `manifest(hash)` reads the parsed manifest. Operations accept options such as `signal`; add/read also accept progress callbacks, whose reporting still needs the corrections tracked in A07.

The result of `add()` includes:

- `manifestHash`: the file's retrieval identifier.
- `manifest`: a `Uint8Array` containing the serialized manifest JSON. Displaying this array as JSON produces numeric byte entries; these are not chunk identifiers.
- `manifestYaml`: a legacy field containing **JSON text**, despite its name.

Use `parseManifest(added.manifest)` to inspect chunk hashes. The demo displays hashes and a short summary instead of dumping these internal return fields.

Missing or corrupt content causes reads to fail if no configured source supplies verified bytes. Error types, source limits, cancellation edge cases, and precise adapter contracts are still being hardened. The existing legacy `add()`/`get()` exports share APDS state; use explicit `createAndFS({ store })` instances for new integrations. Separating the legacy global state is planned in A05.

## Try disk storage and HTTP reads

The server opens `./andfs-data` by default. Set `ANDFS_DATA` to use a different directory. The directory is ignored by Git.

To seed the default server store with a small file, run this from the repository root:

```sh
deno eval --frozen '
import { createAndFS } from "./andfs.js"
import { diskStore } from "./stores.js"
const files = createAndFS({ store: await diskStore("./andfs-data") })
const added = await files.add(new TextEncoder().encode("Hello from the server!"))
console.log(added.manifestHash)
'
```

With `deno task serve` running, paste the printed hash below:

```sh
MANIFEST_HASH='paste-the-printed-hash-here'
curl "http://127.0.0.1:8000/media/$MANIFEST_HASH"
curl "http://127.0.0.1:8000/blobs/$MANIFEST_HASH"
```

The first response reconstructs the text; the second returns its manifest JSON.

- `GET` and `HEAD /blobs/:hash` read a verified block.
- `GET` and `HEAD /media/:manifestHash` read a file, with basic byte-range handling.
- Write endpoints, missing-block negotiation, authentication, and resource limits are planned in Milestone 2. HTTP error mapping and range edge cases are not yet conformant; the current handler maps caught errors to `404`.

Your own client can combine `createAndFS({ store, sources: [httpSource(baseURL)] })` with `httpSource` from `http.js`. The shipped browser demo does not configure that source.

## CLI status

`cli.js` is a legacy APDS-based prototype with `add` and `get` branches, including experimental directory handling. It buffers files, prints progress and results together, and expects a saved manifest-tree JSON file for restore. Its add output is not a dependable machine-readable input for get. Directory restore is not hardened against hostile paths.

The documented disk-store example above is the current server demonstration. A streaming CLI with `inspect`, `verify`, `push`, and `pull` is planned; those commands do not exist yet.

## Development

```sh
deno task check
```

This checks formatting, lints, type-checks all root JavaScript modules, and runs tests using a frozen lockfile. It does not rewrite source or the lockfile. `deno task fmt` applies formatting; `lint`, `typecheck`, and `test` can run separately. First-time dependency downloads need internet access; the current tests need no runtime network or filesystem permissions.

JavaScript checking currently permits implicit types and untyped catch variables. A04 will tighten public contracts. Direct URL imports are allowed for browser compatibility, and intentional async APIs use explained local lint exceptions to preserve promise/rejection behavior.

Direct dependencies are pinned, with transitive dependencies recorded in `deno.lock`. For an intentional update, edit the version, run `deno check --frozen=false *.js`, review the lockfile, then run the full check. Browsers do not enforce Deno's lockfile on upstream CDN imports.

CI runs `deno task check`. The suite currently covers core round trips, ranges, malformed manifests, and async compatibility. Its existing corruption-recovery test needs correction, as tracked in A08. Browser upload/copy/recreate has been manually smoke-tested; automated browser, HTTP, CLI, and full cross-device coverage remain on the work board. Passing checks is not a claim of production readiness.

## Project map

| File                        | Purpose                                                                     |
| --------------------------- | --------------------------------------------------------------------------- |
| `andfs.js`                  | Chunking, manifests, verification, streaming, and legacy APDS compatibility |
| `stores.js`                 | Memory, IndexedDB, and disk adapters                                        |
| `http.js`                   | HTTP read source and request handler                                        |
| `serve.js`                  | Development assets and disk-backed HTTP reads                               |
| `frontend.js`, `index.html` | Browser demo                                                                |
| `cli.js`                    | Legacy CLI prototype                                                        |
| `andfs.test.js`             | Current automated tests                                                     |
| `WORK_ORDER.md`             | Milestones, acceptance checks, and stop points                              |
| `AGENTS.md`                 | Contributor workflow and guardrails                                         |

Licensed under the [MIT License](LICENSE).
