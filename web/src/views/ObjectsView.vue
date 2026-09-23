<script setup>
import { computed } from 'vue'
import Icon from '../components/Icon.vue'
import { useFetch } from '../composables/useFetch'
import { api } from '../api/client'

const { data: objectsResp, loading, error } = useFetch(api.objects())
const { data: roles } = useFetch(api.roles())

const objects = computed(() => objectsResp.value?.items ?? [])
const roleByLevel = computed(() => {
  const map = new Map()
  for (const r of roles.value ?? []) map.set(r.level, r)
  return map
})
</script>

<template>
  <p v-if="loading" class="row__meta">Загрузка…</p>
  <p v-else-if="error" class="row__meta">Ошибка загрузки /mocks/objects.json: {{ error.message }}</p>

  <section v-else class="block">
    <div v-if="!objects.length" class="empty">
      <Icon name="i-check-c" />
      <p>Все объекты в норме</p>
    </div>

    <div v-else class="stack">
      <div v-for="o in objects" :key="o.id" class="obj-card" :class="`accent-${o.status}`">
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
      </div>
    </div>
  </section>
</template>
