<script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useCookies } from 'vue3-cookies'
  import { useAppStore } from '@/stores'
  const router = useRouter()
  const route = useRoute()
  const { cookies } = useCookies()
  const appStore = useAppStore()
  const appName = ref(import.meta.env.NODE_ENV)
  const title = ref(import.meta.env.VITE_APP_BASE_TITLE)
  const drawer = computed(() => appStore.getDrawer)
  const breakpointName = computed(() => appStore.getBreakpointName)
  const changeDrawer = function () {
    appStore.SET_DRAWER(!drawer.value)
  }
  const goToLogin = function () {
    router.push({ path: '/login' })
  }

  onMounted(() => {
  })
</script>

<template>
  <v-app-bar app id="header-app" height="40px">    
    <div class="header-content">
      
    </div>
  </v-app-bar>
  <v-icon v-if="breakpointName == 'xs' || breakpointName == 'sm' || breakpointName == 'md'" :size="32" 
    class="btn-visible-drawer pl-2" icon="mdi:mdi-format-list-bulleted" color="var(--main-color)" @click.stop="changeDrawer"></v-icon>
</template>

<style lang="scss">
  #header-app {
    display: flex;
    height: 40px;
    padding: 8px 40px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    background: #FFF;
    box-shadow: 0px 2px 8px 0px rgba(185, 121, 121, 0.15);
  }
  #banner .container {
    padding: 0
  }
  #banner .container a {
    text-decoration: none;
    display: flex;
    text-align: center;
    flex-wrap: wrap;
    align-content: center;
  }
  .logo-banner {
    width: 55px;
    margin-right: 10px;
  }
  .title-banner {
    display: flex;
    flex-direction: column;
    font-family: "Roboto Slab";
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 21px;
    color: var(--main-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    align-content: center;
    flex-wrap: wrap;
    text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.15);
  }
  .btn-visible-drawer {
    display: inline-block;
    position: absolute;
    right: 5px;
    top: 5px;
    z-index: 10000;
  }
  // ----end------------
  @media screen and (max-width: 426px){
    .logo-banner {
      margin-right: 10px;
      width: 55px !important;
    }
    .btn-visible-drawer {
      top: 17px;
    }
  }
  @media screen and (max-width: 1024px){
    .logo-banner {
      margin-right: 10px;
      width: 55px;
    }
    .title-banner {
      font-size: 13px;
      line-height: 18px;
      align-content: center;
    }
  }
  @media screen and (min-width: 1024px){
    .btn-visible-drawer {
      top: 5px;
    }
  }
</style>

