<script setup>
import { ref, reactive, computed, watch, defineAsyncComponent } from 'vue'
import { useAppStore } from '@/stores'
import { userApi } from '@/api'

const FormCRUD = defineAsyncComponent(() => import("../components/FormCRUD.vue"));
const props = defineProps({})
const appStore = useAppStore()
const thongTinDoiTuong = ref({})
const infoMatKhau = ref({})
const formThongTin = ref([
  {
    "fieldName": "HoVaTen",
    "fieldLabel": "Họ và tên",
    "fieldType": "text",
    "fieldClass": "v-col-xs-12 v-col-4",
    "placeHolder": "",
    "defaultValue": "",
    "dataType": "",
    "dataSource": "",
    "autoEvent": "",
    "required": true,
    "rules": [],
    "readonly": false
  },
  {
    "fieldName": "NgaySinh",
    "fieldLabel": "Ngày sinh",
    "fieldType": "date",
    "fieldClass": "v-col-xs-12 v-col-4",
    "placeHolder": "ddmmyyyy, dd/mm/yyyy",
    "defaultValue": "",
    "dataType": "",
    "dataSource": "",
    "autoEvent": "",
    "required": false,
    "rules": [],
    "readonly": false,
    "maxDateValue": null,
    "maxDate": "currentDate"
  },
  {
    "fieldName": "GioiTinh",
    "fieldLabel": "Giới tính",
    "itemText": "TenMuc",
    "itemValue": "MaMuc",
    "fieldType": "select",
    "fieldClass": "v-col-xs-12 v-col-4",
    "placeHolder": "",
    "defaultValue": null,
    "dataType": "",
    "api": "/cmonmgt/internal/gioitinh/1.0/filter",
    "responseDataApi": "content",
    "params": {
      "page": 0,
      "size": 100
    },
    "dataSource": [],
    "autoEvent": "",
    "required": true,
    "rules": [],
    "readonly": false
  },
  {
    "fieldName": "SoDienThoai",
    "fieldLabel": "Số điện thoại",
    "fieldType": "phone",
    "fieldClass": "v-col-xs-12 v-col-4",
    "placeHolder": "",
    "defaultValue": "",
    "dataType": "",
    "dataSource": "",
    "autoEvent": "",
    "required": false,
    "rules": [],
    "readonly": false
  },
  {
    "fieldName": "ThuDienTu",
    "fieldLabel": "Thư điện tử",
    "fieldType": "email",
    "fieldClass": "v-col-xs-12 v-col-4",
    "placeHolder": "",
    "defaultValue": "",
    "dataType": "",
    "dataSource": "",
    "autoEvent": "",
    "required": false,
    "rules": [],
    "readonly": false
  },
  {
    "fieldLabel": "Địa chỉ thường trú"
  },
  {
    "fieldName": "DiaChi_TinhThanh",
    "fieldLabel": "Tỉnh/ Thành phố",
    "itemText": "TenMuc",
    "itemValue": "MaMuc",
    "fieldType": "select",
    "fieldClass": "v-col-xs-12 v-col-4",
    "placeHolder": "",
    "defaultValue": null,
    "dataType": "",
    "api": "/cmonmgt/internal/tinhthanh/1.0/filter",
    "responseDataApi": "content",
    "params": {
      "page": 0,
      "size": 100
    },
    "dataSource": [],
    "autoEvent": "",
    "required": false,
    "rules": [],
    "readonly": false
  },
  {
    "fieldName": "DiaChi_QuanHuyen",
    "fieldLabel": "Quận/ Huyện",
    "itemText": "TenMuc",
    "itemValue": "MaMuc",
    "fieldType": "select",
    "fieldClass": "v-col-xs-12 v-col-4",
    "placeHolder": "",
    "defaultValue": null,
    "dataType": "",
    "api": "/cmonmgt/internal/huyenquan/1.0/filter",
    "responseDataApi": "content",
    "parent": "DiaChi_TinhThanh",
    "parentMapping": "thamChieu_MaMuc",
    "valueParentMapping": "MaMuc",
    "params": {
      "page": 0,
      "size": 100
    },
    "dataSource": [],
    "autoEvent": "",
    "required": false,
    "rules": [],
    "readonly": false
  },
  {
    "fieldName": "DiaChi_XaPhuong",
    "fieldLabel": "Phường/ Xã",
    "itemText": "TenMuc",
    "itemValue": "MaMuc",
    "fieldType": "select",
    "fieldClass": "v-col-xs-12 v-col-4",
    "placeHolder": "",
    "defaultValue": null,
    "dataType": "",
    "api": "/cmonmgt/internal/xaphuong/1.0/filter",
    "responseDataApi": "content",
    "parent": "DiaChi_QuanHuyen",
    "parentMapping": "thamChieu_MaMuc",
    "valueParentMapping": "MaMuc",
    "params": {
      "page": 0,
      "size": 100
    },
    "dataSource": [],
    "autoEvent": "",
    "required": false,
    "rules": [],
    "readonly": false
  },
  {
    "fieldName": "DiaChi_SoNhaChiTiet",
    "fieldLabel": "Địa chỉ chi tiết",
    "fieldType": "text",
    "fieldClass": "v-col-xs-12 v-col-12",
    "placeHolder": "",
    "defaultValue": "",
    "dataType": "",
    "dataSource": "",
    "autoEvent": "",
    "required": false,
    "rules": [],
    "readonly": false
  },
  {
    "fieldLabel": "Nơi ở hiện tại"
  },
  {
    "fieldName": "NoiOHienTai_TinhThanh",
    "fieldLabel": "Tỉnh/ Thành phố",
    "itemText": "TenMuc",
    "itemValue": "MaMuc",
    "fieldType": "select",
    "fieldClass": "v-col-xs-12 v-col-4",
    "placeHolder": "",
    "defaultValue": null,
    "dataType": "",
    "api": "/cmonmgt/internal/tinhthanh/1.0/filter",
    "responseDataApi": "content",
    "params": {
      "page": 0,
      "size": 100
    },
    "dataSource": [],
    "autoEvent": "",
    "required": false,
    "rules": [],
    "readonly": false
  },
  {
    "fieldName": "NoiOHienTai_QuanHuyen",
    "fieldLabel": "Quận/ Huyện",
    "itemText": "TenMuc",
    "itemValue": "MaMuc",
    "fieldType": "select",
    "fieldClass": "v-col-xs-12 v-col-4",
    "placeHolder": "",
    "defaultValue": null,
    "dataType": "",
    "api": "/cmonmgt/internal/huyenquan/1.0/filter",
    "responseDataApi": "content",
    "parent": "NoiOHienTai_TinhThanh",
    "parentMapping": "thamChieu_MaMuc",
    "valueParentMapping": "MaMuc",
    "params": {
      "page": 0,
      "size": 100
    },
    "dataSource": [],
    "autoEvent": "",
    "required": false,
    "rules": [],
    "readonly": false
  },
  {
    "fieldName": "NoiOHienTai_XaPhuong",
    "fieldLabel": "Phường/ Xã",
    "itemText": "TenMuc",
    "itemValue": "MaMuc",
    "fieldType": "select",
    "fieldClass": "v-col-xs-12 v-col-4",
    "placeHolder": "",
    "defaultValue": null,
    "dataType": "",
    "api": "/cmonmgt/internal/xaphuong/1.0/filter",
    "responseDataApi": "content",
    "parent": "NoiOHienTai_QuanHuyen",
    "parentMapping": "thamChieu_MaMuc",
    "valueParentMapping": "MaMuc",
    "params": {
      "page": 0,
      "size": 100
    },
    "dataSource": [],
    "autoEvent": "",
    "required": false,
    "rules": [],
    "readonly": false
  },
  {
    "fieldName": "NoiOHienTai_SoNhaChiTiet",
    "fieldLabel": "Địa chỉ chi tiết",
    "fieldType": "text",
    "fieldClass": "v-col-xs-12 v-col-12",
    "placeHolder": "",
    "defaultValue": "",
    "dataType": "",
    "dataSource": "",
    "autoEvent": "",
    "required": false,
    "rules": [],
    "readonly": false
  }
])
const thongTinTaiKhoan = ref({
  "MaDinhDanh": "",
  "HoVaTen": "",
  "AnhCaNhan": {
    "MaDinhDanh": "",
    "TenTep": "",
    "DinhDangTep": "",
    "KichThuocTep": null,
    "DuongDanURL": "",
    "MaHoaDuLieu": ""
  },
  "GiayToTuyThan": [],
  "NgaySinh": "",
  "GioiTinh": {
    "MaMuc": "",
    "TenMuc": ""
  },
  "DiaChiThuongTru": {
    "SoNhaChiTiet": "",
    "TinhThanh": {
      "MaMuc": "",
      "TenMuc": ""
    },
    "HuyenQuan": {
      "MaMuc": "",
      "TenMuc": ""
    },
    "XaPhuong": {
      "MaMuc": "",
      "TenMuc": ""
    }
  },
  "DanhBaLienLac": [
    {
      "ThuDienTu": "",
      "SoDienThoai": ""
    }
  ],
  "NoiOHienTai": {
    "SoNhaChiTiet": "",
    "TinhThanh": {
      "MaMuc": "",
      "TenMuc": ""
    },
    "HuyenQuan": {
      "MaMuc": "",
      "TenMuc": ""
    },
    "XaPhuong": {
      "MaMuc": "",
      "TenMuc": ""
    }
  }
})
const formNhapDoiMatKhau = ref([
  {
    "fieldName": "MatKhauCu",
    "fieldLabel": "Mật khẩu cũ",
    "fieldType": "text",
    "fieldClass": "v-col-xs-12 v-col-12",
    "placeHolder": "",
    "defaultValue": "",
    "dataType": "",
    "dataSource": "",
    "autoEvent": "",
    "required": true,
    "emitKeyup": true,
    "rules": [],
    "readonly": false
  },
  {
    "fieldName": "MatKhauMoi",
    "fieldLabel": "Mật khẩu mới",
    "fieldType": "text",
    "fieldClass": "v-col-xs-12 v-col-12",
    "placeHolder": "",
    "defaultValue": "",
    "dataType": "",
    "dataSource": "",
    "regexText": "Mật khẩu mới cần ít nhất 8 ký tự, gồm 1 chữ hoa, 1 chữ thường và 1 số.",
    "autoEvent": "",
    "isPassword": true,
    "required": true,
    "rules": [],
    "emitKeyup": true,
    "readonly": false
  },
  {
    "fieldName": "NhapLaiMatKhauMoi",
    "fieldLabel": "Xác nhận mật khẩu mới",
    "fieldType": "text",
    "fieldClass": "v-col-xs-12 v-col-12",
    "placeHolder": "",
    "defaultValue": "",
    "dataType": "",
    "dataSource": "",
    "regexText": "Mật khẩu xác nhận không trùng khớp với mật khẩu mới.",
    "autoEvent": "",
    "required": true,
    "isConfirmPassword": true,
    "keyToCompare": "MatKhauMoi",
    "rules": [],
    "emitKeyup": true,
    "readonly": false
  },
])
const loading = ref(false)
const dialogDoiMatKhau = ref(false)
const certUser = ref('')
const refsFormDoiMatKhau = ref(null)
const formThongTinTaiKhoan = ref(null)
const formThongTinDoanhNghiepToChuc = ref(null)
const emit = defineEmits(['submitForm'])
const getThongTinTk = function () {
  let filter = {}
  userApi.getThongTinTaiKhoan(filter).then(function (result) {
    if (result) {
      certUser.value = result.CanBo?.ChungThuSo??''
      thongTinDoiTuong.value = {
        ...result.CanBo,
        ThuDienTu: result.CanBo?.DanhBaLienLac?.ThuDienTu ?? "",
        SoDienThoai: result.CanBo?.DanhBaLienLac?.SoDienThoai ?? "",
        DiaChi_TinhThanh: result.CanBo?.DiaChiThuongTru?.TinhThanh ?? "",
        DiaChi_QuanHuyen: result.CanBo?.DiaChiThuongTru?.HuyenQuan ?? "",
        DiaChi_XaPhuong: result.CanBo?.DiaChiThuongTru?.XaPhuong ?? "",
        DiaChi_SoNhaChiTiet: result.CanBo?.DiaChiThuongTru?.SoNhaChiTiet ?? "",
        NoiOHienTai_TinhThanh: result.CanBo?.NoiOHienTai?.TinhThanh ?? "",
        NoiOHienTai_QuanHuyen: result.CanBo?.NoiOHienTai?.HuyenQuan ?? "",
        NoiOHienTai_XaPhuong: result.CanBo?.NoiOHienTai?.XaPhuong ?? "",
        NoiOHienTai_SoNhaChiTiet: result.CanBo?.NoiOHienTai?.SoNhaChiTiet ?? ""
      }
    }
    appStore.SET_USERINFO(thongTinDoiTuong.value)
  }).catch(function (err) {
    console.log(err)
  })
}
const goBack = function () {
  window.history.back()
}
const updateUser = function () {
  loading.value = true
  let dataUser = null
  let filter = {
    data: {
      ...thongTinDoiTuong.value,
      DanhBaLienLac: {
        ThuDienTu: thongTinDoiTuong.value?.ThuDienTu ?? "",
        SoDienThoai: thongTinDoiTuong.value?.SoDienThoai ?? "",
      },
      DiaChiThuongTru: {
        TinhThanh: thongTinDoiTuong.value?.DiaChi_TinhThanh ?? "",
        QuanHuyen: thongTinDoiTuong.value?.DiaChi_QuanHuyen ?? "",
        XaPhuong: thongTinDoiTuong.value?.DiaChi_XaPhuong ?? "",
        SoNhaChiTiet: thongTinDoiTuong.value?.DiaChi_SoNhaChiTiet ?? "",
      },
      NoiOHienTai: {
        TinhThanh: thongTinDoiTuong.value?.NoiOHienTai_TinhThanh ?? "",
        QuanHuyen: thongTinDoiTuong.value?.NoiOHienTai_QuanHuyen ?? "",
        XaPhuong: thongTinDoiTuong.value?.NoiOHienTai_XaPhuong ?? "",
        SoNhaChiTiet: thongTinDoiTuong.value?.NoiOHienTai_SoNhaChiTiet ?? "",
      }
    },
    class: 'citizenmgt',
    collection: 'canhan'
  }

  loading.value = true
  userApi.capNhatThongTinTaiKhoan(filter).then(function (result) {
    loading.value = false
    appStore.success('Cập nhật thông tin thành công')
  }).catch(function () {
    loading.value = false
    appStore.error('Cập nhật thất bại')
  })
}
getThongTinTk()
const validateForm = async function () {
  const { valid } = await formThongTinDoanhNghiepToChuc.value.validate()
  return valid
}
const handleChangePassword = async function () {
  let valid = await refsFormDoiMatKhau.value.validateForm();
  let dataForm = await refsFormDoiMatKhau.value.submit();

  if (!valid) {
    appStore.error("Đồng chí vui lòng nhập đầy đủ thông tin");
    return;
  }

  let filter = {
    data: dataForm,
  };
  loading.value = true
  userApi.doiMatKhau(filter)
    .then(function (result) {
      loading.value = false
      dialogDoiMatKhau.value = false
      appStore.success('Đổi mật khẩu thành công')
    })
    .catch(function (error) {
      loading.value = false
      console.log()
      if (error?.response?.data?.message === 'not.match.password') {
        appStore.error('Mật khẩu cũ không chính xác, vui lòng thử lại')
      } else {
        appStore.error('Đổi mật khẩu thất bại')
      }
    })
}
defineExpose({
  thongTinTaiKhoan, validateForm
})
</script>

