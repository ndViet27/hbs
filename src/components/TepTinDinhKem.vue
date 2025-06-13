<script setup>
import { ref, reactive, toRef, onMounted, watch, defineAsyncComponent } from "vue";
import { useAppStore } from "@/stores";
import { generalApi } from "@/api";
import { cloneDeep, isEmpty, omit } from '@/helpers/lodash'
const SelectSearch = defineAsyncComponent(() => import("./SelectSearch.vue"));
const Pagination = defineAsyncComponent(() => import("./Pagination.vue"));

const emit = defineEmits(['handleUpload'])

const props = defineProps({
  maHoaTep: {
    type: Boolean,
    default: false,
  },
  permission: {
    type: Object,
    default: {
      upload: true,
      delete: true,
    },
  },
  tepInput: {
    type: Array,
    default: [],
  },
  edit: {
    type: Boolean,
    default: false,
  },
  idComponent: {
    type: String,
    default: "",
  },
  multipleUpload: {
    type: Boolean,
    default: false,
  },
  accept: {
    type: String,
    default: "",
  },
  suDungKhoGiayTo: {
    type: Boolean,
    default: false,
  },
  nhapTenGiayTo: {
    type: Boolean,
    default: false,
  },
  taoDuThao: {
    type: Boolean,
    default: false,
  },
  vanBanDieuHanh: {
    type: Boolean,
    default: false,
  },
  thongTinDuThao: {
    type: Object,
    default: null,
  },
  confirmDelete: {
    type: Boolean,
    default: false,
  },
  soGhiVanBan: {
    type: Boolean,
    default: false,
  },
  keyUpdateDoiTuongVanBan: {
    type: String,
    default: ''
  }
});
const appStore = useAppStore()
const filesInput = toRef(props, 'tepInput')
const loadingData = ref(false)
const dialogPreview = ref(false)
const currentUserInfo = ref(null)
const urlPreview = ref("")
const loading = ref(false)
const dragging = ref(false)
const tepUpload = ref([])
const tepGiayToLuuTruSo =ref([])
const dialogChonGiayToTuKho = ref(false)
const dialogTenGiayTo = ref(false)
const tenGiayTo = ref()
const form = ref(null)
const headersGiayToLuuTruSo = ref([
  {
    key: 1,
    sortable: false,
    title: "STT",
    align: "center",
    value: "stt",
    type: "index",
    class: "td-center",
    width: 50,
  },
  {
    key: 2,
    sortable: false,
    title: "Tên giấy tờ",
    align: "center",
    value: "SoHieuVanBan",
    class: "td-left py-1",
  },
  {
    key: 3,
    sortable: false,
    title: "Loại văn bản",
    align: "center",
    value: "NhomLoaiGiayTo",
    class: "td-left py-1",
    width: 150,
  },
  {
    key: 4,
    sortable: false,
    title: "Thông tin giấy tờ",
    align: "center",
    value: "NgayBanHanh",
    class: "td-center verticalAlignTop py-1",
    width: 250,
  },
  {
    key: 5,
    sortable: false,
    title: "Tệp đính kèm",
    align: "center",
    value: "TepDuLieu",
    class: "td-center",
    width: 250,
  },
  {
    key: 6,
    sortable: false,
    title: "Thao tác",
    align: "center",
    class: "td-center",
    width: 100,
  },
]);
const dsGiayToLuuTruSo = ref([])
const page = ref(0)
const itemsPerPage = ref(5)
const loadingDataGiayTo = ref(false)
const total = ref(0)
const pageCount = ref(0)
const keywordSearch = ref("")
const loaiVanBanSearch = ref(null)
const coQuanBanHanhSearch = ref(null)

