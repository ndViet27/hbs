<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { useDatePicker } from '../../composables/useDatePicker'

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
  }
})

const emit = defineEmits(['update:modelValue', 'open-date-picker', 'close-date-picker'])

const { 
  textInputOptionsDateTime, 
  formatDateTimePicker 
} = useDatePicker()

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
    select-text="Chọn" 
    cancel-text="Thoát"
    :model-value="modelValue" 
    text-input 
    :format="formatDateTimePicker" 
    placeholder="dd/mm/yyyy" 
    :text-input-options="textInputOptionsDateTime"
    time-picker-inline 
    auto-apply 
    locale="vi" 
    :day-names="['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
    :min-date="itemConfig.hasOwnProperty('minDate') ? itemConfig.minDateValue : null"
    :max-date="itemConfig.hasOwnProperty('maxDate') ? itemConfig.maxDateValue : null"
    @update:model-value="changeDatePicker" 
    @open="openDatePicker(true)" 
    @closed="openDatePicker(false)"
  />
</template> 