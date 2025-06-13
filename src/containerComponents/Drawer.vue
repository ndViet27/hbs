<script setup>
  import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
  import { logout, initKeycloak } from '@/utils/keycloak'
  import { useRouter, useRoute } from 'vue-router'
  import { useCookies } from 'vue3-cookies'
  import { useAppStore } from '@/stores'
  import { danhMucApi } from '@/api'
  import jsondata from '@/metadata/menuDraw.json'
  const router = useRouter()
  const route = useRoute()
  const { cookies } = useCookies()
  const appStore = useAppStore()
  const menuItems = ref(jsondata.menuDraw)
  const drawer = computed(() => appStore.getDrawer)
  const breakpointName = computed(() => appStore.getBreakpointName)
  const menuSelected = computed(() => appStore.getMenuSelected)
  const subMenuSelected = computed(() => appStore.getSubMenuSelected)
  const isSigned = computed(() => cookies.get('isSigned'))
  const userLogin = computed(() => appStore.getUserLogin)
  const rail = ref(false)
  const itemsOpened = ref([])
  const emit = defineEmits(['dataLoaded'])
  // console.log('breakpointName', breakpointName.value)
  if (breakpointName.value == 'xs' || breakpointName.value == 'sm' || breakpointName.value == 'md') {
    appStore.SET_DRAWER(false)
  }
  const filteredMenuChildren = (children) => {
    return children.filter(submenu => submenu.visible || submenu.visible === undefined);
  }
  const findActiveMenuItem = () => {
    let foundMenuItem = null;
    let foundSubMenuItem = null;
    let foundMenuGroup = null;
    
    menuItems.value.forEach((menu) => {
      if (menu.to && route.path === menu.to) {
        foundMenuItem = menu;
      } else if (menu.children) {
        menu.children.forEach((subMenu) => {
          if (subMenu.to && route.path === subMenu.to) {
            foundSubMenuItem = subMenu;
            foundMenuGroup = menu;
          }
        });
      }
    });
    
    if (!foundMenuItem && !foundSubMenuItem) {
      menuItems.value.forEach((menu) => {
        if (menu.to && route.path.startsWith(menu.to) && menu.to !== '') {
          foundMenuItem = menu;
        } else if (menu.children) {
          menu.children.forEach((subMenu) => {
            if (subMenu.to && route.path.startsWith(subMenu.to) && subMenu.to !== '') {
              foundSubMenuItem = subMenu;
              foundMenuGroup = menu;
            }
          });
        }
      });
    }
    
    if (foundSubMenuItem && foundMenuGroup) {
      appStore.SET_SUB_MENU_SELECTED(foundSubMenuItem);
      appStore.SET_MENU_SELECTED(foundMenuGroup);
      
      if (!itemsOpened.value.includes(foundMenuGroup.id)) {
        itemsOpened.value.push(foundMenuGroup.id);
      }
    } else if (foundMenuItem) {
      appStore.SET_MENU_SELECTED(foundMenuItem);
      appStore.SET_SUB_MENU_SELECTED({});
    }

    // Nếu không tìm thấy menu nào được chọn và đang ở trang chủ, tự động chuyển đến menu đầu tiên
    if (!foundMenuItem && !foundSubMenuItem && route.path === '/' && isSigned.value) {
      redirectToFirstMenu();
    }
  }

  // Hàm chuyển hướng đến menu đầu tiên
  const redirectToFirstMenu = () => {
    // Kiểm tra nếu có menu items
    if (menuItems.value && menuItems.value.length > 0) {
      const firstMenu = menuItems.value.filter(menu => menu.visible || menu.visible === undefined)[0];
      
      // Nếu menu đầu tiên có children
      if (firstMenu.hasOwnProperty('children') && firstMenu.children && firstMenu.children.length > 0) {
        const visibleChildren = filteredMenuChildren(firstMenu.children);
        if (visibleChildren.length > 0) {
          // Chọn menu con đầu tiên
          const firstSubMenu = visibleChildren[0];
          appStore.SET_SUB_MENU_SELECTED(firstSubMenu);
          appStore.SET_MENU_SELECTED(firstMenu);
          
          // Mở menu group
          if (!itemsOpened.value.includes(firstMenu.id)) {
            itemsOpened.value.push(firstMenu.id);
          }
          
          // Chuyển hướng đến menu con đầu tiên
          router.push({ path: firstSubMenu.to });
          return;
        }
      }
      
      // Nếu menu đầu tiên không có children hoặc không có children hiển thị
      if (firstMenu.to) {
        appStore.SET_MENU_SELECTED(firstMenu);
        appStore.SET_SUB_MENU_SELECTED({});
        router.push({ path: firstMenu.to });
      }
    }
  };
  
  const changeRail = function () {
    rail.value = !rail.value
  }
  const changeDrawer = function () {
    appStore.SET_DRAWER(false)
  }
  const redirectTo = function (item, index) {
    if (item.id !== menuSelected.value.id && item.to) {
      appStore.SET_SUB_MENU_SELECTED({})
      if (item.serviceCode) {
        router.push({ path: item.to, query: { service: item.serviceCode } })
      } else {
        router.push({ path: item.to })
      }
      appStore.SET_MENU_SELECTED(item)
    }     
  }
  const redirectToSubMenu = function (item, index, itemParent) {
    appStore.SET_SUB_MENU_SELECTED(item)
    appStore.SET_MENU_SELECTED(itemParent)
    router.push({ path: item.to })
  }
  const submitLogout = function () {
    appStore.SET_ISSIGNED(false)
    localStorage.setItem('user', null)
    cookies.set('Token', '')
    cookies.set('RefreshToken', '')
    router.push({ path: '/login' })
  }
  const submitLogoutKeycloak = function () {
    logout()
    cookies.remove('isSigned')
  }
  const goToLogin = function () {
    router.push({ path: '/login' })
  }
  const goToThongTinTaiKhoan = function () {
    router.push({ path: '/thong-tin-tai-khoan' })
  }
  watch(() => route.path, () => {
    findActiveMenuItem();
  }, { immediate: true });
  watch(menuSelected, (val) => {
    if (val && val.id && val.children) {
      if (!itemsOpened.value.includes(val.id)) {
        itemsOpened.value.push(val.id);
      }
    }
  });
  watch(() => isSigned.value, (newVal) => {
    if (newVal && route.path === '/') {
      nextTick(() => {
        redirectToFirstMenu();
      });
    }
  });
  onMounted(() => {
    nextTick(() => {
      findActiveMenuItem();
      
      // Nếu người dùng đã đăng nhập và đang ở trang chủ nhưng chưa chọn menu nào
      if (isSigned.value && route.path === '/' && 
          (!menuSelected.value || Object.keys(menuSelected.value).length === 0)) {
        redirectToFirstMenu();
      }
    });
  })
