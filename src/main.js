import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import vuetify from './plugins/vuetify'
import { initKeycloak, initializeKeycloak, logout } from '@/utils/keycloak';
import { useCookies } from "vue3-cookies"
import { useAppStore } from '@/stores'

const { cookies } = useCookies()
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(vuetify)
app.use(router)

// Cấu hình axios
const baseURL = import.meta.env.VITE_APP_PATH_API;
if (typeof baseURL !== 'undefined') {
  axios.defaults.baseURL = baseURL
}
const updateTokenStatus = (accessTokenExpiresIn, refreshTokenExpiresIn) => {
  if (accessTokenExpiresIn < 0) {
    cookies.remove('isSigned')
    logout()
  } else if (accessTokenExpiresIn < 120) {
    // Hiển thị dialog với bộ đếm ngược
    if (document.getElementById('dialogLogout') && document.getElementById('dialogLogout').style.display === 'none') {
      document.getElementById('dialogLogout').style.display = 'block'
    }
  } else {
    // Nếu thời gian còn nhiều, ẩn dialog nếu đang hiển thị
    if (document.getElementById('dialogLogout') && document.getElementById('dialogLogout').style.display !== 'none') {
      document.getElementById('dialogLogout').style.display = 'none'
    }
  }
}
// Khởi tạo Keycloak cơ bản
initializeKeycloak({
  onLoad: 'check-sso',
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  pkceMethod: 'S256',
  checkLoginIframe: false,
  promiseType: 'native',
  adapter: 'default',
  responseMode: 'query'
})
.then(authenticated => {
  console.log('Keycloak initialized, authentication state:', authenticated);
  if (authenticated) {
    const keycloak = initKeycloak();
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + keycloak.token;

    // Cập nhật cookie ban đầu
    let currentTime = Math.floor(new Date().getTime() / 1000) + keycloak.timeSkew;
    let accessTokenExpiresIn = keycloak.tokenParsed.exp - currentTime;
    let refreshTokenExpiresIn = keycloak.refreshTokenParsed ? keycloak.refreshTokenParsed.exp - currentTime : -1;
    cookies.set('isSigned', true, Math.min(accessTokenExpiresIn, refreshTokenExpiresIn));
    
    // Interceptor để làm mới token trước khi gọi API
    axios.interceptors.request.use(
      async (config) => {
        const currentTime = Math.floor(new Date().getTime() / 1000) + keycloak.timeSkew;
        const expiresIn = keycloak.tokenParsed.exp - currentTime;

        if (expiresIn < 120) {
          await keycloak.updateToken(120).then(refreshed => {
            if (refreshed) {
              console.log('Token đã được làm mới trước khi gọi API');
              axios.defaults.headers.common['Authorization'] = 'Bearer ' + keycloak.token;
              const newCurrentTime = Math.floor(new Date().getTime() / 1000) + keycloak.timeSkew;
              const newExpiresIn = keycloak.tokenParsed.exp - newCurrentTime;
              const newRefreshExpiresIn = keycloak.refreshTokenParsed ? keycloak.refreshTokenParsed.exp - newCurrentTime : -1;
              cookies.set('isSigned', true, Math.min(newExpiresIn, newRefreshExpiresIn));
            }
          }).catch(() => {
            console.error('Failed to refresh token');
            cookies.remove('isSigned');
            router.push('/login');
          });
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    // Phát hiện tương tác người dùng
    const handleUserInteraction = async () => {
      const currentTime = Math.floor(new Date().getTime() / 1000) + keycloak.timeSkew;
      const expiresIn = keycloak.tokenParsed.exp - currentTime;
      // console.log('session expiresIn:', expiresIn)
      if (expiresIn < 120) {
        await keycloak.updateToken(120).then(refreshed => {
          if (refreshed) {
            console.log('Token đã được làm mới do tương tác');
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + keycloak.token;
            const newCurrentTime = Math.floor(new Date().getTime() / 1000) + keycloak.timeSkew;
            const newExpiresIn = keycloak.tokenParsed.exp - newCurrentTime;
            const newRefreshExpiresIn = keycloak.refreshTokenParsed ? keycloak.refreshTokenParsed.exp - newCurrentTime : -1;
            cookies.set('isSigned', true, Math.min(newExpiresIn, newRefreshExpiresIn));
            // Ẩn dialogLogout
            try {
              document.getElementById('dialogLogout').style.display = 'none'
            } catch (error) {
            }
          }
        }).catch(() => {
          console.error('Failed to refresh token');
          cookies.remove('isSigned');
          router.push('/login');
        });
      }
    };

    // Lắng nghe các sự kiện tương tác
    ['click', 'keydown'].forEach(event => {
      window.addEventListener(event, handleUserInteraction);
    });

    // Kiểm tra trạng thái token mỗi 30 giây
    setInterval(() => {
      const currentTime = Math.floor(new Date().getTime() / 1000) + keycloak.timeSkew;
      const accessTokenExpiresIn = keycloak.tokenParsed.exp - currentTime;
      const refreshTokenExpiresIn = keycloak.refreshTokenParsed ? keycloak.refreshTokenParsed.exp - currentTime : -1;
      // console.log('accessTokenExpiresIn', accessTokenExpiresIn)
      // console.log('refreshTokenExpiresIn', refreshTokenExpiresIn)
      updateTokenStatus(accessTokenExpiresIn, refreshTokenExpiresIn);
    }, 30000);

    // Kiểm tra và chuyển hướng nếu đang ở silent-check.html
    if (window.location.href.includes('/silent-check-.html')) {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#/')) {
        console.log('Redirect từ silent-check.html về URL chính với hash:', hash);
        window.location.replace(window.location.origin + hash);
      } else {
        console.log('Redirect từ silent-check.html về trang chủ');
        window.location.replace(window.location.origin + '/#/');
      }
      return;
    }
  } else {
    cookies.remove('isSigned')
    router.push('/login')
  }
  
  // Luôn mount ứng dụng, để router và AuthCallback xử lý phần redirect
  app.mount('#app');
})
.catch(error => {
  cookies.remove('isSigned')
  console.error('Keycloak init error:', error)
  app.mount('#app')
  router.push('/login')
});