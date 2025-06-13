<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Object, Array, String, Number, null],
    default: null
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

const emit = defineEmits(['update:modelValue', 'update:focused', 'update:search', 'change-model-value'])

const handleUpdateFocused = (focused) => {
  emit('update:focused', focused, props.itemConfig)
}

const handleUpdateSearch = (val) => {
  emit('update:search', val)
}

const handleUpdateModel = () => {
  emit('change-model-value', props.itemConfig)
}

// Prepare custom filter if needed
const customFilter = {
  "VanBanChiDao": function (itemTitle, queryText, item) {
    const textOne = item.raw.SoHieuVanBan.toLowerCase()
    const textTwo = item.raw.TieuDeVanBan.toLowerCase()
    const searchText = queryText.toLowerCase()
    return textOne.indexOf(searchText) > -1 || textTwo.indexOf(searchText) > -1
  },
  "LoaiHoSoNghiepVu": function (itemTitle, queryText, item) {
    const textOne = item.raw.MaMuc.toLowerCase()
    const textTwo = item.raw.TenMuc.toLowerCase()
    const searchText = queryText.toLowerCase()
    return textOne.indexOf(searchText) > -1 || textTwo.indexOf(searchText) > -1
  }
}
</script>

<template>
  <v-combobox
    class="flex input-form"
    :no-data-text="itemConfig.api ? 'Không có dữ liệu' : undefined"
    :hide-no-data="!itemConfig.api"
    :model-value="modelValue"
    :return-object="itemConfig.hasOwnProperty('returnObject') && !itemConfig.returnObject ? false : true"
    :items="itemConfig.dataSource"
    :multiple="itemConfig.multiple"
    :item-title="itemConfig.itemText"
    :item-value="itemConfig.itemValue"
    :chips="itemConfig.hasOwnProperty('chips')"
    :closable-chips="itemConfig.hasOwnProperty('chips')"
    dense
    solo
    hide-details="auto"
    :readonly="itemConfig.hasOwnProperty('edit') && !itemConfig.edit"
    :clearable="(!itemConfig.hasOwnProperty('edit') || itemConfig.edit) && (!itemConfig.hasOwnProperty('clearable') || itemConfig.clearable)"
    :required="itemConfig.required"
    :rules="rules"
    @update:focused="handleUpdateFocused"
    @update:search="handleUpdateSearch"
    @update:model-value="handleUpdateModel"
    :loading="itemConfig.loading"
    :custom-filter="itemConfig.hasOwnProperty('customFilter') ? customFilter[itemConfig.customFilter] : undefined"
  >
    <template v-if="itemConfig.hasOwnProperty('tempCode')" v-slot:item="{ props, item }">
      <v-list-item v-bind="props" class="pa-2" style="cursor: pointer">
        <template v-slot:title>
          <span>
            <b>{{ item.raw[itemConfig.tempCode] }}</b> - <span>{{ item.raw[itemConfig.tempName] }}</span>
          </span>
        </template>
      </v-list-item>
    </template>

    <template v-if="itemConfig.hasOwnProperty('tempCode')" v-slot:selection="{ props, item }">
      <div v-bind="props">
        <span>
          <b>{{ item.raw[itemConfig.tempCode] }}</b> - <span>{{ item.raw[itemConfig.tempName] }}</span>
        </span>
      </div>
    </template>
  </v-combobox>
</template> 