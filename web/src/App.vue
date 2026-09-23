<script setup>
import { computed, ref, watch } from 'vue'
import { useFetch } from './composables/useFetch'
import { api } from './api/client'
import TopBar from './components/TopBar.vue'
import TabBar from './components/TabBar.vue'
import RolePicker from './views/RolePicker.vue'
import HomeOwnerView from './views/HomeOwnerView.vue'
import HomeStaffView from './views/HomeStaffView.vue'
import TasksView from './views/TasksView.vue'
import ObjectsView from './views/ObjectsView.vue'
import ProfileView from './views/ProfileView.vue'

const TABS_OWNER = [
  { id: 'home', label: 'Сегодня', icon: 'i-home' },
  { id: 'objects', label: 'Объекты', icon: 'i-grid' },
  { id: 'profile', label: 'Профиль', icon: 'i-user' }
]
const TABS_STAFF = [
  { id: 'home', label: 'Сегодня', icon: 'i-home' },
  { id: 'tasks', label: 'Задачи', icon: 'i-tasks' },
  { id: 'objects', label: 'Объекты', icon: 'i-grid' },
  { id: 'profile', label: 'Профиль', icon: 'i-user' }
]
const TITLES = { home: 'Сегодня', tasks: 'Задачи', objects: 'Объекты', profile: 'Профиль' }

const { data: roles } = useFetch(api.roles())

const roleId = ref(null)
const activeTab = ref('home')

const role = computed(() => roles.value?.find((r) => r.id === roleId.value) ?? null)
// Owner (level 0) and admin (level 5) are both non-operational — neither has
// a per-level checklist, so neither gets the "tasks" tab / HomeStaffView,
// which assumes role.id is one of l1-l4 and fetches /mocks/tasks-{id}.json.
// Routing admin there 404s on tasks-admin.json and crashes on the HTML
// fallback response. The admin-specific dashboard isn't ported yet (see
// README) — HomeOwnerView is level-agnostic (just objects + roles) so it
// doubles as a reasonable admin landing screen until then.
const isOwnerLike = computed(() => role.value?.level === 0 || role.value?.id === 'admin')
const tabs = computed(() => (isOwnerLike.value ? TABS_OWNER : TABS_STAFF))
const title = computed(() => TITLES[activeTab.value] ?? '')

// If the active tab doesn't exist for the current role (e.g. owner has no
// "tasks" tab), fall back to home instead of rendering a blank screen.
watch(tabs, (list) => {
  if (!list.some((t) => t.id === activeTab.value)) activeTab.value = 'home'
})

function selectRole(id) {
  roleId.value = id
  activeTab.value = 'home'
}
function switchRole() {
  roleId.value = null
}
</script>

<template>
  <div class="stage">
    <div class="app-frame">
      <RolePicker v-if="!role" @select="selectRole" />

      <template v-else>
        <TopBar :role="role" :title="title" />

        <main class="scroll">
          <HomeOwnerView v-if="activeTab === 'home' && isOwnerLike" />
          <HomeStaffView
            v-else-if="activeTab === 'home'"
            :role="role"
            @open-tasks="activeTab = 'tasks'"
          />
          <TasksView v-else-if="activeTab === 'tasks'" :role="role" />
          <ObjectsView v-else-if="activeTab === 'objects'" />
          <ProfileView v-else-if="activeTab === 'profile'" :role="role" @switch-role="switchRole" />
        </main>

        <TabBar :tabs="tabs" :active="activeTab" @update:active="activeTab = $event" />
      </template>
    </div>
  </div>
</template>
