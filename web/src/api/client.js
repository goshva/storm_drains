// Stands in for the future Go backend documented in ../../api/openapi.yaml.
// Every helper here returns the URL for a static mock JSON file whose shape
// matches that contract's response schemas exactly, so swapping this module
// for real `fetch('/api/v1/...')` calls later is a drop-in change — nothing
// that calls these functions needs to know the difference.

const MOCK_BASE = '/mocks'

export const api = {
  roles: () => `${MOCK_BASE}/roles.json`,
  users: () => `${MOCK_BASE}/users.json`,
  objects: () => `${MOCK_BASE}/objects.json`,
  raci: () => `${MOCK_BASE}/raci.json`,
  tasksForLevel: (levelId) => `${MOCK_BASE}/tasks-${levelId}.json`,
  calendarWorks: () => `${MOCK_BASE}/calendar-works.json`,
  calendarOccurrences: () => `${MOCK_BASE}/calendar-occurrences.json`
}
