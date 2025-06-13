<script setup>
  import axios from 'axios'
  import { useRouter, useRoute } from 'vue-router'
  import { useCookies } from 'vue3-cookies'
  import { ref, computed, onMounted } from 'vue'
  import { useAppStore } from '@/stores'
  import { userApi } from '@/api'
  import { login } from '@/utils/keycloak';
  const router = useRouter()
  const appStore = useAppStore()
  const { cookies } = useCookies()
  

  const overlay = ref(false)
  const loading = ref(false)
  const valid = ref(true)
  const userName = ref('')
  const password = ref('')
  const signed = ref(false)
  const rememberMe = ref(false)
  const visiblePassWord = ref(false)

  const getSearchParams = function (prams, key) {
    let value = ""
    let headers = prams.split("&")
    headers.forEach(function (header) {
        header = header.split("=");
        let keyHeader = header[0];
        if (keyHeader === key) {
        value = header[1]
        }
    });
    return value
  }
  const initLoginSso = function () {
    let searchParams = window.location.href.split("?")
    let code = searchParams[1] ? decodeURIComponent(String(getSearchParams(searchParams[1], "code"))) : ''
    if (code) {
      getTokenLoginSso(code.split('#')[0])
    }
  }
  const loginHeThong = function () {
    // test
    // appStore.SET_ISSIGNED(true)
    // cookies.set('Token', '')
    goToPage()
    // end
    if (loading.value || !userName.value || !password.value) {
      return
    }
    loading.value = true
    let filter = {
      data: {
        username: userName.value,
        password: password.value,
        grant_type: 'password',
        client_id: '',
        client_secret: '',
        base_auth: window.btoa(userName.value + ":" + password.value)
      }
    }
    userApi.login(filter).then(function (result) {
      loading.value = false
      if (result && result.access_token) {
        let payload = String(result.access_token.split('.')[1]).replace(/_/g, "/")
        let dataUser = JSON.parse(atob(payload))
        cookies.set('session_id', result.session_id, result.expires_in)
        cookies.set('UserInfo', JSON.stringify(dataUser), result.expires_in)
        appStore.SET_ISSIGNED(true)
        goToPage()
      } else {
        appStore.clear()
        appStore.error('Tên đăng nhập hoặc mật khẩu không chính xác')
      }
    }).catch(function (result) {
      loading.value = false
      appStore.clear()
      appStore.error('Tên đăng nhập hoặc mật khẩu không chính xác')
    })
  }
  const loginKeycloak = function () {
    try {
      // Lưu redirect path hiện tại vào sessionStorage
      const currentPath = router.currentRoute.value.fullPath;
      if (currentPath !== '/login') {
        sessionStorage.setItem('auth-redirect', currentPath);
      }
      
      // Gọi hàm login từ utils/keycloak
      login();
    } catch (error) {
      console.error('Lỗi khi khởi tạo đăng nhập Keycloak:', error);
      loading.value = false;
      appStore.error('Không thể kết nối tới dịch vụ xác thực, vui lòng thử lại sau');
    }
  }
  const loginSso = function () {
    loading.value = true
    let filter = {
      data: {
        'doi_tuong_su_dung': 'CanBo',
        'redirect_uri': window.location.origin
      }
    }
    userApi.getUrlSso(filter).then(function (result) {
      window.location.href = result
      loading.value = false
    }).catch(function () {
      loading.value = false
    })
  }
  const getTokenLoginSso = function (code) {
    loading.value = true
    let filter = {
      data: {
        'code': code,
        'redirect_uri': window.location.origin,
        'grant_type': 'authorization_code'
      }
    }
    userApi.getTokenSso(filter).then(function (result) {
      loading.value = false
      console.log('result', result)
      cookies.set('Token', result.access_token, result.expires_in)
      cookies.set('RefreshToken', result.refresh_token, result.refresh_expires_in)
      axios.defaults.headers.common['Authorization'] = result.access_token ? 'Bearer ' + result.access_token : ''
      goToPage()
    }).catch(function () {
      loading.value = false
    })
  }
  const submitLogout = function () {
    signed.value = false
    appStore.SET_ISSIGNED(false)
    cookies.set('Token', '')
    cookies.set('RefreshToken', '')
    cookies.set('UserInfo', null)

  }
  const goToPage = function() {
    router.push({ path: '/' })
  }
  
  onMounted(() => {
    // Kiểm tra trạng thái đăng nhập từ store hoặc cookies
    signed.value = cookies.get('isSigned')
  })
