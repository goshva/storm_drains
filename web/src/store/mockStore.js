import { reactive } from 'vue'
import { api } from '../api/client'

// Stands in for the Go backend: seeds itself once from the static mock JSON
// (public/mocks/*.json, each validated against api/openapi.yaml), then every
// mutation is applied to this reactive state AND persisted to localStorage,
// so admin edits / checklist ticks survive a reload — same role localStorage
// plays in the root static app (index.html), just centralized here instead
// of scattered per-component.
//
// There's no real auth/session in this prototype (just a role switcher), so
// wherever the contract wants an actor id (completedBy, changedBy,
// uploadedBy) these actions take an `actorId` param — callers pass the
// current role's id, which is the closest thing to "who" this app has.
const STORAGE_KEY = 'storm_drains_mock_v2'

export const state = reactive({
  ready: false,
  roles: [],
  users: [],
  objects: [],
  raci: [],
  tasks: { l1: [], l2: [], l3: [], l4: [] },
  // objectId -> ObjectStatusChange[]
  objectHistory: {},
  // objectId -> Attachment[]
  objectAttachments: {},
  // levelId -> taskId -> TaskCompletionRecord[]
  taskCompletions: { l1: {}, l2: {}, l3: {}, l4: {} },
  // levelId -> taskId -> Attachment[]
  taskAttachments: { l1: {}, l2: {}, l3: {}, l4: {} },
  calendarWorks: [],
  calendarOccurrences: []
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
        tasks: state.tasks,
        objectHistory: state.objectHistory,
        objectAttachments: state.objectAttachments,
        taskCompletions: state.taskCompletions,
        taskAttachments: state.taskAttachments,
        calendarWorks: state.calendarWorks,
        calendarOccurrences: state.calendarOccurrences
      })
    )
  } catch {
    // localStorage unavailable (private mode, quota, ...) — mutations still
    // work for the session, they just won't survive a reload. Attachments
    // are downscaled specifically to avoid hitting quota here (see
    // toDataUrlThumbnail below).
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
        state.objectHistory = persisted.objectHistory || {}
        state.objectAttachments = persisted.objectAttachments || {}
        state.taskCompletions = persisted.taskCompletions || { l1: {}, l2: {}, l3: {}, l4: {} }
        state.taskAttachments = persisted.taskAttachments || { l1: {}, l2: {}, l3: {}, l4: {} }
        state.calendarWorks = persisted.calendarWorks || []
        state.calendarOccurrences = persisted.calendarOccurrences || []
      } else {
        const [usersResp, objectsResp, raci, l1, l2, l3, l4, calendarWorks, occurrencesResp] = await Promise.all([
          fetchJson(api.users()),
          fetchJson(api.objects()),
          fetchJson(api.raci()),
          fetchJson(api.tasksForLevel('l1')),
          fetchJson(api.tasksForLevel('l2')),
          fetchJson(api.tasksForLevel('l3')),
          fetchJson(api.tasksForLevel('l4')),
          fetchJson(api.calendarWorks()),
          fetchJson(api.calendarOccurrences())
        ])
        state.users = usersResp.items
        state.objects = objectsResp.items
        state.raci = raci
        state.tasks = { l1, l2, l3, l4 }
        state.calendarWorks = calendarWorks
        state.calendarOccurrences = occurrencesResp.items
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

// ---- objects ----

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

export function editObject(objectId, patch, actorId) {
  const obj = state.objects.find((o) => o.id === objectId)
  if (!obj) return
  const statusOrIssueChanged =
    (patch.status !== undefined && patch.status !== obj.status) ||
    (patch.issue !== undefined && patch.issue !== obj.issue)
  Object.assign(obj, patch)
  obj.updatedAt = new Date().toISOString()
  if (statusOrIssueChanged) {
    const history = state.objectHistory[objectId] || (state.objectHistory[objectId] = [])
    history.unshift({
      id: localId('h'),
      status: obj.status,
      issue: obj.issue,
      changedAt: obj.updatedAt,
      changedBy: actorId || null
    })
  }
  persist()
}

export function deleteObject(objectId) {
  state.objects = state.objects.filter((o) => o.id !== objectId)
  delete state.objectHistory[objectId]
  delete state.objectAttachments[objectId]
  persist()
}

export function getObjectHistory(objectId) {
  return state.objectHistory[objectId] || []
}

export function getObjectAttachments(objectId) {
  return state.objectAttachments[objectId] || []
}

export function addObjectAttachment(objectId, attachment) {
  const list = state.objectAttachments[objectId] || (state.objectAttachments[objectId] = [])
  list.unshift(attachment)
  persist()
}

export function deleteObjectAttachment(objectId, attachmentId) {
  const list = state.objectAttachments[objectId]
  if (!list) return
  state.objectAttachments[objectId] = list.filter((a) => a.id !== attachmentId)
  persist()
}

// ---- users ----

export function addUser({ name, roleId }) {
  state.users.push({ id: localId('u'), name, roleId, createdAt: new Date().toISOString() })
  persist()
}

export function editUser(userId, patch) {
  const user = state.users.find((u) => u.id === userId)
  if (!user) return
  Object.assign(user, patch)
  persist()
}

export function deleteUser(userId) {
  state.users = state.users.filter((u) => u.id !== userId)
  persist()
}

// ---- RACI matrix ----

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

// ---- task definitions & completion ----

export function addTaskDefinition(levelId, { title, note }) {
  const list = state.tasks[levelId] || (state.tasks[levelId] = [])
  list.push({
    id: localId('t'),
    levelId,
    title,
    note,
    periodKey: '',
    completed: false,
    completedAt: null,
    completedBy: null
  })
  persist()
}

export function editTaskDefinition(levelId, taskId, patch) {
  const task = state.tasks[levelId]?.find((t) => t.id === taskId)
  if (!task) return
  Object.assign(task, patch)
  persist()
}

export function deleteTaskDefinition(levelId, taskId) {
  state.tasks[levelId] = (state.tasks[levelId] || []).filter((t) => t.id !== taskId)
  if (state.taskCompletions[levelId]) delete state.taskCompletions[levelId][taskId]
  if (state.taskAttachments[levelId]) delete state.taskAttachments[levelId][taskId]
  persist()
}

export function toggleTask(levelId, taskId, actorId) {
  const task = state.tasks[levelId]?.find((t) => t.id === taskId)
  if (!task) return
  task.completed = !task.completed
  task.completedAt = task.completed ? new Date().toISOString() : null
  task.completedBy = task.completed ? actorId || null : null

  const byTask = state.taskCompletions[levelId] || (state.taskCompletions[levelId] = {})
  const history = byTask[taskId] || (byTask[taskId] = [])
  history.unshift({
    periodKey: task.periodKey || new Date().toISOString().slice(0, 10),
    completed: task.completed,
    completedAt: task.completedAt,
    completedBy: task.completedBy
  })
  persist()
}

export function getTaskCompletionHistory(levelId, taskId) {
  return state.taskCompletions[levelId]?.[taskId] || []
}

export function getTaskAttachments(levelId, taskId) {
  return state.taskAttachments[levelId]?.[taskId] || []
}

export function addTaskAttachment(levelId, taskId, attachment) {
  const byTask = state.taskAttachments[levelId] || (state.taskAttachments[levelId] = {})
  const list = byTask[taskId] || (byTask[taskId] = [])
  list.unshift(attachment)
  persist()
}

export function deleteTaskAttachment(levelId, taskId, attachmentId) {
  const list = state.taskAttachments[levelId]?.[taskId]
  if (!list) return
  state.taskAttachments[levelId][taskId] = list.filter((a) => a.id !== attachmentId)
  persist()
}

// ---- calendar ----

export function addCalendarWork({ title, levelId, freq, interval, startDate, notifyBeforeMinutes }) {
  const now = new Date().toISOString()
  const work = {
    id: localId('cw'),
    title,
    description: null,
    levelId,
    objectId: null,
    recurrence: {
      freq,
      interval: interval || 1,
      byWeekday: [],
      byMonthDay: [],
      startDate,
      endDate: null,
      count: null
    },
    notifyBeforeMinutes: notifyBeforeMinutes ?? 60,
    active: true,
    createdAt: now,
    updatedAt: now,
    source: 'internal'
  }
  state.calendarWorks.push(work)
  // Mock materialization: expanding a full RRULE into occurrences is backend
  // business logic outside this prototype's scope, so just create the first
  // occurrence at the rule's start date (real backend would expand
  // freq/interval/count/endDate into every future occurrence).
  state.calendarOccurrences.push({
    id: localId('co'),
    workId: work.id,
    scheduledAt: new Date(startDate).toISOString(),
    status: 'pending',
    completedAt: null,
    completedBy: null
  })
  persist()
}

export function deleteCalendarWork(workId) {
  state.calendarWorks = state.calendarWorks.filter((w) => w.id !== workId)
  state.calendarOccurrences = state.calendarOccurrences.filter((o) => o.workId !== workId)
  persist()
}

export function updateCalendarOccurrence(occurrenceId, status, actorId) {
  const occ = state.calendarOccurrences.find((o) => o.id === occurrenceId)
  if (!occ) return
  occ.status = status
  occ.completedAt = status === 'completed' ? new Date().toISOString() : null
  occ.completedBy = status === 'completed' ? actorId || null : null
  persist()
}

// ---- attachments: capture + downscale ----

// Real camera photos can be several MB; localStorage is usually capped around
// 5-10MB total. Downscaling to a small JPEG thumbnail keeps this mock usable
// (a handful of KB per photo) instead of blowing the quota after 2-3 uploads.
export function fileToThumbnailDataUrl(file, maxDim = 480) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      img.onerror = () => reject(new Error('Не удалось прочитать изображение'))
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export function getCurrentGeoLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracyMeters: pos.coords.accuracy }),
      () => resolve(null),
      { timeout: 5000 }
    )
  })
}

export async function buildAttachment(file, actorId) {
  const [dataUrl, location] = await Promise.all([fileToThumbnailDataUrl(file), getCurrentGeoLocation()])
  return {
    id: localId('att'),
    url: dataUrl,
    contentType: 'image/jpeg',
    sizeBytes: null,
    location,
    uploadedAt: new Date().toISOString(),
    uploadedBy: actorId || null
  }
}
