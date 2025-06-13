<script setup>
import { useCookies } from 'vue3-cookies'
import { useRouter, useRoute } from 'vue-router'
import {
  ref,
  reactive,
  computed,
  onMounted,
  watch,
  defineAsyncComponent,
} from 'vue'
import { useAppStore } from '@/stores'
import { generalApi, hosoApi } from '@/api'
import {
  mergeAndSortHeaders,
  getValue,
  dateLocale,
  arrayToString,
} from '@/helpers'

const route = useRoute()
const router = useRouter()
const jsondata = ref(null)
const appStore = useAppStore()
const configCache = reactive({})
const moduleType = ref(route.meta.moduleType)
const props = defineProps({
  doituong: {
    type: String,
    default: '',
  },
})

const breakpointName = computed(() => appStore.getBreakpointName)
const Pagination = defineAsyncComponent(() =>
  import('@/components/Pagination.vue')
)
const TimKiemNangCao = defineAsyncComponent(() =>
  import('@/components/TimKiemNangCao.vue')
)
const FormCRUD = defineAsyncComponent(() => import('@/components/FormCRUD.vue'))
const TableView = defineAsyncComponent(() =>
  import('@/components/TableView.vue')
)
const headers = ref([])
const mauTimKiem = ref([])
const headersMobile = ref([])
const dataConfigBody = ref([])
const configsTableView = ref([])
const menuSelected = computed(() => appStore.getMenuSelected)
const subMenuSelected = computed(() => appStore.getSubMenuSelected)

const keywordSearch = ref('')
const dataInputSearch = ref({})
const dataInputSearchCopy = ref({})
const advanceSearchReference = ref(null)

const page = ref(0)
const total = ref(0)
const pageCount = ref(0)
const loading = ref(false)
const dsDoiTuong = ref([])
const itemsPerPage = ref(20)
const loadingData = ref(false)

const dsCapHoc = ref([])

const configError = ref(null)
const configLoaded = ref(false)

const refsFormSearch = ref(null)

const getConfigByModuleType = async () => {
  if (!moduleType.value) return null
  if (configCache[moduleType.value]) {
    return configCache[moduleType.value]
  }
  try {
    const config = await import(
      `@/metadata/StatisticsModule/${moduleType.value}.json`
    )
    configCache[moduleType.value] = config
    return config
  } catch (error) {
    console.error(`Error loading: ${moduleType.value}`, error)
    configError.value = error
    return null
  }
}

const loadConfiguration = async () => {
  try {
    configLoaded.value = false
    const config = await getConfigByModuleType()
    jsondata.value = config
    headers.value = config?.tableHeaders ?? []
    headersMobile.value = config?.tableHeadersMobile ?? []
    dataConfigBody.value = mergeAndSortHeaders(config?.tableHeaders)
    dataConfigBody.value = dataConfigBody.value.filter((item) => !item.isParent)
    configsTableView.value = config?.tableConfigs ?? []
    mauTimKiem.value = config?.formSearch ?? []

    dsDoiTuong.value = config?.tempDsDoiTuong ?? []

    configLoaded.value = true
    return config
  } catch (error) {
    configError.value = error
    throw error
  }
}

const setupPromise = loadConfiguration().then(async () => {
  keywordSearch.value = ''
  setTimeout(() => {
    refsFormSearch.value.initForm()
  }, 500)
  dataInputSearch.value = {}
  await getDsCapHoc()
  getDanhSach()
})

const changeNumberPage = function (numberPage) {
  itemsPerPage.value = numberPage.value
  getDanhSach('reset')
}

const changePage = function (pagePagination) {
  page.value = pagePagination.value - 1
  getDanhSach()
}

const getDsCapHoc = async () => {
  let filter = {
    api: '/dulieuchu/tracuu/internal/danhmuc/1.0/filter',
    params: {
      tenDanhMuc: 'dm_cap_hoc',
    },
  }

  await generalApi.getData(filter).then((res) => {
    dsCapHoc.value = res.data.result
  })
}

