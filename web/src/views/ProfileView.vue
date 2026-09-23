<script setup>
import Icon from '../components/Icon.vue'
import { roleTileClass } from '../utils/roleTile'

const props = defineProps({
  role: { type: Object, required: true }
})
const emit = defineEmits(['switch-role'])
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
    <button class="btn btn--ghost" @click="emit('switch-role')">
      <Icon name="i-chev-l" />Сменить роль
    </button>
  </section>
</template>
