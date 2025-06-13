<script setup>
import { useRouter, useRoute } from "vue-router";
import {
  ref,
  reactive,
  computed,
  onMounted,
  watch,
  defineAsyncComponent,
} from "vue";
import { useAppStore } from "@/stores";
const route = useRoute();
const router = useRouter();
const jsondata = ref(null);
const appStore = useAppStore();
const configCache = reactive({});
const moduleType = ref(route.meta.moduleType);
const props = defineProps({
  doituong: {
    type: String,
    default: "",
  },
});

const TimKiemNangCao = defineAsyncComponent(() =>
  import("@/components/TimKiemNangCao.vue")
);
const Pagination = defineAsyncComponent(() =>
  import("@/components/Pagination.vue")
);
const headers = ref([]);
const mauTimKiem = ref([]);
const headersMobile = ref([]);
const menuSelected = computed(() => appStore.getMenuSelected);
const subMenuSelected = computed(() => appStore.getSubMenuSelected);
const configLoaded = ref(false);
const page = ref(0);
const total = ref(0);
const pageCount = ref(0);
const loading = ref(false);
const dsDoiTuong = ref([]);
const itemsPerPage = ref(20);
const loadingData = ref(false);

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
    headers.value = config?.tableHeaders ?? [];
    headersMobile.value = config?.tableHeadersMobile ?? [];
    mauTimKiem.value = config?.formSearch ?? [];

    dsDoiTuong.value = config?.tempDsDoiTuong ?? [];
    console.log(dsDoiTuong.value);

    configLoaded.value = true;
    return config;
  } catch (error) {
    configError.value = error;
    console.log(error);

    throw error;
  }
};
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

watch(route, async (to, from) => {
  moduleType.value = to.meta?.moduleType;
  if (moduleType.value) {
    await loadConfiguration();

    // keywordSearch.value = "";
    // if (advanceSearchReference.value) {
    //   advanceSearchReference.value.resetForm();
    // }
    // dataInputSearch.value = {};
    // getDanhSach()
    // getDanhMucTrangThai()
  } else {
    headers.value = [];
    headersMobile.value = [];
    mauTimKiem.value = [];
  }
});

onMounted(async () => {
  // Đánh dấu đang xử lý từ path để tránh watch query chạy
  if (!configLoaded.value) {
    await loadConfiguration();
  }
  // initPage()
});
</script>
<template>
  <Suspense>
    <template #default>
      <v-card
        class="mx-auto pa-0"
        style="box-shadow: none !important; overflow: inherit; min-height: 80vh"
      >
        <v-row class="my-0 mb-3 mx-0">
          <v-col
            class="row-header d-flex align-center justify-start py-0 px-0"
            style="border: none"
          >
            <div class="header-content" style="text-transform: uppercase">
              {{
                jsondata?.title ?? subMenuSelected?.title ?? menuSelected?.title
              }}
            </div>
            <v-text-field
              clearable
              class="input-form input-header-search"
              append-inner-icon="mdi-magnify"
              placeholder="Nhập từ khóa để tìm kiếm"
            >
            </v-text-field>
          </v-col>

          <v-btn
            size="small"
            color="var(--main-color)"
            :prepend-icon="'mdi-calendar-plus'"
            class="mx-0 white--text ml-3"
            style="float: left; height: 30px"
            variant="flat"
          >
            Thêm cơ quan quản lý
          </v-btn>
          <v-btn
            size="small"
            color="var(--main-color)"
            :prepend-icon="'mdi-filter-variant-plus'"
            class="mx-0 white--text ml-3"
            style="float: left; height: 30px"
            variant="outlined"
          >
            Nâng cao
          </v-btn>
        </v-row>
        <div>
          <TimKiemNangCao :mauNhap="mauTimKiem" :formType="'normalSearch'">
          </TimKiemNangCao>
        </div>
        <v-row class="mx-0 my-0">
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
                      itemHeader.hasOwnProperty('width') ? itemHeader.width : ''
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
                          : ""
                      }}
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
                          : ""
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
            <!-- <Pagination
              :pageInput="page + 1"
              :pageCount="pageCount"
              :total="total"
              @changePage="changePage"
              style="margin-bottom: 50px"
            ></Pagination> -->
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

<style scoped></style>
