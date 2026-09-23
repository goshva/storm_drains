<script setup>
import { computed, reactive, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { state as store, addObject, deleteObject } from '../store/mockStore'

const props = defineProps({
  adminMode: { type: Boolean, default: false }
})

const roleByLevel = computed(() => {
  const map = new Map()
  for (const r of store.roles) map.set(r.level, r)
  return map
})

const OPERATIONAL_LEVELS = [1, 2, 3, 4]
const STATUS_LABEL = { ok: 'Норма', warn: 'Внимание', crit: 'Критично' }

const showForm = ref(false)
const form = reactive({ name: '', zone: '', status: 'ok', levels: [] })

function toggleLevel(lv) {
  const idx = form.levels.indexOf(lv)
  if (idx === -1) form.levels.push(lv)
  else form.levels.splice(idx, 1)
}

function submit() {
  if (!form.name.trim()) return
  addObject({ name: form.name.trim(), zone: form.zone.trim(), status: form.status, levels: [...form.levels] })
  form.name = ''
  form.zone = ''
  form.status = 'ok'
  form.levels = []
  showForm.value = false
}
</script>

<template>
  <section class="block">
    <div v-if="!store.objects.length" class="empty">
      <Icon name="i-check-c" />
      <p>Все объекты в норме</p>
    </div>

    <div v-else class="stack">
      <div v-for="o in store.objects" :key="o.id" class="obj-card" :class="`accent-${o.status}`">
        <span class="obj-card__icon"><Icon :name="o.icon" /></span>
        <span style="flex:1;min-width:0;">
          <span class="obj-card__top"><span class="obj-card__name">{{ o.name }}</span></span>
          <p class="obj-card__zone"><Icon name="i-pin" class="row__chev" /> {{ o.zone }}</p>
          <span class="obj-card__foot">
            <span class="level-chips">
              <span v-for="lv in o.levels" :key="lv" class="level-chip" :title="roleByLevel.get(lv)?.tag">
                <Icon v-if="roleByLevel.get(lv)" :name="roleByLevel.get(lv).icon" />
              </span>
            </span>
          </span>
        </span>
        <button
          v-if="props.adminMode"
          class="delete-btn"
          aria-label="Удалить объект"
          @click="deleteObject(o.id)"
        >
          <Icon name="i-trash" />
        </button>
      </div>
    </div>
  </section>

  <template v-if="props.adminMode">
    <section v-if="!showForm" class="block">
      <button class="btn btn--tint" @click="showForm = true">
        <Icon name="i-plus" />Добавить объект
      </button>
    </section>

    <section v-else class="block">
      <div class="card card-pad">
        <div class="form-field">
          <label>Название объекта</label>
          <input v-model="form.name" type="text" placeholder="Например, Дождеприёмник">
        </div>
        <div class="form-field">
          <label>Зона / расположение</label>
          <input v-model="form.zone" type="text" placeholder="Например, Южный сад">
        </div>
        <div class="form-field">
          <label>Статус</label>
          <div class="segmented">
            <button
              v-for="s in Object.keys(STATUS_LABEL)"
              :key="s"
              type="button"
              class="segmented__opt"
              :class="{ 'is-active': form.status === s }"
              @click="form.status = s"
            >
              {{ STATUS_LABEL[s] }}
            </button>
          </div>
        </div>
        <div class="form-field">
          <label>Ответственные уровни</label>
          <div class="chip-toggles">
            <button
              v-for="lv in OPERATIONAL_LEVELS"
              :key="lv"
              type="button"
              class="chip-toggle"
              :class="{ 'is-active': form.levels.includes(lv) }"
              @click="toggleLevel(lv)"
            >
              <Icon v-if="roleByLevel.get(lv)" :name="roleByLevel.get(lv).icon" />
              {{ roleByLevel.get(lv)?.tag }}
            </button>
          </div>
        </div>
        <button class="btn btn--primary" style="margin-top:6px;" @click="submit">
          <Icon name="i-check" />Добавить объект
        </button>
      </div>
    </section>
  </template>
</template>
