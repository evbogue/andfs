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
- Commit completed work in a focused commit. Push completed authorized work to the intended branch and verify success, following the standing synchronization instruction below. Distinguish local changes, committed changes, pushed changes, and hosted CI results in status reports.
- Report the outcome and relevant validation briefly. Mention material limitations or checks that could not be completed. Never say pushed or browser-verified based only on an intention or attempted action.

## Git synchronization — standing instruction

Ev explicitly requested on 30 October 2026 that local work and GitHub stay synchronized. Sync is part of completing authorized work; do not wait for a separate push request.

- At session start, inspect `git status`, the current branch, remotes, and upstream. Fetch `origin` and compare local and remote commits before editing. Read incoming changes and updated agent/work-order instructions.
- Preserve uncommitted work before integrating incoming commits. Fast-forward when possible; otherwise reconcile both histories and resolve conflicts deliberately. Never discard local work, overwrite another agent's commits, or force-push to make a branch appear current.
- Use this repository's established default branch and upstream. Keep related repositories coordinated, but inspect each independently; do not blindly stage unrelated changes, secrets, identity backups, generated state, or private research data.
- Run checks appropriate to the reconciled changes and update work orders/handoffs to match observed behavior. Commit completed work in focused commits and push the intended branch to GitHub before finishing a change session, unless Ev explicitly asks to keep it local.
- Fetch again before pushing. If GitHub advanced, integrate the new commits, rerun affected checks, and retry a normal push. After pushing, verify the local HEAD equals the intended GitHub branch tip and inspect the remaining worktree status. Report the commit, branch, checks, and any remaining changes or divergence automatically.
- If authentication, network access, conflicts, failing checks, or unfinished work prevent synchronization, preserve the work and report the exact blocker. Do not claim synchronization from an attempted push or a stale remote-tracking ref. Clearly label any intentionally preserved unfinished checkpoint.
- A GitHub push is source synchronization, not permission to deploy services, publish public test messages, send email, or change production data. Existing release and publication rules still apply. Do not install background auto-pull jobs; sync at session boundaries and coordinated handoffs.

## git-ssb synchronization — all projects

Ev explicitly requested on 1 November 2026 that all projects also be pushed to git-ssb. This applies to every project in this workspace, alongside the GitHub synchronization requirement above. Pushing authorized source changes to git-ssb is part of completing the work; do not wait for a separate push request.

- Inspect each project's `ssb` remote independently. If it is missing, locate the existing git-ssb repository or create one using the local sbot workflow documented in `ssbc/AGENTS.md`, then configure the remote. Do not silently skip git-ssb or create duplicate repositories when an existing one can be found.
- Use our sbot's Git-over-HTTP endpoint (`http://127.0.0.1:8989/git/%25<repo-id>.sha256`), following the current local configuration. Replace legacy `ssb://` remotes with the corresponding HTTP endpoint; do not use the legacy `git-remote-ssb` helper.
- Fetch and compare the intended branch on both `origin` and `ssb` before integrating or pushing. Preserve local work and reconcile incoming commits from either remote. Use each project's established default branch and upstream; never assume every project uses `main`, discard commits, or force-push to synchronize histories.
- Push completed source changes to both GitHub and git-ssb before finishing a change session, unless Ev explicitly asks to keep the work local. Verify the intended branch tip on each remote against local HEAD after pushing; use a fresh remote query rather than relying on stale tracking refs.
- If sbot is unavailable, follow the documented local startup workflow and retry. If repository creation, authentication, connectivity, conflicts, or checks still block synchronization, preserve the work and report the exact blocker and which remote remains unsynchronized. Do not claim completion from an attempted push.
- Report the commit, branch, checks, and synchronization status for both remotes. Keep secrets, identity backups, generated state, and private research data out of source pushes. This instruction authorizes source synchronization; existing deployment and other publication rules still apply.

### Local git-ssb workflow

- At the start of a work session, run `npm run agent:preflight` from the workspace's `ssbc` checkout before fetching from `ssb`. Preflight starts sbot if needed and checks that it is listening at `127.0.0.1:8989`. Leave sbot running.
- If the remote is missing, query sbot's `messagesByType` for `git-repo` messages and compare repository IDs, authors, names, and known remotes. Names alone are not unique. Only create a repository when no existing match is found: run `node bin.js git.create <project-name>` from `ssbc`, then configure `ssb` with the returned HTTP URL. Remove surrounding JSON quotes and preserve URL encoding.
- Fetch both remotes again before pushing. If either advanced, reconcile incoming commits and rerun affected checks. From this project's checkout, run `git push origin <branch>` and `git push ssb <branch>` with the intended branch name. Use normal pushes without force or mirroring.
- Verify local HEAD against fresh `git ls-remote --heads origin` and `git ls-remote --heads ssb` results for the intended branch. Re-read HEAD and worktree status afterward to catch concurrent changes. Report any remaining changes or divergence.
