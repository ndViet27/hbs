<template>
  <div>
    <v-dialog max-width="1000" v-model="dialogModel" persistent scrollable>
      <v-card>
        <v-toolbar dark color="primary" class="px-0">
          <div class="sub-header d-flex align-center justify-start py-0 px-0">
            <div class="sub-header-content">Chọn vai trò</div>
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
            <v-col>
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
                        <v-checkbox
                          v-model="group.check"
                          hide-details
                          color="primary"
                          @click.stop
                          @update:modelValue="changeCheckboxAll(group)"
                        ></v-checkbox>
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
                            <v-checkbox
                              v-model="vaitro.check"
                              hide-details
                              color="primary"
                              @click.stop
                              @update:modelValue="changeCheckbox(group)"
                            ></v-checkbox>
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
                            <div
                              class="mb-1 flex align-center"
                              v-if="
                                userInfo &&
                                userInfo.VaiTroSuDung &&
                                (userInfo.VaiTroSuDung.includes('admin') ||
                                  userInfo.VaiTroSuDung.includes('SuperAdmin'))
                              "
                            >
                              <label class="font-bold">
                                Tài khoản quản trị:
                              </label>
                              <span>
                                <v-checkbox
                                  v-model="vaitro.TaiKhoanQuanTri"
                                  hide-details
                                  color="primary"
                                  readonly
                                ></v-checkbox>
                              </span>
                            </div>
                          </div>
                        </v-card>
                      </v-menu>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn class="btn-custom bg-primary ma-auto" @click="save()">
            Chọn
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import jsonData from '@/metadata/QuanTriHeThong/TaiKhoanCapDonVi.json'

const emit = defineEmits(['closePopup', 'savePopup'])

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array,
    default() {
      return []
    },
  },
})
const dialogModel = ref(props.dialog)

const loading = ref(false)

const keyword = ref('')

const groupUngDung = reactive([])

onMounted(async () => {
  loading.value = true
  await loadData()
  loading.value = false
})

async function loadData() {
  try {
    let items = jsonData.tempVaiTro
    const grouped = {}
    items.forEach((obj) => {
      if (obj.UngDung && obj.UngDung.length) {
        obj.UngDung.forEach((ud) => {
          const maMuc = ud.MaMuc
          if (!grouped[maMuc]) {
            grouped[maMuc] = {
              ...ud,
              childrens: [],
              check: false,
            }
          }
          grouped[maMuc].childrens.push({
            ...obj,
            check: props.data?.some(
              (x) =>
                x.MaMuc == maMuc &&
                x.childrens.some((y) => y.MaMuc == obj.MaMuc && y.check)
            ),
          })
        })
      } else {
        if (!grouped['vaitrotonghop'])
          grouped['vaitrotonghop'] = {
            MaMuc: 'vaitrotonghop',
            TenMuc: 'Vai trò tổng hợp',
            childrens: [],
            check: false,
          }

        grouped['vaitrotonghop'].childrens.push({
          ...obj,
          check: props.data?.some(
            (x) =>
              x.MaMuc == 'vaitrotonghop' &&
              x.childrens.some((y) => y.MaMuc == obj.MaMuc && y.check)
          ),
        })
      }
    })
    for (const key in grouped) {
      grouped[key].check = grouped[key].childrens.every((x) => x.check)
      groupUngDung.push(grouped[key])
    }
  } catch (error) {
    console.log(error)
  }
}

function changeCheckboxAll(data) {
  data.childrens.map((x) => (x.check = data.check))
}

function changeCheckbox(data) {
  data.check = data.childrens.every((x) => x.check)
}

async function save() {
  const getVaiTro = groupUngDung.reduce((acc, x) => {
    const seenIds = new Set(acc.map((child) => child.MaMuc))

    const uniqueChildren = x.childrens.filter((child) => {
      if (child.check && !seenIds.has(child.MaMuc)) {
        seenIds.add(child.MaMuc)
        return true
      }
      return false
    })

    return acc.concat(uniqueChildren)
  }, [])
  emit('savePopup', getVaiTro)
}

function close() {
  emit('closePopup')
}
</script>

<style scoped>
.panel-danhmuc {
  border-radius: 5px;
}
.panel-danhmuc >>> .v-expansion-panel-title {
  min-height: 36px !important;
}
.panel-danhmuc >>> .v-expansion-panel--active button span {
  color: var(--main-color);
  font-weight: 700;
}
.panel-danhmuc >>> .v-expansion-panel-text__wrapper {
  padding: 0px 0px !important;
}
.panel-danhmuc >>> .v-expansion-panel__shadow {
  box-shadow: none !important;
}
.panel-danhmuc >>> .v-checkbox .v-selection-control {
  min-height: 0;
}
</style>