</script>

<template>
  <div class="wrap-login">
    <v-container
      id="login-page"
      class="px-0 pt-0"
      fluid
      tag="section"
    >
      <div class="container-wrap">
        <div class="wrap-form px-4 py-3">
          <v-row class="wrap-title pt-1 my-0">
            <v-col class="py-0">
              <img class="img-login-logo" src="/images/logo-login.png">
            </v-col>
            <v-col cols="12" class="text-1 py-0 my-0 mt-3">BỘ GIÁO DỤC VÀ ĐÀO TẠO</v-col>
            <v-col cols="12" class="text-2 py-0 mt-1">Hệ thống cơ sở dữ liệu dùng chung</v-col>
          </v-row>
          <div v-if="!signed" style="max-width: 375px;margin: 0 auto;margin-top: 22px;">
            <v-form ref="form" v-model="valid" lazy-validation class="">
              <!-- <v-row class="my-0">
                <v-col class="py-0">
                  <v-text-field
                    dense
                    class="input-text"
                    placeholder="Tên đăng nhập"
                    v-model="userName"
                    :rules="[v => !!v || 'Tên đăng nhập là bắt buộc']"
                    required
                    prepend-inner-icon="mdi:mdi-account"
                    @keyup.enter="loginHeThong"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row xs12 class="mb-0 mt-4">
                <v-col class="py-0">
                  <v-text-field
                    placeholder="Mật khẩu"
                    class="input-text"
                    dense
                    v-model="password"
                    :type="visiblePassWord ? 'text' : 'password'"
                    :rules="[v => !!v || 'Mật khẩu là bắt buộc']"
                    required
                    prepend-inner-icon="mdi:mdi-key"
                    @keyup.enter="loginHeThong"
                    hide-details="auto"
                    :append-inner-icon="visiblePassWord ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="visiblePassWord = !visiblePassWord"
                  ></v-text-field>
                </v-col>
              </v-row> -->
              <!-- <v-row class="mx-0 my-2">
                <v-col class="px-0 py-0">
                  <v-checkbox
                    class="checkbox-remember"
                    v-model="rememberMe"
                    label="Ghi nhớ tài khoản"
                    color="#ffffff"
                    :value="true"
                    hide-details
                  ></v-checkbox>
                </v-col>
                <v-col class="px-0 py-0" style="text-align: right;">
                  <span style="color: #ffffff;line-height: 40px;cursor: pointer;">Quên mật khẩu?</span>
                </v-col>
              </v-row> -->
              <v-row align="center" class="wrap-btn-login" style="margin-top: 25px; margin-bottom: 30px">
                <v-col class="py-0">
                  <!-- <v-btn class="my-0 white--text btn-login" style="min-width: 200px;"
                    :loading="loading"
                    :disabled="loading"
                    @click="loginHeThong"
                  >
                    Đăng nhập
                  </v-btn> -->

                  <v-btn class="ml-2 my-0 white--text btn-login"
                    :loading="loading"
                    :disabled="loading"
                    @click="loginKeycloak"
                  >
                    Đăng nhập hệ thống xác thực tập trung
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </div>
          <div v-else>
            <div class="text-login mt-5">TÀI KHOẢN ĐÃ ĐĂNG NHẬP HỆ THỐNG</div>
            <v-row align="center" style="margin-bottom: 10px;text-align: center;">
              <v-col cols="12">
                <v-btn small class="my-0 white--text mr-3 btn-login" style="padding: 0 15px !important;"
                  :loading="loading"
                  :disabled="loading"
                  @click="goToPage"
                >
                    <v-icon size="20" icon="mdi:mdi-home-circle-outline"></v-icon>&nbsp;
                    <span>Truy cập hệ thống</span>
                </v-btn>

                <!-- <v-btn class="my-0 white--text btn-login" small style="padding: 0 15px !important;"
                  :loading="loading"
                  :disabled="loading"
                  @click="submitLogout"
                >
                  <div class="v-btn__content">
                    <v-icon size="18" icon="mdi:mdi-logout-variant"></v-icon>&nbsp;
                    <span>Đăng xuất</span>
                  </div>
                </v-btn> -->
              </v-col>
            </v-row>
          </div>
        </div>
      </div> 
    </v-container>
    
    <div class="wrap-contact-info">
      <div class="uppercase" style="font-weight: 700; font-size: 16px;">Bộ Giáo dục và Đào tạo</div>
      <div>
        <v-icon size="14" color="#ffffff" class="mr-1">mdi-map-marker</v-icon>
        <span>Số 35 Phố Đại Cồ Việt, Phường Lê Đại Hành, Quận Hai Bà Trưng, TP.Hà Nội</span>
      </div>
      <div>
        <v-icon size="14" color="#ffffff" class="mr-1">mdi-phone-in-talk-outline</v-icon>
        <span>Điện thoại: 024.38695144</span>
      </div>
      <div>
        <v-icon size="14" color="#ffffff" class="mr-1">mdi-email</v-icon>
        <span>Thư điện tử: bogddt@moet.gov.vn</span>
      </div>
    </div>
    
    
    <div class="text-center">
      <v-overlay :value="overlay">
        <v-progress-circular
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-overlay>
    </div>
  </div>
  
