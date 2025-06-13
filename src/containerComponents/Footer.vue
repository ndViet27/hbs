<script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useAppStore } from '@/stores'

  const appStore = useAppStore()
  const appName = ref(import.meta.env.NODE_ENV)
  const publicPath = ref(import.meta.env.VITE_APP_PULIC_PATH)
  const breakpointName = computed(() => appStore.getBreakpointName)
  const isMobile = breakpointName.value == 'xs' || breakpointName.value == 'sm' || breakpointName.value == 'md' ? true : false
</script>

<template>
  <v-footer app id="footer" class="px-3">
      <v-row :class="isMobile ? 'mx-0 my-0 px-0' : ''">
        <v-col class="px-0 py-0" style="min-width: fit-content;">
          <div :class="isMobile ? 'text-3' : 'text-3 pl-2'">
            <v-icon size="14" color="main-color" icon="mdi-copyright" class=""></v-icon>&nbsp;
            <span style="text-transform: uppercase;">BỘ GIÁO DỤC VÀ ĐÀO TẠO</span>
          </div>
        </v-col>
        <v-col  class="px-0 py-0 diachi-text" style="min-width: fit-content;">
          <div class="text-3">
            <v-icon size="14" color="main-color" icon="mdi-map-marker" class="mr-1"></v-icon>&nbsp;
            <span>Số 35 Phố Đại Cồ Việt, Phường Lê Đại Hành, Quận Hai Bà Trưng, TP.Hà Nội</span>
          </div>
        </v-col>
        <v-col style="min-width: fit-content;" :class="!isMobile ? 'text-contact px-0 py-0 text-center' : 'text-contact px-0 py-0'">
          <div class="text-3 pr-3">
            <v-icon size="14" color="main-color" icon="mdi-phone-in-talk-outline" class="mr-1"></v-icon>&nbsp;
            <span>Điện thoại: 024.38695144</span>
          </div>
        </v-col>
      </v-row>
  </v-footer>
</template>


<style>
  #footer {
    height: 32px;
    box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.3) !important;
    background-color: #ffffff;
    background-size: cover;
    padding: 0;
  }
  .image-footer {
    text-align: right;
  }
  #footer .text-1, #footer .text-2, #footer .text-3 {
    font-family: Roboto;
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    text-align: left;
    color: var(--main-color);
  }
  #footer span {
    font-weight: 700;
  }
  #footer .text-2 {
    text-align: center;
  }
  .image-footer .img-1 {
    margin-right: 15px;
  }
  @media screen and (max-width: 426px){
    #footer {
      height: 84px
    }
    #footer .text-2, #footer .text-3 {
      text-align: left;
      margin-top: 5px;
    }
    .diachi-text {
      display: none
    }
  }
  @media screen and (min-width: 426px) and (max-width: 768px){
    #footer {
      height: 100px
    }
    #footer .text-2, #footer .text-3 {
      text-align: left;
      margin-top: 5px;
    }
    .diachi-text {
      min-width: 100% !important;
    }
  }
  @media screen and (min-width: 769px) and (max-width: 1024px){
    #footer {
      height: 54px
    }
    #footer .text-1 {
      width: 100%;
    }
    #footer .text-2, #footer .text-3 {
      text-align: left;
      margin-top: 5px;
    }
    .text-contact .text-3 {
      padding-left: 24px !important;
    }
  }
  @media screen and (max-width: 1024px) {
    .mail-contact {
      display: none;
    }
    .sub-mail-contact {
      display: block;
    }
  }
  @media screen and (min-width: 1025px) {
    .sub-mail-contact {
      display: none;
    }
    .text-contact .text-3{
      text-align: right !important;
    }
    .mail-contact .text-3{
      padding-right: 15px;
    }
  }
</style>
