<script setup>
import { computed } from 'vue'
import Icon from '../components/Icon.vue'
import { state as store } from '../store/mockStore'

const okCount = computed(() => store.objects.filter((o) => o.status === 'ok').length)
const critCount = computed(() => store.objects.filter((o) => o.status === 'crit').length)
const operationalRoles = computed(() => store.roles.filter((r) => r.level >= 1 && r.level <= 4))
const attention = computed(() => store.objects.filter((o) => o.status !== 'ok'))
</script>

<template>
  <section class="block">
    <div class="kpi-grid">
      <div class="kpi">
        <p class="kpi__label"><Icon name="i-grid" />Всего объектов</p>
        <p class="kpi__value">{{ store.objects.length }}</p>
        <p class="kpi__sub">в реестре системы</p>
      </div>
      <div class="kpi">
        <p class="kpi__label"><Icon name="i-check-c" />В норме</p>
        <p class="kpi__value c-ok">{{ okCount }} / {{ store.objects.length }}</p>
        <p class="kpi__sub">по данным обхода</p>
      </div>
      <div class="kpi" style="grid-column: span 2;">
        <p class="kpi__label"><Icon name="i-alert" />Критических событий</p>
        <p class="kpi__value" :class="critCount > 0 ? 'c-crit' : 'c-ok'">{{ critCount }}</p>
        <p class="kpi__sub">{{ critCount > 0 ? 'требуют реакции' : 'нет событий' }}</p>
      </div>
    </div>
  </section>

  <section class="block">
    <div class="block__head"><span class="block__title">Уровни контроля</span></div>
    <div class="list">
      <div v-for="role in operationalRoles" :key="role.id" class="row">
        <span class="row__icon"><Icon :name="role.icon" /></span>
        <span class="row__body">
          <p class="row__title">{{ role.name }}</p>
          <p class="row__meta">{{ role.description }}</p>
        </span>
      </div>
    </div>
  </section>

  <section class="block">
    <div class="block__head"><span class="block__title">Требуют внимания</span></div>
    <div v-if="!attention.length" class="empty">
      <Icon name="i-check-c" />
      <p>Все объекты в норме</p>
    </div>
    <div v-else class="stack">
      <div v-for="o in attention" :key="o.id" class="obj-card" :class="`accent-${o.status}`">
        <span class="obj-card__icon"><Icon :name="o.icon" /></span>
        <span style="flex:1;min-width:0;">
          <span class="obj-card__top"><span class="obj-card__name">{{ o.name }}</span></span>
          <p class="obj-card__zone"><Icon name="i-pin" class="row__chev" /> {{ o.zone }}</p>
        </span>
      </div>
    </div>
  </section>
</template>
