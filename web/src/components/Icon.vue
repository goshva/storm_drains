<script setup>
defineProps({
  name: { type: String, required: true }
})
</script>

<template>
  <svg><use :href="`#${name}`" /></svg>
</template>
