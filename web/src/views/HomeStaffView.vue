<script setup>
import { computed } from 'vue'
import Icon from '../components/Icon.vue'
import ProgressRing from '../components/ProgressRing.vue'
import { useFetch } from '../composables/useFetch'
import { api } from '../api/client'

const props = defineProps({
  role: { type: Object, required: true }
})
const emit = defineEmits(['open-tasks'])

const { data: tasks, loading, error } = useFetch(() => api.tasksForLevel(props.role.id))
const { data: objectsResp } = useFetch(api.objects())

const doneCount = computed(() => (tasks.value ?? []).filter((t) => t.completed).length)
const totalCount = computed(() => (tasks.value ?? []).length)
const percent = computed(() => (totalCount.value ? Math.round((doneCount.value / totalCount.value) * 100) : 0))

const zoneObjects = computed(() =>
  (objectsResp.value?.items ?? []).filter((o) => o.levels.includes(props.role.level)).slice(0, 3)
)
</script>

<template>
  <p v-if="loading" class="row__meta">Загрузка…</p>
  <p v-else-if="error" class="row__meta">Ошибка загрузки {{ props.role.id }}: {{ error.message }}</p>

  <template v-else>
    <section class="block">
      <div class="card card-pad">
        <div style="display:flex;align-items:center;gap:14px;">
          <ProgressRing :percent="percent" />
          <div>
            <p class="row__title" style="margin-bottom:3px;">Задачи на сегодня</p>
            <p class="row__meta">Выполнено {{ doneCount }} из {{ totalCount }} пунктов регламента</p>
          </div>
        </div>
        <div style="margin-top:14px;">
          <button class="btn btn--primary" @click="emit('open-tasks')">
            <Icon name="i-tasks" />Открыть чек-лист
          </button>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="block__head"><span class="block__title">Объекты вашей зоны</span></div>
      <div v-if="!zoneObjects.length" class="empty">
        <Icon name="i-check-c" />
        <p>Нет объектов, закреплённых за этим уровнем</p>
      </div>
      <div v-else class="stack">
        <div v-for="o in zoneObjects" :key="o.id" class="obj-card" :class="`accent-${o.status}`">
          <span class="obj-card__icon"><Icon :name="o.icon" /></span>
          <span style="flex:1;min-width:0;">
            <span class="obj-card__top"><span class="obj-card__name">{{ o.name }}</span></span>
            <p class="obj-card__zone"><Icon name="i-pin" class="row__chev" /> {{ o.zone }}</p>
          </span>
        </div>
      </div>
    </section>
  </template>
</template>
