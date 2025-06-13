import { ref } from 'vue'
import axios from 'axios'

export function useDataSource() {
  const loading = ref(false)
  
  /**
   * Load data from an API endpoint
   * @param {Object} filter Configuration object with API info
   * @returns {Promise<Object>} API response data
   */
  const loadDataSource = async (filter) => {
    loading.value = true
    try {
      let apiGet = filter.api
      if (filter.api.indexOf('http') < 0) {
        apiGet = import.meta.env.VITE_APP_PATH_API + filter.api
      }
      
      let settings = {
        "url": apiGet,
        "method": "GET",
        "headers": {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        "data": {},
        "params": filter.params ? filter.params : {}
      }
      
      const response = await axios(settings)
      return response.data
    } catch (error) {
      console.error('Error loading data source:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Merges two arrays ensuring uniqueness based on property
   * @param {Array} arr1 First array
   * @param {Array} arr2 Second array
   * @param {string} propertyName Property to check uniqueness
   * @returns {Array} Merged array with unique objects
   */
  const mergeArraysByProperty = function (arr1, arr2, propertyName) {
    const propertySet = new Set(arr1.map(item => item[propertyName]))
    const uniqueObjects = arr2.filter(item => !propertySet.has(item[propertyName]))
    const mergedArray = [...arr1, ...uniqueObjects]
    return mergedArray
  }
  
  return {
    loading,
    loadDataSource,
    mergeArraysByProperty
  }
} 