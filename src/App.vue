<script setup>
import VueConfirmDialog from './components/ConfirmDialog.vue'
import { useCookies } from 'vue3-cookies'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useAppStore } from '@/stores'
import { initKeycloak, logout as keycloakLogout } from '@/utils/keycloak'

const appStore = useAppStore()
const { cookies } = useCookies()
const { name } = useDisplay()
const router = useRouter()
const accessTokenExpiresIn = ref(0)
let countdownInterval = null

const onResize = function () {
  let breakpointName = name.value
  // console.log('breakpointName', breakpointName)
  appStore.SET_BREAKPOINTNAME(breakpointName)
}
const toastrVue = computed(() => appStore.getToastrVue)
const closeToastr = function () {
  appStore.clear()
}
import { userApi } from '@/api'
const getThongTinTk = function () {
  let thongTinTaiKhoan = null
  try {
    thongTinTaiKhoan = window.userContext && window.userContext.permission ? window.userContext : null
  } catch (error) {
  }
  if (thongTinTaiKhoan) {
    appStore.SET_USERINFO(thongTinTaiKhoan.CanBo)
    let listPermission = thongTinTaiKhoan?.permission??[]
    let mergePermission = listPermission.reduce((acc, obj) => {
      return acc.concat(obj.MaChucNang)
    }, [])
    if (thongTinTaiKhoan.isAdmin) {
      mergePermission.unshift('Admin')
    }
    if (thongTinTaiKhoan.isSuperAdmin) {
      mergePermission.unshift('SuperAdmin')
    }
    appStore.SET_PERMISSION_USER(mergePermission)
  } else {
    let filter = {}
    // userApi.getThongTinTaiKhoan(filter).then(function (result) {
    //   appStore.SET_USERINFO(result.CanBo)
    //   let listPermission = result?.Permission??[]
    //   let mergePermission = listPermission.reduce((acc, obj) => {
    //     return acc.concat(obj.MaChucNang)
    //   }, [])
    //   if (result.isAdmin) {
    //     mergePermission.unshift('Admin')
    //   }
    //   if (result.isSuperAdmin) {
    //     mergePermission.unshift('SuperAdmin')
    //   }
    //   appStore.SET_PERMISSION_USER(mergePermission)
    //   // appStore.SET_PERMISSION_USER([])
    // }).catch(function (err) {
    //   appStore.SET_PERMISSION_USER([])
    // })
  }
}
const logout = function () {
  // cookies.set('session_id', '')
  cookies.set('Token', '')
  cookies.set('RefreshToken', '')
  cookies.set('UserInfo', '')
  document.getElementById('dialogLogout').style.display = 'none'
  router.push({ path: '/login' })
}
// getThongTinTk()

// Khởi tạo và cập nhật bộ đếm ngược khi dialog hiển thị
const startCountdown = () => {
  // Xóa interval hiện tại nếu có
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  
  // Lấy thời gian còn lại từ token
  const keycloak = initKeycloak()
  if (keycloak && keycloak.tokenParsed) {
    const updateCountdown = () => {
      const currentTime = Math.floor(new Date().getTime() / 1000) + keycloak.timeSkew
      const timeLeft = keycloak.tokenParsed.exp - currentTime
      accessTokenExpiresIn.value = timeLeft > 0 ? Math.floor(timeLeft) : 0
      
      // Nếu thời gian đã hết, tự động logout
      if (timeLeft <= 0) {
        clearInterval(countdownInterval)
        countdownInterval = null
        handleLogout()
      }
    }
    
    // Cập nhật ngay lập tức
    updateCountdown()
    
    // Cập nhật mỗi giây
    countdownInterval = setInterval(() => {
      updateCountdown()
    }, 1000)
  }
}
const extendToken = function () {
  document.getElementById('dialogLogout').style.display = 'none'
}
// Xử lý logout khi token hết hạn
const handleLogout = () => {
  // Dừng interval nếu còn
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  
  // Xóa cookies và thực hiện logout
  cookies.remove('isSigned')
  cookies.remove('isActive')
  
  // Đóng dialog nếu đang mở
  if (document.getElementById('dialogLogout')) {
    document.getElementById('dialogLogout').style.display = 'none'
  }
  
  // Gọi hàm logout từ Keycloak
  keycloakLogout()
}


// Thêm listener để theo dõi khi dialog hiển thị
onMounted(() => {
  // Observer để theo dõi thay đổi style của dialogLogout
  const dialogElement = document.getElementById('dialogLogout')
  if (dialogElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          const isVisible = dialogElement.style.display !== 'none'
          if (isVisible) {
            startCountdown()
          } else if (countdownInterval) {
            clearInterval(countdownInterval)
          }
        }
      })
    })
    
    observer.observe(dialogElement, { attributes: true, attributeFilter: ['style'] })
  }
})
</script>

<template>
  <v-app v-resize="onResize" class="wrap-app">
    <router-view></router-view>
    <VueConfirmDialog></VueConfirmDialog>
    <transition name="fade">
      <div id="dialogLogout" style="display: none"
        class="vc-overlay"
      >
        <transition name="zoom">
          <div class="vc-container" style="margin: 0 auto; margin-top: 10%">
            <span class="vc-text-grid">
              <h4 class="vc-title uppercase mb-1">Phiên làm việc sắp hết hạn</h4>
              <h4 class="vc-title uppercase mb-1">Vui lòng thao tác để tiếp tục</h4>
              <h4 class="vc-title uppercase text-center">
                <span style="color: red">{{ accessTokenExpiresIn >= 0 ? accessTokenExpiresIn : 0 }}</span>
              </h4>
            </span>
            <div
              class="vc-btn-grid"
            >
              <button
                class="vc-btn"
                type="button"
                style="width: 370px"
                @click="extendToken"
              >
                TIẾP TỤC
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
    <v-snackbar
      v-model="toastrVue.show"
      :timeout="toastrVue.timeout"
      :color="toastrVue.color"
      location="top"
    >
      <span style="font-size: 14px !important">{{ toastrVue.text }}</span>
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          color="#ffffff"
          variant="text"
          @click="closeToastr"
        >
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

