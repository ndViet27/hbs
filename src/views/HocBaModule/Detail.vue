<template>
  <div class="mx-auto pa-0" style="box-shadow: none !important; overflow: inherit;min-height: 80vh">
    <v-row class="my-0 mb-5 mx-0">
      <v-col class="row-header d-flex align-center justify-start py-0 px-0" style="border: none">
        <div class="header-content">
          <span>Thông tin chứng thư số</span>
        </div>
      </v-col>
      <v-col class="text-right px-0 py-0">
        <v-btn
          class=""
          size="small"
          variant="outlined"
          color="var(--main-color)"
          @click.stop="goBack()"
          height="28px"
        >
          <v-icon size="22" color="var(--main-color)" class="mr-1">mdi-reply-all-outline</v-icon>
          <span style="font-size: 14px; text-transform: none;">Quay lại</span>
        </v-btn>
      </v-col>
    </v-row>
    <div class="mx-auto pa-0 thongtinchung" style="box-shadow: none !important; overflow: inherit;">
      <v-row class="thongtinchung mx-0 my-0" style="position: relative;" v-if="props.id !== '0'">
        <div class="text-right" style="width: 100%">
          <v-menu transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-chip
                :class="breakpointName === 'xs' ? 'menu-list-action-mobile' : 'menu-list-action'"
                v-bind="props"
                @click="showMenuTrangThai = !showMenuTrangThai"
              >
                <v-icon color="var(--main-color)" left size="20" class="mx-2" icon="mdi-send"></v-icon>
                <span style="color:var(--main-color);font-size: 14px;font-weight: 700">
                  {{thongTinDoiTuong && thongTinDoiTuong.TrangThaiHoSo ?  thongTinDoiTuong.TrangThaiHoSo.TenMuc : ''}}
                </span>
                <v-icon class="ml-2" v-if="!showMenuTrangThai" size="20" color="var(--main-color)" icon="mdi-chevron-up"></v-icon>
                <v-icon class="ml-2" v-else size="20" color="var(--main-color)" icon="mdi-chevron-down"></v-icon>
              </v-chip>
            </template>
            <v-list class="pa-0 listActionTrangThai">
              <v-list-item v-for="(item, index) in dsTrangThaiDoiTuong" v-bind:key="index" style="cursor: pointer;"
                @click="duyetChungThu(item)"
              >
                <template v-slot:prepend>
                  <v-icon color="var(--main-color)" icon="mdi-play" class="mr-2"></v-icon>
                </template>
                <v-list-item-title>{{ item.TenHanhDong }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-row>
      <v-row class="mx-0 my-0 px-0" v-if="thongTinDoiTuong && props.id !== '0'">
        <v-col cols="12" md="6" class="py-0 px-0">
          <div class="mb-1">
            <span class="label-text">Cơ sở giáo dục: </span>
            <span class="content-text">{{thongTinDoiTuong?.TrangThaiHoSo?.TenMuc??''}}</span>
          </div>
          <div class="mb-1">
            <span class="label-text">Trạng thái đăng ký: </span>
            <span class="content-text">{{thongTinDoiTuong?.LoaiPhuongTien?.TenMuc??''}}</span>
          </div>
          <div class="mb-1">
            <span class="label-text">Ngày đăng ký: </span>
            <span class="content-text">{{thongTinDoiTuong?.NhanHieu?.TenMuc??''}}</span>
          </div>
          <div class="mb-1">
            <span class="label-text">Ngày duyệt: </span>
            <span class="content-text">{{thongTinDoiTuong?.TenThuongMai??''}}</span>
          </div>
          <div class="mb-1">
            <span class="label-text">File chứng thư: </span>
          </div>
          <div class="">
            <TepTinDinhKem :idComponent="'chungthuso'" :tepInput="thongTinDoiTuong.TepDuLieu && thongTinDoiTuong.TepDuLieu.length ? thongTinDoiTuong.TepDuLieu : []" :edit="false"></TepTinDinhKem>
          </div>
        </v-col>
        <v-col cols="12" md="6" class="py-0 px-0">
          <div class="mb-1">
            <span class="label-text">Thông tin chứng thư số: </span>
          </div>
          <div class="mb-1">
            <span class="label-text"> <v-icon icon="mdi-circle-small" color="#000" size="18"></v-icon> Chủ thể: </span>
            <span class="content-text">{{thongTinDoiTuong.ChuThe}}</span>
          </div>
          <div class="mb-1">
            <span class="label-text">
              <v-icon icon="mdi-circle-small" color="#000" size="18"></v-icon> Ngày hiệu lực: 
            </span>
            <span class="content-text">{{dateLocale(thongTinDoiTuong?.NgayNopHoSo??'')}}</span>
          </div>
          <div class="mb-1">
            <span class="label-text">
              <v-icon icon="mdi-circle-small" color="#000" size="18"></v-icon> Ngày hết hạn: 
            </span>
            <span class="content-text">{{dateLocale(thongTinDoiTuong?.NgayHetHan??'')}}</span>
          </div>
          <div class="mb-1">
            <span class="label-text"> <v-icon icon="mdi-circle-small" color="#000" size="18"></v-icon> Nhà phát hành: </span>
            <span class="content-text">{{thongTinDoiTuong.NhaPhatHanh}}</span>
          </div>
          <div class="mb-1">
            <span class="label-text"> <v-icon icon="mdi-circle-small" color="#000" size="18"></v-icon> Kiểu chữ ký: </span>
            <span class="content-text">{{thongTinDoiTuong.KieuChuKy}}</span>
          </div>
          <div class="mb-1">
            <span class="label-text"> <v-icon icon="mdi-circle-small" color="#000" size="18"></v-icon> Serial của chứng thư: </span>
            <span class="content-text">{{thongTinDoiTuong.Serial}}</span>
          </div>
        </v-col>
      </v-row>
    </div>
    <div class="mx-auto pa-0 thongtinhoso mt-3" style="box-shadow: none !important; overflow: inherit;">
      
    </div>
    <DialogDuyetChungThu
      v-model="showDialog"
      :loading-action="isSubmitting"
      :items="selectedItems"
      @submitFormXetDuyet="handleSubmitDialog"
      @cancel="handleCancelDialog"
    />
  </div>
</template>

<script setup>
  import { useCookies } from 'vue3-cookies'
  import { useRouter, useRoute } from 'vue-router'
  import { ref, reactive, computed, onMounted, watch, defineAsyncComponent } from 'vue'
  import { useAppStore } from '@/stores'
  import { generalApi, hosoApi } from '@/api'
  import { dateLocale } from '@/helpers'
  const TepTinDinhKem = defineAsyncComponent(() =>import("../../components/TepTinDinhKem.vue"))
  const DialogDuyetChungThu = defineAsyncComponent(() =>import("./DialogDuyetChungThu.vue"))
  const route = useRoute()
  const router = useRouter()
  const props = defineProps({
    id: {
      type: String,
      default: ''
    }
  })
  const appStore = useAppStore()
  const breakpointName = computed(() => appStore.getBreakpointName)
  const menuItems = computed(() => appStore.getMenuItems)
  const menuSelected = computed(() => appStore.getMenuSelected)
  const subMenuSelected = computed(() => appStore.getSubMenuSelected)
  const thongTinDoiTuong = ref({})
  const dsTrangThaiDoiTuong = ref([
    {
      TenHanhDong: 'Duyệt chứng thư',
      MaHanhDong: 'duyetchungthu'
    },
    {
      TenHanhDong: 'Từ chối chứng thư',
      MaHanhDong: 'tuchoichungthu'
    }
  ])
  const showDialog = ref(false)
  const isSubmitting = ref(false)
  const selectedItems = ref([])
  const showMenuTrangThai = ref(false)
  const loading = ref(false)
  const loadingAction = ref(false)
  const getThongTinDoiTuong = function (id) {
    let filter = {
      path: '/publicadministrativemgt/internal',
      collection: 'chungthuso',
      primKey: id
    }
    loading.value = true
    generalApi.getChiTietDoiTuong(filter).then( async function(result) {
      loading.value = false
      if (result.resp) {
        console.log('result', result)
        thongTinDoiTuong.value = result.resp
      }
    }).catch(function () {
      loading.value = false
    })
  }
  const duyetChungThu = function (item) {
    console.log('item', item)
    selectedItems.value = [thongTinDoiTuong.value]
    if (item.MaHanhDong === 'duyetchungthu') {
      showConfirmDuyet(true)
    } else {
      // showConfirmDuyet(false)
      showDialog.value = true
    }
  }
  const submitDuyetChungThu = async (accept) => {
    loadingAction.value = true
    try {
      // Xử lý API duyệt chứng thư
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Duyệt chứng thư', selectedItems.value)
      appStore.success('Duyệt chứng thư thành công')
      
      // Reset dữ liệu
      loadingAction.value = false
      selectedItems.value = []
      
      // Trả về kết quả để component gọi có thể reload data
      return true
    } catch (error) {
      appStore.error('Duyệt chứng thư thất bại')
      loadingAction.value = false
      return false
    }
  }
  const showConfirmDuyet = (type) => {
    appStore.SET_SHOWCONFIRM(true)
    const confirm = {
      title: type ? 'Xác nhận duyệt chứng thư' : 'Xác nhận từ chối chứng thư',
      message: type ? 'Bạn có chắc chắn duyệt chứng thư?' : 'Bạn có chắc chắn từ chối chứng thư?',
      button: {
        yes: "Có",
        no: "Không",
      },
      callback: () => {
        if (type) {
          submitDuyetChungThu(true)
        } else {
          showDialog.value = true
        }
      }
    }
    appStore.SET_CONFIG_CONFIRM_DIALOG(confirm)
  }
  const goBack = function () {
    router.back()
  }
  onMounted(() => {
    getThongTinDoiTuong(props.id)
  })
  watch(() => props.id, () => {
    getThongTinDoiTuong(props.id)
  })
  const handleSubmitDialog = async (data) => {
    appStore.SET_SHOWCONFIRM(true)
    const confirm = {
      title: 'Xác nhận từ chối chứng thư',
      message: 'Bạn có chắc chắn từ chối chứng thư?',
      button: {
        yes: "Có",
        no: "Không",
      },
      callback: () => {
        isSubmitting.value = true
        try {
          // Xử lý API từ chối chứng thư với data.lyDoTuChoi và data.items
          console.log('Submit từ chối', data)
          
          // Đóng dialog và reset
          showDialog.value = false
          isSubmitting.value = false
          
          // Reload data
          getThongTinDoiTuong(props.id)
        } catch (error) {
          appStore.error('Thực hiện thất bại')
          isSubmitting.value = false
        }
      }
    }
    appStore.SET_CONFIG_CONFIRM_DIALOG(confirm)
  }
  const handleCancelDialog = () => {
    
  }
</script>

<style scoped>
.detail-view {
  padding: 20px;
}
.actions {
  margin-bottom: 20px;
}
.loading {
  margin: 20px 0;
  font-style: italic;
}
.data-detail {
  margin-top: 20px;
}
.data-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  background-color: #f9f9f9;
}
</style>