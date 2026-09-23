# Vue 3 / Vite prototype

An attempt at porting the root `index.html` vanilla-JS PWA to a proper Vue 3 +
Vite build, on the `dev` branch, to try out the shape of the app described in
`../api/openapi.yaml` — components load their data with `fetch()` from static
mock JSON files instead of talking to the real (not-yet-built) Go backend.

## Run it

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build     # production build to dist/
```

## How the mocks work

`src/api/client.js` maps each resource to a URL under `public/mocks/*.json`.
Every mock file's shape was validated against `../api/openapi.yaml`'s schemas
(`UserListResponse`, `ObjectListResponse`, `RaciRow`, `TaskDefinition`,
`CalendarWork`, ...) with ajv, so it's a faithful stand-in for what the real
endpoints will return. `src/composables/useFetch.js` is the one place that
calls `fetch()`; swapping `client.js` to point at real `/api/v1/...` URLs
later shouldn't require touching any component.

## What's ported, what isn't

Implemented: role picker, owner/staff home, per-level task checklist (local
optimistic toggle only — there's no backend to persist it), object list,
profile / switch-role.

Not ported yet: the admin role's object/roster/RACI-matrix CRUD, the
recurring work calendar, the SOS protocol sheet, photo attachments, and the
light/dark theme toggle. `public/mocks/raci.json`, `calendar-works.json` and
`calendar-occurrences.json` exist and validate against the contract, but
nothing in the UI reads them yet — they're there for whoever picks up the
admin/calendar views next.
