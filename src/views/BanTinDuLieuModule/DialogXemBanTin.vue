<template>
  <div>
    <v-dialog width="1200" v-model="dialogModel" persistent scrollable>
      <v-card>
        <v-toolbar dark color="primary" class="px-0">
          <div class="sub-header d-flex align-center justify-start py-0 px-0">
            <div class="sub-header-content">Xem bản tin</div>
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
          <v-row class="mb-3"> </v-row>
          <v-row class="my-0 mb-3 mx-0">
            <v-col
              class="row-header d-flex align-center justify-start py-0 px-0"
              style="border: none"
            >
              <div class="header-content uppercase">Danh sách học bạ</div>
              <v-text-field
                v-model="keywordSearch"
                append-inner-icon="mdi-magnify"
                @keyup.enter="xemGoiTin('rest')"
                @click:append-inner="xemGoiTin('rest')"
                @click:prepend-inner="xemGoiTin('rest')"
                placeholder="Nhập từ khóa tìm kiếm"
                dense
                hide-details="auto"
                class="input-form input-header-search"
                clearable
              ></v-text-field>
            </v-col>
          </v-row>
          <div>
            <TimKiemNangCao
              ref="advanceSearch"
              :mauNhap="mauTimKiem"
              :dataInput="dataInputSearch"
              :formType="'normalSearch'"
              @changeFormSearch="changeFormSearch"
            ></TimKiemNangCao>
          </div>
          <v-row class="mx-0 my-0 mt-2">
            <v-col class="px-0 py-0">
              <v-data-table
                :headers="headers"
                :items="dsHocBa"
                :items-per-page="itemsPerPage"
                item-value="HOC_BA_ID"
                hide-default-footer
                class="table-base"
                :loading="loading"
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
                      <div
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
                        <div
                          v-else
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

                      <template
                        v-else-if="itemHeader.type == 'TrangThaiXuLyTin'"
                      >
                        <div class="mb-1">
                          <span>{{
                            getTrangThai(item?.trang_thai_ket_qua_id)
                          }}</span>
                        </div>
                      </template>

                      <template
                        v-else-if="itemHeader.type == 'ChiTietLoiXuLyDuLieu'"
                      >
                        <div
                          class="mb-1"
                          v-if="
                            item?.ds_loi_xu_ly_du_lieu &&
                            item?.ds_loi_xu_ly_du_lieu.length
                          "
                        >
                          <div
                            v-for="(
                              itemLoi, indexLoi
                            ) in item?.ds_loi_xu_ly_du_lieu"
                            :key="indexLoi"
                          >
                            <p class="font-weight-bold">
                              {{ `${itemLoi?.loi_xu_ly_du_lieu_id}: ` }}
                              <span style="font-weight: 400 !important">{{
                                itemLoi?.ten_loi_xu_ly_du_lieu
                              }}</span>
                            </p>
                          </div>
                        </div>
                      </template>

                      <div
                        v-else-if="itemHeader.type == 'date'"
                        :style="
                          itemHeader.hasOwnProperty('style')
                            ? itemHeader.style
                            : ''
                        "
                      >
                        {{
                          getValue(item, itemHeader.value)
                            ? dateLocale(getValue(item, itemHeader.value))
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
              <Pagination
                v-if="total"
                :pageInput="page + 1"
                :pageCount="pageCount"
                :total="total"
                :currentNumberPage="itemsPerPage"
                @changePage="changePage"
                @changeNumberPage="changeNumberPage"
                style="margin-bottom: 50px"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { dateLocale } from '@/helpers/index'
import { generalApi } from '@/api'

const Pagination = defineAsyncComponent(() =>
  import('@/components/Pagination.vue')
)
const TimKiemNangCao = defineAsyncComponent(() =>
  import('@/components/TimKiemNangCao.vue')
)
const emit = defineEmits(['closePopup', 'duyet', 'tuchoi'])
const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
  xuLyBanTinId: {
    type: String,
    default: '',
  },
  data: {
    type: Array,
    default: () => [],
  },
})

const dialogModel = ref(props.dialog)

const dsHocBa = ref(props.data)

