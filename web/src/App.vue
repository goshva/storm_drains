<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { state as store, initMockStore } from './store/mockStore'
import TopBar from './components/TopBar.vue'
import TabBar from './components/TabBar.vue'
import RolePicker from './views/RolePicker.vue'
import HomeOwnerView from './views/HomeOwnerView.vue'
import HomeStaffView from './views/HomeStaffView.vue'
import AdminHomeView from './views/AdminHomeView.vue'
import TasksView from './views/TasksView.vue'
import AdminTasksView from './views/AdminTasksView.vue'
import ObjectsView from './views/ObjectsView.vue'
import ProfileView from './views/ProfileView.vue'
import AdminUsersView from './views/AdminUsersView.vue'
import AdminMatrixView from './views/AdminMatrixView.vue'
import AdminCalendarView from './views/AdminCalendarView.vue'

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
const TABS_ADMIN = [
  { id: 'home', label: 'Обзор', icon: 'i-home' },
  { id: 'objects', label: 'Объекты', icon: 'i-grid' },
  { id: 'roles', label: 'Роли', icon: 'i-users' },
  { id: 'matrix', label: 'Матрица', icon: 'i-admin' },
  { id: 'profile', label: 'Профиль', icon: 'i-user' }
]
// Reachable from the admin "Обзор" hub's management list, not from the
// bottom tab bar directly — a 7-tab bar doesn't fit a 420px frame.
const ADMIN_HUB_ONLY_TABS = ['tasks', 'calendar']

const TITLES = {
  home: 'Сегодня',
  tasks: 'Задачи',
  objects: 'Объекты',
  profile: 'Профиль',
  roles: 'Роли пользователей',
  matrix: 'Матрица ответственности',
  calendar: 'Календарь работ'
}

onMounted(initMockStore)

const roleId = ref(null)
const activeTab = ref('home')

const role = computed(() => store.roles.find((r) => r.id === roleId.value) ?? null)
const isAdmin = computed(() => role.value?.id === 'admin')
const isOwnerLike = computed(() => role.value?.level === 0 || isAdmin.value)
const tabs = computed(() => {
  if (isAdmin.value) return TABS_ADMIN
  return isOwnerLike.value ? TABS_OWNER : TABS_STAFF
})
// The bottom bar has no button for hub-only screens; highlight "Обзор"
// while on one of them instead of showing no active tab at all.
const highlightTab = computed(() =>
  isAdmin.value && ADMIN_HUB_ONLY_TABS.includes(activeTab.value) ? 'home' : activeTab.value
)
const title = computed(() => {
  if (activeTab.value === 'home' && isAdmin.value) return 'Обзор'
  if (activeTab.value === 'tasks' && isAdmin.value) return 'Чек-листы'
  return TITLES[activeTab.value] ?? ''
})

// If the active tab doesn't exist for the current role (e.g. owner has no
// "tasks" tab), fall back to home instead of rendering a blank screen.
watch(tabs, (list) => {
  if (!list.some((t) => t.id === activeTab.value) && !(isAdmin.value && ADMIN_HUB_ONLY_TABS.includes(activeTab.value))) {
    activeTab.value = 'home'
  }
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
      <p v-if="!store.ready" class="row__meta" style="padding:20px;">Загрузка…</p>

      <RolePicker v-else-if="!role" @select="selectRole" />

      <template v-else>
        <TopBar :role="role" :title="title" />

        <main class="scroll">
          <AdminHomeView v-if="activeTab === 'home' && isAdmin" @navigate="activeTab = $event" />
          <HomeOwnerView v-else-if="activeTab === 'home' && isOwnerLike" />
          <HomeStaffView
            v-else-if="activeTab === 'home'"
            :role="role"
            @open-tasks="activeTab = 'tasks'"
          />
          <AdminTasksView v-else-if="activeTab === 'tasks' && isAdmin" @back="activeTab = 'home'" />
          <TasksView v-else-if="activeTab === 'tasks'" :role="role" />
          <ObjectsView v-else-if="activeTab === 'objects'" :admin-mode="isAdmin" :actor-id="role.id" />
          <AdminUsersView v-else-if="activeTab === 'roles'" />
          <AdminMatrixView v-else-if="activeTab === 'matrix'" />
          <AdminCalendarView v-else-if="activeTab === 'calendar'" @back="activeTab = 'home'" />
          <ProfileView v-else-if="activeTab === 'profile'" :role="role" @switch-role="switchRole" />
        </main>

        <TabBar :tabs="tabs" :active="highlightTab" @update:active="activeTab = $event" />
      </template>
    </div>
  </div>
</template>
