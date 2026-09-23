<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
import { buildAttachment } from '../store/mockStore'

const props = defineProps({
  actorId: { type: String, default: null }
})
const emit = defineEmits(['captured'])

const fileInput = ref(null)
const busy = ref(false)

function pick() {
  fileInput.value?.click()
}

async function onChange(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  busy.value = true
  try {
    const attachment = await buildAttachment(file, props.actorId)
    emit('captured', attachment)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      capture="environment"
      style="display:none"
      @change="onChange"
    >
    <button class="btn btn--tint" :disabled="busy" @click="pick">
      <Icon name="i-camera" />{{ busy ? 'Обработка снимка…' : 'Фотофиксация с GPS-меткой' }}
    </button>
  </div>
</template>
