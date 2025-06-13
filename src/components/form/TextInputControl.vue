<script setup>
import { toRef } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  itemConfig: {
    type: Object,
    required: true
  },
  rules: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'keyup:enter', 'changeTextModelValue'])

const handleInput = (event) => {
  emit('update:modelValue', event)
  emit('changeTextModelValue', event, props.itemConfig)
}

const handlePressEnter = () => {
  if (props.itemConfig.hasOwnProperty('emitKeyup')) {
    emit('keyup:enter', props.itemConfig)
  }
}
</script>

<template>
  <v-text-field
    class="flex input-form"
    :model-value="modelValue"
    :placeholder="itemConfig.placeHolder"
    solo
    dense
    hide-details="auto"
    :clearable="!itemConfig.hasOwnProperty('edit') || itemConfig.edit"
    :required="itemConfig.required"
    :rules="rules"
    @update:model-value="handleInput"
    @keyup.enter.prevent="handlePressEnter"
    :readonly="itemConfig.hasOwnProperty('edit') && !itemConfig.edit"
  ></v-text-field>
</template> 