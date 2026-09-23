<script setup>
import { ref } from 'vue'
import Icon from '../components/Icon.vue'
import { state as store, addRaciRow, deleteRaciRow, cycleRaciCell } from '../store/mockStore'

const LEVELS = ['l1', 'l2', 'l3', 'l4']
const LEGEND = [
  { k: 'r', label: 'Исполнитель' },
  { k: 'a', label: 'Ответственный' },
  { k: 'c', label: 'Согласующий' },
  { k: 'i', label: 'Информируемый' }
]

function cellClass(v) {
  if (v === 'R') return 'r'
  if (v === 'A') return 'a'
  if (v === 'C') return 'c'
  if (v === 'I') return 'i'
  return 'none'
}

const showForm = ref(false)
const operationName = ref('')

function submit() {
  if (!operationName.value.trim()) return
  addRaciRow(operationName.value.trim())
  operationName.value = ''
  showForm.value = false
}
</script>

<template>
  <section class="block">
    <div class="card card-pad">
      <table class="raci">
        <thead>
          <tr>
            <th>Операция</th>
            <th>I</th><th>II</th><th>III</th><th>IV</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in store.raci" :key="row.id">
            <td>{{ row.operation }}</td>
            <td v-for="lv in LEVELS" :key="lv">
              <button
                class="raci-tag"
                :class="cellClass(row.assignments[lv])"
                @click="cycleRaciCell(row.id, lv)"
              >
                {{ row.assignments[lv] || '—' }}
              </button>
            </td>
            <td>
              <button class="delete-btn" aria-label="Удалить операцию" @click="deleteRaciRow(row.id)">
                <Icon name="i-trash" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="raci-legend">
        <div v-for="x in LEGEND" :key="x.k" class="raci-legend__item">
          <span class="raci-tag" :class="x.k">{{ x.k.toUpperCase() }}</span>
          <span>{{ x.label }}</span>
        </div>
      </div>
      <p class="row__meta" style="margin-top:10px;">Нажмите на ячейку, чтобы изменить назначение роли</p>
    </div>
  </section>

  <section v-if="!showForm" class="block">
    <button class="btn btn--tint" @click="showForm = true">
      <Icon name="i-plus" />Добавить операцию
    </button>
  </section>

  <section v-else class="block">
    <div class="card card-pad">
      <div class="form-field">
        <label>Название операции</label>
        <input v-model="operationName" type="text" placeholder="Например, Осмотр колодцев">
      </div>
      <button class="btn btn--primary" @click="submit">
        <Icon name="i-check" />Добавить операцию
      </button>
    </div>
  </section>
</template>
