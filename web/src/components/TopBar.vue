<script setup>
import Icon from './Icon.vue'
import { formatToday } from '../utils/date'

const props = defineProps({
  role: { type: Object, required: true },
  title: { type: String, required: true }
})

const today = formatToday()
</script>

<template>
  <header class="topbar">
    <div class="topbar__row">
      <div>
        <p class="topbar__eyebrow">
          <span class="topbar__roleicon" :title="props.role.tag" :aria-label="props.role.tag">
            <Icon :name="props.role.icon" />
          </span>
          {{ today }}
        </p>
        <h1 class="topbar__title serif">{{ title }}</h1>
      </div>
    </div>
  </header>
</template>