</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    :permanent="(breakpointName == 'xs' || breakpointName == 'sm' || breakpointName == 'md') ? false : true"
    absolute
    :width="(breakpointName == 'xs' || breakpointName == 'sm' || breakpointName == 'md') ? 250 : 250"
    id="navigation-draw"
  >
    <template v-slot:prepend>
      <v-list-item two-line class="px-0 pl-2 head-drawer">
        <template v-slot:prepend>
          <img
            :src="`/images/logo-login.png`"
            style="width: 38px; height: 38px"
          />
        </template>

        <v-list-item-title class="text-head-draw">
          Cơ sở dữ liệu dùng chung
        </v-list-item-title>
        <v-list-item-title class="sub-text-head-draw">
          Bộ Giáo dục và Đào tạo
        </v-list-item-title>
      </v-list-item>
    </template>

    <v-divider color="var(--main-color)" style="opacity: 0.5"></v-divider>

    <v-list dense :opened="itemsOpened" :open-strategy="'multiple'" style="padding-top: 0px;">
      <template v-for="(menu, index) in menuItems">
        <!-- list -->
        <v-list-item v-if="!menu.hasOwnProperty('children') && (menu.visible || menu.visible === undefined)"  @click.stop="redirectTo(menu, index)"
        :class="menu.id === menuSelected.id ? 'list-menu item-active' : 'list-menu'"
        :key="'menu-' + menu.id"
        >
          <template v-slot:prepend>
            <div v-if="!rail">
              <v-icon
                :size="rail ? 24 : 22"
                class="icon-draw"
                :icon="menu.icon"
              ></v-icon>
            </div>
            <v-tooltip v-else top color="var(--main-color)">
              <template v-slot:activator="{ props }">
                <div class="mark-active" style="width: 5px;height: 100%"></div>
                <v-icon
                  :size="rail ? 24 : 22"
                  v-bind="props"
                  class="icon-draw"
                  :icon="menu.icon"
                  ></v-icon>
              </template>
              <span class="uppercase text-bold">{{ menu.title + 1 }}</span>
            </v-tooltip>
          </template>
          <v-list-item-title class="text-drawer text-list uppercase text-bold">{{
            menu.title
          }}</v-list-item-title>
        </v-list-item>
        <!-- listGroup -->
        <v-list-group v-if="menu.hasOwnProperty('children') && (menu.visible || menu.visible === undefined)" :value="menu.id" :key="'group-' + menu.id">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props"  @click.stop="redirectTo(menu, index)"
            :class="menu.id === menuSelected.id ? 'list-menu item-active' : 'list-menu'" 
            >
              <template v-slot:prepend>
                <div v-if="!rail">
                  <v-icon
                    :size="rail ? 24 : 22"
                    class="icon-draw"
                    :icon="menu.icon"
                  ></v-icon>
                </div>
                <v-tooltip v-else top color="var(--main-color)">
                  <template v-slot:activator="{ props }">
                    <div class="mark-active" style="width: 5px;height: 100%"></div>
                    <v-icon
                      :size="rail ? 24 : 22"
                      v-bind="props"
                      class="icon-draw"
                      :icon="menu.icon"
                      ></v-icon>
                  </template>
                  <span class="uppercase">{{ menu.title }}</span>
                </v-tooltip>
              </template>
              <v-list-item-title class="text-drawer text-list uppercase font-weight-bold">
                {{ menu.title }}
              </v-list-item-title>
            </v-list-item>
          </template>
          <div v-for="(submenu, i) in filteredMenuChildren(menu.children)" :key="'submenu-' + submenu.id">
            <v-list-item @click="redirectToSubMenu(submenu, i, menu)"
              v-if="!rail"
              style="padding-left: 20px !important; padding-right: 20px !important;"
              :class="submenu.id === subMenuSelected.id ? 'list-submenu item-active' : 'list-submenu'"
            >
              <template v-slot:prepend>
                <div>
                  <div class="mark-active" style="width: 5px;height: 100%"></div>
                  <v-icon
                    size="22"
                    class="icon-draw"
                    icon="mdi-unfold-more-vertical"
                  ></v-icon>
                </div>
              </template>
              <v-list-item-title class="text-drawer text-list text-sub-list">
                {{ submenu.title }}
              </v-list-item-title>
            </v-list-item>
          </div>
        </v-list-group>
      </template>
    </v-list>
    <v-btn color="var(--main-color)" :density="breakpointName == 'xs' || breakpointName == 'sm' || breakpointName == 'md' ? 'comfortable' : 'compact'"
     @click.stop="breakpointName == 'xs' || breakpointName == 'sm' || breakpointName == 'md' ? changeDrawer() : changeRail()" 
      style="position: absolute;right: -15px;top: 50%" icon>
      <v-icon :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'" size="24" color="#fff"></v-icon>
    </v-btn>
    <template v-slot:append>
      <v-divider color="#BEBDBD" style="opacity: 0.5;"></v-divider>
      <div>

        <v-menu transition="scale-transition">
          <template v-slot:activator="{ props }">
            <div v-bind="props" class="d-flex align-center pt-2 pb-2" 
              style="width: 100%;justify-content: space-between;cursor: pointer;background: var(--bg-main-color);">
              <div class="px-2" style="border-right: 1px solid #fff;">
                <v-icon size="20" color="#fff" icon="mdi-account-circle"></v-icon>
              </div>
              <div class="px-2">
                <span style="color: #fff; font-weight: 600;">Sở GD&ĐT Hà Nội</span>
              </div>
              <div class="px-2">
                <v-icon size="18" color="#fff" icon="mdi-chevron-up"></v-icon>
              </div>
            </div>

          </template>
          <v-list class="pa-0 sub-menu-draw">
            <v-list-item style="cursor: pointer;" @click="goToThongTinTaiKhoan()">
              <template v-slot:prepend>
                <v-icon color="var(--main-color)" icon="mdi-account-circle"></v-icon>
              </template>
              <v-list-item-title class="text-drawer font-weight-bold">Thông tin tài khoản</v-list-item-title>
            </v-list-item>
            <v-list-item style="cursor: pointer;" @click="submitLogoutKeycloak()">
              <template v-slot:prepend>
                <v-icon color="red" icon="mdi-power"></v-icon>
              </template>
              <v-list-item-title class="text-drawer font-weight-bold">Đăng xuất</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </template>
  </v-navigation-drawer>
