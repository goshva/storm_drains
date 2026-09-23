# Vue 3 / Vite prototype

An attempt at porting the root `index.html` vanilla-JS PWA to a proper Vue 3 +
Vite build, on the `dev` branch, to try out the shape of the app described in
`../api/openapi.yaml`.

## Run it

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build     # production build to dist/
```

## How the mock store works

`src/store/mockStore.js` is the app's single source of truth — a reactive
store that, on first load, fetches `public/mocks/*.json` (each file's shape
validated against `../api/openapi.yaml`'s schemas — `UserListResponse`,
`ObjectListResponse`, `RaciRow`, `TaskDefinition`, ... — with ajv) and then
persists every mutation (add/delete an object, toggle a checklist item, edit
the RACI matrix, ...) to `localStorage`, the same role it plays in the root
static app. Reload the page and your edits are still there; call
`resetMockStore()` in the browser console and reload to re-seed from the
mock files.

`src/api/client.js` (used only by the store, for the initial seed) maps each
resource to its mock URL — swapping it to point at real `/api/v1/...`
endpoints later, and moving the store's mutations to `fetch()` calls against
them, shouldn't require touching any view component.

## What's ported, what isn't

Implemented, all backed by the persistent store: role picker, owner/staff/
admin home, per-level task checklist (persisted toggle), object list +
admin add/delete, admin user roster (add/delete, assign to an existing
role), admin RACI matrix (tap a cell to cycle R/A/C/I, add/delete
operations, icon-based legend).

Not ported yet: the recurring work calendar UI, photo attachments, object/
task history endpoints, the SOS protocol sheet, and PWA features (service
worker, offline indicator, install prompt, light/dark theme toggle) — none
of these exist in the root static app either except the PWA bits.
`public/mocks/calendar-works.json` and `calendar-occurrences.json` exist and
validate against the contract, but nothing in the UI reads them yet.
