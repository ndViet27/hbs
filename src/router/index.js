import { createRouter, createWebHashHistory } from 'vue-router'
import { isAuthenticated, isInitializedStatus } from '@/utils/keycloak'
import jsondata from '@/metadata/menuDraw.json'
// Generate routes from menu data
const generateRoutesFromMenu = (menuData) => {
  let routes = []
  
  menuData.forEach(menu => {
    if (menu.children) {
      // Create module routes for each submenu item
      menu.children.forEach(submenu => {
        if (submenu.to && submenu.moduleName) {
          const baseRoute = submenu.to
          const moduleName = submenu.moduleName
          if (moduleName === 'StatisticsModule') {
            routes.push({
              path: baseRoute,
              name: `${baseRoute}-list`,
              component: () => import(`@/views/${moduleName}/List.vue`),
              meta: { 
                title: submenu.title,
                module: moduleName,
                moduleType: submenu.moduleType,
                moduleParams: submenu.moduleParams,
                requiresAuth: true
              }
            })
          }
          else if (moduleName === 'QuanTriHeThong') {
            routes.push({
              path: baseRoute,
              name: `${baseRoute}-list`,
              component: () => import(`@/views/${moduleName}/List.vue`),
              meta: { 
                title: submenu.title,
                module: moduleName,
                moduleType: submenu.moduleType,
                moduleParams: submenu.moduleParams
              }
            })

            // Add detail route
            routes.push({
              path: `${baseRoute}/:id`,
              name: `${baseRoute}-detail`,
              component: () => import(`@/views/${moduleName}/Detail.vue`),
              props: true,
              meta: { 
                title: `Chi tiết ${submenu.title}`,
                module: moduleName,
                moduleType: submenu.moduleType,
                moduleParams: submenu.moduleParams
              }
            })
            
            // Add create/edit route
            routes.push({
              path: `${baseRoute}/edit/:id?`,
              name: `${baseRoute}-edit`,
              component: () => import(`@/views/${moduleName}/Edit.vue`),
              props: true,
              meta: { 
                title: `Thêm mới/Cập nhật ${submenu.title}`,
                module: moduleName,
                moduleType: submenu.moduleType,
                moduleParams: submenu.moduleParams
              }
            })
          }
          // Default handling for other modules
          else {
            // Add list route
            routes.push({
              path: baseRoute,
              name: `${moduleName}${submenu.moduleType}${menu.id}List`,
              component: () => import(`@/views/${moduleName}/List.vue`),
              meta: { 
                title: submenu.title,
                module: moduleName,
                moduleType: submenu.moduleType,
                moduleParams: submenu.moduleParams,
                requiresAuth: true
              }
            })
            
            // Add detail route
            routes.push({
              path: `${baseRoute}/:id`,
              name: `${moduleName}${submenu.moduleType}${menu.id}Detail`,
              component: () => import(`@/views/${moduleName}/Detail.vue`),
              props: true,
              meta: { 
                title: `Chi tiết ${submenu.title}`,
                module: moduleName,
                moduleType: submenu.moduleType,
                requiresAuth: true
              }
            })
            
            // Add create/edit route
            routes.push({
              path: `${baseRoute}/edit/:id?`,
              name: `${moduleName}${submenu.moduleType}${menu.id}Edit`,
              component: () => import(`@/views/${moduleName}/Edit.vue`),
              props: true,
              meta: { 
                title: submenu.title,
                module: moduleName,
                moduleType: submenu.moduleType,
                moduleParams: submenu.moduleParams,
                requiresAuth: true
              }
            })
          }
        }
      })
    } else if (menu.to && menu.moduleName) {
      // Handle single menu items without children
      const baseRoute = menu.to
      const moduleName = menu.moduleName
      
      routes.push({
        path: baseRoute,
        name: `${moduleName}${menu.id}List`,
        component: () => import(`@/views/${moduleName}/List.vue`),
        meta: { 
          title: menu.title,
          module: moduleName,
          moduleType: menu.moduleType,
          moduleParams: menu.moduleParams,
          requiresAuth: true
        }
      })
      
      routes.push({
        path: `${baseRoute}/:id`,
        name: `${moduleName}${menu.id}Detail`,
        component: () => import(`@/views/${moduleName}/Detail.vue`),
        props: true,
        meta: { 
          title: menu.title,
          module: moduleName,
          moduleType: menu.moduleName,
          moduleParams: menu.moduleParams,
          requiresAuth: true
        }
      })
      
      routes.push({
        path: `${baseRoute}/edit/:id?`,
        name: `${moduleName}${menu.id}Edit`,
        component: () => import(`@/views/${moduleName}/Edit.vue`),
        props: true,
        meta: { 
          title: menu.title,
          module: moduleName,
          moduleType: menu.moduleName,
          moduleParams: menu.moduleParams,
          requiresAuth: true
        }
      })
    }
  })
  
  return routes
}

// Generate dynamic routes from menu data
const dynamicRoutes = generateRoutesFromMenu(jsondata.menuDraw)

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: { requiresAuth: true },
      children: [
        // Manual routes from original configuration
        {
          path: '/thong-tin-tai-khoan',
          name: 'ThongTinTaiKhoan',
          component: () => import('@/views/ThongTinTaiKhoan.vue'),
          props: true,
          meta: { requiresAuth: true }
        },
        // Add dynamic routes as children of Home
        ...dynamicRoutes
      ]
    },
    {
      name: 'Login',
      path: '/login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    // Catch-all route for 404
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: { requiresAuth: false }
    }
  ]
})

// Router guard
router.beforeEach((to, from, next) => {
  // Kiểm tra nếu đang ở trong quá trình xác thực silent SSO
  if (window.location.href.includes('silent-check-sso')) {
    return; // Không làm gì, để Keycloak xử lý
  }

  // Kiểm tra xem route có yêu cầu xác thực không
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Nếu đã khởi tạo Keycloak
    if (isInitializedStatus()) {
      // Kiểm tra xác thực
      if (isAuthenticated()) {
        // Đã xác thực, cho phép truy cập
        next();
      } else {
        // Lưu đường dẫn hiện tại để redirect sau khi đăng nhập
        sessionStorage.setItem('auth-redirect', to.fullPath);
        next('/login');
      }
    } else {
      // Keycloak chưa khởi tạo, cho phép truy cập và để main.js xử lý
      next();
    }
  } else {
    // Route không yêu cầu xác thực, cho phép truy cập
    next();
  }
});

export default router;
