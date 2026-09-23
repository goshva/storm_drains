<script setup>
import Icon from '../components/Icon.vue'
import { roleTileClass } from '../utils/roleTile'
import { themeState, setTheme } from '../store/theme'
import { pwaState, isStandalone, promptInstall } from '../store/pwa'

const props = defineProps({
  role: { type: Object, required: true }
})
const emit = defineEmits(['switch-role'])

const THEME_OPTIONS = [
  { value: 'system', label: 'Системная' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' }
]
</script>

<template>
  <section class="block">
    <div class="card card-pad" style="display:flex;align-items:center;gap:14px;">
      <span
        class="row__icon"
        :class="roleTileClass(props.role)"
        style="width:52px;height:52px;border-radius:14px;"
      >
        <Icon :name="props.role.icon" />
      </span>
      <div>
        <p class="row__title" style="font-size:17.5px;">{{ props.role.name }}</p>
        <p class="row__meta" style="white-space:normal;">{{ props.role.description }}</p>
      </div>
    </div>
  </section>

  <section class="block">
    <div class="block__head"><span class="block__title">Оформление</span></div>
    <div class="segmented">
      <button
        v-for="opt in THEME_OPTIONS"
        :key="opt.value"
        type="button"
        class="segmented__opt"
        :class="{ 'is-active': themeState.theme === opt.value }"
        @click="setTheme(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </section>

  <section v-if="pwaState.canInstall && !isStandalone()" class="block">
    <button class="btn btn--tint" @click="promptInstall">
      <Icon name="i-download" />Установить приложение
    </button>
  </section>

  <section class="block">
    <button class="btn btn--ghost" @click="emit('switch-role')">
      <Icon name="i-chev-l" />Сменить роль
    </button>
  </section>
</template>
