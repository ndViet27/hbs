<script setup>
import { ref, computed } from 'vue'
import TableRow from './TableRow.vue'
import TableGroupView from './TableGroupView.vue'
import { defineAsyncComponent } from 'vue'

const Pagination = defineAsyncComponent(() => import('../Pagination.vue'))

const props = defineProps({
  tableConfigs: {
    type: Object,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  page: {
    type: Number,
    default: 0
  },
  pageCount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingForm: {
    type: Boolean,
    default: false
  },
  permisson: {
    type: Object,
    default: () => ({ edit: true, delete: true, download: false })
  },
  selected: {
    type: Array,
    default: () => []
  },
  checkExits: {
    type: Function,
    required: true
  },
  componentPage: {
    type: Number,
    default: 0
  },
  titleEdit: {
    type: String,
    default: "Sửa"
  }
})

const emit = defineEmits(['editDoiTuong', 'xoaDoiTuong', 'selectDoiTuong', 'changePage'])

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

function onChangePage(page) {
  emit('changePage', page)
}
</script>

<template>
  <div>
    <!-- Group by table -->
    <v-data-table
      v-if="tableConfigs.groupBy"
      :headers="tableConfigs.headers"
      :items="items"
      :items-per-page="tableConfigs.itemsPerPage"
      item-value="primKey"
      hide-default-footer
      class="table-base table-tphs"
      no-data-text="Không có dữ liệu"
      loading-text="Đang tải"
      :loading="loading"
    >
      <template v-slot:item>
        <TableGroupView
          :groups="items"
          :headers="tableConfigs.headers"
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
    </v-data-table>

    <!-- Standard table -->
    <v-data-table
      v-else
      :headers="tableConfigs.headers"
      :items="items"
      :items-per-page="tableConfigs.itemsPerPage"
      :page="page+1"
      item-value="primKey"
      hide-default-footer
      class="table-base table-tphs"
      no-data-text="Không có dữ liệu"
      loading-text="Đang tải"
      :loading="loading"
    >
      <template v-slot:item="{ item, index }">
        <TableRow
          v-memo="[item, checkExits(item)]"
          :item="item"
          :headers="tableConfigs.headers"
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
      </template>
    </v-data-table>

    <!-- Pagination -->
    <Pagination 
      v-if="total" 
      :pageInput="page+1" 
      :pageCount="pageCount" 
      :total="total" 
      @changePage="onChangePage"
    />
  </div>
</template> 