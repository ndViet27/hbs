import { defineStore } from "pinia";

export const useAppStore = defineStore("appStore", {
  state: () => ({
    toastrVue: {
      show: false,
      color: "green",
      text: "",
      timeout: 5000,
    },
    userInfo: null,
    loading: false,
    dialogConfirm: {
      auth: false,
      title: "",
      message: "",
      button: {},
      callback: () => {},
    },
    menuItems: [],
    isShowLogout: false,
    isShowConfirm: false,
    isOpenUpdateDialog: false,
    breakpointName: "lg",
    drawer: true,
    isSigned: false,
    menuSelected: {},
    subMenuSelected: {},
    menuXuLySelected: {},
    thuTucSelected: {},
    thongTinHoSo: {},
    activeThongKe: false,
    thongTinNguoiDuocTiep: null,
    thongTinDonThu: null,
    permissionUser: [],
    tabTrangThaiVBDen: "TiepNhan",
    tabTrangThaiVBDi: "ChiDao",
    tabTrangThaiLich: "DanhSachLich",
    tabTrangThaiHoSo: "LapHoSo",
    tabThongTinTuLieu: "VanBanPhapLuat",
    tabPhieuTrinhVanBan: "ChiDao",
    tabTiepCongDan: "TiepThuongXuyen",
    tabDonThu: "DonChoXuLy",
    tabPhongChongThamNhung: "KeKhaiTaiSanThuNhap",
    selectedStatusVanBanDen: "",
    tokenKySo: "",
    userRoles: {},
    tuanCongTac: 0,
    infoVanBanDen: {},
    infoDeMucHoSo: {},
    listDanhMucHoSo: [],
    listNode: [],
    listTrangThaiVanBanDen: [],
    listTrangThaiVanBanDi: [],
    dsXuLyDonThu: [],
    dataDuThao: {}
  }),
  getters: {
    getUserInfo: (state) => state.userInfo,
    isAuthenticated: (state) => !!state.userInfo?.authenticated,
    getCurrentWeek: (state) => {
      const currentDate = new Date();
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      const pastDaysOfYear = (currentDate - startOfYear) / 86400000;
      const weekNumber = Math.ceil(
        (pastDaysOfYear + startOfYear.getDay() + 1) / 7
      );
      return weekNumber + state.tuanCongTac;
    },
    getToastrVue: (state) => state.toastrVue,
    getUserRoles: (state) => {
      const isHavePermission =
        state.userRoles.isAdmin || state.userRoles.isSuperAdmin;
      return isHavePermission;
    },
    getTokenKySo: (state) => state.tokenKySo,
    getIsOpenDialog: (state) => state.isOpenUpdateDialog,
    getDialogConfirm: (state) => state.dialogConfirm,
    getIsShowConfirm: (state) => state.isShowConfirm,
    getIsShowLogout: (state) => state.isShowLogout,
    getBreakpointName: (state) => state.breakpointName,
    getDrawer: (state) => state.drawer,
    getIsSigned: (state) => state.isSigned,
    getUserLogin: (state) => state.userInfo,
    getMenuSelected: (state) => state.menuSelected,
    getSubMenuSelected: (state) => state.subMenuSelected,
    getMenuXuLySelected: (state) => state.menuXuLySelected,
    getThuTucSelected: (state) => state.thuTucSelected,
    getThongTinHoSo: (state) => state.thongTinHoSo,
    getMenuItems: (state) => state.menuItems,
  },
  actions: {
    error(val) {
      this.toastrVue = {
        show: false,
        color: "red",
        text: "",
        timeout: 0,
      };
      this.toastrVue = {
        show: true,
        color: "red",
        text: val,
        timeout: 5000,
      };
    },
    success(val) {
      this.toastrVue = {
        show: false,
        color: "red",
        text: "",
        timeout: 0,
      };
      this.toastrVue = {
        show: true,
        color: "green",
        text: val,
        timeout: 5000,
      };
    },
    clear() {
      this.toastrVue = {
        show: false,
        color: "green",
        text: "",
      };
    },
    SET_LOADING(value) {
      this.loading = value;
    },
    
    SET_USERINFO(userInfo) {
      this.userInfo = userInfo;
    },
    SET_OPEN_DIALOG(val) {
      this.isOpenUpdateDialog = val;
    },
    SET_TOKEN_KY_SO(val) {
      this.tokenKySo = val;
    },
    SET_CONFIG_CONFIRM_DIALOG(val) {
      this.dialogConfirm = val;
    },
    SET_SHOWCONFIRM(val) {
      this.isShowConfirm = val;
    },
    SET_SHOWLOGOUT(val) {
      this.isShowLogout = val;
    },
    SET_BREAKPOINTNAME(val) {
      this.breakpointName = val;
    },
    SET_DRAWER(val) {
      this.drawer = val;
    },
    SET_MENU_SELECTED(val) {
      this.menuSelected = val;
    },
    SET_SUB_MENU_SELECTED(val) {
      this.subMenuSelected = val;
    },
    SET_MENUXULY_SELECTED(val) {
      this.menuXuLySelected = val;
    },
    SET_THUTUC_SELECTED(val) {
      this.thuTucSelected = val;
    },
    SET_THONGTINHOSO(val) {
      this.thongTinHoSo = val;
    },
    SET_ISSIGNED(val) {
      this.isSigned = val;
    },
    SET_PERMISSION_USER(val) {
      this.permissionUser = val;
    },
    SET_ROlES_USER(val) {
      this.userRoles = val;
    },
    SET_MENU_ITEMS(val) {
      this.menuItems = val;
    },
  },
});
