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
const headers = ref([])
const mauTimKiem = ref([])
const headersMobile = ref([])
const menuSelected = computed(() => appStore.getMenuSelected)
const subMenuSelected = computed(() => appStore.getSubMenuSelected)

const statusList = ref([])
const keywordSearch = ref('')
const statusSelected = ref('')
const advanceSearch = ref(false)
const dataInputSearch = ref({})
const advanceSearchReference = ref(null)

const page = ref(0)
const total = ref(0)
const pageCount = ref(0)
const loading = ref(false)
const dsDoiTuong = ref([])
const itemsPerPage = ref(20)
const loadingData = ref(false)

const configError = ref(null)
const configLoaded = ref(false)

const doiTuongDaChon = ref([])
const isSelectAll = ref(false)

const currentItem = ref(null)
const formNhapResetPassword = ref([
  {
    fieldName: 'MatKhauMoi',
    fieldLabel: 'Mật khẩu mới',
    fieldType: 'text',
    fieldClass: 'v-col-xs-12 v-col-12',
    placeHolder: '',
    defaultValue: '',
    dataType: '',
    dataSource: '',
    autoEvent: '',
    required: true,
    rules: [],
    readonly: false,
  },
  {
    fieldName: 'NhapLaiMatKhau',
    fieldLabel: 'Nhập lại mật khẩu',
    fieldType: 'text',
    fieldClass: 'v-col-xs-12 v-col-12',
    placeHolder: '',
    defaultValue: '',
    dataType: '',
    dataSource: '',
    autoEvent: '',
    required: true,
    rules: [],
    readonly: false,
  },
])
const isShowResetPassword = ref(false)
const refsFormResetPassword = ref(null)

const isShowDialogCreate = ref(false)
const formNhapCreate = ref([
  {
    fieldName: 'clientid',
    fieldLabel: 'Client ID',
    fieldType: 'text',
    fieldClass: 'v-col-xs-12 v-col-12',
    placeHolder: '',
    defaultValue: '',
    dataType: '',
    dataSource: '',
    autoEvent: '',
    required: true,
    rules: [],
    readonly: false,
  },
  {
    fieldName: 'clientkey',
    fieldLabel: 'Client Key',
    fieldType: 'text',
    fieldClass: 'v-col-xs-12 v-col-12',
    placeHolder: '',
    defaultValue: '',
    dataType: '',
    dataSource: '',
    autoEvent: '',
    required: true,
    rules: [],
    readonly: false,
  },
])

