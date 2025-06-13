<template>
  <div class="approval-detail-container">
    <div class="header-section">
      <div class="title-area text-uppercase header-border">
        <h1 class="" style="color: var(--main-color)">
          {{ formThongTin?.title ?? '' }}
        </h1>
      </div>
      <div class="action-buttons">
        <v-btn
          class="btn-custom ml-auto text-white"
          color="var(--main-color)"
          @click.stop="redirectEdit()"
        >
          <v-icon size="22" color="#fff" class="mr-2"> mdi-file-edit </v-icon>
          <span>Cập nhật</span>
        </v-btn>
        <v-btn
          class="btn-custom ml-auto"
          variant="outlined"
          color="var(--main-color)"
          @click.stop="goBack()"
        >
          <v-icon size="22" color="var(--main-color)" class="mr-2"> mdi-reply-all-outline </v-icon>
          <span>Quay lại</span>
        </v-btn>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Content -->
    <div v-else class="content-container">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div
              class="info-group d-flex"
              v-for="(item, index) in formInfo"
              :key="index"
            >
              <label class="mr-1">{{ `${item.label}:` }}</label>
              <div v-if="item.type === 'text'">
                {{
                  infoBanGhi.hasOwnProperty(item.value)
                    ? infoBanGhi[item.value]
                    : ''
                }}
              </div>
              <div v-if="item.type === 'boolean'">
                <v-checkbox
                  :model-value="infoBanGhi[item.value]"
                  color="var(--main-color)"
                  class="flex"
                  hide-details
                  readonly
                >
                </v-checkbox>
              </div>
              <div v-if="item.type === 'list'">
                {{ arrayToString(infoBanGhi[item.value], item.mapping) }}
              </div>
              <div v-if="item.type === 'object'">
                {{
                  infoBanGhi.hasOwnProperty(item.value) &&
                  infoBanGhi[item.value]
                    ? infoBanGhi[item.value][item.mapping]
                    : ''
                }}
              </div>
            </div>
            <v-col cols="12" class="px-0 py-0">
              <v-expansion-panels
                variant="accordion"
                class="panel-danhmuc my-2"
                :model-value="[0]"
                multiple
                style="border: 1px solid #dedede"
              >
                <v-expansion-panel
                  v-for="(group, indexGr) in groupUngDung"
                  :key="indexGr"
                  style="border-radius: 5px !important"
                >
                  <v-expansion-panel-title class="px-2 py-1" hide-actions>
                    <template v-slot:default="{ expanded }">
                      <div style="display: flex; align-items: center">
                        <v-icon
                          size="22"
                          :color="expanded ? 'var(--main-color)' : '#000'"
                          class="mr-2"
                        >
                          {{ expanded ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
                        </v-icon>
                        <span
                          style="
                            font-weight: 600;
                            font-size: 14px;
                            text-transform: uppercase;
                          "
                        >
                          <span v-if="group.MaMuc != 'vaitrotonghop'">
                            Ứng dụng:
                          </span>
                          {{ group.TenMuc }}
                        </span>
                      </div>
                    </template>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text style="padding: 0">
                    <div
                      v-for="(vaitro, index) in group.childrens"
                      :key="index"
                      class="py-0"
                      :style="
                        index + 1 !== group.childrens.length
                          ? 'display: flex;align-items: center;padding-left: 15px;border-bottom: 1px solid #dedede'
                          : 'display: flex;align-items: center;padding-left: 15px'
                      "
                    >
                      <v-menu :close-on-content-click="false" location="top">
                        <template v-slot:activator="{ props }">
                          <span
                            v-bind="props"
                            style="cursor: pointer"
                            class="py-2 d-flex align-center"
                          >
                            <span>
                              {{ vaitro.MaMuc }} -
                              {{ vaitro.TenMuc }}
                            </span>
                          </span>
                        </template>
                        <v-card
                          min-width="500"
                          max-width="1000"
                          style="border: 1px solid #dadada"
                        >
                          <div class="pa-3">
                            <div class="mb-1">
                              <label class="font-bold"> Mã vai trò: </label>
                              <span>{{ vaitro.MaMuc }}</span>
                            </div>
                            <div class="mb-1">
                              <label class="font-bold"> Tên vai trò: </label>
                              <span>
                                {{ vaitro.TenMuc }}
                              </span>
                            </div>
                            <!-- <div
                              class="mb-1 d-flex align-center"
                              v-if="
                                userInfoVaiTro &&
                                userInfoVaiTro.VaiTroSuDung &&
                                (userInfoVaiTro.VaiTroSuDung.includes(
                                  'admin'
                                ) ||
                                  userInfoVaiTro.VaiTroSuDung.includes(
                                    'SuperAdmin'
                                  ))
                              "
                            >
                              <label class="font-bold">
                                Tài khoản quản trị:
                              </label>
                              <span>
                                <v-checkbox
                                  v-model="vaitro.TaiKhoanQuanTri"
                                  hide-details
                                  color="var(--main-color)"
                                  readonly
                                ></v-checkbox>
                              </span>
                            </div> -->
                          </div>
                        </v-card>
                      </v-menu>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, reactive, onMounted } from 'vue'
import { useAppStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const subMenuSelected = computed(() => appStore.getSubMenuSelected)

const jsondata = ref(null)
const configCache = reactive({})
const moduleType = route.meta.moduleType

const configError = ref(null)
const configLoaded = ref(false)

const loading = ref(true)
const infoBanGhi = ref({})
const status = ref('pending')
const itemId = route.params.id
const typeAction = ref('create')
const groupUngDung = reactive([])

const formInfo = ref([])
const formThongTin = ref({})

// Get page title from route and menu configuration
const goBack = function () {
  router.back()
}

const redirectEdit = function () {
  router.push({
    path: `${subMenuSelected.value.to}/edit/${itemId}`,
    query: route.query,
  })
}

const getConfigByModuleType = async (moduleType) => {
  if (!moduleType) return null
  if (configCache[moduleType]) {
    return configCache[moduleType]
  }
  try {
    const config = await import(`@/metadata/QuanTriHeThong/${moduleType}.json`)
    configCache[moduleType] = config
    return config
  } catch (error) {
    console.error(`Error loading: ${moduleType}`, error)
    configError.value = error
    return null
  }
}

const arrayToString = function (arr, name) {
  if (!arr || !arr.length) return ''
  let arrayString = ''
  if (name) {
    let arrConvert = Array.from(arr, (item) => item[name])
    arrayString = arrConvert.toString()
  } else {
    arrayString = arr.toString()
  }
  return arrayString.replace(/,/g, ", ")
}

const loadConfiguration = async () => {
  try {
    if (route.params.id) {
      typeAction.value = 'update'
    } else {
      typeAction.value = 'create'
      loading.value = false
    }
    configLoaded.value = false
    const config = await getConfigByModuleType(moduleType)
    jsondata.value = config
    formThongTin.value = config['detail']
    formInfo.value = config['detail']['formInfo']
    configLoaded.value = true
    return config
  } catch (error) {
    configError.value = error
    throw error
  }
}

const setupPromise = loadConfiguration().then(() => {
  if (route.params.id) {
    loadData()
  }
})

// Load item data
const loadData = () => {
  loading.value = true

  // In a real app, you'd make an API call here
  // For now, let's simulate loading with mock data
  setTimeout(() => {
    infoBanGhi.value = generateMockItem(itemId)
    loading.value = false
  }, 800)
}

// Generate mock data for demo
const generateMockItem = (id) => {
  return {
    primKey: id,
    TenGoi: 'Trần Văn A',
    TenTaiKhoan: 'tentaikhoan1',
    TinhTrangSuDungTaiKhoan: {
      TenMuc: 'Đang sử dụng',
      MaMuc: '01',
    },
    TaiKhoanQuanTri: true,
    PhanVungDuLieu: [
      {
        TenMuc: 'Bộ giáo dục',
        MaDinhDanh: 'BGD-001',
      },
    ],
    PhanVungDuLieuNgamDinh: {
      TenMuc: 'Bộ giáo dục',
      MaDinhDanh: 'BGD-001',
    },

    VaiTro: groupBy([
      {
        id: 13953,
        '@type': 'C_VaiTroSuDung',
        MaMuc: 'CHANH_THANH_TRA',
        TenMuc: 'Chánh thanh tra',
      },
    ]),
    TrangThaiDuLieu: {
      TenMuc: 'Chính thức',
      MaMuc: '02',
    },
  }
}

function groupBy(data) {
  groupUngDung.length = 0
  const grouped = {}
  data.forEach((obj) => {
    if (obj.UngDung && obj.UngDung.length) {
      obj.UngDung.forEach((ud) => {
        const maMuc = ud.MaMuc
        if (!grouped[maMuc]) {
          grouped[maMuc] = {
            ...ud,
            childrens: [],
            check: true,
          }
        }
        grouped[maMuc].childrens.push({ ...obj, check: true })
      })
    } else {
      if (!grouped['vaitrotonghop'])
        grouped['vaitrotonghop'] = {
          MaMuc: 'vaitrotonghop',
          TenMuc: 'Vai trò tổng hợp',
          childrens: [],
          check: true,
        }

      grouped['vaitrotonghop'].childrens.push({ ...obj, check: true })
    }
  })
  for (const key in grouped) {
    groupUngDung.push(grouped[key])
  }
  console.log(groupUngDung)
}
</script>

<style scoped>
.approval-detail-container {
  padding: 20px;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title-area {
  display: flex;
  align-items: center;
  gap: 15px;
}
.title-area .badge {
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
}
.action-buttons {
  display: flex;
  gap: 10px;
}
.content-container {
  margin-top: 20px;
}
.loading-container {
  text-align: center;
  padding: 50px;
}
.header-border {
  border-bottom: 2px solid var(--main-color);
}
.info-group {
  margin-bottom: 15px;
}
.info-group label {
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
  color: #555;
  min-width: 200px;
}
</style>
