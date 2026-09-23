<script setup>
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import ProgressRing from '../components/ProgressRing.vue'
import PhotoCapture from '../components/PhotoCapture.vue'
import AttachmentGallery from '../components/AttachmentGallery.vue'
import {
  state as store,
  toggleTask,
  getTaskCompletionHistory,
  getTaskAttachments,
  addTaskAttachment,
  deleteTaskAttachment
} from '../store/mockStore'

const props = defineProps({
  role: { type: Object, required: true }
})

const FREQ_LABEL = { l1: 'Ежедневный регламент', l2: 'Еженедельный регламент', l3: 'Ежемесячный регламент', l4: 'Квартальный регламент' }

const tasks = computed(() => store.tasks[props.role.id] ?? [])
const doneCount = computed(() => tasks.value.filter((t) => t.completed).length)
const totalCount = computed(() => tasks.value.length)
const percent = computed(() => (totalCount.value ? Math.round((doneCount.value / totalCount.value) * 100) : 0))
const freqLabel = computed(() => FREQ_LABEL[props.role.id] ?? '')

const expandedId = ref(null)
function toggleExpand(taskId) {
  expandedId.value = expandedId.value === taskId ? null : taskId
}
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
      <div v-for="task in tasks" :key="task.id" class="task-item">
        <button
          class="task-row"
          :class="{ 'is-done': task.completed }"
          @click="toggleTask(role.id, task.id, role.id)"
        >
          <span class="check"><Icon name="i-check" /></span>
          <span class="row__body">
            <p class="task-title">{{ task.title }}</p>
            <p class="task-note">{{ task.note }}</p>
          </span>
        </button>
        <button
          class="task-row__expand"
          :class="{ 'is-open': expandedId === task.id }"
          aria-label="Подробнее"
          @click="toggleExpand(task.id)"
        >
          <Icon name="i-chev-r" />
        </button>

        <div v-if="expandedId === task.id" class="task-detail">
          <p class="block__title" style="margin-bottom:8px;">Фотофиксация</p>
          <PhotoCapture :actor-id="role.id" @captured="(a) => addTaskAttachment(role.id, task.id, a)" />
          <div style="margin-top:10px;">
            <AttachmentGallery
              :attachments="getTaskAttachments(role.id, task.id)"
              deletable
              @delete="(id) => deleteTaskAttachment(role.id, task.id, id)"
            />
          </div>

          <template v-if="getTaskCompletionHistory(role.id, task.id).length">
            <p class="block__title" style="margin:16px 0 8px;">История отметок</p>
            <div class="list">
              <div v-for="(h, i) in getTaskCompletionHistory(role.id, task.id)" :key="i" class="row">
                <span class="row__icon" :class="{ gold: !h.completed }">
                  <Icon :name="h.completed ? 'i-check-c' : 'i-clock'" />
                </span>
                <span class="row__body">
                  <p class="row__title">{{ h.completed ? 'Отмечено выполненным' : 'Снята отметка' }}</p>
                  <p class="row__meta">{{ h.completedAt ? new Date(h.completedAt).toLocaleString('ru-RU') : '—' }}</p>
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
