<script setup>
import { ref, defineAsyncComponent } from 'vue'

const VueDatePicker = defineAsyncComponent(() =>
  import("@vuepic/vue-datepicker")
)

const props = defineProps({
  modelValue: {
    type: [Date, String, null],
    default: null
  },
  itemConfig: {
    type: Object,
    required: true
  },
  formId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'open-date-picker', 'close-date-picker'])

const textInputOptions = ref({
  format: 'dd/MM/yyyy'
})

const formatDatePicker = (date) => {
  try {
    if (date && date.getDate) {
      const day = date.getDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
    }
  } catch (error) {
    console.error('Error formatting date', error)
  }
  return ''
}

const changeDatePicker = (val) => {
  emit('update:modelValue', val)
}

const openDatePicker = (open) => {
  if (open) {
    emit('open-date-picker', true, props.itemConfig)
  } else {
    emit('close-date-picker')
  }
}
</script>

<template>
  <VueDatePicker 
    class="flex" 
    position="left" 
    :enable-time-picker="false" 
    select-text="Chọn" 
    cancel-text="Thoát"
    :model-value="modelValue"
    text-input 
    :format="formatDatePicker" 
    placeholder="dd/mm/yyyy" 
    :text-input-options="textInputOptions"
    auto-apply 
    locale="vi" 
    :day-names="['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
    :disabled="itemConfig.hasOwnProperty('edit') && !itemConfig.edit"
    :min-date="itemConfig.hasOwnProperty('minDate') ? itemConfig.minDateValue : null"
    :max-date="itemConfig.hasOwnProperty('maxDate') ? itemConfig.maxDateValue : null"
    @update:model-value="changeDatePicker" 
    @open="openDatePicker(true)" 
    @closed="openDatePicker(false)"
  />
</template> 