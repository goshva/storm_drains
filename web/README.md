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

Implemented, all backed by the persistent store, matching `api/openapi.yaml`:

- **Objects** — list, add, edit (with an auto-logged status-change history),
  delete, GPS-tagged photo attachments (`ObjectDetailView.vue`).
- **Users** — roster list, add, edit (name/role), delete.
- **RACI matrix** — list, add/delete rows, tap a cell to cycle R/A/C/I,
  icon-based legend.
- **Checklists** — per-level task list with persisted toggle, per-task
  completion history and GPS-tagged photo attachments (`TasksView.vue`), and
  admin CRUD over the checklist items themselves (`AdminTasksView.vue`).
- **Recurring work calendar** — admin can create a work (title, level,
  freq/interval/start date) and mark its occurrences completed/skipped
  (`AdminCalendarView.vue`). The full `RecurrenceRule` shape
  (byWeekday/byMonthDay/endDate/count) is in the store/contract but this
  simple form only exposes freq+interval+startDate; expanding a rule into
  every future occurrence is backend business logic out of scope for a
  static mock, so creating a work seeds exactly one occurrence at its start
  date.
- **Theme** (light/dark/system, Profile tab) and **PWA install**
  (manifest + service worker in `public/`, install button on Profile).

There's no login/session concept (just the role switcher), so wherever the
contract wants an actor id (`completedBy`, `changedBy`, `uploadedBy`) the
store is given the current role's id as a stand-in.

Photos are captured for real (`<input type="file" capture>` +
`navigator.geolocation`) but downscaled to a small JPEG data URL before
being stored in `localStorage` — full-resolution camera photos would blow
the ~5-10MB quota after a couple of uploads.

Admin's checklist/calendar management is reachable from the "Обзор" hub's
management list rather than the bottom tab bar — a 7-tab bar doesn't fit a
420px frame.

**Not ported**: the SOS protocol sheet and the offline/update-available
toast the root static app has (unrelated to the mock-API gap analysis this
work closed).
