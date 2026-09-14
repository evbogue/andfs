# Working on AndFS

## Scope and communication

- AndFS means **And File System**: store bytes anywhere, identify them once, retrieve and verify them everywhere. Keep the implementation small.
- The user has ADHD. Lead with the outcome, use short updates, and surface only the few decisions that matter now. For a requested review, give concrete improvements before implementing. When implementation is authorized, complete it without repeated confirmation.
- Read the relevant ticket in `WORK_ORDER.md`. Work on one implementation ticket at a time, honor its acceptance checks and stop point, and park unrelated ideas. An explicit user-requested fix may take priority without advancing the whole milestone.
- Do not start the next ticket automatically. Do not add architecture, dependencies, or polished explorer features merely because they appear in the Later list.

## Keep claims aligned with the code

- Inspect implementation and tests before describing capabilities. Update the README alongside changes to public APIs, commands, demo behavior, storage, or setup.
- Clearly distinguish implemented behavior, manually verified behavior, automated coverage, known limitations, and planned work. A green check alone does not establish production readiness.
- Browser-local storage and server disk storage are separate. Do not describe the demo's Upload Media button as a network upload until an actual destination adapter is connected and tested.
- A copied hash transfers an identifier, not the content. Retrieval elsewhere requires the manifest and every referenced chunk to be available from a store or source.
- Do not claim working anproto integration, peer transports, robust CLI commands, offline operation, or production server security before they exist and are verified.
- Treat current limitations described in the README as facts to recheck, not permanent design constraints. Update or remove stale warnings when the implementation changes.

## Content identity and UI

- A manifest hash identifies file bytes. Keep filename, MIME type, and mutable presentation metadata outside the v1 byte identity.
- Show the manifest hash prominently with a copy action, file size, and chunk count. Keep chunk hashes in expandable details. Never dump serialized byte arrays into the normal user interface.
- `add()` currently returns raw manifest bytes and a misleadingly named `manifestYaml` JSON string. Decode with `parseManifest()` for display; preserve compatibility until an intentional migration is scoped.
- Use text-safe DOM properties for filenames and other untrusted content. Keep labels accessible, copy feedback visible, and a manual-copy fallback available.

## Core and compatibility

- Keep new core logic independent of APDS, HTTP, IndexedDB, disk, and the UI. Existing legacy APDS coupling is debt tracked in the work order; do not expand it or silently reorganize modules during an unrelated fix.
- Verify blocks before returning or caching bytes from a source. Preserve ordered chunks, manifest serialization, hash encoding, and range semantics unless protocol work explicitly changes them.
- Keep streaming available. Whole-file buffering may be a documented convenience, never the only core path.
- Preserve promise returns and rejection semantics when fixing lint. Removing `async` can break callers even if existing `await` expressions still work.
- Pin direct dependencies and review lockfile changes. Preserve direct browser-compatible imports. Do not assume a Deno import map or lockfile also governs browser execution.

## Validation and local demo

- Use Deno 2.7.13 unless updating the runtime is part of the task; update README and CI together when changing it.
- Follow the configured single-quote/no-semicolon style. Run `deno task fmt` after edits and `deno task check` before committing. Keep `check` non-mutating and frozen-lockfile checks enabled.
- JavaScript types are currently gradual. Tighten contracts in the appropriate ticket; do not claim complete type safety or suppress new errors broadly to get a green check.
- Add focused tests for behavioral changes. For small presentation-only edits, use an observable browser check instead of tests that mirror markup. Verify affected controls and reconstruction when editing the demo.
- Tests must exercise what their names claim. The existing corruption-recovery test writes identical bytes; A08 tracks fixing it. Do not count it as proof of corruption handling.
- Start the demo from this repository root with `deno task serve`; verify the response before giving the user a URL. Prefer `http://127.0.0.1:8000/` for this demo.
- If the wrong application appears, inspect the listening process, page origin, cache, and service-worker possibility. Do not kill an unrelated server blindly. Changing between localhost and 127.0.0.1 also changes browser storage origin.
- The current server binds all interfaces and statically serves the repository. Do not describe it as production-safe or publicly deploy it as-is. Follow Milestone 2 for server hardening.

## Finish and Git

- Inspect `git status` first. Preserve unrelated user edits and include only changes authorized by the task. A request to rewrite a file authorizes integrating its existing edits into that rewrite.
- Update the relevant work-order status only when acceptance checks pass. Keep documentation-only work scoped; do not mark unrelated implementation tickets complete.
- Commit completed work in a focused commit. When the user asks to push, push the intended branch and verify success. Distinguish local changes, committed changes, pushed changes, and hosted CI results in status reports.
- Report the outcome and relevant validation briefly. Mention material limitations or checks that could not be completed. Never say pushed or browser-verified based only on an intention or attempted action.