<template>
  <div style="max-width: 1300px; margin: 0 auto">
    <v-row class="my-0 mb-5 mx-0">
      <v-col class="row-header d-flex align-center justify-start py-0 px-0" style="border: none">
        <div class="header-content uppercase">
          Thông tin tài khoản
        </div>
      </v-col>
      <v-btn 
        class="mx-0 my-0 mr-2"
        size="small"
        color="red"
        height="28px"
        @click.stop="dialogDoiMatKhau = true"
      >
        <v-icon size="18" color="#fff" class="mr-2">mdi-lock-reset</v-icon>
        <span style="font-size: 14px; text-transform: none;">Đổi mật khẩu</span>
      </v-btn>
    </v-row>

    <FormCRUD 
      ref="formThongTinTaiKhoan" 
      typeAction="create" 
      :mauNhap="formThongTin"
      :dataInput="thongTinDoiTuong">
    </FormCRUD>

    <!-- <v-row class="mx-0 my-0 px-3 mt-4" justify="center">
      <v-btn class="mr-3" size="small" variant="outlined" color="var(--main-color)" @click.stop="goBack()"
        height="28px">
        <v-icon size="22" color="var(--main-color)" class="mr-2">mdi-reply-all-outline</v-icon>
        <span style="font-size: 14px; text-transform: none;">Quay lại</span>
      </v-btn>
      <v-btn size="small" color="var(--main-color)" class="mx-0 mr-3" @click.stop="updateUser()" height="28px"
        :loading="loading" :disabled="loading">
        <v-icon size="20" color="#ffffff" class="mr-2">mdi-content-save-all</v-icon>
        <span>Cập nhật</span>
      </v-btn>
    </v-row> -->

    <v-dialog
      max-width="700"
      v-model="dialogDoiMatKhau"
      persistent
    >
      <v-card>
        <v-toolbar
          dark
          color="var(--main-color)" class="px-0"
        >
          <v-col class="sub-header d-flex align-center justify-start py-0 px-0">
            <div class="sub-header-content">
              Đổi mật khẩu
            </div>
            <div class="triangle-header"></div>
          </v-col>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn variant="flat" size="small" icon color="#E9FFF2" @click="dialogDoiMatKhau = false" >
              <v-icon size="20">mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="my-0 mb-3">
          <v-row class="mx-0 my-0 my-3">
            <v-col cols="12" class="px-0 py-0">
              <FormCRUD 
              ref="refsFormDoiMatKhau" 
              typeAction="create" 
              :mauNhap="formNhapDoiMatKhau"
              :dataInput="infoMatKhau"
              @emitKeyupFunction="handleChangePassword"
              >
            </FormCRUD>
            </v-col>
          </v-row>
          <v-row class="align-center justify-center">
            <v-btn
              size="small"
              width="100"
              variant="outlined"
              color="var(--main-color)"
              :loading="loading"
              :disabled="loading"
              class="mx-0 white--text mr-3"
              @click.stop="dialogDoiMatKhau = false"
            >
              <v-icon size="22" color="var(--main-color)" class="mr-2"
                >mdi-reply-all-outline</v-icon
              >
              <span>Hủy bỏ</span>
            </v-btn>
            <v-btn
              size="small"
              color="var(--main-color)"
              :loading="loading"
              :disabled="loading"
              class="mx-0 white--text"
              width="100"
              @click.stop="handleChangePassword"
            >
              <v-icon size="18" class="">mdi-content-save-check-outline</v-icon>&nbsp;
              <span>Xác nhận</span>
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>