const getColumnCount = () => {
  if (!jsondata.value || !jsondata.value.tableHeaders) return 0

  if (Array.isArray(jsondata.value.tableHeaders[0])) {
    const firstRow = jsondata.value.tableHeaders[0]
    return firstRow.reduce((total, header) => {
      return total + (header.colspan || 1)
    }, 0)
  }
  return jsondata.value.tableHeaders.length
}

const handleThongKeDanhSach = async function () {
  if (refsFormSearch.value) {
    let valid = await refsFormSearch.value.validateForm()
    let data = await refsFormSearch.value.submit()

    if (!valid) {
      appStore.error('Vui lòng chọn đầy đủ thông tin')
      return
    }

    let filterData = {}
    mauTimKiem.value.map((el) => {
      if (el.fieldType === 'select' || el.fieldType === 'selectbox') {
        if (data && data.hasOwnProperty(el.fieldName) && data[el.fieldName]) {
          filterData[el.fieldName] = data[el.fieldName][el.itemValue]
        } else {
          filterData[el.fieldName] = ''
        }
      }
    })

    data = {
      ...data,
      ngayGuiBaoCao_DenNgay: dateLocale(data.ngayGuiBaoCao_DenNgay),
      ngayGuiBaoCao_TuNgay: dateLocale(data.ngayGuiBaoCao_TuNgay),
      ...filterData,
    }

    dataInputSearchCopy.value = { ...data }
    getDanhSach('reset')
  }
}

const handleChangeFormSearch = async function (item, data) {
  console.log(item, data)
  if (item?.fieldName === 'coQuanQuanLyId' && data) {
    await refsFormSearch.value.setAttributeFields(
      'coQuanQuanLyIdChildren',
      true,
      'edit'
    )
  } else {
    await refsFormSearch.value.setAttributeFields(
      'coQuanQuanLyIdChildren',
      false,
      'edit'
    )
    await refsFormSearch.value.setValue(null, 'coQuanQuanLyIdChildren')
  }
}

const handleXoaBoLoc = async function (data) {
  dataInputSearch.value = {}
  await refsFormSearch.value.resetForm()
}

const getDanhSach = function (type) {
  if (type == 'reset') {
    page.value = 0
  }
  let filter = {
    api: `/dulieuchu/tracuu/internal/statistic/1.0/${jsondata.value.collection}`,
    params: {
      page: page.value,
      size: itemsPerPage.value,
      keyword: keywordSearch.value ? keywordSearch.value : '',
      orderFields: 'ThoiGianTao',
      orderTypes: 'desc',
    },
  }

  if (dataInputSearchCopy.value) {
    filter.params = Object.assign(filter.params, dataInputSearchCopy.value)
  }

  if (filter.params?.coQuanQuanLyIdChildren) {
    filter.params.coQuanQuanLyId = filter.params.coQuanQuanLyIdChildren
  }
  if (!filter?.params.coQuanQuanLyId) {
    return
  }
  dsDoiTuong.value = []
  loadingData.value = true
  total.value = 0
  pageCount.value = 0
  generalApi
    .getData(filter)
    .then(function (result) {
      loadingData.value = false
      dsDoiTuong.value = result.data.result
      total.value = result.data.result.totalElements
      pageCount.value = result.data.result.totalPages
    })
    .catch(function () {
      loadingData.value = false
      dsDoiTuong.value = []
      total.value = 0
      pageCount.value = 0
    })
}

const getCapHoc = (item) => {
  if (!item || !item?.length) return ''
  return item
    .map((capHoc) => {
      const itemCapHoc = dsCapHoc.value.find((el) => el.cap_hoc_id === capHoc)
      return itemCapHoc?.ten_cap_hoc
    })
    .join(', ')
}

