<script setup>
import { computed } from 'vue'
import Icon from '../components/Icon.vue'
import { state as store } from '../store/mockStore'

const emit = defineEmits(['navigate'])

const critCount = computed(() => store.objects.filter((o) => o.status === 'crit').length)

const LINKS = [
  { tab: 'objects', label: 'Объекты', desc: 'Добавление и удаление объектов системы', icon: 'i-grid', cls: '' },
  { tab: 'roles', label: 'Роли пользователей', desc: 'Назначение сотрудников на роли', icon: 'i-users', cls: 'indigo' },
  { tab: 'tasks', label: 'Чек-листы', desc: 'Пункты регламента по уровням', icon: 'i-tasks', cls: 'gold' },
  { tab: 'matrix', label: 'Матрица ответственности', desc: 'RACI по операциям обслуживания', icon: 'i-admin', cls: 'indigo' },
  { tab: 'calendar', label: 'Календарь работ', desc: 'Повторяющиеся работы и напоминания', icon: 'i-calendar', cls: 'gold' }
]
</script>

<template>
  <section class="block">
    <div class="kpi-grid">
      <div class="kpi">
        <p class="kpi__label"><Icon name="i-grid" />Объектов</p>
        <p class="kpi__value">{{ store.objects.length }}</p>
        <p class="kpi__sub">в реестре системы</p>
      </div>
      <div class="kpi">
        <p class="kpi__label"><Icon name="i-users" />Пользователей</p>
        <p class="kpi__value">{{ store.users.length }}</p>
        <p class="kpi__sub">закреплено за ролями</p>
      </div>
      <div class="kpi">
        <p class="kpi__label"><Icon name="i-admin" />Операций в матрице</p>
        <p class="kpi__value">{{ store.raci.length }}</p>
        <p class="kpi__sub">зон ответственности</p>
      </div>
      <div class="kpi">
        <p class="kpi__label"><Icon name="i-alert" />Критических объектов</p>
        <p class="kpi__value" :class="critCount > 0 ? 'c-crit' : 'c-ok'">{{ critCount }}</p>
        <p class="kpi__sub">{{ critCount > 0 ? 'требуют реакции' : 'нет событий' }}</p>
      </div>
    </div>
  </section>

  <section class="block">
    <div class="block__head"><span class="block__title">Управление</span></div>
    <div class="list">
      <button v-for="l in LINKS" :key="l.tab" class="row" @click="emit('navigate', l.tab)">
        <span class="row__icon" :class="l.cls"><Icon :name="l.icon" /></span>
        <span class="row__body">
          <p class="row__title">{{ l.label }}</p>
          <p class="row__meta">{{ l.desc }}</p>
        </span>
        <Icon name="i-chev-r" class="row__chev" />
      </button>
    </div>
  </section>
</template>
