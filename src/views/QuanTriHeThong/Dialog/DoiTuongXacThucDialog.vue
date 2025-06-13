<template>
  <div>
    <v-dialog max-width="1000" v-model="dialogModel" persistent scrollable>
      <v-card>
        <v-toolbar dark color="primary" class="px-0">
          <div class="sub-header d-flex align-center justify-start py-0 px-0">
            <div class="sub-header-content">Chọn đối tượng xác thực</div>
            <div class="triangle-header"></div>
          </div>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-custom"
              size="small"
              icon
              color="#E9FFF2"
              @click="close()"
            >
              <v-icon size="20">mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="px-3 pt-3">
          <v-row>
            <v-col cols="12" class="my-2 d-flex">
              <div class="w-100">
                <v-text-field
                  class="input-form"
                  v-model="keyword"
                  solo
                  dense
                  clearable
                  hide-details="auto"
                  placeholder="Tìm kiếm theo từ khoá ..."
                  append-inner-icon="mdi-magnify"
                  @click:append-inner="loadData()"
                  @click:clear="loadData()"
                  @keyup.enter="loadData()"
                >
                </v-text-field>
              </div>
              <div class="ml-3">
                <v-btn
                  class="btn-custom text-white"
                  color="var(--main-color)"
                  height="30"
                  @click="advanceSearch = !advanceSearch"
                >
                  <v-icon size="18" class="text-white mr-1">
                    {{
                      !advanceSearch
                        ? 'mdi-filter-variant-plus'
                        : 'mdi-filter-variant'
                    }}
                  </v-icon>
                  Tìm kiếm nâng cao
                </v-btn>
              </div>
            </v-col>
          </v-row>
          <v-row v-if="advanceSearch">
            <TimKiemNangCao
              ref="advanceSearchReference"
              :mauNhap="mauTimKiem"
              :dataInput="dataInputSearch"
              @submitSearch="submitAdvanceSearch"
            ></TimKiemNangCao>
          </v-row>

          <v-row class="mx-0 my-0 mt-2">
            <v-col class="px-0 py-0">
              <v-data-table
                :headers="headers"
                :items="items"
                :items-per-page="itemsPerPage"
                item-value="primKey"
                hide-default-footer
                class="table-base"
                :loading="loading"
                no-data-text="Không có dữ liệu"
                loading-text="Đang tải"
              >
                <template v-slot:item="{ item, index }">
                  <tr>
                    <td
                      v-for="(itemHeader, indexHeader) in headers"
                      :key="indexHeader"
                      :class="itemHeader['class']"
                      :width="
                        itemHeader.hasOwnProperty('width')
                          ? itemHeader.width
                          : ''
                      "
                    >
                      <div v-if="itemHeader.type == 'index'">
                        <div
                          v-if="itemsPerPage"
                          :style="
                            itemHeader.hasOwnProperty('style')
                              ? itemHeader.style
                              : ''
                          "
                        >
                          {{
                            (page + 1) * itemsPerPage - itemsPerPage + index + 1
                          }}
                        </div>
                      </div>
                      <div
                        v-else-if="itemHeader.type == 'action'"
                        :style="
                          itemHeader.hasOwnProperty('style')
                            ? itemHeader.style
                            : ''
                        "
                      >
                        <v-tooltip location="top">
                          <template v-slot:activator="{ props }">
                            <v-btn
                              :disabled="loading"
                              :loading="loading"
                              icon
                              @click.stop="handleSelectItem(item)"
                              variant="flat"
                              size="small"
                              v-bind="props"
                              class="mr-2"
                            >
                              <span style="color: var(--main-color)">
                                Chọn
                              </span>
                            </v-btn>
                          </template>
                          <span>Chọn</span>
                        </v-tooltip>
                      </div>
                      <div
                        v-else
                        :style="
                          itemHeader.hasOwnProperty('style')
                            ? itemHeader.style
                            : ''
                        "
                      >
                        {{ getValue(item, itemHeader.value) }}
                      </div>
                    </td>
                  </tr>
                </template>
              </v-data-table>
              <Pagination
                v-if="total"
                :pageInput="page + 1"
                :pageCount="pageCount"
                :total="total"
                :currentNumberPage="itemsPerPage"
                @changePage="changePage"
                @changeNumberPage="changeNumberPage"
                style="margin-bottom: 50px"
              >
              </Pagination>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { generalApi } from '@/api'
import { getValue, dateLocale } from '@/helpers/index'
const TimKiemNangCao = defineAsyncComponent(() =>
  import('@/components/TimKiemNangCao.vue')
)

const Pagination = defineAsyncComponent(() =>
  import('@/components/Pagination.vue')
)

const emit = defineEmits(['closePopup', 'savePopup'])

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default() {
      return {}
    },
  },
})
const dialogModel = ref(props.dialog)

const dataInputSearch = ref({})

const keyword = ref('')

const items = ref([])
const headers = ref([
  {
    key: 1,
    sortable: false,
    title: 'STT',
    align: 'center',
    value: 'stt',
    type: 'index',
    class: 'th-center verticalAlignTop td-center py-1',
    width: 50,
  },
  {
    key: 2,
    sortable: false,
    title: 'Tên cơ quan',
    align: 'center',
    value: 'ten_co_quan_quan_ly',
    type: 'text',
    class: 'th-left text-left verticalAlignTop',
    width: 150,
  },
  {
    key: 3,
    sortable: false,
    title: 'Mã cơ quan',
    align: 'center',
    value: 'co_quan_quan_ly_id',
    type: 'text',
    class: 'th-center text-center verticalAlignTop',
    width: 50,
  },
  {
    key: 4,
    value: 'action',
    sortable: false,
    title: 'Thao tác',
    align: 'center',
    type: 'action',
    class: 'th-center text-center',
    width: 50,
  },
])
const mauTimKiem = ref([])

const total = ref(0)
const page = ref(0)
const pageCount = ref(0)
const loading = ref(false)
const itemsPerPage = ref(10)

const advanceSearch = ref(false)
const url = ref(null)

const submitAdvanceSearch = function (dataSearch) {
  dataInputSearch.value = dataSearch
  getDanhSach('reset')
}

async function loadData() {
  try {
    let filter = {
      api: `/dulieuchu/tracuu/internal/coquanquanly/1.0/filter`,
      params: {
        size: itemsPerPage.value,
        page: page.value,
      },
    }
    generalApi.getData(filter).then((result) => {
      items.value = result.data.result
      total.value = result.data.totalItems
      pageCount.value = result.data.totalPages
    })
  } catch (error) {
    items.value = []
    console.log(error)
  }
}

const changePage = (data) => {
  page.value = data.value - 1
  loadData()
}

async function handleSelectItem(item) {
  emit('savePopup', item)
}

function close() {
  emit('closePopup')
}

onMounted(async () => {
  loadData()
})
</script>
