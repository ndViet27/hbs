// src/composables/useFormSearchRouter.js
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getValue } from '@/helpers/index'

export function useFormSearchRouter() {
  const router = useRouter()
  const route = useRoute()
  
  // Tracking states
  const isProcessingSearch = ref(false)
  const dataInputSearchCopy = ref({})
  
  /**
   * Chuyển đổi dữ liệu form thành query params và cập nhật URL
   * @param {Object} data - Dữ liệu từ form search
   * @param {Object} options - Tùy chọn
   * @param {Object} options.dataInputSearch - State lưu dữ liệu input
   * @param {Array} options.mauTimKiem - Config form search  
   * @param {Boolean} options.isFromPathChange - Flag xác định đang xử lý path
   * @param {Number} options.currentPage - Trang hiện tại
   * @param {Number} options.pageSize - Kích thước trang
   */
  const changeFormSearch = function(data, options = {}) {
    try {
      // Destructure options với default values
      const {
        dataInputSearch = ref({}),
        mauTimKiem = ref([]),
        isFromPathChange = ref(false),
        currentPage = ref(0),
        pageSize = ref(20)
      } = options

      if (isProcessingSearch.value || isFromPathChange.value) {
        return
      }
      
      isProcessingSearch.value = true
      dataInputSearchCopy.value = { ...dataInputSearch.value, ...data }
      const currentQuery = { ...route.query }
      console.log('submit--data', data)
      for (const key in data) {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          if (Array.isArray(data[key])) {
            // Nếu là mảng, chuyển thành chuỗi ngăn cách bằng dấu phẩy
            currentQuery[key] = data[key].join(',')
          } else if (typeof data[key] === 'object') {
            // Nếu là object, lấy giá trị theo quy ước
            const fieldDef = mauTimKiem.value.find((field) => field.name === key)
            if (fieldDef && fieldDef.mapping) {
              // Sử dụng mapping để lấy giá trị
              currentQuery[key] = getValue(data[key], fieldDef.mapping)
            } else {
              // Mặc định sử dụng MaMuc hoặc id
              currentQuery[key] =
                data[key].MaMuc || data[key].id || JSON.stringify(data[key])
            }
          } else {
            // Trường hợp chuỗi hoặc số đơn giản
            currentQuery[key] = data[key]
          }
        } else {
          // Nếu giá trị là null, undefined hoặc chuỗi rỗng, xóa khỏi query
          delete currentQuery[key]
        }
      }

      // Đảm bảo giữ lại tham số trang và kích thước nếu có
      if (currentPage.value > 0) {
        currentQuery.page = currentPage.value + 1
      }
      if (pageSize.value !== 10) {
        // Giá trị mặc định
        currentQuery.size = pageSize.value
      }

      // Push vào router với query mới
      return router
        .push({
          path: route.path,
          query: currentQuery,
        })
        .finally(() => {
          isProcessingSearch.value = false
        })
    } catch (error) {
      console.error('Error in changeFormSearch:', error)
      isProcessingSearch.value = false
      throw error
    }
  }

  return {
    isProcessingSearch,
    dataInputSearchCopy,
    changeFormSearch
  }
}