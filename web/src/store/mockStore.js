import { reactive } from 'vue'
import { api } from '../api/client'

// Stands in for the Go backend: seeds itself once from the static mock JSON
// (public/mocks/*.json, each validated against api/openapi.yaml), then every
// mutation is applied to this reactive state AND persisted to localStorage,
// so admin edits / checklist ticks survive a reload — same role localStorage
// plays in the root static app (index.html), just centralized here instead
// of scattered per-component.
const STORAGE_KEY = 'storm_drains_mock_v1'

export const state = reactive({
  ready: false,
  roles: [],
  users: [],
  objects: [],
  raci: [],
  tasks: { l1: [], l2: [], l3: [], l4: [] }
})

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.json()
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        users: state.users,
        objects: state.objects,
        raci: state.raci,
        tasks: state.tasks
      })
    )
  } catch {
    // localStorage unavailable (private mode, quota, ...) — mutations still
    // work for the session, they just won't survive a reload.
  }
}

let initPromise = null

export function initMockStore() {
  if (!initPromise) {
    initPromise = (async () => {
      // Roles are fixed reference data — always re-seeded, never persisted/mutated.
      state.roles = await fetchJson(api.roles())

      const persisted = loadPersisted()
      if (persisted) {
        state.users = persisted.users
        state.objects = persisted.objects
        state.raci = persisted.raci
        state.tasks = persisted.tasks
      } else {
        const [usersResp, objectsResp, raci, l1, l2, l3, l4] = await Promise.all([
          fetchJson(api.users()),
          fetchJson(api.objects()),
          fetchJson(api.raci()),
          fetchJson(api.tasksForLevel('l1')),
          fetchJson(api.tasksForLevel('l2')),
          fetchJson(api.tasksForLevel('l3')),
          fetchJson(api.tasksForLevel('l4'))
        ])
        state.users = usersResp.items
        state.objects = objectsResp.items
        state.raci = raci
        state.tasks = { l1, l2, l3, l4 }
        persist()
      }
      state.ready = true
    })()
  }
  return initPromise
}

// Dev convenience: wipe the persisted store and re-seed from the mock files
// on next load (e.g. from the browser console: `resetMockStore()`).
export function resetMockStore() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

let seq = 0
function localId(prefix) {
  seq += 1
  return `local-${prefix}-${Date.now()}-${seq}`
}

export function addObject({ name, zone, status, levels }) {
  state.objects.push({
    id: localId('o'),
    name,
    zone: zone || 'Не указано',
    icon: 'i-drop',
    status,
    levels,
    issue: null,
    updatedAt: new Date().toISOString(),
    source: 'internal'
  })
  persist()
}

export function deleteObject(objectId) {
  state.objects = state.objects.filter((o) => o.id !== objectId)
  persist()
}

export function addUser({ name, roleId }) {
  state.users.push({ id: localId('u'), name, roleId, createdAt: new Date().toISOString() })
  persist()
}

export function deleteUser(userId) {
  state.users = state.users.filter((u) => u.id !== userId)
  persist()
}

export function addRaciRow(operation) {
  state.raci.push({
    id: localId('r'),
    operation,
    assignments: { l1: '', l2: '', l3: '', l4: '' }
  })
  persist()
}

export function deleteRaciRow(raciId) {
  state.raci = state.raci.filter((r) => r.id !== raciId)
  persist()
}

const RACI_CYCLE = ['', 'R', 'A', 'C', 'I']
export function cycleRaciCell(raciId, levelId) {
  const row = state.raci.find((r) => r.id === raciId)
  if (!row) return
  const current = row.assignments[levelId] || ''
  row.assignments[levelId] = RACI_CYCLE[(RACI_CYCLE.indexOf(current) + 1) % RACI_CYCLE.length]
  persist()
}

export function toggleTask(levelId, taskId) {
  const task = state.tasks[levelId]?.find((t) => t.id === taskId)
  if (!task) return
  task.completed = !task.completed
  task.completedAt = task.completed ? new Date().toISOString() : null
  persist()
}
