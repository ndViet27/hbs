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
  dateLocaleTime,
  buildSearchParams,
} from '@/helpers/index'
import { useFormSearchRouter } from '@/composables/useFormSearchRouter'

const route = useRoute()
const router = useRouter()
const configCache = reactive({})
const moduleType = ref(route.meta.moduleType)
const jsondata = ref(null)
const appStore = useAppStore()
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
const DialogXemBanTin = defineAsyncComponent(() =>
  import('@/views/BanTinDuLieuModule/DialogXemBanTin.vue')
)
const PreviewXML = defineAsyncComponent(() =>
  import('@/components/dialog/PreviewXML.vue')
)
const menuSelected = computed(() => appStore.getMenuSelected)
const subMenuSelected = computed(() => appStore.getSubMenuSelected)
const listNumberPage = ref([
  {
    name: '5',
    value: 5,
  },
  {
    name: '10',
    value: 10,
  },
  {
    name: '15',
    value: 15,
  },
  {
    name: '20',
    value: 20,
  },
])
const headers = ref([])
const headersMobile = ref([])
const dataConfigBody = ref([])
const mauTimKiem = ref([])
const mauTimKiemAdvance = ref([])

const advanceSearch = ref(false)
const advanceSearchReference = ref(null)
const advanceSearchReferenceAdvance = ref(null)
const dataInputSearch = ref({})
const dataInputSearchAdvance = ref({})
const keywordSearch = ref('')
const dsDoiTuong = ref([])
const doiTuongDaChon = ref([])
const itemsPerPage = ref(10)
const loading = ref(false)
const loadingData = ref(false)
const page = ref(0)
const pageCount = ref(0)
const total = ref(0)
const configLoaded = ref(false)
const configError = ref(null)
const loadingAction = ref(false)
const showDialogXemBanTin = ref(false)
const isShowPreviewXML = ref(false)
const dialogPreviewName = ref(false)
const infoFileMaDinhDanh = ref('')
const dsHocBa = ref([])
const selectedItem = ref(null)
const isFromPathChange = ref(false)
const dsTrangThai = ref([])

const {
  isProcessingSearch,
  dataInputSearchCopy,
  changeFormSearch: formSearchChange,
} = useFormSearchRouter()

const getTrangThai = (id) => {
  const item = dsTrangThai.value.find((el) => el.trang_thai_xu_ly_tin_id === id)
  return item ? item.ten_trang_thai_xu_ly_tin : 'Lỗi bản tin dữ liệu'
}