// Watch for route changes
watch(route, async (to, from) => {
  moduleType.value = to.meta?.moduleType

  if (moduleType.value) {
    mauTimKiem.value = []
    await loadConfiguration()
    keywordSearch.value = ''
    if (refsFormSearch.value) {
      refsFormSearch.value.resetForm()
    }
    dataInputSearch.value = {}
    dataInputSearchCopy.value = {}
    await getDsCapHoc()
    getDanhSach()
    // getDanhMucTrangThai()
  } else {
    headers.value = []
    headersMobile.value = []
    mauTimKiem.value = []
  }
})
</script>
<template>
  <Suspense>
    <template #default>
      <v-card
        class="mx-auto pa-0"
        style="box-shadow: none !important; overflow: inherit; min-height: 80vh"
      >
        <v-row class="mx-0 my-0">
          <v-col class="px-0 py-0">
            <v-row
              class="my-0 mb-5 mx-0"
              v-if="breakpointName == 'xs' || breakpointName == 'sm'"
            >
              <v-col
                class="row-header d-flex align-center justify-start py-0 px-0"
                style="border: none"
              >
                <div class="header-content" style="text-transform: uppercase">
                  {{
                    jsondata?.title ??
                    subMenuSelected?.title ??
                    menuSelected?.title
                  }}
                </div>
                <div class="triangle-header"></div>
              </v-col>
            </v-row>
            <v-row class="my-0 mb-3 mx-0" v-else>
              <v-col
                class="row-header d-flex align-center justify-start py-0 px-0 mr-3"
                style="border: none"
              >
                <div class="header-content" style="text-transform: uppercase">
                  {{
                    jsondata?.title ??
                    subMenuSelected?.title ??
                    menuSelected?.title
                  }}
                </div>
              </v-col>
            </v-row>
            <!--  -->
            <div class="rounded-lg" style="border: 1px solid var(--main-color)">
              <div v-if="mauTimKiem && mauTimKiem.length">
                <FormCRUD
                  class="pa-4 rounded-lg"
                  ref="refsFormSearch"
                  :mauNhap="mauTimKiem"
                  :dataInput="dataInputSearch"
                  @changeModelItem="handleChangeFormSearch"
                ></FormCRUD>
              </div>
            </div>
            <v-row class="mx-0 my-3">
              <v-col class="px-0 py-0 text-center">
                <v-btn
                  size="small"
                  color="#DE0000"
                  class="mx-0 white--text"
                  variant="outlined"
                  @click="handleXoaBoLoc"
                >
                  <v-icon size="18" color="#DE0000"
                    >mdi-filter-variant-remove</v-icon
                  >&nbsp;Xoá bộ lọc
                </v-btn>
                <v-btn
                  size="small"
                  color="var(--main-color)"
                  class="mx-0 white--text ml-3"
                  @click="handleThongKeDanhSach"
                >
                  <v-icon size="18" class="">mdi-chart-bar</v-icon>&nbsp;Thống
                  kê
                </v-btn>
              </v-col>
            </v-row>
            <!-- table -->
            <v-row class="mx-0 my-0 my-3" v-if="breakpointName === 'xs'">
              <v-col
                class="px-0 py-0 py-1"
                style="font-weight: 600; color: var(--main-color)"
              >
                <span>Tổng số: </span>
                <span>{{ total }}</span>
              </v-col>
            </v-row>

            <v-row class="mx-0 my-0">
              <v-col cols="12" class="px-0 py-0">
                <div class="table-wrapper">
                  <v-data-table
                    :headers="headers"
                    :items="dsDoiTuong"
                    :items-per-page="itemsPerPage"
                    item-value="primKey"
                    hide-default-footer
                    class="table-base sticky-columns-table"
                    loading-text="Đang tải"
                    hide-no-data
                  >
                    <template
                      #headers
                      v-if="headers && Array.isArray(headers[0])"
                    >
                      <tr
                        v-for="(headerRow, rowIndex) in headers"
                        :key="rowIndex"
                      >
                        <th
                          v-for="header in headerRow"
                          :key="header.key"
                          :class="header.class"
                          :width="header.width"
                          :rowspan="header.rowspan || 1"
                          :colspan="header.colspan || 1"
                          :style="
                            header.hasOwnProperty('style') ? header.style : ''
                          "
                        >
                          <span>{{ header.title }}</span>
                        </th>
                      </tr>
                      <tr class="data-table-progress" v-if="loadingData">
                        <th :colspan="getColumnCount()">
                          <v-progress-linear
                            color="var(--main-color)"
                            indeterminate
                          ></v-progress-linear>
                        </th>
                      </tr>
                    </template>
                    <template
                      v-slot:body
                      v-if="!dsDoiTuong || !dsDoiTuong.length"
                    >
                      <tr>
                        <td
                          :colspan="getColumnCount()"
                          class="text-center py-6"
                        >
                          <div
                            class="d-flex flex-column align-center justify-center"
                          >
                            <div class="text-grey pt-2">Không có dữ liệu</div>
                          </div>
                        </td>
                      </tr>
                    </template>
                    <template v-slot:item="{ item, index }">
                      <tr v-if="headers && Array.isArray(headers[0])">
                        <template
                          v-for="(itemHeader, indexHeader) in dataConfigBody"
                          :key="indexHeader"
                        >
                          <td
                            v-if="
                              itemHeader.value ||
                              itemHeader.type == 'index' ||
                              itemHeader.type == 'action'
                            "
                            :class="itemHeader.class"
                            :width="
                              itemHeader.hasOwnProperty('width')
                                ? itemHeader.width
                                : ''
                            "
                          >
                            <template v-if="itemHeader.type == 'select'">
                              <div
                                :style="
                                  itemHeader.hasOwnProperty('style')
                                    ? itemHeader.style
                                    : ''
                                "
                              >
                                <v-checkbox
                                  class="checkbox-remember"
                                  color="var(--main-color)"
                                  :model-value="checkExits(item)"
                                  @click.stop="selectDoiTuong(item, index)"
                                  hide-details
                                ></v-checkbox>
                              </div>
                            </template>

                            <template v-if="itemHeader.type == 'index'">
                              <div
                                :style="
                                  itemHeader.hasOwnProperty('style')
                                    ? itemHeader.style
                                    : ''
                                "
                              >
                                {{
                                  (page + 1) * itemsPerPage -
                                  itemsPerPage +
                                  index +
                                  1
                                }}
                              </div>
                            </template>

                            <template v-else-if="itemHeader.type == 'date'">
                              <div
                                :style="
                                  itemHeader.hasOwnProperty('style')
                                    ? itemHeader.style
                                    : ''
                                "
                              >
                                {{
                                  item.hasOwnProperty(itemHeader.value)
                                    ? dateLocale(item[itemHeader.value])
                                    : ''
                                }}
                              </div>
                            </template>

                            <template v-else-if="itemHeader.type == 'action'">
                              <div
                                class="d-flex align-center justify-center"
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
                                      icon
                                      variant="flat"
                                      size="small"
                                      v-bind="props"
                                      class="mx-0"
                                      @click.stop="duyetChungThuc(true, item)"
                                    >
                                      <v-icon
                                        size="18"
                                        color="var(--main-color)"
                                        >mdi-check-decagram-outline</v-icon
                                      >
                                    </v-btn>
                                  </template>
                                  <span>Duyệt</span>
                                </v-tooltip>

                                <v-tooltip location="top">
                                  <template v-slot:activator="{ props }">
                                    <v-btn
                                      class="mx-0"
                                      :disabled="loading"
                                      icon
                                      variant="flat"
                                      size="small"
                                      v-bind="props"
                                      @click.stop="duyetChungThuc(false, item)"
                                    >
                                      <v-icon size="18" color="red"
                                        >mdi-cancel</v-icon
                                      >
                                    </v-btn>
                                  </template>
                                  <span>Từ chối</span>
                                </v-tooltip>
                              </div>
                            </template>

                            <template v-else-if="itemHeader.type == 'CapHoc'">
                              <div
                                :style="
                                  itemHeader.hasOwnProperty('style')
                                    ? itemHeader.style
                                    : ''
                                "
                              >
                                {{ getCapHoc(item?.cap_hoc_id) }}
                              </div>
                            </template>

                            <template v-else-if="itemHeader.type == 'object'">
                              <div
                                :style="
                                  itemHeader.hasOwnProperty('style')
                                    ? itemHeader.style
                                    : ''
                                "
                              >
                                {{
                                  item.hasOwnProperty(itemHeader.value) &&
                                  item[itemHeader.value]
                                    ? item[itemHeader.value][itemHeader.mapping]
                                    : ''
                                }}
                              </div>
                            </template>

                            <!-- Trường hợp mặc định -->
                            <template v-else>
                              <div
                                :style="
                                  itemHeader.hasOwnProperty('style')
                                    ? itemHeader.style
                                    : ''
                                "
                              >
                                {{ getValue(item, itemHeader.value) }}
                              </div>
                            </template>
                          </td>
                        </template>
                      </tr>
                      <tr v-else @click="redirectThongTinDoiTuong(item)">
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
                                (page + 1) * itemsPerPage -
                                itemsPerPage +
                                index +
                                1
                              }}
                            </div>
                            <div
                              v-else
                              :style="
                                itemHeader.hasOwnProperty('style')
                                  ? itemHeader.style
                                  : ''
                              "
                            >
                              {{
                                (page + 1) * itemsPerPage -
                                itemsPerPage +
                                index +
                                1
                              }}
                            </div>
                          </div>

                          <div
                            v-else-if="itemHeader.type == 'date'"
                            :style="
                              itemHeader.hasOwnProperty('style')
                                ? itemHeader.style
                                : ''
                            "
                          >
                            {{
                              item.hasOwnProperty(itemHeader.value)
                                ? dateLocale(item[itemHeader.value])
                                : ''
                            }}
                          </div>

                          <div
                            v-else-if="itemHeader.type == 'checkbox'"
                            :style="
                              itemHeader.hasOwnProperty('style')
                                ? itemHeader.style
                                : ''
                            "
                          >
                            <v-checkbox
                              class="checkbox-remember shrink"
                              color="var(--main-color)"
                              :model-value="checkExits(item)"
                              @click.stop="selectDoiTuong(item, index)"
                              hide-details
                            ></v-checkbox>
                          </div>

                          <div
                            v-else-if="itemHeader.type == 'boolean'"
                            :style="
                              itemHeader.hasOwnProperty('style')
                                ? itemHeader.style
                                : ''
                            "
                          >
                            <v-checkbox
                              class="checkbox-remember shrink"
                              color="var(--main-color)"
                              :model-value="item[itemHeader.value]"
                              readonly
                              hide-details
                            ></v-checkbox>
                          </div>

                          <div v-else-if="itemHeader.type == 'CapHoc'">
                            <div
                              :style="
                                itemHeader.hasOwnProperty('style')
                                  ? itemHeader.style
                                  : ''
                              "
                            >
                              {{ getCapHoc(item?.cap_hoc_id) }}
                            </div>
                          </div>

                          <div
                            v-else-if="itemHeader.type == 'object'"
                            :style="
                              itemHeader.hasOwnProperty('style')
                                ? itemHeader.style
                                : ''
                            "
                          >
                            {{
                              item.hasOwnProperty(itemHeader.value) &&
                              item[itemHeader.value]
                                ? item[itemHeader.value][itemHeader.mapping]
                                : ''
                            }}
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
                </div>
                <Pagination
                  :pageInput="page + 1"
                  :pageCount="pageCount"
                  :total="total"
                  @changePage="changePage"
                  @changeNumberPage="changeNumberPage"
                  style="margin-bottom: 50px"
                >
                </Pagination>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </template>
    <template #fallback>
      <v-card class="mx-auto pa-5" style="min-height: 80vh">
        <div class="d-flex justify-center align-center" style="height: 100%">
          <v-progress-circular
            indeterminate
            color="var(--main-color)"
            size="24"
          ></v-progress-circular>
          <div class="ml-4 text-h6">Đang tải dữ liệu...</div>
        </div>
      </v-card>
    </template>
  </Suspense>
</template>
<style>
.blink {
  animation: blinker 2s linear infinite;
}

.item:last-child {
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

@keyframes blinker {
  50% {
    opacity: 25%;
  }
}
</style>
