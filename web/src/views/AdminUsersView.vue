<script setup>
import { computed, reactive, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { state as store, addUser, editUser, deleteUser } from '../store/mockStore'
import { roleTileClass } from '../utils/roleTile'

const assignableRoles = computed(() => store.roles.filter((r) => r.id !== 'admin'))
const roleById = computed(() => {
  const map = new Map()
  for (const r of store.roles) map.set(r.id, r)
  return map
})

const editingId = ref(null)
const editForm = reactive({ name: '', roleId: null })

function startEdit(user) {
  editingId.value = user.id
  editForm.name = user.name
  editForm.roleId = user.roleId
}
function saveEdit(userId) {
  if (!editForm.name.trim() || !editForm.roleId) return
  editUser(userId, { name: editForm.name.trim(), roleId: editForm.roleId })
  editingId.value = null
}

const showForm = ref(false)
const form = reactive({ name: '', roleId: null })

function submit() {
  if (!form.name.trim() || !form.roleId) return
  addUser({ name: form.name.trim(), roleId: form.roleId })
  form.name = ''
  form.roleId = null
  showForm.value = false
}
</script>

<template>
  <section class="block">
    <div class="list">
      <div v-for="u in store.users" :key="u.id" class="row" style="align-items:flex-start;">
        <template v-if="editingId === u.id">
          <span style="flex:1;min-width:0;">
            <div class="form-field"><input v-model="editForm.name" type="text"></div>
            <div class="form-field">
              <div class="chip-toggles">
                <button
                  v-for="r in assignableRoles" :key="r.id" type="button" class="chip-toggle"
                  :class="{ 'is-active': editForm.roleId === r.id }" @click="editForm.roleId = r.id"
                >
                  <Icon :name="r.icon" />{{ r.name }}
                </button>
              </div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn--primary" style="flex:1;" @click="saveEdit(u.id)"><Icon name="i-check" />Сохранить</button>
              <button class="btn btn--ghost" style="flex:1;" @click="editingId = null">Отмена</button>
            </div>
          </span>
        </template>
        <template v-else>
          <span class="row__icon" :class="roleTileClass(roleById.get(u.roleId))">
            <Icon :name="roleById.get(u.roleId)?.icon ?? 'i-user'" />
          </span>
          <span class="row__body">
            <p class="row__title">{{ u.name }}</p>
            <p class="row__meta">{{ roleById.get(u.roleId)?.name ?? 'Без роли' }}</p>
          </span>
          <button class="edit-btn" aria-label="Редактировать" @click="startEdit(u)">
            <Icon name="i-admin" />
          </button>
          <button class="delete-btn" aria-label="Удалить пользователя" @click="deleteUser(u.id)">
            <Icon name="i-trash" />
          </button>
        </template>
      </div>
    </div>
  </section>

  <section v-if="!showForm" class="block">
    <button class="btn btn--tint" @click="showForm = true">
      <Icon name="i-plus" />Добавить пользователя
    </button>
  </section>

  <section v-else class="block">
    <div class="card card-pad">
      <div class="form-field">
        <label>Имя сотрудника</label>
        <input v-model="form.name" type="text" placeholder="Например, Анна Смирнова">
      </div>
      <div class="form-field">
        <label>Роль</label>
        <div class="chip-toggles">
          <button
            v-for="r in assignableRoles"
            :key="r.id"
            type="button"
            class="chip-toggle"
            :class="{ 'is-active': form.roleId === r.id }"
            @click="form.roleId = r.id"
          >
            <Icon :name="r.icon" />{{ r.name }}
          </button>
        </div>
      </div>
      <button class="btn btn--primary" style="margin-top:6px;" @click="submit">
        <Icon name="i-check" />Добавить пользователя
      </button>
    </div>
  </section>
</template>
