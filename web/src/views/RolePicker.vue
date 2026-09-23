<script setup>
import Icon from '../components/Icon.vue'
import { state as store } from '../store/mockStore'
import { roleTileClass } from '../utils/roleTile'
import { formatToday } from '../utils/date'

const emit = defineEmits(['select'])

const today = formatToday()
</script>

<template>
  <div class="picker">
    <div class="picker__brand">
      <div class="picker__mark"><Icon name="i-shield" /></div>
      <p class="picker__name serif">Поместье · Ливнёвая система</p>
      <p class="picker__sub">Vue 3 / Vite прототип. Данные читаются и пишутся через мок-хранилище (mock JSON + localStorage), повторяющее контракт api/openapi.yaml</p>
      <span class="picker__date">{{ today }}</span>
    </div>

    <p class="picker__label">Роли в системе</p>

    <div class="list">
      <button
        v-for="role in store.roles"
        :key="role.id"
        class="row"
        @click="emit('select', role.id)"
      >
        <span class="row__icon" :class="roleTileClass(role)">
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
