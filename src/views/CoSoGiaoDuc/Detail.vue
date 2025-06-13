<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, computed, reactive, onMounted, defineAsyncComponent } from "vue";
import { useAppStore } from "@/stores";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

// const subMenuSelected = computed(() => appStore.getSubMenuSelected);

const jsondata = ref(null);
const configCache = reactive({});
const moduleType = ref(route.meta.moduleType);

const configError = ref(null);
const configLoaded = ref(false);

const detail = ref({});
const tabIndex = ref(0);

const thongTinChungCuaCoSo = ref({});
const thongTinTuyenSinh = ref({});
const danhSachNhapHoc = ref({});

const currentTabId = ref("thongTinChungCuaCoSo");

const TimKiemNangCao = defineAsyncComponent(() =>
  import("@/components/TimKiemNangCao.vue")
);
function getTab(id) {
  return detail?.value?.tabs?.find((tab) => tab.tabId === id);
}

const getConfigByModuleType = async () => {
  if (!moduleType.value) return null;
  if (configCache[moduleType.value]) {
    return configCache[moduleType.value];
  }
  try {
    const config = await import(
      `@/metadata/DuLieuChuModule/${moduleType.value}.json`
    );
    configCache[moduleType.value] = config;
    return config;
  } catch (error) {
    console.error(`Error loading: ${moduleType.value}`, error);
    configError.value = error;
    return null;
  }
};

const loadConfiguration = async () => {
  try {
    configLoaded.value = false;
    const config = await getConfigByModuleType();
    console.log(config);
    jsondata.value = config;
    detail.value = config["detail"];

    configLoaded.value = true;
    return config;
  } catch (error) {
    configError.value = error;
    console.log(error);

    throw error;
  }
};

const setupPromise = loadConfiguration().then(() => {
  if (route.params.id) {
    // loadData()
  }
});

// Load item data
// const loadData = () => {
//   loading.value = true

