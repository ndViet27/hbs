# Học bạ số

Developing with Vue 3 in Vite.
- VueJS 3
- Vuetify 3
- VueRouter 4
- Pinia

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```
### Compile, Minify for Development

```sh
npm run build:dev
```

### Compile, Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

# HocBaSo - Tổng quan về cấu trúc View

## Cấu trúc thư mục

Dự án sử dụng cấu trúc dạng module cho các views:

```
src/
├── views/
│   ├── Home.vue                   # Trang chủ
│   ├── Login.vue                  # Trang đăng nhập
│   ├── [TenModule]/               # Thư mục cho mỗi module
│   │   ├── List.vue               # Trang danh sách
│   │   ├── Detail.vue             # Trang chi tiết
│   │   └── Edit.vue               # Trang thêm mới/cập nhật
```

## Các trang view theo module

Mỗi module được tổ chức thành 3 loại view chính:

1. **List.vue**: Hiển thị danh sách các đối tượng, cho phép tìm kiếm, lọc và điều hướng đến trang chi tiết hoặc thêm mới.
2. **Detail.vue**: Hiển thị thông tin chi tiết của một đối tượng, cho phép điều hướng đến trang chỉnh sửa.
3. **Edit.vue**: Form thêm mới hoặc cập nhật đối tượng.

## Điều hướng

Mỗi module được cấu hình trong router với 3 route tương ứng:

1. Route danh sách: `moduleBase` → `ModuleList`
2. Route chi tiết: `moduleBase/:id` → `ModuleDetail`
3. Route thêm mới/cập nhật: `moduleBase/edit/:id?` → `ModuleEdit`

Điều hướng giữa các trang:
- Từ List → Detail: `this.$router.push({ name: 'ModuleDetail', params: { id } })`
- Từ List → Edit (thêm mới): `this.$router.push({ name: 'ModuleEdit' })`
- Từ Detail → Edit: `this.$router.push({ name: 'ModuleEdit', params: { id: this.id } })`
- Từ Edit → List/Detail: `this.$router.push({ name: 'ModuleList' })` hoặc `this.$router.push({ name: 'ModuleDetail', params: { id: this.id } })`

## Danh sách các Module

Dự án bao gồm các module sau (được tự động tạo từ file `menuDraw.json`):

- CoQuanQuanLy
- CoSoGiaoDuc
- NguoiHoc
- NhaGiaoCanBo
- HocBa
- VanBangChungChi
- ...
