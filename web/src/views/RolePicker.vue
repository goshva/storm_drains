<script setup>
import Icon from '../components/Icon.vue'
import { useFetch } from '../composables/useFetch'
import { api } from '../api/client'
import { formatToday } from '../utils/date'

const emit = defineEmits(['select'])

const { data: roles, loading, error } = useFetch(api.roles())
const today = formatToday()
</script>

<template>
  <div class="picker">
    <div class="picker__brand">
      <div class="picker__mark"><Icon name="i-shield" /></div>
      <p class="picker__name serif">Поместье · Ливнёвая система</p>
      <p class="picker__sub">Vue 3 / Vite прототип. Данные загружаются через fetch() из mock-JSON, повторяющего контракт api/openapi.yaml</p>
      <span class="picker__date">{{ today }}</span>
    </div>

    <p class="picker__label">Роли в системе</p>

    <p v-if="loading" class="row__meta">Загрузка ролей…</p>
    <p v-else-if="error" class="row__meta">Не удалось загрузить /mocks/roles.json: {{ error.message }}</p>

    <div v-else class="list">
      <button
        v-for="role in roles"
        :key="role.id"
        class="row"
        @click="emit('select', role.id)"
      >
        <span class="row__icon" :class="{ gold: role.level === 0 }">
          <Icon :name="role.icon" />
        </span>
        <span class="row__body">
          <p class="row__title">{{ role.name }}</p>
          <p class="row__meta">{{ role.description }}</p>
        </span>
        <Icon name="i-chev-r" class="row__chev" />
      </button>
    </div>
  </div>
</template>
