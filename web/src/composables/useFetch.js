import { ref, shallowRef, watchEffect } from 'vue'

// Minimal fetch-backed data loader. `source` can be a plain URL string, a ref
// holding one, or a function returning one (so the fetch re-runs whenever the
// values it reads change, e.g. useFetch(() => api.tasksForLevel(role.value.id))).
export function useFetch(source) {
  const data = shallowRef(null)
  const error = shallowRef(null)
  const loading = ref(false)

  function resolveUrl() {
    return typeof source === 'function' ? source() : source?.value ?? source
  }

  async function load() {
    const url = resolveUrl()
    if (!url) {
      data.value = null
      return
    }
    loading.value = true
    error.value = null
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
      data.value = await res.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  watchEffect(load)

  return { data, error, loading, reload: load }
}
