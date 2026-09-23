<script setup>
import { computed } from 'vue'
import Icon from '../components/Icon.vue'
import ProgressRing from '../components/ProgressRing.vue'
import { state as store, toggleTask } from '../store/mockStore'

const props = defineProps({
  role: { type: Object, required: true }
})

const FREQ_LABEL = { l1: 'Ежедневный регламент', l2: 'Еженедельный регламент', l3: 'Ежемесячный регламент', l4: 'Квартальный регламент' }

const tasks = computed(() => store.tasks[props.role.id] ?? [])
const doneCount = computed(() => tasks.value.filter((t) => t.completed).length)
const totalCount = computed(() => tasks.value.length)
const percent = computed(() => (totalCount.value ? Math.round((doneCount.value / totalCount.value) * 100) : 0))
const freqLabel = computed(() => FREQ_LABEL[props.role.id] ?? '')
</script>

<template>
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
        @click="toggleTask(role.id, task.id)"
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
