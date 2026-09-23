<script setup>
import { computed, reactive, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { state as store, addTaskDefinition, editTaskDefinition, deleteTaskDefinition } from '../store/mockStore'

defineEmits(['back'])

const LEVELS = ['l1', 'l2', 'l3', 'l4']
const activeLevel = ref('l1')

const levelRole = computed(() => store.roles.find((r) => r.id === activeLevel.value))
const tasks = computed(() => store.tasks[activeLevel.value] ?? [])

const editingId = ref(null)
const editForm = reactive({ title: '', note: '' })

function startEdit(task) {
  editingId.value = task.id
  editForm.title = task.title
  editForm.note = task.note
}
function saveEdit(taskId) {
  if (!editForm.title.trim() || !editForm.note.trim()) return
  editTaskDefinition(activeLevel.value, taskId, { title: editForm.title.trim(), note: editForm.note.trim() })
  editingId.value = null
}

const showForm = ref(false)
const form = reactive({ title: '', note: '' })
function submit() {
  if (!form.title.trim() || !form.note.trim()) return
  addTaskDefinition(activeLevel.value, { title: form.title.trim(), note: form.note.trim() })
  form.title = ''
  form.note = ''
  showForm.value = false
}
</script>

<template>
  <button class="btn btn--ghost" style="margin-bottom:16px;" @click="$emit('back')">
    <Icon name="i-chev-l" />К обзору
  </button>

  <section class="block">
    <div class="segmented">
      <button
        v-for="lv in LEVELS"
        :key="lv"
        type="button"
        class="segmented__opt"
        :class="{ 'is-active': activeLevel === lv }"
        @click="activeLevel = lv; editingId = null; showForm = false"
      >
        {{ store.roles.find((r) => r.id === lv)?.tag }}
      </button>
    </div>
  </section>

  <section class="block">
    <div class="block__head"><span class="block__title">{{ levelRole?.name }} — пункты чек-листа</span></div>
    <div class="list">
      <div v-for="task in tasks" :key="task.id" class="row" style="align-items:flex-start;">
        <template v-if="editingId === task.id">
          <span style="flex:1;min-width:0;">
            <div class="form-field"><input v-model="editForm.title" type="text"></div>
            <div class="form-field" style="margin-bottom:8px;"><input v-model="editForm.note" type="text"></div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn--primary" style="flex:1;" @click="saveEdit(task.id)"><Icon name="i-check" />Сохранить</button>
              <button class="btn btn--ghost" style="flex:1;" @click="editingId = null">Отмена</button>
            </div>
          </span>
        </template>
        <template v-else>
          <span class="row__body">
            <p class="row__title">{{ task.title }}</p>
            <p class="row__meta" style="white-space:normal;">{{ task.note }}</p>
          </span>
          <button class="edit-btn" style="margin-left:8px;" aria-label="Редактировать" @click="startEdit(task)">
            <Icon name="i-admin" />
          </button>
          <button class="delete-btn" aria-label="Удалить пункт" @click="deleteTaskDefinition(activeLevel, task.id)">
            <Icon name="i-trash" />
          </button>
        </template>
      </div>
    </div>
  </section>

  <section v-if="!showForm" class="block">
    <button class="btn btn--tint" @click="showForm = true">
      <Icon name="i-plus" />Добавить пункт чек-листа
    </button>
  </section>

  <section v-else class="block">
    <div class="card card-pad">
      <div class="form-field">
        <label>Название пункта</label>
        <input v-model="form.title" type="text" placeholder="Например, Осмотр решёток">
      </div>
      <div class="form-field">
        <label>Пояснение</label>
        <input v-model="form.note" type="text" placeholder="Например, После осадков, весь периметр">
      </div>
      <button class="btn btn--primary" style="margin-top:6px;" @click="submit">
        <Icon name="i-check" />Добавить
      </button>
    </div>
  </section>
</template>
