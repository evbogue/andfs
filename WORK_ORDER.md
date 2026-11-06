# AndFS Ultimate Work Order

## Current priority — sustainable internet fame, 2026-10-29

Status: planned; this documentation update does not complete implementation or authorize deployment.

**Research purpose:** learn whether publishing on Ev’s own domain, with portable authorship and accessible conversations, leads to repeat recognition, relationships, collaborations, and opportunities at a sustainable cost in time.

**Shared first milestone:** a visitor reads Ev’s Wiredove posts on evbogue.com, opens a conversation, replies without leaving the site, and can reload the same conversation. The reply is also retrievable in Wiredove. Reading requires no identity setup. Validate writes with disposable identities and isolated local services before any separately authorized public release.

### Sequencing decision — 2026-11-06

Status: documentation only; implementation and compatibility acceptance remain open.

**Why this order:** publishing clients already depend on AndFS v1. Establish reproducible checks and shared byte-level evidence before changing the core. A successful local round trip alone cannot prove interoperability, and a matching hash cannot prove remote retention or retrieval. The publishing milestone needs a verified compatibility handoff; it does not require completing the standalone AndFS 1.0 roadmap.

1. **Restore the check baseline first.** The [November 4 hosted check](https://github.com/evbogue/andfs/actions/runs/41916030578) failed during frozen typechecking on an integrity mismatch for `https://cdn.jsdelivr.net/npm/idb@8/+esm`, before tests ran. Inspect the resolved dependency bytes and import chain, then use a reviewed exact version or vendored source while preserving direct browser imports. Do not simply delete the lockfile or accept a new hash without review. Keep A01's historical completion record, but record this regression separately.
   - [ ] Run `deno task check` with Deno 2.7.13 and a fresh dependency cache; confirm checking leaves tracked files unchanged and record the resulting hosted run.
2. **Complete one bounded v1 compatibility slice.** Use A02's protocol specification and independent golden fixtures, the existing A03 reference conventions, and the relevant A08 negative cases. Include empty, short UTF-8, exact-chunk and multi-chunk inputs. Inspect the actual consumers before choosing new field names or changing exports.
   - [ ] Record each consumer's exact upstream/source revision and fixture provenance; compare manifest bytes, manifest/chunk hashes and reconstructed bytes.
   - [ ] Record missing and corrupt content separately. Correct the identical-bytes repair test before citing it as corruption coverage.
3. **Hand off deliberately.** Reuse the fixtures in Wiredove and the Muse adapter; record the exact command/assertion and result for each consumer. Existing application-level media tests may supply evidence, but do not automatically close upstream tickets. Adopt upstream changes through reviewed pins rather than editing vendored copies.

**Ownership:** AndFS owns byte identity, verification and core storage/source contracts. Wiredove and the adapter own their upload authorization, signed message integration and media presentation; evbogue.com owns its retained data and gateway. Track failures at the layer that causes them.

**Stop point:** a green reproducible baseline plus the compatibility evidence/handoff, or a focused blocker with reproduction details. This slice does not close all of A02/A03/A08 unless their full acceptance criteria pass. Resume A04–A09 deliberately afterward. Hardened standalone HTTP services and the CLI remain 1.0 work; directories, lifecycle tooling, encryption, explorer polish and new transports remain later work.

### Next ticket: verify the media contract used by publishing clients

AndFS owns byte identity and verification. Wiredove owns upload authorization and media UX; evbogue.com owns its retained data and media gateway. A valid hash does not guarantee that another client can retrieve the bytes.

- [ ] Record the exact upstream revision vendored by Wiredove and compare it with this checkout before proposing changes. Preserve v1 serialization, ordered chunks, hash encoding, and metadata outside byte identity.
- [ ] Add or identify small portable fixtures for empty bytes, a small file, and a multi-chunk file, including expected manifest bytes/hash and chunk hashes. Derive expectations independently of the code under test.
- [ ] Exercise missing and corrupt manifests/chunks, reconstruction, and streaming against the appropriate current work-order tickets. Fix the known identical-bytes corruption test under A08 rather than counting it as corruption evidence.
- [ ] Hand the fixture set and verified import/API examples to Wiredove and the adapter. Application repositories own their upload, retention, range-serving, and cross-origin acceptance checks; report defects at the responsible layer.

**Acceptance:** fixtures reproduce across the consuming clients; tampered bytes and unavailable blocks have distinct outcomes; successful reconstruction matches the original bytes. Run the repository’s prescribed formatting/check commands for any implementation change and document limitations without implying network retention or production security.

**Deliver:** fixture provenance, actual tested revisions, checks, and a short compatibility note. Do not edit Wiredove’s vendored files in place; any later upstream adoption must be deliberate and pinned.

**Stop point:** the shared media fixture/compatibility handoff is complete, or a specific upstream blocker has a focused ticket. Continue the original board one ticket at a time only when needed. General CLI work, peer transport expansion, garbage collection, and protocol changes do not block the interactive timeline unless an observed defect proves otherwise.

Coordination: `../wiredove/WORK_ORDER.md`, `../muse-wiredove-adapter/REVIEW_FOLLOWUP_WORK_ORDER.md` (local workspace references).

---

> **North star:** And File System — store bytes anywhere, identify them once, and retrieve and verify them everywhere.

This work order turns AndFS from a promising prototype into a small, dependable content-addressed file system for browsers, command lines, servers, and peer transports.

## How to use this document

This plan is designed to reduce ADHD friction:

- Work from **Now** only. Do not browse the Later list while coding.
- Pick one ticket, copy its checkbox into your daily note, and finish or explicitly park it.
- Most tickets should fit in one focused session (roughly 30–120 minutes).
- Stop at the ticket's **stop point**. New ideas go in the parking lot, not into the current ticket.
- A ticket is complete only when its acceptance checks pass.
- Commit after each ticket so every session produces a visible win.
- Keep no more than one implementation ticket in progress.

Suggested session rhythm:

1. Read the current ticket only.
2. Write the smallest failing test or observable check.
3. Make it pass.
4. Run `deno task check`.
5. Update this file and commit.
6. Stop, or deliberately choose the next ticket.

## Project rules

These constraints protect the best quality of AndFS: its smallness.

- The core must not depend on APDS, HTTP, IndexedDB, the filesystem, or the UI.
- A manifest hash identifies bytes, not a filename or mutable record.
- Every block is verified before it is returned or cached.
- Full-file buffering is a convenience, never the only path.
- Metadata, directories, encryption, and pinning live above the v1 byte manifest.
- Public APIs receive examples, tests, and documented failure behavior.
- New protocol features require conformance fixtures before adapters depend on them.

## Outcome and definition of done

The first production-ready AndFS release is complete when a user can:

- Add a large file without loading the whole file into memory.
- Receive one stable manifest hash.
- Push all required blocks to an HTTP server.
- Retrieve or stream the file from a browser or CLI with verification.
- Reference the file from an anproto message using its stable AndFS manifest hash.
- Use tested memory, disk, IndexedDB, APDS, and HTTP adapters through their documented contracts.
- Understand the project from the README without reading its source.

Directories, pinning, audit/repair, garbage collection, and the polished explorer are post-1.0 capabilities. They must not delay a stable and useful byte-storage release.

Release gates:

- `deno task check` passes with zero lint, type, or test failures.
- Core, HTTP, CLI, and store tests cover their documented behavior.
- Dependencies are pinned.
- No server entry point exposes the repository or data directory as static files.
- A clean-machine quickstart has been tested.
- A real-browser smoke test passes for local storage and remote retrieval.
- The server trust model and resource limits are documented and tested.

## Work board

### Now — Milestone 1: trustworthy v1 core

Do these tickets in order. This is the only active milestone.

- [x] **A01 — Add project tooling**
  - Create `deno.json` with pinned imports and `fmt`, `lint`, `typecheck`, `test`, `check`, and `serve` tasks.
  - Make `check` non-mutating: verify formatting, lint, check all root JavaScript modules, and run tests with a frozen committed lockfile.
  - Pin direct APDS URL imports without breaking direct browser imports. Record transitive dependencies in `deno.lock`.
  - Preserve single-quote/no-semicolon formatting and existing promise/rejection behavior.
  - Document Deno 2.7.13 and run the same check in CI. Permit gradual JavaScript annotations until A04.
  - Add `.gitignore` for `andfs-data/`, coverage, editor files, and generated artifacts.
  - Add a full `LICENSE` file.
  - Fix the current 13 lint findings without changing behavior.
  - **Accept:** `deno task check` succeeds from the repository root with an empty dependency cache, leaves tracked files unchanged, and exercises async compatibility.
  - **Verified:** Deno 2.7.13, five passing tests, zero lint/type/format findings, successful empty-cache check, and no files changed by checking. CI configured; hosted run awaits push.
  - **Stop point:** Do not reorganize modules in this ticket.

- [ ] **A02 — Freeze the v1 wire format**
  - Write `docs/protocol-v1.md` covering hash encoding, chunk size, manifest JSON, empty files, maximum size, range semantics, and verification requirements.
  - Create committed golden fixtures for an empty file, a short UTF-8 file, an exact one-chunk file, and a multi-chunk file.
  - Test exact manifest bytes and hashes against those fixtures.
  - Decide whether extra manifest properties are accepted or rejected and document it.
  - **Accept:** An independent implementation could reproduce every fixture byte-for-byte.
  - **Stop point:** Do not design v2 or directory manifests.

- [ ] **A03 — Define the minimal anproto reference**
  - Review anproto's existing message conventions before choosing field names.
  - Specify how a message references an AndFS v1 manifest hash without embedding bytes or chunk lists.
  - Permit optional presentation metadata such as filename and MIME type without making it part of the byte identity.
  - Define unavailable, downloading, and failed-verification states for consumers.
  - Add one shared fixture representing an anproto message with an AndFS reference.
  - **Accept:** Both projects can use the fixture without interpreting the hash differently.
  - **Stop point:** Do not design directories or rich attachment catalogs.

- [ ] **A04 — Define store and source contracts**
  - Add JSDoc types for `BlockStore`, `BlockSource`, progress events, and public options/results.
  - Document whether stores must copy byte arrays and whether `put` must be idempotent.
  - Validate constructor arguments precisely.
  - Keep adapters structurally typed; do not add a class hierarchy.
  - **Accept:** `deno check` catches an intentionally malformed adapter in a type fixture.
  - **Stop point:** Only define behavior already needed by v1.

- [ ] **A05 — Remove global storage state**
  - Make the frontend and CLI construct and retain their own `createAndFS()` instance.
  - Keep APDS support in an explicit adapter.
  - Move legacy singleton exports to a clearly marked compatibility module or deprecate them.
  - Ensure two AndFS instances can use different namespaces concurrently.
  - **Accept:** A test writes different content through two isolated instances without namespace crossover.
  - **Stop point:** Do not redesign APDS itself.

- [ ] **A06 — Introduce useful error types**
  - Add errors for invalid hashes, missing blocks, corrupt blocks, invalid manifests, invalid ranges, source timeouts, and storage failures.
  - Preserve the original error as `cause` when wrapping failures.
  - Only fall back to a remote source for a missing or corrupt local block; do not silently hide operational store failures.
  - Include the relevant hash in diagnostic errors without exposing unrelated data.
  - **Accept:** Tests can distinguish every documented failure with `instanceof` or a stable error code.
  - **Stop point:** Do not create a general logging framework.

- [ ] **A07 — Correct streaming and progress behavior**
  - For `Blob` inputs, report `bytes`, `totalBytes`, completed chunks, and total chunks.
  - For unknown-length streams, use `totalBytes: undefined` rather than a false total.
  - For range reads, report progress relative to the requested range.
  - Test cancellation before reading, mid-upload, during source fallback, and mid-read.
  - Ensure event listeners and readers are always released.
  - **Accept:** The demo progress bar never jumps to 100% before work is complete.
  - **Stop point:** Do not add transfer-speed UI yet.

- [ ] **A08 — Expand core adversarial tests**
  - Cover empty files, exact chunk boundaries, maximum manifest shape, wrong final-chunk length, malformed UTF-8, duplicate chunks, invalid ranges, aborts, timeouts, and source repair.
  - Test oversized source responses and corrupted local content. Fix the existing repair test, which currently writes identical bytes instead of corrupting its block.
  - Test that verified source content is cached locally.
  - **Accept:** Core behavior and failure modes are exercised without network or disk access.
  - **Stop point:** HTTP behavior belongs in Milestone 2.

- [ ] **A09 — Prove the browser baseline**
  - Add an automated real-browser smoke test for `createAndFS()` with `browserStore()`.
  - Test add, verified read, persistence across reopening IndexedDB, isolation between namespaces, and cancellation.
  - Confirm all core imports run directly in supported browsers without Deno or Node globals.
  - Document secure-context requirements and the supported browser baseline.
  - **Accept:** The same golden v1 fixture created in Deno is read and verified in a real browser.
  - **Stop point:** Keep the existing demo visually simple; explorer polish comes later.

### Next — Milestone 2: secure browser-to-server vertical slice

- [ ] **B01 — Define the server threat model**
  - Decide whether reads are public-by-hash, authenticated, or deployment-configurable.
  - Require an explicit upload authorization mode; never silently ship an unlimited public write endpoint.
  - Define body, batch, request-rate, total-storage, and per-principal limits.
  - Define behavior when storage is full and who is allowed to pin content.
  - State whether private content is unsupported until encryption exists.
  - Treat MIME type and other client metadata as untrusted.
  - Write the decisions in `docs/threat-model.md`.
  - **Accept:** A deployer can tell exactly who may read, write, and consume storage.
  - **Stop point:** Do not implement authentication providers in this ticket.

- [ ] **B02 — Specify the HTTP API**
  - Document `PUT`, `GET`, and `HEAD /blobs/:hash` plus `GET` and `HEAD /media/:manifest`.
  - Apply the threat-model decisions to authorization, limits, status codes, CORS, ranges, caching, ETags, and error responses.
  - Specify a batch endpoint that returns which hashes are absent.
  - **Accept:** Request/response examples cover success and every expected client error.

- [ ] **B03 — Implement verified block upload**
  - Add `PUT /blobs/:hash` with a strict body limit.
  - Hash the received body and reject mismatches without persisting them.
  - Make repeated identical uploads idempotent.
  - Return `201` for a new block and `204` when it already exists.
  - **Accept:** Integration tests prove corrupt and oversized bodies are never stored.

- [ ] **B04 — Implement existence checks and batch missing**
  - Add efficient `HEAD /blobs/:hash`.
  - Add a bounded missing-hashes request so clients can deduplicate before upload.
  - Put maximum hash-count and request-size limits in the protocol.
  - **Accept:** Uploading the same file twice sends no block bodies on the second run.

- [ ] **B05 — Harden HTTP downloads**
  - Map typed errors to `400`, `404`, `408`, `416`, and `500` correctly.
  - Add immutable caching and strong ETags for blocks and media.
  - Support conditional requests.
  - Validate single byte ranges, including suffix ranges and empty files.
  - Bound remote response sizes while streaming, not after `arrayBuffer()` completes.
  - **Accept:** A table-driven HTTP test suite covers GET, HEAD, cache validation, and ranges.

- [ ] **B06 — Separate demo and storage servers**
  - Serve browser assets from an explicit public directory.
  - Never expose `.git`, source files, or the block directory through static serving.
  - Add host, port, data-directory, and allowed-origin configuration.
  - Default to localhost for development.
  - **Accept:** Security tests cannot retrieve repository or data-directory paths.

- [ ] **B07 — Add an HTTP destination adapter**
  - Implement missing-block negotiation and upload.
  - Keep `httpSource()` read-only and give the write adapter a distinct name.
  - Add bounded concurrency, abort support, retries with backoff, and progress events.
  - **Accept:** An integration test adds locally, pushes remotely, clears local storage, and retrieves from the server.

- [ ] **B08 — Prove the browser/anproto/network round trip**
  - In a browser, add a file to IndexedDB and push its missing blocks to the HTTP server.
  - Place its stable AndFS reference in the agreed anproto fixture/message shape.
  - From a fresh browser storage namespace, resolve the reference through `httpSource()`, verify it, and cache it locally.
  - Demonstrate byte-range media retrieval without reconstructing the complete file in memory.
  - **Accept:** One automated end-to-end test proves browser → AndFS → anproto reference → HTTP → fresh browser retrieval.
  - **Stop point:** This is proof of the product loop, not the polished explorer.

### Next — Milestone 3: safe, satisfying CLI

- [ ] **C01 — Establish the CLI contract**
  - Support `add`, `get`, `inspect`, `verify`, `push`, `pull`, and `serve`.
  - Reserve stdout for machine-readable results and stderr for progress/errors.
  - Add `--json`, `--quiet`, `--store`, and `--remote` conventions.
  - Return documented exit codes.
  - **Accept:** Every command has a help example and CLI parsing tests.

- [ ] **C02 — Make single-file round trips reliable**
  - `andfs add PATH` prints a manifest hash or a stable JSON object.
  - `andfs get HASH --output PATH` streams to a temporary file and atomically renames it on success.
  - Never read or reconstruct a complete large file in memory.
  - Refuse accidental overwrite unless `--force` is provided.
  - **Accept:** Instrumented tests show memory use remains bounded as file size and chunk count increase.

- [ ] **C03 — Add inspection and verification tools**
  - `inspect` displays manifest type, logical size, chunk count, and referenced hashes.
  - `verify` checks the complete reachable graph and reports missing/corrupt blocks.
  - Offer stable JSON output for automation.
  - **Accept:** Verification exits nonzero and identifies the exact damaged hash.

Milestone acceptance:

- A file can make a complete CLI → HTTP → browser round trip without full-file buffering.
- The CLI can inspect and verify the same hash used by the browser and anproto fixture.
- Completion of this milestone satisfies the functional scope for 1.0.

### Later — Milestone 4: canonical files and directories

- [ ] **D01 — Define canonical file and directory descriptors**
  - Keep the v1 byte manifest unchanged.
  - Add a separately hashed file descriptor with content hash, name, MIME type, size, and optional modified time.
  - Add a canonical directory descriptor with sorted entries.
  - Remove the current redundant combination of stored directory JSON and inline children.
  - Add golden descriptor fixtures.
  - **Accept:** Equivalent directory inputs generate the same descriptor hash.

- [ ] **D02 — Make directory restore hostile-input safe**
  - Reject empty names, `.`, `..`, separators, NUL, and unsafe platform names.
  - Prove every destination remains within the selected output root.
  - Define whether symlinks are rejected or represented explicitly; reject them by default.
  - Detect traversal, collisions, and excessive nesting before writing.
  - **Accept:** Malicious fixture trees cannot write outside a temporary destination.

- [ ] **D03 — Extend anproto references to descriptors**
  - Preserve compatibility with the minimal v1 manifest reference.
  - Document how anproto consumers distinguish raw byte manifests from file and directory descriptors.
  - Add a directory-sharing integration fixture.
  - **Accept:** A receiving client safely restores a referenced directory from the fixture.

Milestone acceptance:

- Files and directories have deterministic descriptor hashes.
- Untrusted directory descriptors cannot escape the selected restore directory.
- anproto can reference either raw file bytes or a richer descriptor without ambiguity.

### Later — Milestone 5: ownership and lifecycle

- [ ] **E01 — Create a repository/catalog abstraction** separate from raw block storage.
- [ ] **E02 — Add `pin`, `unpin`, and `pins`** for named roots.
- [ ] **E03 — Implement reachability traversal** for manifests and directory descriptors.
- [ ] **E04 — Add `gc --dry-run`**, followed by confirmed garbage collection.
- [ ] **E05 — Add `audit` and `repair`** using configured sources.
- [ ] **E06 — Coalesce concurrent reads** so the same missing block is fetched once.
- [ ] **E07 — Report storage statistics**: logical, physical, reachable, orphaned, and deduplicated bytes.

Milestone acceptance:

- Removing an unpinned root and running GC deletes only unreachable blocks.
- Audit never mutates; repair only replaces missing or corrupt content with verified bytes.
- GC produces a reviewable dry-run before deletion.

### Later — Milestone 6: browser explorer

- [ ] **F01 — Add drag-and-drop for files and directories.**
- [ ] **F02 — Add retrieval by pasted manifest or descriptor hash.**
- [ ] **F03 — Stream media through the range endpoint instead of rebuilding it in memory.**
- [ ] **F04 — Show transfer state, verification state, source, speed, and deduplication savings.**
- [ ] **F05 — Add pin management, storage usage, audit, and repair controls.**
- [ ] **F06 — Add per-file cancellation, retry, accessible status text, and actionable errors.**
- [ ] **F07 — Revoke object URLs and clean up abandoned operations.**
- [ ] **F08 — Package the explorer as an offline-capable PWA.**

Milestone acceptance:

- A first-time user can add, copy, retrieve, stream, pin, verify, and delete content without reading documentation.
- Keyboard-only and screen-reader workflows cover all core actions.
- Refreshing or going offline does not silently lose pinned local content.

### Someday — Milestone 7: advanced protocol work

Each item below needs its own design note and explicit evidence that v1 cannot meet the use case.

- [ ] Merkle manifests for files over 4 GiB and partial manifest traversal.
- [ ] Optional content-defined chunking for edited-file deduplication.
- [ ] Bounded parallel read-ahead and source racing.
- [ ] Capability-based encryption with clear deduplication/privacy tradeoffs.
- [ ] Signed descriptors for provenance.
- [ ] Service-worker-backed stable browser media URLs.
- [ ] S3/R2, WebRTC, and peer-network adapters.
- [ ] Cross-language implementations driven by the conformance fixtures.

## Testing matrix

Test adapters by role instead of pretending every transport is a local `BlockStore`.

### Block stores

| Behavior                    | Memory | Disk | IndexedDB | APDS |
| --------------------------- | :----: | :--: | :-------: | :--: |
| Put/get exact bytes         |   ✓    |  ✓   |     ✓     |  ✓   |
| Missing block               |   ✓    |  ✓   |     ✓     |  ✓   |
| Idempotent put              |   ✓    |  ✓   |     ✓     |  ✓   |
| Corruption detected by core |   ✓    |  ✓   |     ✓     |  ✓   |
| Namespace isolation         |   —    |  —   |     ✓     |  ✓   |
| Persistence after restart   |   —    |  ✓   |     ✓     |  ✓   |

### Remote sources

| Behavior                                   | HTTP | Future peers |
| ------------------------------------------ | :--: | :----------: |
| Missing block distinguished                |  ✓   |      ✓       |
| Oversized response stopped while streaming |  ✓   |      ✓       |
| Abort and timeout honored                  |  ✓   |      ✓       |
| Corruption rejected before caching         |  ✓   |      ✓       |
| Concurrent same-hash fetch coalesced       |  ✓   |      ✓       |

### Remote destinations

| Behavior                            | HTTP | Future peers |
| ----------------------------------- | :--: | :----------: |
| Missing blocks negotiated           |  ✓   |      ✓       |
| Idempotent verified upload          |  ✓   |      ✓       |
| Authorization failure distinguished |  ✓   |      ✓       |
| Limits and backpressure honored     |  ✓   |      ✓       |
| Abort and bounded retry honored     |  ✓   |      ✓       |

Additional suites:

- Golden protocol fixtures.
- Core malformed-input and cancellation tests.
- HTTP conformance and range tests.
- CLI subprocess and path-safety tests.
- Browser tests for IndexedDB, quota errors, reloads, and object-URL cleanup.
- End-to-end local-to-server-to-browser round trips.

## Release sequence

Use small releases so progress stays visible:

- **0.2 — Trustworthy core:** Milestone 1 complete.
- **0.3 — Browser/network/anproto round trip:** Milestone 2 complete.
- **0.4 — Useful CLI:** Milestone 3 complete.
- **1.0 — Stable byte storage:** Milestones 1–3 plus clean-machine validation, documentation review, security review, and no known format-breaking issue.
- **1.1 — Canonical files and directories:** Milestone 4 complete.
- **1.2 — Durable storage lifecycle:** Milestone 5 complete.
- **1.3 — AndFS Explorer:** Milestone 6 complete.
- **2.0 — Format evolution:** only when a proven requirement needs a breaking manifest or descriptor change.

Do not promise a calendar date for 1.0. Release when the gates are met.

## Pull request checklist

Keep this short enough to use every time:

- [ ] One ticket or one tightly related behavior.
- [ ] Tests demonstrate the change.
- [ ] `deno task check` passes.
- [ ] Public behavior is documented.
- [ ] No unrelated cleanup is mixed in.
- [ ] Error and cancellation paths were considered.
- [ ] Work order checkbox/status is updated.

## Parking lot

Capture exciting distractions here without changing the active milestone:

- Native desktop mounts/FUSE.
- Mutable names and collaborative catalogs.
- Thumbnail and media-transcoding services.
- Public discovery/search.
- Billing, quotas, and multi-tenant administration.
- Benchmark dashboard and network simulation.

Items leave the parking lot only when a real user story requires them.

## Immediate next action

Restore the reproducible check baseline described in the November 6 sequencing decision, then deliberately start the bounded v1 fixture/compatibility slice above. A01's earlier local validation is historical evidence; it does not resolve the later hosted integrity failure. Keep one implementation ticket in progress and record its observed finish line before moving on.
