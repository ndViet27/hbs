import Keycloak from 'keycloak-js';
// Khởi tạo instance Keycloak
let keycloakInstance = null;
let isInitialized = false;

export const initKeycloak = () => {
  if (keycloakInstance) {
    return keycloakInstance;
  }

  keycloakInstance = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  });

  return keycloakInstance;
};

// Khởi tạo Keycloak chỉ một lần duy nhất
export const initializeKeycloak = (options = {}) => {
  if (isInitialized) {
    return Promise.resolve(keycloakInstance.authenticated);
  }
  
  const keycloak = initKeycloak();
  
  const defaultOptions = {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256',
    checkLoginIframe: false,
    promiseType: 'native',
    adapter: 'default',
    responseMode: 'query',
    redirectUri: window.location.origin,
    enableLogging: true,
    flow: 'standard'
  };
  
  return keycloak.init({...defaultOptions, ...options})
    .then(authenticated => {
      isInitialized = true;
      return authenticated;
    });
};

// Kiểm tra token hiện tại mà không cần init lại
export const checkToken = () => {
  const keycloak = initKeycloak();
  
  if (!isInitialized) {
    return Promise.reject(new Error('Keycloak not initialized'));
  }
  
  return Promise.resolve(keycloak.authenticated);
};

// Chức năng đăng nhập cho hash mode
export const login = () => {
  const keycloak = initKeycloak();
  
  // Lưu hash path hiện tại để redirect sau khi đăng nhập
  // Cần lưu phần path sau # 
  const currentHashPath = window.location.hash.substring(1) || '/';
  sessionStorage.setItem('auth-redirect', currentHashPath);
  
  console.log('Đang bắt đầu quá trình đăng nhập Keycloak...');
  
  // Cấu hình tối ưu hơn cho hash mode
  // const redirectUri = window.location.origin + '/silent-check.html';
  const redirectUri = window.location.origin
  
  keycloak.login({
    redirectUri: redirectUri, // Sử dụng trang trung gian
    responseMode: 'fragment', // Sử dụng fragment thay vì query
    pkceMethod: 'S256'
  });
};

// Đăng xuất
export const logout = () => {
  const keycloak = initKeycloak();
  
  // Xóa dữ liệu session
  sessionStorage.removeItem('auth-redirect');
  
  // Cấu hình cho hash mode
  keycloak.logout({
    redirectUri: window.location.origin + '/#/login',
    responseMode: 'query'
  });
};

// Hàm tiện ích khác
export const getToken = () => {
  const keycloak = initKeycloak();
  return keycloak.token;
};

export const isAuthenticated = () => {
  const keycloak = initKeycloak();
  return !!keycloak.authenticated;
};

export const isInitializedStatus = () => {
  return isInitialized;
};

// Thông tin chi tiết về tài khoản người dùng đã đăng nhập
export const getUserInfo = () => {
  const keycloak = initKeycloak();
  if (!keycloak.authenticated) {
    return null;
  }
  
  return {
    username: keycloak.tokenParsed?.preferred_username,
    email: keycloak.tokenParsed?.email,
    name: keycloak.tokenParsed?.name,
    roles: keycloak.tokenParsed?.realm_access?.roles || []
  };
};