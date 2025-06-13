<script setup>
import { computed } from 'vue'
import TableCellRenderer from './TableCellRenderer.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  headers: {
    type: Array,
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

// Tối ưu: tính toán điều kiện màu sắc một lần
const rowColorClasses = computed(() => {
  return {
    'disabled-color': conditionChangeRowColor(props.item),
    'delete-color': conditionDeleteRowColor(props.item)
  }
})

function conditionChangeRowColor(item) {
  if (props.tableConfigs.hasOwnProperty('changeColorRow')) {
    if (props.tableConfigs.hasOwnProperty('keyCheck2')) {
      return item[props.tableConfigs.keyCheck1][props.tableConfigs.keyCheck2]
    } else {
      return item[props.tableConfigs.keyCheck1]
    }
  } else {
    return false
  }
}

function conditionDeleteRowColor(item) {
  if (props.tableConfigs.hasOwnProperty('changeColorRow')) {
    if (props.tableConfigs.hasOwnProperty('keyCheck3')) {
      return item[props.tableConfigs.keyCheck1][props.tableConfigs.keyCheck3]
    } else {
      return item[props.tableConfigs.keyCheck1]
    }
  } else {
    return false
  }
}

// Forward event to parent
function onEditDoiTuong(item, index) {
  emit('editDoiTuong', item, index)
}

function onXoaDoiTuong(item, index) {
  emit('xoaDoiTuong', item, index)
}

function onSelectDoiTuong(item, index) {
  emit('selectDoiTuong', item, index)
}
</script>

<template>
  <tr :class="rowColorClasses">
    <td 
      v-for="(header, headerIndex) in headers" 
      :key="headerIndex" 
      :class="header.class" 
      :width="header.hasOwnProperty('width') ? header.width : ''"
    >
      <TableCellRenderer
        :item="item"
        :header="header"
        :index="index"
        :page="page"
        :component-page="componentPage"
        :table-configs="tableConfigs"
        :check-exits="checkExits"
        :permisson="permisson"
        :loading-form="loadingForm"
        :title-edit="titleEdit"
        @edit-doi-tuong="onEditDoiTuong"
        @xoa-doi-tuong="onXoaDoiTuong"
        @select-doi-tuong="onSelectDoiTuong"
      />
    </td>
  </tr>
</template> 