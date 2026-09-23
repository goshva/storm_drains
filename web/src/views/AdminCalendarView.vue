<script setup>
import { computed, reactive, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { state as store, addCalendarWork, deleteCalendarWork, updateCalendarOccurrence } from '../store/mockStore'

defineEmits(['back'])

const FREQ_OPTIONS = [
  { value: 'DAILY', label: 'Ежедневно' },
  { value: 'WEEKLY', label: 'Еженедельно' },
  { value: 'MONTHLY', label: 'Ежемесячно' },
  { value: 'YEARLY', label: 'Ежегодно' }
]
// Genitive plural for "Каждые N ..." (N дней/недель/месяцев/лет) vs. the
// single-unit phrase for interval=1 ("Каждый день"/"Каждую неделю"/...).
const FREQ_UNIT_PLURAL = { DAILY: 'дней', WEEKLY: 'недель', MONTHLY: 'месяцев', YEARLY: 'лет' }
const FREQ_SINGLE_PHRASE = { DAILY: 'Каждый день', WEEKLY: 'Каждую неделю', MONTHLY: 'Каждый месяц', YEARLY: 'Каждый год' }
const FREQ_UNIT = { DAILY: 'дн.', WEEKLY: 'нед.', MONTHLY: 'мес.', YEARLY: 'г.' }
const OCC_STATUS_LABEL = { pending: 'Ожидается', completed: 'Выполнено', skipped: 'Пропущено', overdue: 'Просрочено' }

const roleById = computed(() => {
  const map = new Map()
  for (const r of store.roles) map.set(r.id, r)
  return map
})

function recurrenceSummary(work) {
  const r = work.recurrence
  const every = r.interval > 1 ? `Каждые ${r.interval} ${FREQ_UNIT_PLURAL[r.freq] || ''}` : FREQ_SINGLE_PHRASE[r.freq] || ''
  return `${every}, с ${new Date(r.startDate).toLocaleDateString('ru-RU')}`
}

const occurrencesByWork = computed(() => {
  const map = new Map()
  for (const occ of store.calendarOccurrences) {
    const list = map.get(occ.workId) || []
    list.push(occ)
    map.set(occ.workId, list)
  }
  return map
})

const showForm = ref(false)
const form = reactive({ title: '', levelId: 'l1', freq: 'WEEKLY', interval: 1, startDate: new Date().toISOString().slice(0, 10) })

function submit() {
  if (!form.title.trim() || !form.startDate) return
  addCalendarWork({
    title: form.title.trim(),
    levelId: form.levelId,
    freq: form.freq,
    interval: Number(form.interval) || 1,
    startDate: form.startDate,
    notifyBeforeMinutes: 60
  })
  form.title = ''
  form.interval = 1
  showForm.value = false
}
</script>

<template>
  <button class="btn btn--ghost" style="margin-bottom:16px;" @click="$emit('back')">
    <Icon name="i-chev-l" />К обзору
  </button>

  <section class="block">
    <div v-if="!store.calendarWorks.length" class="empty">
      <Icon name="i-calendar" />
      <p>Повторяющихся работ пока нет</p>
    </div>

    <div v-else class="stack">
      <div v-for="work in store.calendarWorks" :key="work.id" class="card card-pad">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span class="row__icon"><Icon :name="roleById.get(work.levelId)?.icon ?? 'i-calendar'" /></span>
          <span style="flex:1;min-width:0;">
            <p class="row__title">{{ work.title }}</p>
            <p class="row__meta">{{ roleById.get(work.levelId)?.tag }} · {{ recurrenceSummary(work) }}</p>
          </span>
          <button class="delete-btn" aria-label="Удалить работу" @click="deleteCalendarWork(work.id)">
            <Icon name="i-trash" />
          </button>
        </div>

        <div v-if="occurrencesByWork.get(work.id)?.length" style="margin-top:12px;" class="list">
          <div v-for="occ in occurrencesByWork.get(work.id)" :key="occ.id" class="row">
            <span class="row__icon" :class="{ gold: occ.status === 'pending' }">
              <Icon :name="occ.status === 'completed' ? 'i-check-c' : occ.status === 'skipped' ? 'i-close' : 'i-clock'" />
            </span>
            <span class="row__body">
              <p class="row__title">{{ new Date(occ.scheduledAt).toLocaleDateString('ru-RU') }}</p>
              <p class="row__meta">{{ OCC_STATUS_LABEL[occ.status] }}</p>
            </span>
            <template v-if="occ.status === 'pending'">
              <button
                class="edit-btn"
                aria-label="Отметить выполненным"
                @click="updateCalendarOccurrence(occ.id, 'completed', 'admin')"
              >
                <Icon name="i-check" />
              </button>
              <button
                class="neutral-btn"
                aria-label="Пропустить"
                @click="updateCalendarOccurrence(occ.id, 'skipped', 'admin')"
              >
                <Icon name="i-close" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section v-if="!showForm" class="block">
    <button class="btn btn--tint" @click="showForm = true">
      <Icon name="i-plus" />Добавить повторяющуюся работу
    </button>
  </section>

  <section v-else class="block">
    <div class="card card-pad">
      <div class="form-field">
        <label>Название работы</label>
        <input v-model="form.title" type="text" placeholder="Например, Промывка лотков">
      </div>
      <div class="form-field">
        <label>Уровень ответственности</label>
        <div class="chip-toggles">
          <button
            v-for="lv in ['l1', 'l2', 'l3', 'l4']" :key="lv" type="button" class="chip-toggle"
            :class="{ 'is-active': form.levelId === lv }" @click="form.levelId = lv"
          >
            <Icon :name="roleById.get(lv)?.icon" />{{ roleById.get(lv)?.tag }}
          </button>
        </div>
      </div>
      <div class="form-field">
        <label>Периодичность</label>
        <div class="segmented">
          <button
            v-for="f in FREQ_OPTIONS" :key="f.value" type="button" class="segmented__opt"
            :class="{ 'is-active': form.freq === f.value }" @click="form.freq = f.value"
          >
            {{ f.label }}
          </button>
        </div>
      </div>
      <div class="form-field">
        <label>Интервал (каждые N {{ FREQ_UNIT[form.freq] }})</label>
        <input v-model.number="form.interval" type="number" min="1">
      </div>
      <div class="form-field">
        <label>Дата начала</label>
        <input v-model="form.startDate" type="date">
      </div>
      <button class="btn btn--primary" style="margin-top:6px;" @click="submit">
        <Icon name="i-check" />Добавить
      </button>
    </div>
  </section>
</template>
