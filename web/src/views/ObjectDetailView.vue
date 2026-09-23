<script setup>
import { computed, reactive, ref } from 'vue'
import Icon from '../components/Icon.vue'
import AttachmentGallery from '../components/AttachmentGallery.vue'
import PhotoCapture from '../components/PhotoCapture.vue'
import {
  state as store,
  editObject,
  deleteObject,
  getObjectHistory,
  getObjectAttachments,
  addObjectAttachment,
  deleteObjectAttachment
} from '../store/mockStore'

const props = defineProps({
  objectId: { type: String, required: true },
  adminMode: { type: Boolean, default: false },
  actorId: { type: String, default: null }
})
const emit = defineEmits(['back'])

const STATUS_LABEL = { ok: 'Норма', warn: 'Внимание', crit: 'Критично' }
const OPERATIONAL_LEVELS = [1, 2, 3, 4]

const object = computed(() => store.objects.find((o) => o.id === props.objectId))
const roleByLevel = computed(() => {
  const map = new Map()
  for (const r of store.roles) map.set(r.level, r)
  return map
})
const history = computed(() => getObjectHistory(props.objectId))
const attachments = computed(() => getObjectAttachments(props.objectId))

const editing = ref(false)
const form = reactive({ name: '', zone: '', status: 'ok', issue: '', levels: [] })

function startEdit() {
  if (!object.value) return
  form.name = object.value.name
  form.zone = object.value.zone
  form.status = object.value.status
  form.issue = object.value.issue || ''
  form.levels = [...object.value.levels]
  editing.value = true
}
function toggleLevel(lv) {
  const idx = form.levels.indexOf(lv)
  if (idx === -1) form.levels.push(lv)
  else form.levels.splice(idx, 1)
}
function saveEdit() {
  if (!form.name.trim()) return
  editObject(
    props.objectId,
    {
      name: form.name.trim(),
      zone: form.zone.trim(),
      status: form.status,
      issue: form.issue.trim() || null,
      levels: [...form.levels]
    },
    props.actorId
  )
  editing.value = false
}
function remove() {
  deleteObject(props.objectId)
  emit('back')
}
</script>

<template>
  <template v-if="object">
    <button class="btn btn--ghost" style="margin-bottom:16px;" @click="emit('back')">
      <Icon name="i-chev-l" />К списку объектов
    </button>

    <section class="block">
      <div class="card card-pad" :class="`accent-${object.status}`">
        <div class="kv"><span class="kv__k">Статус</span><span class="kv__v">{{ STATUS_LABEL[object.status] }}</span></div>
        <div class="kv"><span class="kv__k">Зона</span><span class="kv__v">{{ object.zone }}</span></div>
        <div class="kv">
          <span class="kv__k">Ответственный уровень</span>
          <span class="kv__v">
            <span class="level-chips">
              <span v-for="lv in object.levels" :key="lv" class="level-chip" :title="roleByLevel.get(lv)?.tag">
                <Icon v-if="roleByLevel.get(lv)" :name="roleByLevel.get(lv).icon" />
              </span>
            </span>
          </span>
        </div>
        <div class="kv"><span class="kv__k">Обновлено</span><span class="kv__v">{{ new Date(object.updatedAt).toLocaleString('ru-RU') }}</span></div>
        <p v-if="object.issue" class="row__meta" style="margin-top:10px;white-space:normal;">{{ object.issue }}</p>
      </div>
    </section>

    <section v-if="adminMode" class="block">
      <div v-if="!editing" style="display:flex;gap:10px;">
        <button class="btn btn--tint" style="flex:1;" @click="startEdit"><Icon name="i-admin" />Изменить</button>
        <button class="btn btn--danger" style="flex:1;" @click="remove"><Icon name="i-trash" />Удалить</button>
      </div>
      <div v-else class="card card-pad">
        <div class="form-field"><label>Название</label><input v-model="form.name" type="text"></div>
        <div class="form-field"><label>Зона</label><input v-model="form.zone" type="text"></div>
        <div class="form-field">
          <label>Статус</label>
          <div class="segmented">
            <button
              v-for="s in Object.keys(STATUS_LABEL)" :key="s" type="button" class="segmented__opt"
              :class="{ 'is-active': form.status === s }" @click="form.status = s"
            >{{ STATUS_LABEL[s] }}</button>
          </div>
        </div>
        <div class="form-field"><label>Описание проблемы</label><input v-model="form.issue" type="text" placeholder="Необязательно"></div>
        <div class="form-field">
          <label>Ответственные уровни</label>
          <div class="chip-toggles">
            <button
              v-for="lv in OPERATIONAL_LEVELS" :key="lv" type="button" class="chip-toggle"
              :class="{ 'is-active': form.levels.includes(lv) }" @click="toggleLevel(lv)"
            >
              <Icon v-if="roleByLevel.get(lv)" :name="roleByLevel.get(lv).icon" />{{ roleByLevel.get(lv)?.tag }}
            </button>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:6px;">
          <button class="btn btn--primary" style="flex:1;" @click="saveEdit"><Icon name="i-check" />Сохранить</button>
          <button class="btn btn--ghost" style="flex:1;" @click="editing = false">Отмена</button>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="block__head"><span class="block__title">Фотофиксация</span></div>
      <PhotoCapture :actor-id="actorId" @captured="(a) => addObjectAttachment(objectId, a)" />
      <div style="margin-top:12px;">
        <AttachmentGallery
          :attachments="attachments"
          :deletable="adminMode"
          @delete="(id) => deleteObjectAttachment(objectId, id)"
        />
      </div>
    </section>

    <section v-if="history.length" class="block">
      <div class="block__head"><span class="block__title">История изменений</span></div>
      <div class="list">
        <div v-for="h in history" :key="h.id" class="row">
          <span class="row__icon"><Icon name="i-clock" /></span>
          <span class="row__body">
            <p class="row__title">{{ STATUS_LABEL[h.status] }}</p>
            <p class="row__meta">{{ new Date(h.changedAt).toLocaleString('ru-RU') }}{{ h.issue ? ' · ' + h.issue : '' }}</p>
          </span>
        </div>
      </div>
    </section>
  </template>
</template>