const getDsGiayToTuKho = function (type) {
  if (type == "reset") {
    page.value = 0;
  }
  let filter = {
    path: "/drivemgt/internal",
    collection: "giaytoluutruso",
    params: {
      page: page.value,
      size: itemsPerPage.value,
      keyword: keywordSearch.value,
      tenLoaiVanBan_MaMuc: loaiVanBanSearch.value
        ? loaiVanBanSearch.value["MaMuc"]
        : "",
      coQuanBanHanh_MaDinhDanh: coQuanBanHanhSearch.value
        ? coQuanBanHanhSearch.value["MaDinhDanh"]
        : "",
    },
    data: {},
  };
  loadingDataGiayTo.value = true;
  total.value = 0;
  generalApi
    .getData(filter)
    .then(function (result) {
      loadingDataGiayTo.value = false;
      dsGiayToLuuTruSo.value = result.content;
      total.value = result.totalElements;
      pageCount.value = result.totalPages;
    })
    .catch(function () {
      loadingDataGiayTo.value = false;
      total.value = 0;
      pageCount.value = 0;
    });
};
const changePage = function (pagePagination) {
  page.value = pagePagination.value - 1;
  getDsGiayToTuKho();
};
const chonTuKhogiayTo = function () {
  dialogChonGiayToTuKho.value = true;
  getDsGiayToTuKho("reset");
};
const submitChonTuKho = function (tepDuLieu, giayToLuuTruSo) {
  tepUpload.value = tepDuLieu;
  tepGiayToLuuTruSo.value = giayToLuuTruSo
  dialogChonGiayToTuKho.value = false;
};
const changeModelLoaiVanBan = function (data) {
  loaiVanBanSearch.value = data;
  getDsGiayToTuKho("reset");
};
const changeModelCoQuanBanHanh = function (data) {
  coQuanBanHanhSearch.value = data;
  getDsGiayToTuKho("reset");
};
const getFileType = function (ext) {
  let type = "";
  let extStr = String(ext).toLocaleLowerCase();
  switch (extStr) {
    case "jpg":
    case "jpeg":
    case "jpe":
    case "png":
    case "webp":
      type = "image";
      break;
    case "doc":
    case "docx":
      type = "word";
      break;
    case "xls":
    case "xlsx":
      type = "excel";
      break;
    case "pdf":
      type = "pdf";
      break;
    default:
      type = "";
      break;
  }
  return type;
};
const handleDrop = function (event) {
  if (loadingData.value) {
    return;
  }
  event.preventDefault();
  dragging.value = false;
  let files = event.dataTransfer.files;
  handleDragFiles(files);
};
const handleDragFiles = function (files) {
  console.log("filessss", files);
  let arrTep = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let ext = file["name"].split(".");
    arrTep.push({
      File: file,
      Ext: ext[ext.length - 1],
      KichThuocTep: file["size"],
      TenTep: file["name"],
      FileInput: true,
      Signed: false,
      FileSigned: null,
    });
  }
  tepUpload.value = arrTep;
};
const dateIsoLocal = function (date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const zone = String(-(new Date().getTimezoneOffset() / 60)).padStart(2, 0);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+${zone}:00`;
};
const dateLocale = function (dateInput) {
  if (!dateInput) return "";
  let date = new Date(dateInput);
  return (
    date.getDate().toString().padStart(2, "0") +
    "/" +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    date.getFullYear()
  );
};
const dateLocaleTime = function (dateInput) {
  let date = new Date(dateInput);
  return (
    date.getDate().toString().padStart(2, "0") +
    "/" +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    date.getFullYear() +
    " " +
    date.getHours().toString().padStart(2, "0") +
    ":" +
    date.getMinutes().toString().padStart(2, "0")
  );
};
const pickFileUpload = function () {
  setTimeout(function () {
    if (loadingData.value) {
      return;
    }
    if (props.nhapTenGiayTo) {
      tenGiayTo.value = null;
      dialogTenGiayTo.value = true;
    } else {
      document.getElementById(
        "file_upload_tep_dinh_kem" + props.idComponent
      ).value = "";
      document
        .getElementById("file_upload_tep_dinh_kem" + props.idComponent)
        .click();
    }
  }, 100)
};
const submitNhapTenGiayTo = async function () {
  const { valid } = await form.value.validate();
  if (!valid) return;
  dialogTenGiayTo.value = false;
  document.getElementById(
    "file_upload_tep_dinh_kem" + props.idComponent
  ).value = "";
  document
    .getElementById("file_upload_tep_dinh_kem" + props.idComponent)
    .click();
};
const uploadFile = function () {
  let files = $("#file_upload_tep_dinh_kem" + props.idComponent)[0].files;
  let arrTep = [];
  let arrAction = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let ext = file["name"].split(".");
    arrTep.push({
      File: file,
      Ext: ext[ext.length - 1],
      KichThuocTep: file["size"],
      TenTep: file["name"],
      FileInput: true,
      Signed: false,
      FileSigned: null,
    });
    arrAction.push(generalApi.uploadTep(file));
  }
  loadingData.value = true;
  Promise.all(arrAction)
    .then((results) => {
      let tepArr = [];
      results.forEach((element) => {
        if (element && element["message"] === "success") {
          tepArr.push(element.resp);
        }
      });
      tepUpload.value = tepUpload.value.concat(tepArr);
      emit('handleUpload', {'type': 'create', 'data': JSON.parse(JSON.stringify(tepUpload.value))});
      loadingData.value = false;
    })
    .catch((xhr) => {
      loadingData.value = false;
    });
};
const deleteFile = function (file, index) {
  if (props.confirmDelete) {
    appStore.SET_SHOWCONFIRM(true);
    let confirm = {
      auth: false,
      title: "Xóa dữ liệu",
      message: "Bạn có chắc chắn muốn xóa?",
      button: {
        yes: "Có",
        no: "Không",
      },
      callback: () => {
        tepUpload.value.splice(index, 1);
        emit('handleUpload', {'type': 'delete', 'data': file});
      },
    };
    appStore.SET_CONFIG_CONFIRM_DIALOG(confirm);
  } else {
    tepUpload.value.splice(index, 1);
    emit('handleUpload', {'type': 'delete', 'data': file});
  }
};
const taiXuongFile = function (file, action, giaiMa) {
  let typePreview = ["png", "jpg", "jpeg", "pdf", "jpe", "webp"];
  if (loading.value) {
    return;
  }
  loading.value = true;
  generalApi.taiTep(file).then(function (result) {
    loading.value = false;
    if (action == "preview") {
      if (typePreview.includes(file.Ext)) {
        urlPreview.value = result;
        dialogPreview.value = true;
      } else {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = result;
        a.download = `${file.TenTep}.${file.Ext}`;
        a.click();
      }
    } else {
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = result;
      a.download = `${file.TenTep}.${file.Ext}`;
      a.click();
    }
  })
  .catch(function (error) {
    loading.value = false;
  });
}
const initData = function () {
  tepUpload.value = props.tepInput;
};
onMounted(() => {
  try {
    currentUserInfo.value = userContext??null
  } catch (error) {
  }
  
  initData();
});
watch(filesInput, async(val) => {
  tepUpload.value = filesInput.value;
}, { deep: true })
defineExpose({
  tepUpload,
  tenGiayTo,
  tepGiayToLuuTruSo
});
</script>
<template>
  <v-card
    v-if="props.edit"
    class="pa-0 thanhphanhoso"
    style="box-shadow: none !important"
  >
    <v-row class="mx-0 my-0">
      <div style="width: 100%">
        <v-row
          v-for="(item, index) in tepUpload"
          :key="index"
          class="mx-0 my-0 px-0 py-0"
          style="width: 100%; align-items: center"
        >
          <div
            class="py-0"
            @click="taiXuongFile(item, 'preview')"
            v-if="item && item.KichThuocTep"
            :style="
              item.DaHuyBoThayThe ? 'width: 100%; opacity: 0.8' : 'width: 100%'
            "
          >
          
            <v-icon
              size="18"
              color="green"
              v-if="getFileType(item.Ext) === 'excel'"
              >mdi-file-excel-outline</v-icon
            >
            <v-icon
              size="18"
              color="blue"
              v-else-if="getFileType(item.Ext) === 'word'"
              >mdi-file-word-outline</v-icon
            >
            <v-icon
              size="18"
              color="red"
              v-else-if="getFileType(item.Ext) === 'pdf'"
              >mdi-file-pdf-box</v-icon
            >
            <v-icon
              size="18"
              color="blue"
              v-else-if="getFileType(item.Ext) === 'image'"
              >mdi-file-image</v-icon
            >
            <v-icon size="18" color="#2161b1" v-else>mdi-paperclip</v-icon>
            <a
              class="ml-2"
              style="
                text-decoration: underline;
                color: var(--main-color);
                cursor: pointer;
              "
              >{{ item.TenTep }}.{{ item.Ext }}</a
            >
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="flat"
                  size="small"
                  v-bind="props"
                  class="mr-0"
                  @click.stop="taiXuongFile(item, 'download')"
                  style="height: 32px"
                >
                  <v-icon size="18" color="var(--main-color)"
                    >mdi-cloud-download-outline</v-icon
                  >
                </v-btn>
              </template>
              <span>Tải xuống</span>
            </v-tooltip>
            <v-tooltip location="top" v-if="props.permission.delete">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="flat"
                  size="small"
                  v-bind="props"
                  class="mr-2"
                  @click.stop="deleteFile(item, index)"
                  style="height: 32px"
                >
                  <v-icon size="18" color="red">mdi-close</v-icon>
                </v-btn>
              </template>
              <span>Xóa</span>
            </v-tooltip>
          </div>
        </v-row>
        <v-btn
          :loading="loadingData"
          :disabled="loadingData"
          v-if="
            props.permission.upload &&
            ((!tepUpload.length && !props.multipleUpload) ||
              props.multipleUpload)
          "
          class="mt-2 mr-3"
          size="small"
          variant="outlined"
          color="var(--main-color)"
          @click.stop="pickFileUpload"
          height="28px"
        >
          <v-icon size="22" color="var(--main-color)" class="mr-1"
            >mdi-cloud-upload-outline</v-icon
          >
          <span style="font-size: 14px; text-transform: none">
            Tải lên giấy tờ
          </span>
        </v-btn>
        <v-btn
          :loading="loadingData"
          :disabled="loadingData"
          v-if="
            props.permission.upload &&
            props.suDungKhoGiayTo &&
            ((!tepUpload.length && !props.multipleUpload) ||
              props.multipleUpload)
          "
          class="mt-2 mr-2"
          size="small"
          color="var(--main-color)"
          @click.stop="chonTuKhogiayTo"
          height="28px"
        >
          <v-icon size="20" color="#FFF" class="mr-1">mdi-folder-file</v-icon>
          <span style="font-size: 14px; text-transform: none"
            >Chọn giấy tờ kho</span
          >
        </v-btn>
      </div>
    </v-row>
    <input
      type="file"
      :id="'file_upload_tep_dinh_kem' + props.idComponent"
      :multiple="props.multipleUpload"
      :accept="props.accept"
      @input="uploadFile()"
      style="display: none"
    />
  </v-card>
  <div v-else>
    <v-row
      v-for="(item, index) in tepUpload"
      :key="index"
      class="mx-0 my-0 px-0 py-0"
      style="width: 100%; align-items: center"
    >
      <div
        class="py-0"
        @click.stop="taiXuongFile(item, 'preview')"
        v-if="item && item.KichThuocTep"
        style="width: 100%"
      >
        <v-icon title="Tệp đã mã hóa"
          size="18"
          color="red"
          v-if="item?.LoaiNguonLuuTru?.MaMuc === 'xenc64'"
        >mdi-file-key-outline</v-icon>
        <v-icon size="18" color="green" v-if="getFileType(item.Ext) === 'excel'"
          >mdi-file-excel-outline</v-icon
        >
        <v-icon class="mr-1"
          size="18"
          color="blue"
          v-else-if="getFileType(item.Ext) === 'word'"
          >mdi-file-word-outline</v-icon
        >
        <v-icon
          size="18"
          color="red"
          v-else-if="getFileType(item.Ext) === 'pdf'"
          >mdi-file-pdf-box</v-icon
        >
        <v-icon
          size="18"
          color="blue"
          v-else-if="getFileType(item.Ext) === 'image'"
          >mdi-file-image</v-icon
        >
        <v-icon size="18" color="#2161b1" v-else>mdi-paperclip</v-icon>
        <a
          class="ml-2"
          style="text-decoration: underline; color: var(--main-color); cursor: pointer"
          >{{ item.TenTep }}.{{ item.Ext }}
        </a>
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              variant="flat"
              size="small"
              v-bind="props"
              class="mr-0"
              @click.stop="taiXuongFile(item, 'download')"
              style="height: 32px"
            >
              <v-icon size="18" color="var(--main-color)"
                >mdi-cloud-download-outline</v-icon
              >
            </v-btn>
          </template>
          <span>Tải xuống</span>
        </v-tooltip>
      </div>
    </v-row>
  </div>
  <v-dialog max-width="1000" v-model="dialogPreview" persistent>
    <v-card>
      <v-toolbar dark color="var(--main-color)" class="px-0">
        <v-col class="sub-header d-flex align-center justify-start py-0 px-0">
          <div class="sub-header-content">Tệp tin đính kèm</div>
          <div class="triangle-header"></div>
        </v-col>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            variant="flat"
            size="small"
            icon
            color="#E9FFF2"
            @click="dialogPreview = false"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="my-0 px-0 py-0">
        <iframe
          :src="urlPreview"
          type="application/pdf"
          width="100%"
          height="100%"
          style="overflow: auto; min-height: 600px"
          frameborder="0"
        >
        </iframe>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog max-width="1200" v-model="dialogChonGiayToTuKho" persistent>
    <v-card>
      <v-toolbar dark color="var(--main-color)" class="px-0">
        <v-col class="sub-header d-flex align-center justify-start py-0 px-0">
          <div class="sub-header-content">
            <span>Chọn giấy tờ từ kho</span>
          </div>
          <div class="triangle-header"></div>
        </v-col>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            variant="flat"
            size="small"
            icon
            color="#E9FFF2"
            @click="dialogChonGiayToTuKho = false"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="px-3">
        <v-row class="px-0 mx-1 py-3">
          <v-col cols="12" md="6" class="py-0 px-0 mb-2 pr-2">
            <SelectSearch
              :configs="{
                api: '/drivemgt/internal/tenloaivanban/1.0/filter',
                itemText: 'TenMuc',
                itemValue: 'MaMuc',
                dataSource: [],
                responseDataApi: 'content',
                params: { page: 0, size: 100 },
                keywordSearch: '',
                placeholder: 'Loại văn bản',
                multiple: false,
                returnObject: true,
              }"
              :data="loaiVanBanSearch"
              @changeModel="changeModelLoaiVanBan"
            >
            </SelectSearch>
          </v-col>
          <v-col cols="12" md="6" class="py-0 px-0 mb-2 pl-2">
            <SelectSearch
              :configs="{
                api: '/orgmgt/internal/coquandonvi/1.0/filter',
                itemText: 'TenGoi',
                itemValue: 'MaDinhDanh',
                dataSource: [],
                responseDataApi: 'content',
                params: { page: 0, size: 20 },
                keywordSearch: 'keyword',
                placeholder: 'Cơ quan ban hành',
                multiple: false,
                returnObject: true,
              }"
              :data="coQuanBanHanhSearch"
              @changeModel="changeModelCoQuanBanHanh"
            >
            </SelectSearch>
          </v-col>
          <v-col cols="12" class="py-0 px-0 mb-2">
            <v-text-field
              v-model="keywordSearch"
              append-inner-icon="mdi-magnify"
              @keyup.enter="getDsGiayToTuKho('reset')"
              @click:append-inner="getDsGiayToTuKho('reset')"
              @click:prepend-inner="getDsGiayToTuKho('reset')"
              placeholder="Nhập từ khóa tìm kiếm"
              dense
              hide-details="auto"
              class="input-form"
              clearable
            ></v-text-field>
          </v-col>
          <v-data-table
            :headers="headersGiayToLuuTruSo"
            :items="dsGiayToLuuTruSo"
            :items-per-page="itemsPerPage"
            :page="page + 1"
            item-value="primKey"
            hide-default-footer
            class="table-base table-tphs mt-2"
            no-data-text="Không có dữ liệu"
            loading-text="Đang tải"
            :loading="loadingDataGiayTo"
          >
            <template v-slot:item="{ item, index }">
              <tr>
                <td class="py-1 text-center">
                  <div>
                    {{ (page + 1) * itemsPerPage - itemsPerPage + index + 1 }}
                  </div>
                </td>

                <td>
                  <div>
                    {{ item.TenGiayTo }}
                  </div>
                  <div>
                    <label class="text-bold">Số văn bản:</label>
                    <i>{{ item.SoHieuVanBan }}</i>
                  </div>
                </td>

                <td>
                  <div>
                    <span>{{
                      item.TenLoaiVanBan ? item.TenLoaiVanBan["TenMuc"] : ""
                    }}</span>
                  </div>
                </td>

                <td class="py-1">
                  <div>
                    <label class="text-bold">Cơ quan ban hành:</label>
                    <span>{{
                      item.CoQuanBanHanh ? item.CoQuanBanHanh["TenGoi"] : ""
                    }}</span>
                  </div>
                  <div>
                    <label class="text-bold">Ngày ban hành:</label>
                    <span>{{
                      item.hasOwnProperty("NgayBanHanh") && item.NgayBanHanh
                        ? dateLocale(item.NgayBanHanh)
                        : ""
                    }}</span>
                  </div>
                  <div>
                    <label class="text-bold">Ghi chú:</label>
                    <i>{{ item.GhiChuVanBan }}</i>
                  </div>
                </td>

                <td>
                  <v-row
                    v-for="(itemFile, indexFile) in item.TepDuLieu"
                    :key="indexFile"
                    class="mx-0 my-0 px-0 py-0"
                    style="width: 100%; align-items: center"
                  >
                    <div
                      class="py-0 mb-1"
                      @click="taiXuongFile(itemFile, 'preview')"
                      v-if="itemFile && itemFile.KichThuocTep"
                      :style="
                        itemFile.DaHuyBoThayThe
                          ? 'width: 100%; opacity: 0.8'
                          : 'width: 100%'
                      "
                    >
                      <v-icon
                        size="18"
                        color="green"
                        v-if="getFileType(itemFile.Ext) === 'excel'"
                        >mdi-file-excel-outline</v-icon
                      >
                      <v-icon
                        size="18"
                        color="blue"
                        v-else-if="getFileType(itemFile.Ext) === 'word'"
                        >mdi-file-word-outline</v-icon
                      >
                      <v-icon
                        size="18"
                        color="red"
                        v-else-if="getFileType(itemFile.Ext) === 'pdf'"
                        >mdi-file-pdf-box</v-icon
                      >
                      <v-icon
                        size="18"
                        color="blue"
                        v-else-if="getFileType(itemFile.Ext) === 'image'"
                        >mdi-file-image</v-icon
                      >
                      <v-icon size="18" color="#2161b1" v-else
                        >mdi-paperclip</v-icon
                      >
                      <a
                        class="ml-2"
                        style="
                          text-decoration: underline;
                          color: var(--main-color);
                          cursor: pointer;
                        "
                        >{{ itemFile.TenTep }}.{{ itemFile.Ext }}</a
                      >
                    </div>
                  </v-row>
                </td>

                <td>
                  <v-btn
                    v-if="item.TepDuLieu && item.TepDuLieu.length"
                    size="small"
                    color="var(--main-color)"
                    @click.stop="submitChonTuKho(item.TepDuLieu, item)"
                    class="mx-0 white--text"
                  >
                    <v-icon size="18" class="">mdi-cloud-arrow-down</v-icon>
                    &nbsp;
                    <span>Chọn</span>
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
          <Pagination
            v-if="total"
            :pageInput="page + 1"
            :pageCount="pageCount"
            :total="total"
            @changePage="changePage"
          ></Pagination>
        </v-row>
        <v-row class="mx-0 my-0">
          <v-col cols="12" class="px-0 py-0 text-center my-3 mt-5">
            <v-btn
              size="small"
              color="var(--main-color)"
              @click.stop="dialogChonGiayToTuKho = false"
              class="mx-0 white--text"
              style="width: 120px"
            >
              <v-icon size="18" class="">mdi-close</v-icon>
              &nbsp;
              <span>Thoát</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog max-width="600" v-model="dialogTenGiayTo" persistent>
    <v-card style="overflow: visible">
      <v-toolbar dark color="var(--main-color)" class="px-0">
        <v-col class="sub-header d-flex align-center justify-start py-0 px-0">
          <div class="sub-header-content">Thêm mới tên giấy tờ đính kèm</div>
          <div class="triangle-header"></div>
        </v-col>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            variant="flat"
            size="small"
            icon
            color="#E9FFF2"
            @click="dialogTenGiayTo = false"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="px-3 pt-2">
        <v-form ref="form" lazy-validation>
          <v-row class="mb-2 mt-0">
            <v-col cols="12" class="py-0 mb-2">
              <label style="color: #000">
                Tên giấy tờ <span style="color: red">(*)</span>
              </label>
              <v-text-field
                class="input-form"
                v-model="tenGiayTo"
                solo
                dense
                clearable
                hide-details="auto"
                :rules="[(v) => !!v || 'Thông tin bắt buộc']"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-form>
        <v-row class="mx-0 my-0">
          <v-col cols="12" class="align-center justify-center py-0 px-0 my-3">
            <v-btn
              size="small"
              color="var(--main-color)"
              @click="dialogTenGiayTo = false"
              class="mx-0 white--text"
              variant="outlined"
            >
              <v-icon size="18" color="var(--main-color)" class="mr-1">
                mdi-close
              </v-icon>
              <span style="font-size: 14px; text-transform: none">Hủy</span>
            </v-btn>
            <v-btn
              size="small"
              color="var(--main-color)"
              @click.stop="submitNhapTenGiayTo"
              class="ml-3 white--text"
            >
              <v-icon size="18" class="mr-1">
                mdi-content-save-check-outline
              </v-icon>
              Xác nhận
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>


</template>
<style>
  .stepper-label.error {
    background: red !important;
  }
</style>
