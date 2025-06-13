<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { useDatePicker } from '../../composables/useDatePicker'

const VueDatePicker = defineAsyncComponent(() =>
  import("@vuepic/vue-datepicker")
)

const props = defineProps({
  modelValueFrom: {
    type: [Date, String, null],
    default: null
  },
  modelValueTo: {
    type: [Date, String, null],
    default: null
  },
  itemConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'update:modelValueFrom', 
  'update:modelValueTo', 
  'open-date-picker', 
  'close-date-picker'
])

const { 
  textInputOptions, 
  formatDatePicker
} = useDatePicker()

const updateFromDate = (val) => {
  emit('update:modelValueFrom', val)
}

const updateToDate = (val) => {
  emit('update:modelValueTo', val)
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
  <v-row>
    <v-col>
      <VueDatePicker 
        class="flex" 
        position="left" 
        :enable-time-picker="false"
        select-text="Chọn" 
        cancel-text="Thoát"
        :model-value="modelValueFrom" 
        text-input 
        :format="formatDatePicker" 
        placeholder="dd/mm/yyyy" 
        :text-input-options="textInputOptions"
        auto-apply 
        locale="vi" 
        :day-names="['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
        @update:model-value="updateFromDate" 
        @open="openDatePicker(true)" 
        @closed="openDatePicker(false)"
        :min-date="itemConfig.hasOwnProperty('minDate') ? itemConfig.minDateValue : null"
        :max-date="modelValueTo ? modelValueTo : (itemConfig.hasOwnProperty('maxDate') ? itemConfig.maxDateValue : null)"
      />
    </v-col>
    <v-col class="px-0" style="width: 20px; max-width: 20px; padding-top: 15px;">
      <v-icon size="24" color="var(--main-color)">mdi-minus</v-icon>
    </v-col>
    <v-col>
      <VueDatePicker 
        class="flex" 
        position="left" 
        :enable-time-picker="false"
        select-text="Chọn" 
        cancel-text="Thoát"
        :model-value="modelValueTo" 
        text-input 
        :format="formatDatePicker" 
        placeholder="dd/mm/yyyy" 
        :text-input-options="textInputOptions"
        auto-apply 
        locale="vi" 
        :day-names="['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
        @update:model-value="updateToDate" 
        @open="openDatePicker(true)" 
        @closed="openDatePicker(false)"
        :min-date="modelValueFrom ? modelValueFrom : null"
        :max-date="itemConfig.hasOwnProperty('maxToDate') ? itemConfig.maxToDateValue : (itemConfig.hasOwnProperty('maxDate') ? itemConfig.maxDateValue : null)"
      />
    </v-col>
  </v-row>
</template> 