const getConfigByModuleType = async () => {
  if (!moduleType.value) return null
  if (configCache[moduleType.value]) {
    return configCache[moduleType.value]
  }
  try {
    const config = await import(
      `@/metadata/${route.meta.module}/${moduleType.value}.json`
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
    mauTimKiem.value = config?.formSearch ?? []
    mauTimKiemAdvance.value = config?.formSearchAdvance ?? []
    configLoaded.value = true
    return config
  } catch (error) {
    configError.value = error
    throw error
  }
}

const showAdvanceSearch = function () {
  advanceSearch.value = !advanceSearch.value
  setTimeout(function () {
    if (advanceSearch.value) {
      advanceSearchReference.value.initForm()
    }
  }, 500)
}

const getDanhSach = function (type) {
  if (type == 'reset') {
    page.value = 0
  }

  let filter = {
    path: '/dulieuchu/tracuu/internal',
    collection: 'xulybantin',
    params: {
      ...jsondata.value.params,
      page: page.value,
      size: itemsPerPage.value,
      keyword: keywordSearch.value ? keywordSearch.value : '',
      orderFields: 'ThoiGianTao',
      orderTypes: 'desc',
    },
  }

  // Thêm tất cả các tham số tìm kiếm từ URL vào filter.params
  if (
    dataInputSearchCopy.value &&
    Object.keys(dataInputSearchCopy.value).length > 0
  ) {
    for (const key in dataInputSearchCopy.value) {
      const value = dataInputSearchCopy.value[key]
      const fieldDef = mauTimKiem.value.find((field) => field.name === key)

      // Nếu giá trị là null, undefined hoặc chuỗi rỗng, bỏ qua
      if (value === null || value === undefined || value === '') continue

      // Xử lý các trường hợp đặc biệt (array, object...)
      if (Array.isArray(value)) {
        // Nếu là mảng rỗng, bỏ qua
        if (value.length === 0) continue

        // Nếu trường có cấu hình và là select
        if (fieldDef && fieldDef.type === 'select') {
          if (!fieldDef.returnObject) {
            // Nếu return-object là false, các giá trị trong mảng là primitive
            filter.params[key] = value.join(',')
          } else {
            // Nếu return-object là true hoặc không được định nghĩa, chuyển đổi đối tượng
            filter.params[key] = value
              .map((item) =>
                typeof item === 'object'
                  ? getValue(item, fieldDef.mapping || fieldDef.itemValue)
                  : item
              )
              .join(',')
          }
        } else {
          // Mảng thông thường hoặc không có cấu hình trường
          filter.params[key] = value
            .map((item) => {
              if (typeof item === 'object' && item !== null) {
                return item.id || item.MaMuc || item.value || item
              }
              return item
            })
            .join(',')
        }
      } else if (typeof value === 'object' && value !== null) {
        // Xử lý trường hợp đối tượng đơn lẻ
        if (fieldDef && fieldDef.type === 'select') {
          if (!fieldDef.returnObject) {
            // Không nên xảy ra vì nếu return-object là false, giá trị phải là primitive
            filter.params[key] = value.toString()
          } else {
            // Lấy giá trị từ đối tượng theo mapping
            filter.params[key] = getValue(
              value,
              fieldDef.mapping || fieldDef.itemValue
            )
          }
        } else {
          // Đối tượng không phải từ select hoặc không có cấu hình
          filter.params[key] =
            value.id || value.MaMuc || value.value || JSON.stringify(value)
        }
      } else {
        // Giá trị primitive (chuỗi, số...)
        filter.params[key] = value
      }
    }
  }

  dsDoiTuong.value = []
  loadingData.value = true
  total.value = 0
  pageCount.value = 0

  generalApi
    .getDanhSachDoiTuong(filter)
    .then(function (result) {
      loadingData.value = false
      dsDoiTuong.value = result.data.result
      total.value = result.data.totalItems
      pageCount.value = result.data.totalPages
    })
    .catch(function (error) {
      loadingData.value = false
      dsDoiTuong.value = []
      total.value = 0
      pageCount.value = 0
      console.error('Lỗi khi lấy danh sách hồ sơ:', error)
    })
}

const redirectThongTinDoiTuong = function (dt, hoso) {
  let queryCurrent = route && route.query ? route.query : {}
  router.push({ path: `${route.path}/${dt._id.$oid}`, query: queryCurrent })
}

const getDsTrangThaiGoiTin = async () => {
  let filter = {
    api: '/dulieuchu/tracuu/internal/danhmuc/1.0/filter',
    params: {
      tenDanhMuc: 'dm_trang_thai_xu_ly_tin',
    },
  }

  await generalApi.getData(filter).then((res) => {
    dsTrangThai.value = res.data.result
  })
}

const xemGoiTin = function (item) {
  showDialogXemBanTin.value = true
  selectedItem.value = item
}

const xoaDoiTuong = function (item) {
  appStore.SET_SHOWCONFIRM(true)
  let confirm = {
    auth: false,
    title: 'Xóa dữ liệu vĩnh viễn',
    message: 'Bạn có chắc chắn muốn xóa?',
    button: {
      yes: 'Có',
      no: 'Không',
    },
    callback: () => {
      let filter = {
        path: '/publicadministrativemgt/internal',
        collection: 'hosodichvucong',
        data: item,
      }
      loading.value = true
      generalApi
        .xoaDoiTuong(filter)
        .then(function (result) {
          loading.value = false
          getDanhSach()
        })
        .catch(function () {
          loading.value = false
          appStore.error('Thực hiện thất bại')
        })
    },
  }
  appStore.SET_CONFIG_CONFIRM_DIALOG(confirm)
}

const changePage = function (pagePagination) {
  handlePaginationChange('page', pagePagination.value)
}

const changeNumberPage = function (numberPage) {
  handlePaginationChange('size', numberPage.value)
}

const submitAdvanceSearch = function (dataSearch) {
  dataInputSearch.value = dataSearch
  debouncedGetDanhSach('reset')
}

const checkExits = function (item) {
  if (!doiTuongDaChon.value.length) {
    return false
  } else {
    let x = doiTuongDaChon.value.find(function (i) {
      return i['id'] == item['id']
    })
    return x ? true : false
  }
}
const selectDoiTuong = function (item, index) {
  let exists = doiTuongDaChon.value.find((x) => x.id === item.id)
  if (exists) {
    // Nếu đã có thì loại bỏ
    doiTuongDaChon.value = doiTuongDaChon.value.filter((x) => x.id !== item.id)
  } else {
    // Chưa có thì thêm vào
    doiTuongDaChon.value.push(item)
  }
}

const changeFormSearch = function (data) {
  formSearchChange(data, {
    dataInputSearch,
    mauTimKiem,
    isFromPathChange,
    currentPage: page.value,
    pageSize: itemsPerPage.value,
  })
}

const debouncedSearchTimeout = ref(null)
const debouncedGetDanhSach = function (type) {
  clearTimeout(debouncedSearchTimeout.value)
  debouncedSearchTimeout.value = setTimeout(() => {
    getDanhSach(type)
  }, 300)
}

const handOpenXML = (type, item) => {
  if (item) {
    infoFileMaDinhDanh.value = item?.ma_dinh_danh
    dialogPreviewName.value = type ? 'Bản tin yêu cầu' : 'Bản tin trả lời'
    isShowPreviewXML.value = true
  }
}

// Thêm hàm mới để xử lý thay đổi trang và số mục/trang
const handlePaginationChange = function (type, value) {
  if (isProcessingSearch.value) {
    return
  }
  isProcessingSearch.value = true
  const currentQuery = { ...route.query }
  if (type === 'page') {
    currentQuery.page = value
  } else if (type === 'size') {
    currentQuery.size = value
    currentQuery.page = 1
  }
  router
    .push({
      path: route.path,
      query: currentQuery,
    })
    .finally(() => {
      isProcessingSearch.value = false
    })
}

const handleKeywordSearch = function () {
  if (isProcessingSearch.value) {
    return
  }
  isProcessingSearch.value = true
  const currentQuery = { ...route.query }
  if (keywordSearch.value) {
    currentQuery.keyword = keywordSearch.value
  } else {
    delete currentQuery.keyword
  }
  currentQuery.page = 1
  router
    .push({
      path: route.path,
      query: currentQuery,
    })
    .finally(() => {
      isProcessingSearch.value = false
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
watch(
  () => route.path,
  async (newPath) => {
    route.query.trangThaiXulyTinId = '02,03,04'
    isFromPathChange.value = true
    moduleType.value = route.meta?.moduleType
    if (moduleType.value) {
      mauTimKiem.value = []
      await loadConfiguration()
      initPage()
    } else {
      headers.value = []
      headersMobile.value = []
      mauTimKiem.value = []
      mauTimKiemAdvance.value = []
    }
  }
)

const initPage = () => {
  if (!mauTimKiem.value || mauTimKiem.value.length === 0) {
    return
  }

  let newQuery = route.query
  keywordSearch.value = newQuery.keyword ? newQuery.keyword : ''
  page.value = newQuery.page ? parseInt(newQuery.page) - 1 : 0
  itemsPerPage.value = newQuery.size ? parseInt(newQuery.size) : 10

  const searchParams = buildSearchParams(newQuery, mauTimKiem.value)

  dataInputSearch.value = { ...searchParams }
  dataInputSearchCopy.value = { ...searchParams }
  getDanhSach('reset')
  isFromPathChange.value = false
}

// Cập nhật watch route.query để tránh chạy khi đang xử lý path change
watch(
  () => route.query,
  (newQuery) => {
    if (isFromPathChange.value) {
      return
    }
    if (!configLoaded.value) {
      return
    }

    // Xử lý dữ liệu giống như trong initPage
    keywordSearch.value = newQuery.keyword ? newQuery.keyword : ''
    page.value = newQuery.page ? parseInt(newQuery.page) - 1 : 0
    itemsPerPage.value = newQuery.size ? parseInt(newQuery.size) : 10

    const searchParams = buildSearchParams(newQuery, mauTimKiem.value)

    dataInputSearchCopy.value = { ...searchParams }

    if (!isProcessingSearch.value) {
      dataInputSearch.value = { ...searchParams }
    }
    getDanhSach()
  },
  { deep: true, immediate: false } // immediate: false không gọi ngay khi khởi tạo
)

// Sửa lại onMounted
onMounted(async () => {
  // Đánh dấu đang xử lý từ path để tránh watch query chạy
  isFromPathChange.value = true
  getDsTrangThaiGoiTin()
  if (!configLoaded.value) {
    await loadConfiguration()
  }
  initPage()
})
</script>
<template>
  <Suspense>
    <template #default>
      <v-card
        class="mx-auto pa-0"
        style="box-shadow: none !important; overflow: inherit; min-height: 80vh"
      >
        <v-row
          class="my-0 mb-5 mx-0"
          v-if="breakpointName == 'xs' || breakpointName == 'sm'"
        >
          <v-col
            class="row-header d-flex align-center justify-start py-0 px-0"
            style="border: none"
          >
            <div class="header-content uppercase">
              {{ subMenuSelected?.title ?? menuSelected?.title }}
            </div>
            <div class="triangle-header"></div>
          </v-col>
          <!-- <v-col class="m-btn-show-advanceSearch text-right px-0 py-0">
            <v-icon :size="24" class=""
              :icon="!advanceSearch ? 'mdi-filter-variant-plus' : 'mdi-filter-variant'" color="var(--main-color)" 
              @click.stop="showAdvanceSearch">
            </v-icon>
          </v-col> -->
        </v-row>
        <v-row class="my-0 mb-3 mx-0" v-else>
          <v-col
            class="row-header d-flex align-center justify-start py-0 px-0"
            style="border: none"
          >
            <div class="header-content uppercase">
              {{ subMenuSelected?.title ?? menuSelected?.title }}
            </div>
            <v-text-field
              v-model="keywordSearch"
              append-inner-icon="mdi-magnify"
              @keyup.enter="handleKeywordSearch"
              @click:append-inner="handleKeywordSearch"
              @click:prepend-inner="handleKeywordSearch"
              placeholder="Nhập từ khóa tìm kiếm"
              dense
              hide-details="auto"
              class="input-form input-header-search"
              clearable
            ></v-text-field>
          </v-col>
          <!-- <v-col class="py-0 px-0 wrap-btn-advanceSearch">
            <v-btn
              size="small"
              color="var(--main-color)"
              :prepend-icon="!advanceSearch ? 'mdi-filter-variant-plus' : 'mdi-filter-variant'"
              @click.stop="showAdvanceSearch" class="mx-0 white--text" style="float: right;"
            >
              Nâng cao
            </v-btn>
          </v-col> -->
        </v-row>
        <div v-if="advanceSearch">
          <TimKiemNangCao
            ref="advanceSearchReference"
            :mauNhap="mauTimKiemAdvance"
            :dataInput="dataInputSearchAdvance"
            @submitSearch="submitAdvanceSearch"
          ></TimKiemNangCao>
        </div>
        <div v-if="mauTimKiem && mauTimKiem.length">
          <TimKiemNangCao
            ref="advanceSearchReferenceAdvance"
            :mauNhap="mauTimKiem"
            :dataInput="dataInputSearch"
            :formType="'normalSearch'"
            @changeFormSearch="changeFormSearch"
          ></TimKiemNangCao>
        </div>
        <!-- table -->
        <v-row v-if="breakpointName === 'xs'" class="mx-0 my-0 my-3">
          <v-col
            class="px-0 py-0 py-1"
            style="font-weight: 600; color: var(--main-color)"
          >
            <span>Tổng số: </span>
            <span>{{ total }}</span>
          </v-col>
        </v-row>

        <v-row class="mx-0 my-0 my-3" v-if="breakpointName === 'xs'">
          <v-col cols="12" class="px-0 py-0">
            <v-data-table
              :headers="headersMobile"
              :items="dsDoiTuong"
              :items-per-page="itemsPerPage"
              item-value="primKey"
              hide-default-footer
              class="table-base"
              no-data-text="Không có dữ liệu"
              loading-text="Đang tải"
            >
              <template v-slot:item="{ item, index }">
                <tr @click="redirectThongTinDoiTuong(item)">
                  <td class="td-center">
                    <div>
                      {{ (page + 1) * itemsPerPage - itemsPerPage + index + 1 }}
                    </div>
                  </td>
                  <td class="pt-2">
                    <div class="my-2">
                      <span>{{ item?.cosogiaoduc ?? '' }}</span>
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

        <v-row class="mx-0 my-3" v-else>
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
                <template #headers>
                  <tr v-for="(headerRow, rowIndex) in headers" :key="rowIndex">
                    <th
                      v-for="header in headerRow"
                      :key="header.key"
                      :class="[
                        header.class,
                        header.sticky ? 'sticky-column' : '',
                      ]"
                      :style="[
                        header.hasOwnProperty('style') ? header.style : '',
                        header.hasOwnProperty('width')
                          ? `width: ${header.width}px; min-width: ${header.width}px;`
                          : '',
                      ]"
                      :rowspan="header.rowspan || 1"
                      :colspan="header.colspan || 1"
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
                <template v-slot:body v-if="!dsDoiTuong || !dsDoiTuong.length">
                  <tr>
                    <td :colspan="getColumnCount()" class="text-center py-6">
                      <div
                        class="d-flex flex-column align-center justify-center"
                      >
                        <div class="text-grey pt-2">Không có dữ liệu</div>
                      </div>
                    </td>
                  </tr>
                </template>
                <template v-slot:item="{ item, index }">
                  <tr>
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
                        :key="indexHeader"
                        :class="[
                          itemHeader.class,
                          itemHeader.sticky ? 'sticky-column' : '',
                        ]"
                        :style="[
                          itemHeader.hasOwnProperty('style')
                            ? itemHeader.style
                            : '',
                        ]"
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
                              item.hasOwnProperty(itemHeader.value) &&
                              item[itemHeader.value]
                                ? dateLocale(item[itemHeader.value])
                                : ''
                            }}
                          </div>
                        </template>

                        <template v-else-if="itemHeader.type == 'datetime'">
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
                                ? dateLocaleTime(item[itemHeader.value])
                                : ''
                            }}
                          </div>
                        </template>
                        <template
                          v-else-if="itemHeader.type == 'TrangThaiXuLyTin'"
                        >
                          <div
                            v-if="getTrangThai(item?.trang_thai_xu_ly_tin_id)"
                            :style="
                              ['00', '01', '06'].includes(
                                item?.trang_thai_xu_ly_tin_id
                              )
                                ? 'color: #F57C00'
                                : 'color: green'
                            "
                          >
                            <v-chip>{{
                              getTrangThai(item?.trang_thai_xu_ly_tin_id)
                            }}</v-chip>
                          </div>
                        </template>
                        <template
                          v-else-if="
                            itemHeader.type == 'action' &&
                            !['00', '01'].includes(
                              item?.trang_thai_xu_ly_tin_id
                            )
                          "
                        >
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
                                  @click.stop="xemGoiTin(item)"
                                >
                                  <v-icon size="24" color="var(--main-color)"
                                    >mdi-file-eye-outline</v-icon
                                  >
                                </v-btn>
                              </template>
                              <span>Xem nội dung</span>
                            </v-tooltip>

                            <v-tooltip location="top">
                              <template v-slot:activator="{ props }">
                                <v-btn
                                  :disabled="loading"
                                  icon
                                  variant="flat"
                                  size="small"
                                  v-bind="props"
                                  class="mx-0"
                                  @click.stop="
                                    handOpenXML(
                                      true,
                                      item?.du_lieu_ban_tin_yeu_cau
                                    )
                                  "
                                >
                                  <img
                                    class="img-login-logo"
                                    src="../../assets/images/icon-xml.svg"
                                  />
                                </v-btn>
                              </template>
                              <span>Bản tin yêu cầu</span>
                            </v-tooltip>

                            <v-tooltip
                              location="top"
                              v-if="item?.du_lieu_ban_tin_tra_loi?.ma_dinh_danh"
                            >
                              <template v-slot:activator="{ props }">
                                <v-btn
                                  :disabled="loading"
                                  icon
                                  variant="flat"
                                  size="small"
                                  v-bind="props"
                                  class="mx-0"
                                  @click.stop="
                                    handOpenXML(
                                      false,
                                      item?.du_lieu_ban_tin_tra_loi
                                    )
                                  "
                                >
                                  <img
                                    class="img-login-logo"
                                    src="../../assets/images/icon-xml.svg"
                                  />
                                </v-btn>
                              </template>
                              <span>Bản tin trả lời</span>
                            </v-tooltip>
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
                </template>
              </v-data-table>
            </div>
            <Pagination
              :pageInput="page + 1"
              :pageCount="pageCount"
              :total="total"
              :currentNumberPage="itemsPerPage"
              :listNumberPage="listNumberPage"
              @changePage="changePage"
              @changeNumberPage="changeNumberPage"
              style="margin-bottom: 50px"
            >
            </Pagination>
          </v-col>
        </v-row>

        <DialogXemBanTin
          v-if="showDialogXemBanTin"
          :dialog="showDialogXemBanTin"
          :xuLyBanTinId="selectedItem?.xu_ly_ban_tin_id"
          @closePopup="showDialogXemBanTin = false"
        />

        <PreviewXML
          v-if="isShowPreviewXML"
          :dialog="isShowPreviewXML"
          :name="dialogPreviewName"
          :maDinhDanh="infoFileMaDinhDanh"
          @closePopup="isShowPreviewXML = fasle"
        />
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
<style scoped>
.table-base::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 100%;
  -webkit-box-shadow: inset -10px 0 10px -10px rgba(0, 0, 0, 0.3);
  box-shadow: inset -10px 0 10px -10px rgba(0, 0, 0, 0.3);
}
.blink {
  animation: blinker 2s linear infinite;
}

.text-block {
  white-space: pre;
}

@keyframes blinker {
  50% {
    opacity: 25%;
  }
}
</style>