const getConfigByModuleType = async () => {
  if (!moduleType.value) return null
  if (configCache[moduleType.value]) {
    return configCache[moduleType.value]
  }
  try {
    const config = await import(
      `@/metadata/QuanTriHeThong/${moduleType.value}.json`
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
    console.log(config)
    jsondata.value = config
    headers.value = config?.tableHeaders ?? []
    headersMobile.value = config?.tableHeadersMobile ?? []
    mauTimKiem.value = config?.formSearch ?? []

    dsDoiTuong.value = config?.tempDsDoiTuong ?? []

    configLoaded.value = true
    return config
  } catch (error) {
    configError.value = error
    throw error
  }
}

const setupPromise = loadConfiguration().then(() => {
  keywordSearch.value = ''
  if (advanceSearchReference.value) {
    advanceSearchReference.value.resetForm()
  }
  dataInputSearch.value = {}
  // getDanhSach()
  // getDanhMucTrangThai()
})

const showAdvanceSearch = function () {
  advanceSearch.value = !advanceSearch.value
  setTimeout(function () {
    if (advanceSearch.value) {
      advanceSearchReference.value.initForm()
    }
  }, 500)
}

const themMoiHoSo = function () {
  if (jsondata.value.type === 'taikhoandonvi') {
    router.push({
      path: `${subMenuSelected.value.to}/edit`,
      query: route.query,
    })
  } else {
    isShowDialogCreate.value = true
  }
}

const redirectPage = function (id) {
  appStore.SET_OPEN_DIALOG(true)
  let queryCurrent = route && route.query ? route.query : {}
  router.push({
    path: `${subMenuSelected.value.to}/edit/${id}`,
    query: queryCurrent,
  })
}

const chuyenTrangThaiDuLieu = function (item) {
  appStore.SET_SHOWCONFIRM(true)
  let confirm = {
    auth: false,
    title: item.TrangThaiDuLieu['MaMuc'] == '02' ? 'Hủy bỏ' : 'Khôi phục',
    message: 'Bạn có chắc chắn muốn thực hiện?',
    button: {
      yes: 'Có',
      no: 'Không',
    },
    callback: () => {
      let tt =
        item.TrangThaiDuLieu['MaMuc'] == '02'
          ? { TenMuc: 'Hủy bỏ', MaMuc: '04' }
          : { TenMuc: 'Chính thức', MaMuc: '02' }
      let dataForm = Object.assign(item, { TrangThaiDuLieu: tt })
      let filter = {
        path: '/publicadministrativemgt/internal',
        primKey: props.id,
        collection: 'hosodichvucong',
        data: dataForm,
      }
      loading.value = true
      generalApi
        .capNhatDoiTuong(filter)
        .then(function (result) {
          loading.value = false
          getDanhSach()
          getDanhMucTrangThai()
          appStore.success('Thực hiện thành công')
        })
        .catch(function () {
          loading.value = false
          appStore.error('Thực hiện thất bại')
        })
    },
  }
  appStore.SET_CONFIG_CONFIRM_DIALOG(confirm)
}

const getDanhMucTrangThai = function () {
  let filter = {
    params: {
      page: 0,
      size: 50,
    },
  }
  hosoApi
    .getCounterHoSoTheoTrangThai(filter)
    .then(function (result) {
      if (result.resp.length) {
        let ds = sortDs(result.resp, 'MaMuc', true)
        statusList.value = ds
      } else {
        statusList.value = []
      }
    })
    .catch(function () {
      statusList.value = []
    })
}

const handleCheckAction = function (item, action) {
  if (action == 'lock') {
    khoaTaiKhoan(item)
  } else if (action == 'reset') {
    isShowResetPassword.value = true
    currentItem.value = item
  } else if (action == 'edit') {
    redirectPage(item.primKey)
  } else if (action == 'delete') {
    xoaDoiTuong(item)
  }
}

const getDanhSach = function (type) {
  if (type == 'reset') {
    page.value = 0
  }
  let filter = {
    path: '/publicadministrativemgt/internal',
    collection: 'hosodichvucong',
    params: {
      page: page.value,
      size: itemsPerPage.value,
      keyword: keywordSearch.value ? keywordSearch.value : '',
      trangThaiHoSo_MaMuc: statusSelected.value ? statusSelected.value : '',
      orderFields: 'ThoiGianTao',
      orderTypes: 'desc',
    },
  }

  if (dataInputSearch.value) {
    filter.params = Object.assign(filter.params, dataInputSearch.value)
  }
  if (!filter.params.trangThaiDuLieu_MaMuc) {
    filter.params['trangThaiDuLieu_MaMuc'] = '02'
  }
  dsDoiTuong.value = []
  loadingData.value = true
  total.value = 0
  pageCount.value = 0
  generalApi
    .getDanhSachDoiTuong(filter)
    .then(function (result) {
      loadingData.value = false
      dsDoiTuong.value = result.content
      total.value = result.totalElements
      pageCount.value = result.totalPages
    })
    .catch(function () {
      loadingData.value = false
      dsDoiTuong.value = []
      total.value = 0
      pageCount.value = 0
    })
}

const redirectThongTinDoiTuong = function (dt, hoso) {
  if (jsondata.value.type === 'taikhoanhethong') {
    return
  }
  let queryCurrent = route && route.query ? route.query : {}
  router.push({
    path: `${subMenuSelected.value.to}/${dt.primKey}`,
    query: queryCurrent,
  })
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
          getDanhMucTrangThai()
        })
        .catch(function () {
          loading.value = false
        })
    },
  }
  appStore.SET_CONFIG_CONFIRM_DIALOG(confirm)
}