const headers = ref([
  {
    type: 'index',
    title: 'STT',
    align: 'center',
    width: 50,
    class: 'th-center td-center py-1',
  },
  {
    value: 'hoc_ba_id',
    title: 'Mã học bạ',
    align: 'center',
    width: 200,
    class: 'th-left text-left',
  },
  {
    value: 'nguoi_hoc.nguoi_hoc_id',
    title: 'Mã học sinh',
    align: 'center',
    width: 200,
    class: 'th-left text-left',
  },
  {
    value: 'nguoi_hoc.so_dinh_danh_ca_nhan',
    title: 'Số định danh',
    align: 'center',
    width: 150,
    class: 'th-left text-left',
  },
  {
    value: 'nguoi_hoc.ho_va_ten',
    title: 'Tên học sinh',
    align: 'center',
    width: 130,
    class: 'th-center text-left',
  },
  {
    value: 'nguoi_hoc.ngay_sinh',
    title: 'Ngày sinh',
    type: 'date',
    align: 'center',
    width: 120,
    class: 'th-center text-center',
  },
  {
    value: 'trang_thai_ket_qua_id',
    title: 'Trạng thái đồng bộ',
    type: 'TrangThaiXuLyTin',
    align: 'center',
    width: 150,
    class: 'th-left text-left',
  },
  {
    value: 'ds_loi_xu_ly_du_lieu',
    title: 'Chi tiết lỗi',
    type: 'ChiTietLoiXuLyDuLieu',
    align: 'center',
    width: 200,
    class: 'th-center',
  },
])

const dsTrangThai = ref([
  {
    value: '00',
    title: 'Chưa được xử lý',
  },
  {
    value: '01',
    title: 'Đã xử lý thành công',
  },
  {
    value: '02',
    title: 'Có lỗi xử lý',
  },
])

const selected = ref([])
const itemsPerPage = ref(10)
const page = ref(0)
const pageCount = ref(0)
const total = ref(0)
const loading = ref(false)
const keywordSearch = ref('')
const mauTimKiem = ref([
  {
    name: 'trangThaiKetQuaId',
    title: 'Trạng thái đồng bộ',
    type: 'select',
    itemText: 'ten_trang_thai_ket_qua',
    itemValue: 'trang_thai_ket_qua_id',
    fieldClass: 'v-col-xs-12 v-col-4',
    api: '',
    responseDataApi: 'result',
    params: {},
    mapping: 'trang_thai_ket_qua_id',
    placeHolder: '',
    defaultValue: '',
    dataType: '',
    dataSource: [
      {
        trang_thai_ket_qua_id: "00",
        ten_trang_thai_ket_qua: 'Chưa được xử lý',
      },
      {
        trang_thai_ket_qua_id: "01",
        ten_trang_thai_ket_qua: 'Đã xử lý thành công',
      },
      {
        trang_thai_ket_qua_id: "02",
        ten_trang_thai_ket_qua: 'Có lỗi xử lý',
      },
    ],
    autoEvent: '',
    clearable: true,
  },
])
const dataSearch = ref({})
const dataInputSearch = ref({})

function changePage(val) {
  page.value = val.value - 1
  xemGoiTin()
}

function changeNumberPage(val) {
  itemsPerPage.value = val.value
  xemGoiTin('reset')
}

function close() {
  dialogModel.value = false
  emit('closePopup')
}

const getTrangThai = (id) => {
  const item = dsTrangThai.value.find((item) => item.value === id)
  return item ? item.title : ''
}

const changeFormSearch = (data) => {
  dataSearch.value = data
  xemGoiTin('reset')
}

const xemGoiTin = function (type) {
  if (type == 'reset') {
    page.value = 0
  }
  let filter = {
    api: `/dulieuchu/tracuu/internal/hocba/1.0/viewbyxulydulieu/${props.xuLyBanTinId}`,
    params: {
      page: page.value,
      size: itemsPerPage.value,
      keyword: keywordSearch.value ? keywordSearch.value : '',
    },
  }
  if (dataSearch.value) {
    filter.params = {
      ...filter.params,
      ...dataSearch.value,
    }
  }
  generalApi.getData(filter).then((result) => {
    dsHocBa.value = result.data.result
    total.value = result.data.totalItems
    pageCount.value = result.data.totalPages
    console.log(dsHocBa.value)
  })
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

onMounted(() => {
  xemGoiTin()
})
</script>

<style scoped>
.text-main-color {
  color: var(--main-color);
}
</style>
