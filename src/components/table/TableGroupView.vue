<script setup>
import { computed } from 'vue'
import TableRow from './TableRow.vue'

const props = defineProps({
  groups: {
    type: Array,
    required: true
  },
  headers: {
    type: Array,
    required: true
  },
  page: {
    type: Number,
    default: 0
  },
  tableConfigs: {
    type: Object,
    required: true
  },
  checkExits: {
    type: Function,
    required: true
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

// Tính toán một lần số cột
const colSpan = computed(() => 
  props.tableConfigs.hasOwnProperty('colNumber') ? props.tableConfigs.colNumber : props.headers.length
)

// Forward events to parent
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
  <tbody>
    <!-- Loop through groups without a key on template -->
    <template v-for="(group, groupIndex) in groups" :key="'group-header-' + groupIndex">
      <!-- Group header row with key -->
      <tr>
        <td style="font-weight: 600" :colspan="colSpan">{{ group.name }}</td>
      </tr>
      
      <!-- Group items with v-memo for performance optimization -->
      <TableRow
        v-for="(item, itemIndex) in group.childrens"
        :key="item?.id || 'group-item-' + groupIndex + '-' + itemIndex"
        v-memo="[item, checkExits(item)]"
        :item="item"
        :headers="headers"
        :index="itemIndex"
        :page="page"
        :table-configs="tableConfigs"
        :check-exits="checkExits"
        :permisson="permisson"
        :loading-form="loadingForm"
        :title-edit="titleEdit"
        @edit-doi-tuong="onEditDoiTuong"
        @xoa-doi-tuong="onXoaDoiTuong"
        @select-doi-tuong="onSelectDoiTuong"
      />
    </template>
  </tbody>
</template> 