const khoaTaiKhoan = function (item) {
  appStore.SET_SHOWCONFIRM(true)
  let confirm = {
    auth: false,
    title: 'Khoá tài khoản',
    message: 'Bạn có chắc chắn muốn khoá tài khoản?',
    button: {
      yes: 'Có',
      no: 'Không',
    },
    callback: () => {
      appStore.success('Khoá tài khoản thành công')
    },
  }
  appStore.SET_CONFIG_CONFIRM_DIALOG(confirm)
}

const changePage = function (pagePagination) {
  page.value = pagePagination.value - 1
  getDanhSach()
}

const changeNumberPage = function (numberPage) {
  itemsPerPage.value = numberPage.value
  getDanhSach('reset')
}

const selectStatus = function (item, index) {
  statusSelected.value = item.MaMuc
  getDanhSach('reset')
}

const dateLocale = function (dateInput) {
  if (!dateInput) return ''
  let date = new Date(dateInput)
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getFullYear()}`
}

const submitAdvanceSearch = function (dataSearch) {
  dataInputSearch.value = dataSearch
  getDanhSach('reset')
}

const sortDs = function (array, key, ascending) {
  if (ascending) {
    return array.sort((a, b) => (a[key] > b[key] ? 1 : -1))
  } else {
    return array.sort((a, b) => (a[key] < b[key] ? 1 : -1))
  }
}

const getValue = function (obj, key) {
  const keys = key.split('.')
  let value = obj
  for (let i = 0; i < keys.length; i++) {
    if (value && typeof value === 'object' && keys[i] in value) {
      value = value[keys[i]]
    } else {
      return ''
    }
  }
  return value
}

const handleSelectAll = () => {
  isSelectAll.value = !isSelectAll.value
  if (!isSelectAll.value) {
    doiTuongDaChon.value = []
  }
}

const handleResetPassword = async () => {
  let dataForm = await refsFormResetPassword.value.submit()
  let valid = await refsFormResetPassword.value.validateForm()

  if (!valid) {
    appStore.error('Vui lòng nhập đầy đủ thông tin')
    return
  }

  if (dataForm.MatKhauMoi !== dataForm.NhapLaiMatKhau) {
    appStore.error('Mật khẩu không khớp, vui lòng nhập lại')
    return
  }
  console.log(dataForm)
  appStore.SET_SHOWCONFIRM(true)
  let confirm = {
    auth: false,
    title: 'Đặt lại mật khẩu',
    message: 'Bạn có chắc chắn muốn đặt lại mật khẩu?',
    button: {
      yes: 'Có',
      no: 'Không',
    },
    callback: () => {
      appStore.success('Đặt lại mật khẩu thành công')
    },
  }
  appStore.SET_CONFIG_CONFIRM_DIALOG(confirm)
}

const checkExits = function (item) {
  if (!doiTuongDaChon.value.length) {
    return false
  } else {
    let x = doiTuongDaChon.value.find(function (i) {
      return i['uuid'] == item['uuid']
    })
    return x ? true : false
  }
}

const selectDoiTuong = (item) => {
  const selected = doiTuongDaChon.value || []
  const exist = selected.find((x) => x.uuid == item.uuid)

  if (exist) {
    isSelectAll.value = false
  }

  doiTuongDaChon.value = exist
    ? selected.filter((y) => y.uuid != item.uuid)
    : [...selected, item]
}

// Watch for route changes
watch(route, async (to, from) => {
  moduleType.value = to.meta?.moduleType
  if (moduleType.value) {
    await loadConfiguration()
    keywordSearch.value = ''
    if (advanceSearchReference.value) {
      advanceSearchReference.value.resetForm()
    }
    dataInputSearch.value = {}
    // getDanhSach()
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
          <v-col
            cols="4"
            class="px-0 py-0 pr-4"
            v-if="jsondata?.collection === 'quanlydanhmuc'"
          >
            <v-card>
              <v-list density="compact">
                <v-list-item
                  v-for="(i, index) in jsondata.tempDanhMuc"
                  :key="index"
                  :value="i"
                  color="primary"
                >
                  <template v-slot:prepend>
                    <v-icon color="var(--main-color)">mdi-tag-outline</v-icon>
                  </template>
                  <v-list-item-title
                    style="color: var(--main-color)"
                    class="text-uppercase"
                    >{{ i.TenMuc }}</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
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
              <v-col class="m-btn-show-advanceSearch text-right px-0 py-0">
                <v-icon
                  :size="24"
                  class=""
                  :icon="
                    !advanceSearch
                      ? 'mdi-filter-variant-plus'
                      : 'mdi-filter-variant'
                  "
                  color="var(--main-color)"
                  @click.stop="showAdvanceSearch"
                >
                </v-icon>
              </v-col>
            </v-row>
            <v-row class="my-0 mb-3 mx-0" v-else>
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
                <v-text-field
                  v-model="keywordSearch"
                  append-inner-icon="mdi-magnify"
                  @keyup.enter="getDanhSach('reset')"
                  @click:append-inner="getDanhSach('reset')"
                  @click:prepend-inner="getDanhSach('reset')"
                  :placeholder="jsondata?.placeHolderSearch ?? ''"
                  dense
                  hide-details="auto"
                  class="input-form input-header-search"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col v-if="jsondata?.type !== 'taikhoanhethong'" class="py-0 px-0 wrap-btn-advanceSearch">
                <v-btn
                  size="small"
                  color="var(--main-color)"
                  :prepend-icon="
                    !advanceSearch
                      ? 'mdi-filter-variant-plus'
                      : 'mdi-filter-variant'
                  "
                  @click.stop="showAdvanceSearch"
                  class="mx-0 white--text ml-3"
                  style="float: right"
                >
                  Nâng cao
                </v-btn>
              </v-col>
            </v-row>
            <!-- Filter Status -->
            <v-row
              class="mx-0 my-3 wrap-menu-status"
              v-if="statusList && statusList.length"
            >
              <v-chip
                v-for="(item, index) in statusList"
                :key="index"
                class="mr-2 mt-2"
                :color="
                  item.MaMuc === statusSelected
                    ? 'var(--main-color)'
                    : 'var(--main-color)'
                "
                label
                :variant="item.MaMuc === statusSelected ? 'flat' : 'outlined'"
                style="cursor: pointer; height: 28px"
                @click="selectStatus(item, index)"
              >
                <v-icon
                  v-if="item.MaMuc === statusSelected"
                  start
                  icon="mdi-label"
                ></v-icon>
                <span
                  :style="
                    item.MaMuc === statusSelected
                      ? 'font-size: 14px;color: #fff'
                      : 'font-size: 14px;color: var(--main-color)'
                  "
                  >{{ item.TenMuc }}</span
                >
                <span
                  :class="[
                    item.MaMuc === statusSelected
                      ? 'count-chip-active'
                      : 'count-chip',
                    item.SoLuong > 99 ? 'count-chip-fit' : '',
                  ]"
                  >{{ item.SoLuong }}</span
                >
              </v-chip>
            </v-row>
            <!--  -->
            <div v-if="advanceSearch && jsondata?.type !== 'taikhoanhethong'">
              <TimKiemNangCao
                ref="advanceSearchReference"
                :mauNhap="mauTimKiem"
                :dataInput="dataInputSearch"
                @submitSearch="submitAdvanceSearch"
              ></TimKiemNangCao>
            </div>
            <!-- table -->
            <v-row class="mx-0 my-0 my-3">
              <v-col
                v-if="breakpointName === 'xs'"
                class="px-0 py-0 py-1"
                style="font-weight: 600; color: var(--main-color)"
              >
                <span>Tổng số: </span>
                <span>{{ total }}</span>
              </v-col>
              <v-col class="py-0 px-0">
                <v-btn
                  v-if="jsondata?.collection === 'quanlytaikhoan'"
                  size="small"
                  color="var(--main-color)"
                  @click.stop="themMoiHoSo"
                  class="mx-0 white--text ml-2"
                  style="float: right"
                >
                  <v-icon size="18" class=""
                    >mdi-file-document-plus-outline</v-icon
                  >&nbsp;Thêm mới tài khoản
                </v-btn>
              </v-col>
            </v-row>

            <v-row class="mx-0 my-0" v-if="breakpointName === 'xs'">
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
                          {{
                            (page + 1) * itemsPerPage - itemsPerPage + index + 1
                          }}
                        </div>
                      </td>
                      <td class="pt-2">
                        <div class="my-2">
                          <v-btn
                            :disabled="loading"
                            :color="
                              item.TrangThaiDuLieu['MaMuc'] == '02'
                                ? '#FF0000'
                                : 'var(--main-color)'
                            "
                            class="white--text mr-2"
                            size="small"
                            @click.stop="chuyenTrangThaiDuLieu(item)"
                          >
                            <v-icon size="18" color="#fff">
                              {{
                                item.TrangThaiDuLieu['MaMuc'] == '02'
                                  ? 'mdi-close'
                                  : 'mdi-file-restore-outline'
                              }}
                            </v-icon>
                            <span>{{
                              item.TrangThaiDuLieu['MaMuc'] == '02'
                                ? ' Hủy bỏ'
                                : ' Khôi phục'
                            }}</span>
                          </v-btn>
                          <v-btn
                            :disabled="loading"
                            size="small"
                            color="#FF0000"
                            class="white--text"
                            @click.stop="xoaDoiTuong(item)"
                          >
                            <v-icon size="18" color="#fff">mdi-close</v-icon
                            >&nbsp;Xóa
                          </v-btn>
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

            <v-row class="mx-0 my-0" v-else>
              <v-col class="px-0 py-0">
                <v-data-table
                  :headers="headers"
                  :items="dsDoiTuong"
                  :items-per-page="itemsPerPage"
                  item-value="primKey"
                  hide-default-footer
                  class="table-base"
                  :loading="loadingData"
                  no-data-text="Không có dữ liệu"
                  loading-text="Đang tải"
                >
                  <template #headers>
                    <tr>
                      <th
                        v-for="header in headers"
                        :key="header.value"
                        :class="header.class"
                        :width="header.width"
                      >
                        <div v-if="header.type && header.type == 'checkbox'">
                          <v-checkbox
                            color="var(--main-color)"
                            :model-value="isSelectAll"
                            hide-details
                            @click.stop="handleSelectAll"
                          >
                          </v-checkbox>
                        </div>
                        <div
                          v-else
                          :style="
                            header.hasOwnProperty('style') ? header.style : ''
                          "
                        >
                          <span>{{ header.title }}</span>
                        </div>
                      </th>
                    </tr>
                  </template>
                  <template v-slot:item="{ item, index }">
                    <tr @click="redirectThongTinDoiTuong(item)">
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
                                icon
                                variant="flat"
                                size="small"
                                v-bind="props"
                                class="mr-2"
                                @click.stop="handleCheckAction(item, 'lock')"
                              >
                                <v-icon size="18" color="var(--main-color)"
                                  >mdi-lock</v-icon
                                >
                              </v-btn>
                            </template>
                            <span>Khoá tài khoản</span>
                          </v-tooltip>
                          <v-tooltip location="top">
                            <template v-slot:activator="{ props }">
                              <v-btn
                                :disabled="loading"
                                icon
                                variant="flat"
                                size="small"
                                v-bind="props"
                                class="mr-2"
                                @click.stop="handleCheckAction(item, 'reset')"
                              >
                                <v-icon size="18" color="var(--main-color)"
                                  >mdi-refresh</v-icon
                                >
                              </v-btn>
                            </template>
                            <span>Đặt lại mật khẩu</span>
                          </v-tooltip>
                          <v-tooltip
                            location="top"
                            v-if="jsondata.type === 'taikhoandonvi'"
                          >
                            <template v-slot:activator="{ props }">
                              <v-btn
                                :disabled="loading"
                                icon
                                variant="flat"
                                size="small"
                                v-bind="props"
                                class="mr-2"
                                @click.stop="handleCheckAction(item, 'edit')"
                              >
                                <v-icon size="18" color="var(--main-color)"
                                  >mdi-file-document-edit-outline</v-icon
                                >
                              </v-btn>
                            </template>
                            <span>Sửa</span>
                          </v-tooltip>
                          <v-tooltip location="top">
                            <template v-slot:activator="{ props }">
                              <v-btn
                                :disabled="loading"
                                icon
                                variant="flat"
                                size="small"
                                v-bind="props"
                                class="mr-2"
                                @click.stop="handleCheckAction(item, 'delete')"
                              >
                                <v-icon size="18" color="#FF0000">
                                  mdi-close
                                </v-icon>
                              </v-btn>
                            </template>
                            <span>Xoá tài khoản</span>
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
                  :pageInput="page + 1"
                  :pageCount="pageCount"
                  :total="total"
                  @changePage="changePage"
                  style="margin-bottom: 50px"
                ></Pagination>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-dialog
          max-width="500"
          v-model="isShowResetPassword"
          persistent
          scrollable
        >
          <v-card>
            <v-toolbar dark color="primary" class="px-0">
              <div
                class="sub-header d-flex align-center justify-start py-0 px-0"
              >
                <div class="sub-header-content">Đặt lại mật khẩu</div>
                <div class="triangle-header"></div>
              </div>
              <v-spacer></v-spacer>
              <v-toolbar-items>
                <v-btn
                  class="btn-custom"
                  size="small"
                  icon
                  color="#E9FFF2"
                  @click="isShowResetPassword = false"
                >
                  <v-icon size="20">mdi-close</v-icon>
                </v-btn>
              </v-toolbar-items>
            </v-toolbar>
            <v-card-text class="px-3 pt-3">
              <FormCRUD
                ref="refsFormResetPassword"
                :typeAction="'update'"
                :mauNhap="formNhapResetPassword"
                :dataInput="currentItem"
              />
              <v-row class="mx-0 my-0">
                <v-col cols="12" class="text-center">
                  <v-btn
                    class="btn-custom mr-2"
                    size="small"
                    color="var(--main-color)"
                    @click="handleResetPassword"
                  >
                    <v-icon size="20">mdi-check</v-icon>
                    Xác nhận
                  </v-btn>
                  <v-btn
                    class="btn-custom"
                    size="small"
                    color="var(--main-color)"
                    variant="outlined"
                    @click="isShowResetPassword = false"
                  >
                    <v-icon size="20">mdi-close</v-icon>
                    Huỷ bỏ
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-dialog>

        <v-dialog
          max-width="600"
          v-model="isShowDialogCreate"
          persistent
          scrollable
        >
          <v-card>
            <v-toolbar dark color="primary" class="px-0">
              <div
                class="sub-header d-flex align-center justify-start py-0 px-0"
              >
                <div class="sub-header-content">
                  Thêm mới tài khoản hệ thống
                </div>
                <div class="triangle-header"></div>
              </div>
              <v-spacer></v-spacer>
              <v-toolbar-items>
                <v-btn
                  class="btn-custom"
                  size="small"
                  icon
                  color="#E9FFF2"
                  @click="isShowDialogCreate = false"
                >
                  <v-icon size="20">mdi-close</v-icon>
                </v-btn>
              </v-toolbar-items>
            </v-toolbar>
            <v-card-text class="px-3 pt-3">
              <FormCRUD
                ref="refsFormResetPassword"
                :typeAction="'update'"
                :mauNhap="formNhapCreate"
                :dataInput="{}"
              />
              <v-row class="mx-0 my-0">
                <v-col cols="12" class="text-center">
                  <v-btn
                    class="btn-custom mr-2"
                    size="small"
                    color="var(--main-color)"
                    @click="handleResetPassword"
                  >
                    <v-icon size="20">mdi-check</v-icon>
                    Xác nhận
                  </v-btn>
                  <v-btn
                    class="btn-custom"
                    size="small"
                    color="var(--main-color)"
                    variant="outlined"
                    @click="isShowDialogCreate = false"
                  >
                    <v-icon size="20">mdi-close</v-icon>
                    Huỷ bỏ
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-dialog>
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
