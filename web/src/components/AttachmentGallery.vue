<script setup>
import Icon from './Icon.vue'

const props = defineProps({
  attachments: { type: Array, required: true },
  deletable: { type: Boolean, default: false }
})
const emit = defineEmits(['delete'])

function formatCoords(loc) {
  return `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`
}
</script>

<template>
  <div v-if="!props.attachments.length" class="empty">
    <Icon name="i-camera" />
    <p>Фотофиксаций пока нет</p>
  </div>

  <div v-else class="stack">
    <div v-for="a in props.attachments" :key="a.id" class="card card-pad" style="display:flex;gap:12px;align-items:center;">
      <img :src="a.url" alt="" style="width:56px;height:56px;border-radius:10px;object-fit:cover;flex:none;">
      <span style="flex:1;min-width:0;">
        <p class="row__meta">{{ new Date(a.uploadedAt).toLocaleString('ru-RU') }}</p>
        <p class="row__meta">
          <Icon name="i-pin" class="row__chev" />
          {{ a.location ? formatCoords(a.location) : 'Без геометки' }}
        </p>
      </span>
      <button v-if="props.deletable" class="delete-btn" aria-label="Удалить фото" @click="emit('delete', a.id)">
        <Icon name="i-trash" />
      </button>
    </div>
  </div>
</template>
