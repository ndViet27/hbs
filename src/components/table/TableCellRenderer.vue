<script setup>
import { computed } from 'vue'
import { addressToString } from '@/helpers'
import TepTinDinhKem from '../TepTinDinhKem.vue'
import { dateLocale, dateLocaleTime, formatThousandSeparator, getValue } from '@/utils/formatters'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  header: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  page: {
    type: Number,
    default: 0
  },
  componentPage: {
    type: Number,
    default: 0
  },
  tableConfigs: {
    type: Object,
    required: true
  },
  checkExits: {
    type: Function,
    default: () => false
  },
  permisson: {
    type: Object,
    default: () => ({ edit: true, delete: true, download: false })
  },
  loadingForm: {
    type: Boolean,
    default: false
  },
  titleEdit: {
    type: String,
    default: "Sửa"
  }
})

const emit = defineEmits(['editDoiTuong', 'xoaDoiTuong', 'selectDoiTuong'])

const cellStyle = computed(() => props.header.hasOwnProperty('style') ? props.header.style : '')

const showValue = computed(() => {
  if (!props.header.hasOwnProperty('value')) return ''
  return getValue(props.item, props.header.value)
})

// Tối ưu: tính toán giá trị index một lần
const itemIndex = computed(() => {
  if (props.header.type === 'index') {
    if (props.tableConfigs.api) {
      return (props.page + 1) * props.tableConfigs.itemsPerPage - props.tableConfigs.itemsPerPage + props.index + 1
    } else if (props.tableConfigs?.setPageFromProp) {
      return (props.componentPage + 1) * props.tableConfigs.itemsPerPage - props.tableConfigs.itemsPerPage + props.index + 1
    } else {
      return props.index + 1
    }
  } else if (props.header.type === 'indexReverse') {
    return props.tableConfigs.itemsPerPage - props.index
  }
  return props.index + 1
})

// Methods that emit events back to parent
function editDoiTuong() {
  emit('editDoiTuong', props.item, props.index)
}

function xoaDoiTuong() {
  emit('xoaDoiTuong', props.item, props.index)
}

function selectDoiTuong() {
  emit('selectDoiTuong', props.item, props.index)
}
</script>

<template>
  <!-- Select Checkbox -->
  <div v-if="tableConfigs.selected && header.type === 'select'" :style="cellStyle">
    <v-checkbox
      class="checkbox-remember"
      color="var(--main-color)"
      :model-value="checkExits(item)"
      @click.stop="selectDoiTuong"
      hide-details
    />
  </div>

  <!-- Index types -->
  <div v-else-if="header.type === 'index' || header.type === 'indexReverse'" :style="cellStyle">
    {{ itemIndex }}
  </div>

  <!-- Date & DateTime -->
  <div v-else-if="header.type === 'date'" :style="cellStyle">
    {{ item.hasOwnProperty(header.value) ? dateLocale(item[header.value]) : '' }}
  </div>
  <div v-else-if="header.type === 'datetime'" :style="cellStyle">
    {{ item.hasOwnProperty(header.value) ? dateLocaleTime(item[header.value]) : '' }}
  </div>

  <!-- Boolean Value -->
  <div v-else-if="header.type === 'boolean'" :style="cellStyle">
    {{ item[header.value] ? 'Có' : 'Không' }}
  </div>

  <!-- Array & List Types -->
  <div v-else-if="header.type === 'arrayString'" :style="cellStyle">
    {{ item.hasOwnProperty(header.value) ? item[header.value].toString() : '' }}
  </div>
  <div v-else-if="header.type === 'list'" :style="cellStyle">
    <template v-if="!header.hasOwnProperty('mapping2') && item[header.value]">
      <div class="mt-1" v-for="(itemList, indexList) in item[header.value]" :key="indexList">
        <span>- {{ itemList[header.mapping] }}</span>
      </div>
    </template>
    <template v-else-if="header.hasOwnProperty('mapping2') && item[header.value]">
      <div class="mt-1" v-for="(itemList, indexList) in item[header.value][header.mapping]" :key="indexList">
        <span>- {{ itemList[header.mapping2] }}</span>
      </div>
    </template>
  </div>

  <!-- Mark/Check icon -->
  <div v-else-if="header.type === 'mark'" :style="cellStyle">
    <v-icon v-if="item[header.value]" size="22" color="var(--main-color)">mdi-check</v-icon>
  </div>

  <!-- File attachment component -->
  <div v-else-if="header.type === 'TepDinhKem'" :style="cellStyle">
    <TepTinDinhKem 
      idComponent="x"
      :tepInput="item[header.value] ? (Array.isArray(item[header.value]) ? item[header.value] : [item[header.value]]) : []" 
      :edit="false"
    />
  </div>

  <!-- Formatted currency/money -->
  <div v-else-if="header.type === 'money'" :style="cellStyle">
    <div class="mb-1">
      {{ item[header.value] ? `${formatThousandSeparator(getValue(item, header.value))}` : "" }}
    </div>
  </div>

  <!-- ID document details -->
  <div v-else-if="header.type === 'giaytotuythan'" :style="cellStyle">
    <div class="mb-1"><span class="text-bold">- Số CMND/ CCCD: </span>{{ item[header.value]['SoGiay'] }}</div>
    <div class="mb-1"><span class="text-bold">- Ngày cấp: </span>{{ dateLocale(item[header.value]['NgayCap']) }}</div>
    <div class="mb-1"><span class="text-bold">- Nơi cấp: </span>{{ item[header.value]['NoiCap'] }}</div>
  </div>

  <!-- Address formatter -->
  <div v-else-if="header.type === 'diachi'" :style="cellStyle">
    <span>{{ addressToString(item[header.value]) }}</span>
  </div>

  <!-- Action buttons -->
  <div v-else-if="header.type === 'action'" :style="cellStyle">
    <v-tooltip location="top" v-if="permisson.edit">
      <template v-slot:activator="{ props: tooltipProps }">
        <v-btn 
          :disabled="loadingForm" 
          icon 
          variant="flat" 
          size="small" 
          v-bind="tooltipProps" 
          class="mr-2" 
          @click.stop="editDoiTuong"
        >
          <v-icon size="18" color="var(--main-color)">mdi-file-document-edit-outline</v-icon>
        </v-btn>
      </template>
      <span>{{ titleEdit }}</span>
    </v-tooltip>
    <v-tooltip location="top" v-if="permisson.delete">
      <template v-slot:activator="{ props: tooltipProps }">
        <v-btn 
          :disabled="loadingForm" 
          icon 
          variant="flat" 
          size="small" 
          v-bind="tooltipProps" 
          class="mr-2" 
          @click.stop="xoaDoiTuong"
        >
          <v-icon size="18" color="#FF0000">mdi-close</v-icon>
        </v-btn>
      </template>
      <span>Xóa</span>
    </v-tooltip>
  </div>

  <!-- Default value display -->
  <div v-else :style="cellStyle">
    {{ showValue }}
  </div>
</template> 