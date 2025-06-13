# Tích hợp Keycloak vào ứng dụng Vue.js

## Tổng quan

Tài liệu này mô tả quy trình tích hợp Keycloak - giải pháp xác thực và quản lý truy cập mã nguồn mở - vào ứng dụng Vue.

## Cài đặt và thiết lập

### 1. Cài đặt thư viện

### 2. Thiết lập client trong Keycloak Admin Console

1. Đăng nhập vào Keycloak Admin Console
2. Chọn hoặc tạo Realm (VD: `master`)
3. Tạo client mới:
   - Client ID: `security-admin-console` (hoặc tên tùy chọn)
   - Client Protocol: `openid-connect`
   - Root URL: `http://localhost:5173` (URL của ứng dụng Vue)

4. Thiết lập client:
   - Access Type: `public`
   - Standard Flow Enabled: `ON`
   - Direct Access Grants Enabled: `ON`
   - Implicit Flow Enabled: `OFF`
   - Service Accounts Enabled: `OFF`
   - Valid Redirect URIs: `http://localhost:5173/*`
   - Web Origins: `+` (cho phép tất cả nguồn gốc đã đăng ký)

5. Tab Advanced:
   - PKCE Code Challenge Method: `S256`
   - Proof Key for Code Exchange Code Challenge Method: `S256`

### 3. Cấu hình môi trường trong ứng dụng Vue

## Cấu trúc tích hợp

Tích hợp Keycloak được thực hiện qua các thành phần sau:

1. **Utility Keycloak** (`src/utils/keycloak.js`): Quản lý kết nối và tương tác với Keycloak
2. **Trang Callback** (`src/views/AuthCallback.vue`): Xử lý callback sau khi đăng nhập Keycloak
3. **Router Guard** (`src/router/index.js`): Bảo vệ route và xử lý định tuyến khi xác thực
4. **Khởi tạo Keycloak** (`src/main.js`): Thiết lập ban đầu cho Keycloak

## Triển khai

### 1. Tạo utils/keycloak.js

### 2. Tạo AuthCallback.vue

### 3. Cấu hình Router Guard

### 4. Khởi tạo trong main.js

## Luồng xác thực

### 1. Người dùng chưa đăng nhập

```
[Người dùng] → [Truy cập ứng dụng]
                      ↓
         [Router kiểm tra trạng thái xác thực]
                      ↓
         [Chưa xác thực → Chuyển hướng đến /login]
                      ↓
[Người dùng] → [Nhấn "Đăng nhập"] → [keycloak.login()]
                      ↓
      [Redirect đến trang đăng nhập Keycloak]
                      ↓
 [Người dùng nhập thông tin đăng nhập Keycloak]
                      ↓
  [Keycloak xác thực và redirect về ứng dụng]
                      ↓
  [Callback URL: /#/auth-callback với mã xác thực]
                      ↓
  [Router phát hiện và xử lý URL callback]
                      ↓
  [AuthCallback.vue xử lý xác thực và token]
                      ↓
   [Chuyển hướng người dùng đến trang ban đầu]
```

### 2. Người dùng đã đăng nhập (refresh trang)

```
[Người dùng] → [Refresh trang đã đăng nhập]
                      ↓
         [main.js → initializeKeycloak()]
                      ↓
 [Keycloak kiểm tra session và xác thực tự động]
                      ↓
     [Đã xác thực → router cho phép truy cập]
```

### 3. Đăng xuất

```
[Người dùng] → [Nhấn "Đăng xuất"] → [keycloak.logout()]
                      ↓
               [Xóa token và session]
                      ↓
     [Redirect về trang đăng nhập của ứng dụng]
```

## Tính năng chính

### 1. Single Sign-On (SSO)
Hỗ trợ xác thực một lần và sử dụng trên nhiều ứng dụng trong cùng realm Keycloak.

### 2. Silent Check-SSO
Kiểm tra session đăng nhập hiện có mà không hiển thị giao diện đăng nhập.

### 3. PKCE Flow
Sử dụng PKCE (Proof Key for Code Exchange) để bảo mật quá trình trao đổi mã xác thực.

### 4. Auto Refresh Token
Tự động làm mới token khi hết hạn để duy trì phiên người dùng.

## Cấu hình

### Cấu hình môi trường (.env)

### Cấu hình Keycloak

## Xử lý các trường hợp đặc biệt

### 1. Xử lý URL callback không đúng định dạng

### 2. Lưu và khôi phục đường dẫn ban đầu

Khi người dùng cần đăng nhập, ứng dụng lưu đường dẫn hiện tại vào `sessionStorage` và chuyển hướng quay lại sau khi đăng nhập thành công.

## Phương thức hỗ trợ

### 1. Kiểm tra trạng thái xác thực

### 2. Lấy thông tin người dùng

### 3. Đăng nhập

### 4. Đăng xuất

## Xử lý lỗi

### 1. Xử lý lỗi xác thực

### 2. Xử lý token hết hạn
