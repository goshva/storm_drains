<script setup>
import { computed, ref, watch } from 'vue'
import Icon from '../components/Icon.vue'
import ProgressRing from '../components/ProgressRing.vue'
import { useFetch } from '../composables/useFetch'
import { api } from '../api/client'

const props = defineProps({
  role: { type: Object, required: true }
})

const FREQ_LABEL = { l1: 'Ежедневный регламент', l2: 'Еженедельный регламент', l3: 'Ежемесячный регламент', l4: 'Квартальный регламент' }

const { data: fetchedTasks, loading, error } = useFetch(() => api.tasksForLevel(props.role.id))

// useFetch's `data` is a shallowRef (the array itself is swapped wholesale on
// reload, never mutated) — toggling a single task's `completed` flag needs a
// deeply-reactive local copy, since a real backend call would be the actual
// source of truth here (POST /levels/{levelId}/tasks/{taskId}/toggle).
const tasks = ref([])
watch(
  fetchedTasks,
  (val) => { tasks.value = val ? val.map((t) => ({ ...t })) : [] },
  { immediate: true }
)

const doneCount = computed(() => tasks.value.filter((t) => t.completed).length)
const totalCount = computed(() => tasks.value.length)
const percent = computed(() => (totalCount.value ? Math.round((doneCount.value / totalCount.value) * 100) : 0))
const freqLabel = computed(() => FREQ_LABEL[props.role.id] ?? '')

function toggle(task) {
  task.completed = !task.completed
  task.completedAt = task.completed ? new Date().toISOString() : null
}
</script>

<template>
  <p v-if="loading" class="row__meta">Загрузка…</p>
  <p v-else-if="error" class="row__meta">Ошибка загрузки чек-листа: {{ error.message }}</p>

  <template v-else>
    <section class="block">
      <div class="card card-pad">
        <div style="display:flex;align-items:center;gap:14px;">
          <ProgressRing :percent="percent" />
          <div>
            <p class="row__title">{{ freqLabel }}</p>
            <p class="row__meta">Выполнено {{ doneCount }} из {{ totalCount }}</p>
          </div>
        </div>
        <div class="progress" style="margin-top:12px;">
          <div class="progress__fill" :style="{ width: percent + '%' }" />
        </div>
      </div>
    </section>

    <section class="block">
      <div class="list">
        <button
          v-for="task in tasks"
          :key="task.id"
          class="task-row"
          :class="{ 'is-done': task.completed }"
          @click="toggle(task)"
        >
          <span class="check"><Icon name="i-check" /></span>
          <span class="row__body">
            <p class="task-title">{{ task.title }}</p>
            <p class="task-note">{{ task.note }}</p>
          </span>
        </button>
      </div>
    </section>
  </template>
</template>
