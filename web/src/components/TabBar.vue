<script setup>
import Icon from './Icon.vue'

const props = defineProps({
  tabs: { type: Array, required: true },
  active: { type: String, required: true }
})
const emit = defineEmits(['update:active'])
</script>

<template>
  <nav class="tabbar">
    <button
      v-for="tab in props.tabs"
      :key="tab.id"
      class="tab"
      :class="{ 'is-active': props.active === tab.id }"
      @click="emit('update:active', tab.id)"
    >
      <Icon :name="tab.icon" />
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>