</template>


<style lang="scss">
  .head-drawer {
    background: var(--bg-main-color);
    height: 70px;
  }
  .text-head-draw {
    color: #FFF;
    font-family: "Roboto Condensed";
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    margin-bottom: 3px;
    text-transform: uppercase;
  }
  .sub-text-head-draw {
    color: #FFEE01;
    font-family: "Roboto Condensed";
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
  }
  .text-jobpos {
    font-size: 13px !important;
    font-weight: 400;
    font-style: italic !important;
    color: var(--main-color) !important;
  }
  .mark-active {
    display: none;
    position: absolute;
    left: 0;
    top: 0;
    background: var(--main-color);;
  }
  .list-menu {
    padding-top: 8px !important;
    padding-bottom: 8px !important;
  }
  .item-active .mark-active {
    display: inline-block;
  }
  #navigation-draw .v-navigation-drawer__content .v-list-item {
    min-height: 36px !important;
    padding-left: 10px;
    padding-right: 10px;
    border-bottom: 1px dotted #d0d0d0;
  }
  .v-navigation-drawer--rail .v-list-item {
    padding-left: 10px !important;
    padding-right: 10px !important
  }
  #navigation-draw .v-list-item__spacer, .sub-menu-draw .v-list-item__spacer {
    width: 8px !important;
  }
  #navigation-draw .v-list-group__items .v-list-item {
    padding-inline-start: 10px !important;
  }
  // #navigation-draw .list-submenu {
  //   padding-inline-start: 24px !important;
  // }
  #navigation-draw .v-list-item__append .v-icon {
    color: var(--main-color)
  }
  #navigation-draw .item-active .v-list-item__append .v-icon {
    color: #ffffff !important
  }
  .text-drawer {
    color: var(--main-color) !important
  }
  .list-menu.item-active {
    background: var(--main-color);
  }
  .list-menu.item-active .v-icon, .list-menu.item-active .text-drawer {
    color: #ffffff !important;
    // font-weight: 700 !important;
  }
  .list-submenu.item-active {
    background: #ebf2fd;;
    color: var(--main-color) !important;
  }
  
  .icon-draw {
    color: var(--main-color) !important
  }
  .text-list {
    font-size: 14px !important;
    // text-transform: uppercase;
    line-height: 19px !important;
    font-weight: 400;
    white-space: normal;
    letter-spacing: normal
  }
  .text-sub-list {
    text-transform: none;
  }
  .v-navigation-drawer--rail .text-list{
    white-space: nowrap !important;
  }
  .list-menu, .list-submenu {
    cursor: pointer
  }

  #navigation-draw .v-navigation-drawer__content::-webkit-scrollbar {
    width: 5px;
    border-radius: 3px;
  }
  
  #navigation-draw .v-navigation-drawer__content::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }
  
  #navigation-draw .v-navigation-drawer__content::-webkit-scrollbar-thumb {
    background-color: var(--main-color);
    outline: 1px solid rgb(132, 180, 180);
    border-radius: 3px;
  }
</style>