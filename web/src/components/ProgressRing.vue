<script setup>
import { computed } from 'vue'

const props = defineProps({
  percent: { type: Number, required: true }
})

const size = 52
const stroke = 5
const radius = (size - stroke) / 2
const circumference = 2 * Math.PI * radius
const offset = computed(() => circumference * (1 - props.percent / 100))
</script>

<template>
  <div class="ring">
    <svg :viewBox="`0 0 ${size} ${size}`">
      <circle :cx="size / 2" :cy="size / 2" :r="radius" fill="none" stroke="var(--border-soft)" :stroke-width="stroke" />
      <circle
        :cx="size / 2" :cy="size / 2" :r="radius" fill="none" stroke="var(--accent)"
        :stroke-width="stroke" stroke-linecap="round"
        :stroke-dasharray="circumference" :stroke-dashoffset="offset"
      />
    </svg>
    <div class="ring__num">{{ percent }}%</div>
  </div>
</template>
