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

const currentTabId = ref("thongTinCaNhan");

const TimKiemNangCao = defineAsyncComponent(() =>
  import("@/components/TimKiemNangCao.vue")
);
function getTab(id) {
  return detail?.value?.tabs?.find((tab) => tab.tabId === id);
}

const thongTinCaNhan= ref({});

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
    thongTinCaNhan.value = getTab('thongTinCaNhan')

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
            <v-window-item value="thongTinCaNhan">
              <v-row class="mx-0 my-0">
                <v-col>
                  <v-row
                    class="mx-0 my-0 px-0"
                    v-if="thongTinCaNhan.formInfo && thongTinCaNhan.formInfo.length"
                  >
                    <template
                      v-for="(item, index) in thongTinCaNhan.formInfo"
                      v-bind:key="index"
                    >
                      <v-col :class="item['class']">
                        <span class="label-text font-weight-medium mr-2">
                          {{ item.title }}:
                        </span>
                        <span class="content-text" v-if="item.type == 'date'">
                          <!-- {{
                        thongTinDoiTuong.hasOwnProperty(item.value)
                          ? dateLocale(thongTinDoiTuong[item.value])
                          : ""
                      }} -->
                        </span>
                        <span
                          class="content-text"
                          v-else-if="item.type == 'datetime'"
                          :style="
                            item.hasOwnProperty('style') ? item.style : ''
                          "
                        >
                          <!-- {{
                        thongTinDoiTuong.hasOwnProperty(item.value)
                          ? dateLocaleTime(thongTinDoiTuong[item.value])
                          : ""
                      }} -->
                        </span>
                        <span
                          class="content-text"
                          v-else
                          :style="
                            item.hasOwnProperty('style') ? item.style : ''
                          "
                        >
                          <!-- {{ getValue(thongTinDoiTuong, item.value) }} -->
                        </span>
                      </v-col>
                    </template>
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
                </v-col>
              </v-row>
            </v-window-item>
            <v-window-item value="quaTrinhHocTap">
              <v-row class="mx-0 my-0">
                <v-col class="px-0 py-0">
                  <v-row class="my-0 mb-3 mx-0 align-item-center">
                    <div
                      class="rounded-s text-white px-4 py-1"
                      style="background-color: var(--main-color)"
                    >
                      Tìm kiếm
                    </div>
                    <v-text-field
                      clearable
                      class="input-form input-header-search no-left-border"
                      append-inner-icon="mdi-magnify"
                      placeholder="Nhập từ khóa để tìm kiếm"
                    >
                    </v-text-field>
                    <v-btn
                      size="small"
                      color="var(--main-color)"
                      :prepend-icon="'mdi-filter-variant-plus'"
                      class="mx-0 ml-2"
                      variant="outlined"
                      style="float: left; height: 30px"
                    >
                      Nâng cao
                    </v-btn>
                  </v-row>
                  <div>
                    <TimKiemNangCao
                      :mauNhap="getTab('quaTrinhHocTap')?.formSearch"
                      :formType="'normalSearch'"
                    >
                    </TimKiemNangCao>
                  </div>
                  <v-data-table
                    :headers="getTab('quaTrinhHocTap')?.tableHeaders"
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
            </v-window-item>
            <v-window-item value="hocBa">
              <v-row class="mx-0 my-0">
                <v-col class="px-0 py-0">
                  <v-row class="my-0 mb-3 mx-0 align-item-center">
                    <div
                      class="rounded-s text-white px-4 py-1"
                      style="background-color: var(--main-color)"
                    >
                      Tìm kiếm
                    </div>
                    <v-text-field
                      clearable
                      class="input-form input-header-search no-left-border"
                      append-inner-icon="mdi-magnify"
                      placeholder="Nhập từ khóa để tìm kiếm"
                    >
                    </v-text-field>
                    <v-btn
                      size="small"
                      color="var(--main-color)"
                      :prepend-icon="'mdi-filter-variant-plus'"
                      class="mx-0 ml-2"
                      variant="outlined"
                      style="float: left; height: 30px"
                    >
                      Nâng cao
                    </v-btn>
                  </v-row>
                  <div>
                    <TimKiemNangCao
                      :mauNhap="getTab('hocBa')?.formSearch"
                      :formType="'normalSearch'"
                    >
                    </TimKiemNangCao>
                  </div>
                  <v-data-table
                    :headers="getTab('hocBa')?.tableHeaders"
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
            </v-window-item>
            <v-window-item value="vanBangChungChi">
              <v-row class="mx-0 my-0">
                <v-col class="px-0 py-0">
                  <v-row class="my-0 mb-3 mx-0 align-item-center">
                    <div
                      class="rounded-s text-white px-4 py-1"
                      style="background-color: var(--main-color)"
                    >
                      Tìm kiếm
                    </div>
                    <v-text-field
                      clearable
                      class="input-form input-header-search no-left-border"
                      append-inner-icon="mdi-magnify"
                      placeholder="Nhập từ khóa để tìm kiếm"
                    >
                    </v-text-field>
                    <v-btn
                      size="small"
                      color="var(--main-color)"
                      :prepend-icon="'mdi-filter-variant-plus'"
                      class="mx-0 ml-2"
                      variant="outlined"
                      style="float: left; height: 30px"
                    >
                      Nâng cao
                    </v-btn>
                  </v-row>
                  <div>
                    <TimKiemNangCao
                      :mauNhap="getTab('vanBangChungChi')?.formSearch"
                      :formType="'normalSearch'"
                    >
                    </TimKiemNangCao>
                  </div>
                  <v-data-table
                    :headers="getTab('vanBangChungChi')?.tableHeaders"
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
            </v-window-item>
            <v-window-item value="chungNhanKetQuaThi">
              <v-row class="mx-0 my-0">
                <v-col class="px-0 py-0">
                  <v-row class="my-0 mb-3 mx-0 align-item-center">
                    <div
                      class="rounded-s text-white px-4 py-1"
                      style="background-color: var(--main-color)"
                    >
                      Tìm kiếm
                    </div>
                    <v-text-field
                      clearable
                      class="input-form input-header-search no-left-border"
                      append-inner-icon="mdi-magnify"
                      placeholder="Nhập từ khóa để tìm kiếm"
                    >
                    </v-text-field>
                    <v-btn
                      size="small"
                      color="var(--main-color)"
                      :prepend-icon="'mdi-filter-variant-plus'"
                      class="mx-0 ml-2"
                      variant="outlined"
                      style="float: left; height: 30px"
                    >
                      Nâng cao
                    </v-btn>
                  </v-row>
                  <div>
                    <TimKiemNangCao
                      :mauNhap="getTab('chungNhanKetQuaThi')?.formSearch"
                      :formType="'normalSearch'"
                    >
                    </TimKiemNangCao>
                  </div>
                  <v-data-table
                    :headers="getTab('chungNhanKetQuaThi')?.tableHeaders"
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
            </v-window-item>
            <v-window-item value="chungNhanThanhTich">
              <v-row class="mx-0 my-0">
                <v-col class="px-0 py-0">
                  <v-row class="my-0 mb-3 mx-0 align-item-center">
                    <div
                      class="rounded-s text-white px-4 py-1"
                      style="background-color: var(--main-color)"
                    >
                      Tìm kiếm
                    </div>
                    <v-text-field
                      clearable
                      class="input-form input-header-search no-left-border"
                      append-inner-icon="mdi-magnify"
                      placeholder="Nhập từ khóa để tìm kiếm"
                    >
                    </v-text-field>
                    <v-btn
                      size="small"
                      color="var(--main-color)"
                      :prepend-icon="'mdi-filter-variant-plus'"
                      class="mx-0 ml-2"
                      variant="outlined"
                      style="float: left; height: 30px"
                    >
                      Nâng cao
                    </v-btn>
                  </v-row>
                  <div>
                    <TimKiemNangCao
                      :mauNhap="getTab('chungNhanThanhTich')?.formSearch"
                      :formType="'normalSearch'"
                    >
                    </TimKiemNangCao>
                  </div>
                  <v-data-table
                    :headers="getTab('chungNhanThanhTich')?.tableHeaders"
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