//   // In a real app, you'd make an API call here
//   // For now, let's simulate loading with mock data
//   setTimeout(() => {
//     infoBanGhi.value = generateMockItem(itemId)
//     loading.value = false
//   }, 800)
// }
</script>
<template>
  <Suspense>
    <template #default>
      <v-card
        class="mx-auto pa-0"
        style="box-shadow: none !important; overflow: inherit; min-height: 80vh"
      >
        <v-row class="my-0 mb-1 mx-0">
          <v-col
            class="row-header d-flex align-center justify-start py-0 px-0"
            style="border: none"
          >
            <div class="header-content" style="text-transform: uppercase">
              {{ detail?.title }}
            </div>
          </v-col>
        </v-row>

        <div
          class="thongtinhoso w-100"
          style="border-top: 1px solid var(--main-color)"
        >
          <!-- Tabs -->
          <v-tabs v-model="currentTabId">
            <v-tab
              v-for="(tab, index) in detail?.tabs || []"
              :key="index"
              :value="tab.tabId"
            >
              {{ tab.tabTitle }}
            </v-tab>
          </v-tabs>

          <!-- Window content -->
          <v-window v-model="currentTabId" class="mt-4">
            <v-window-item value="thongTinChungCuaCoSo">
              <v-row class="mx-0 my-0">
                <v-col>
                  <v-row>
                    <v-col cols="7">
                      <div
                        class=""
                        v-for="(item, i) in getTab(
                          'thongTinChungCuaCoSo'
                        )?.formInfo.slice(0, 8)"
                        :key="'left-' + i"
                      >
                        <label class="font-weight-medium mr-2"
                          >{{ item.label }}:</label
                        >
                      </div>
                    </v-col>

                    <v-col >
                      <div
                        class=""
                        v-for="(item, i) in getTab(
                          'thongTinChungCuaCoSo'
                        )?.formInfo.slice(8)"
                        :key="'right-' + i"
                      >
                        <label class="font-weight-medium mr-2"
                          >{{ item.label }}:</label
                        >
                      </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <label>
                        {{
                          getTab("thongTinChungCuaCoSo")?.danhSachLanhDao.title
                        }}
                      </label>
                      <v-data-table
                        :headers="
                          getTab('thongTinChungCuaCoSo')?.danhSachLanhDao
                            .tableHeaders
                        "
                        item-value="primKey"
                        hide-default-footer
                        class="table-base"
                        :loading="loadingData"
                        no-data-text="Không có dữ liệu"
                        loading-text="Đang tải"
                      >
                      </v-data-table>
                    </v-col>
                  </v-row>
                  <v-row class="mt-0">
                    <v-col>
                      <label>
                        {{
                          getTab("thongTinChungCuaCoSo")
                            ?.danhSachChuanChuongTrinh.title
                        }}
                      </label>
                      <v-data-table
                        :headers="
                          getTab('thongTinChungCuaCoSo')
                            ?.danhSachChuanChuongTrinh.tableHeaders
                        "
                        item-value="primKey"
                        hide-default-footer
                        class="table-base"
                        :loading="loadingData"
                        no-data-text="Không có dữ liệu"
                        loading-text="Đang tải"
                      >
                      </v-data-table>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="mx-0 my-0 mt-3">
                <v-btn
                  size="small"
                  color="var(--main-color)"
                  :prepend-icon="'mdi-note-edit'"
                  class="mx-0 px-4 custom-icon-btn"
                  style="float: left; height: 30px"
                >
                  Sửa
                </v-btn>
                <v-btn
                  size="small"
                  color="#DE0000"
                  :prepend-icon="'mdi-trash-can '"
                  class="mx-0 ml-2 px-4 custom-icon-btn"
                  variant="outlined"
                  style="float: left; height: 30px"
                >
                  Xóa
                </v-btn>
                <v-btn
                  size="small"
                  color="var(--main-color)"
                  :prepend-icon="'mdi-reply'"
                  class="mx-0 ml-2 px-4 custom-icon-btn"
                  variant="outlined"
                  style="float: left; height: 30px"
                >
                  Quay lại
                </v-btn>
              </v-row>
            </v-window-item>
            <v-window-item value="thongTinTuyenSinh">
              <v-row class="mx-0 my-0">
                <v-data-table
                  :headers="getTab('thongTinTuyenSinh')?.tableHeaders"
                  item-value="primKey"
                  hide-default-footer
                  class="table-base"
                  :loading="loadingData"
                  no-data-text="Không có dữ liệu"
                  loading-text="Đang tải"
                >
                </v-data-table>
              </v-row>
              <v-row class="mx-0 my-0 mt-3">
                <v-btn
                  size="small"
                  color="var(--main-color)"
                  :prepend-icon="'mdi-note-edit'"
                  class="mx-0 px-4 custom-icon-btn"
                  style="float: left; height: 30px"
                >
                  Sửa
                </v-btn>
                <v-btn
                  size="small"
                  color="#DE0000"
                  :prepend-icon="'mdi-trash-can '"
                  class="mx-0 ml-2 px-4 custom-icon-btn"
                  variant="outlined"
                  style="float: left; height: 30px"
                >
                  Xóa
                </v-btn>
                <v-btn
                  size="small"
                  color="var(--main-color)"
                  :prepend-icon="'mdi-reply'"
                  class="mx-0 ml-2 px-4 custom-icon-btn"
                  variant="outlined"
                  style="float: left; height: 30px"
                >
                  Quay lại
                </v-btn>
              </v-row>
            </v-window-item>
            <v-window-item value="danhSachNhapHoc">
              <v-row class="mx-0 my-0">
                <v-data-table
                  :headers="getTab('danhSachNhapHoc')?.tableHeaders"
                  item-value="primKey"
                  hide-default-footer
                  class="table-base"
                  :loading="loadingData"
                  no-data-text="Không có dữ liệu"
                  loading-text="Đang tải"
                >
                </v-data-table>
              </v-row>

              <v-row class="mx-0 my-0 mt-3">
                <v-btn
                  size="small"
                  color="var(--main-color)"
                  :prepend-icon="'mdi-note-edit'"
                  class="mx-0 px-4 custom-icon-btn"
                  style="float: left; height: 30px"
                >
                  Sửa
                </v-btn>
                <v-btn
                  size="small"
                  color="#DE0000"
                  :prepend-icon="'mdi-trash-can '"
                  class="mx-0 ml-2 px-4 custom-icon-btn"
                  variant="outlined"
                  style="float: left; height: 30px"
                >
                  Xóa
                </v-btn>
                <v-btn
                  size="small"
                  color="var(--main-color)"
                  :prepend-icon="'mdi-reply'"
                  class="mx-0 ml-2 px-4 custom-icon-btn"
                  variant="outlined"
                  style="float: left; height: 30px"
                >
                  Quay lại
                </v-btn>
              </v-row>
            </v-window-item>
            <v-window-item value="chungThuSo">
              <v-row>
                <v-col cols="4">
                  <div
                    class=""
                    v-for="(item, i) in getTab('chungThuSo')?.formInfo.slice(
                      0,
                      4
                    )"
                    :key="'left-' + i"
                  >
                    <label class="font-weight-medium mr-2"
                      >{{ item.label }}:</label
                    >
                  </div>
                </v-col>

                <v-col cols="">
                  <div
                    class=""
                    v-for="(item, i) in getTab('chungThuSo')?.formInfo.slice(4)"
                    :key="'right-' + i"
                  >
                    <label class="font-weight-medium mr-2"
                      >{{ item.label }}:</label
                    >
                  </div>
                </v-col>
              </v-row>

              <v-row class="mx-0 my-0 mt-3">
                <v-btn
                  size="small"
                  color="var(--main-color)"
                  :prepend-icon="'mdi-note-edit'"
                  class="mx-0 px-4 custom-icon-btn"
                  style="float: left; height: 30px"
                >
                  Sửa
                </v-btn>
                <v-btn
                  size="small"
                  color="#DE0000"
                  :prepend-icon="'mdi-trash-can '"
                  class="mx-0 ml-2 px-4 custom-icon-btn"
                  variant="outlined"
                  style="float: left; height: 30px"
                >
                  Xóa
                </v-btn>
                <v-btn
                  size="small"
                  color="var(--main-color)"
                  :prepend-icon="'mdi-reply'"
                  class="mx-0 ml-2 px-4 custom-icon-btn"
                  variant="outlined"
                  style="float: left; height: 30px"
                >
                  Quay lại
                </v-btn>
              </v-row>
            </v-window-item>
          </v-window>
        </div>
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
/* Ghi đè kích thước icon prepend */
::v-deep(.custom-icon-btn .v-icon) {
  font-size: 24px !important;
  height: 24px;
  width: 24px;
}
::v-deep(.no-left-border .v-field) {
  border-left: none !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}
</style>
