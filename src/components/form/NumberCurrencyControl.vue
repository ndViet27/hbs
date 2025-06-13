<script setup>
import { useNumberFormat } from '../../composables/useNumberFormat'

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

const emit = defineEmits(['update:modelValue'])

const { handleInputNumberCurrency } = useNumberFormat()

const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
  handleInputNumberCurrency(event.target.value, { [props.itemConfig.fieldName]: event.target.value }, props.itemConfig.fieldName)
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
    :readonly="itemConfig.hasOwnProperty('edit') && !itemConfig.edit"
    @input="updateValue"
  ></v-text-field>
</template> 