</template>

<style lang="scss">
  #app {
    background: transparent !important
  }
  .wrap-login {
    background-size: cover !important;
    height: 100vh;
    width: 100%;
    position: relative;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%), url(/images/bg-login-2.png) no-repeat, lightgray 50% / cover no-repeat;
    background-position: bottom;
  }
  .wrap-login input {
    padding-top: 0px !important;
    min-height: 0px !important;
    caret-color: #ffffff;
  }
  .wrap-login .v-input__details .v-messages {
    color: #ff5252 !important;
    caret-color: #ff5252 !important;
  }
  .wrap-login .v-field--error:not(.v-field--disabled) .v-field__outline {
    display: none !important
  }
  .wrap-login .v-field--variant-filled .v-field__outline::before, .wrap-login .v-field--variant-underlined .v-field__outline::before,
  .wrap-login .v-field--variant-filled .v-field__outline::after, .wrap-login .v-field--variant-underlined .v-field__outline::after {
    display: none !important
  }
  #login-page {
    position: relative;
    margin: 0 auto;
  }
  .container-wrap {
    // background: rgba(14, 42, 66, 0.8);
    // box-shadow: inset -4px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 20px;
    width: auto;
    height: auto;
    // padding: 45px;
    margin: 0 auto;
    margin-top: 20px;
  }
  #login-page .text-1 {
    font-family: "Roboto Slab";
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    color: #ffffff;
  }
  .checkbox-remember.v-checkbox .v-selection-control {
    min-height: 0px !important;
    
  }
  .checkbox-remember.v-checkbox .v-selection-control label, .checkbox-remember.v-checkbox .v-selection-control .v-icon {
    color: #fff !important;
  }
  #login-page .text-2 {
    font-family: "Roboto Slab";
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    color: #ffffff;
  }
  .wrap-form {
    max-width: 510px;
    margin: 0 auto;
    margin-top: 75px;
    border-radius: 20px;
    background: linear-gradient(257deg, #00717D 0%, rgb(0 71 59 / 54%) 100%);
    box-shadow: -4px 4px 4px 0px rgba(0, 0, 0, 0.25) inset;
  }
  .text-login {
    font-family: 'Roboto Slab';
    font-style: normal;
    font-size: 16px;
    line-height: 21px;
    color: #fff;
    text-shadow: 0px 3px 3px rgba(0, 0, 0, 0.17);
    margin-bottom: 15px;
    text-transform: uppercase;
    text-align: center;
  }
  .wrap-login .input-text .v-input__slot:before {
    border-color: transparent;
    border: none !important;
  }
  .wrap-login .input-text .v-input__slot::after {
    display: none !important
  }
  .wrap-login .input-text .v-input__slot {
    border: 1px solid #BAB7B5;
    padding: 4px 5px;
    border-radius: 5px;
    height: 32px
  }
  .wrap-login .input-text .v-field {
    border: 1px solid #bab7b5;
    padding: 4px 5px;
    border-radius: 5px;
    height: 32px;
  }
  .input-text .v-field__prepend-inner, .input-text .v-field__append-inner {
    margin-top: 0;
    padding-top: 0;
    padding-bottom: 15px;
  }
  .input-text .v-icon{
    color: #ffffff !important;
    font-size: 20px !important;
    opacity: 1 !important
  }
  .input-text input {
    color: #ffffff !important;
    font-size: 14px;
  }
  .input-text  .v-input__slot {
    box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 8%), 0px 2px 2px 0px rgb(0 0 0 / 0%), 0px 1px 5px 0px rgb(0 0 0 / 7%) !important;
  }
  .input-text input::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: #ffffff !important;
    opacity: 1; /* Firefox */
  }

  .input-text input:-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: #ffffff !important;
  }

  .input-text input::-ms-input-placeholder { /* Microsoft Edge */
    color: #ffffff !important;
  }
  .btn-login {
    border-radius: 3px;
    background: var(--bg-main-color) !important;
  }
  .wrap-title, .wrap-btn-login {
    text-align: center;
    text-transform: uppercase;
  }
  .wrap-contact-info {
    max-width: 1366px !important;
    height: 120px;
    position: absolute;
    bottom: 12px;
    left: 100px;
    color: #ffffff !important;
  }
  .img-login-logo {
    width: 70px;
  }
  .wrap-title {
    text-align: center;
    margin-top: 20px;
    color: #ffffff
  }
  .bg-login-footer-a {
    width: 100%;
    height: 170px;
    position: absolute;
    bottom: 0;
    fill: linear-gradient(91deg, #589B4D 2.14%, rgba(174, 182, 170, 0.50) 99.94%);
    mix-blend-mode: multiply;
  }
  .bg-login-footer-b {
    width: 100%;
    height: 120px;
    position: absolute;
    bottom: 0;
    fill: linear-gradient(270deg, rgba(0, 66, 28, 0.50) 1.6%, rgba(1, 131, 68, 0.00) 99.92%, rgba(1, 68, 131, 0.10) 99.92%);
    mix-blend-mode: screen;
  }
  @media screen and (max-width: 426px) {
    // .action-title {
    //   display: none;
    // }
    .img-login-logo {
      width: 100px;
      margin-top: 15px;
      margin-bottom: 10px;
    }
    .container-wrap {
      padding: 8px;
      margin-top: 0px;
    }
    .wrap-title {
      text-align: center;
      margin-top: 0px;
      margin-bottom: 30px !important;
    }
    #login-page .text-1 {
      font-size: 16px;
      margin-bottom: 5px;
      padding-bottom: 0px !important;
    }
    #login-page .text-2 {
      font-size: 16px;
    }
    .wrap-btn-login {
      text-align: center;
    }
    .wrap-form {
      margin: 0 10px;
      margin-top: 10px;
    }
    .wrap-contact-info {
      left: 15px;
    }
  }
  @media screen and (min-width: 426px) and (max-width: 769px){
    .container-wrap {
      padding: 8px;
      margin-top: 0px;
    }
    .wrap-title {
      text-align: center;
      margin-top: 0px;
    }
    .wrap-form {
      margin-top: 15px;
      padding-top: 24px !important;
    }
    #login-page .text-1 {
      font-size: 18px;
    }
    .wrap-contact-info {
      left: 50px;
    }
  }

  @media screen and (min-width: 769px) and (max-width: 1025px){
    .container-wrap {
      padding: 8px;
      margin-top: 0px;
    }
    .wrap-title {
      text-align: center;
      margin-top: 0px;
    }
    .wrap-form {
      margin-top: 15px;
    }
    .wrap-contact-info {
      left: 50px;
    }
  }
  #login-page button {
    padding: 5px 24px;
    font-size: 14px;
    color: white;
    margin: 5px;
  }
  #login-page .label {
    color: white;
  }
  #login-page .lang-btn {
    margin-top: 5px;
    margin-left: 91%;
    position: absolute;
  }
</style>
