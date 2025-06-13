<script setup>
  import { ref, toRef, reactive, onMounted, defineAsyncComponent, watch} from 'vue'
  import { vMaska } from "maska"
  
  // ---------------------------------------------
  // COMPONENT IMPORTS
  // ---------------------------------------------
  import TextInputControl from './form/TextInputControl.vue'
  import DatePickerControl from './form/DatePickerControl.vue'
  import SelectInputControl from './form/SelectInputControl.vue'
  import DateTimePickerControl from './form/DateTimePickerControl.vue'
  import DateRangePickerControl from './form/DateRangePickerControl.vue'
  import NumberCurrencyControl from './form/NumberCurrencyControl.vue'
  import MoneyControl from './form/MoneyControl.vue'
  import SelectBoxControl from './form/SelectBoxControl.vue'
  
  // ---------------------------------------------
  // COMPOSABLES
  // ---------------------------------------------
  import { useFormValidation } from '../composables/useFormValidation'
  import { useFormProcessor } from '../composables/useFormProcessor'
  import { useDatePicker } from '../composables/useDatePicker'
  import { useSelectInput } from '../composables/useSelectInput'
  import { useNumberFormat } from '../composables/useNumberFormat'
  
  // ---------------------------------------------
  // UTILS
  // ---------------------------------------------
  // import { formatDate, dateIsoLocal, formatNumber, formatThousandSeparator, getValue } from '../utils/formatUtils'
  
  // Lazy load vue-datepicker
  const VueDatePicker = defineAsyncComponent(() =>
    import("@vuepic/vue-datepicker")
  );
  
  import axios from 'axios'
  const baseURL = import.meta.env.VITE_APP_PATH_API;
  
  /**
   * FormCRUD.vue - Dynamic Form Component
   * 
   * This component creates a dynamic form based on a configuration object (mauNhap).
   * It supports various input types including text, select, date, checkbox, etc.
   * The form can be used for creating, reading, updating and deleting data (CRUD operations).
   * 
   * Key features:
   * - Dynamic field rendering based on configuration
   * - Field validation
   * - Conditional field visibility
   * - Data formatting (dates, numbers, currency)
   * - API integration for select options
   */
  
  // Use composables
  const { getRules, validateForm } = useFormValidation()
  const { processFormData, updateFieldVisibility, processDataForBinding } = useFormProcessor()
  const { getMinMaxDateConfig } = useDatePicker()
  const { handleSelectFocus, handleSearch } = useSelectInput()
  const { maskOptions } = useNumberFormat()
  
  const props = defineProps({
    typeAction: {
      type: String,
      default: 'create'
    },
    mauNhap: {
      type: Object,
      default: {}
    },
    dataInput: {
      type: Object,
      default: null
    },
    parentItem: {
      type: Object,
      default: {}
    },
    reRender: {
      type: Boolean,
      default: true
    },
    idForm: {
      type: String,
      default: ''
    },
  })
	const mauNhapForm = reactive(props.mauNhap)
  const dataInputForm = toRef(props, 'dataInput')
	const data = ref({})
  const validForm = ref(false)
  const formCrud = ref(null)
  const formContainer = ref(null)
  const selectItem = ref(null)
  const lastFocusedItem = ref(null)
  const indexSelect = ref(null)
  const itemSelectDoiTuong = ref({})
  const enableKeywordSearch = ref(true)
  const optionsMaska = { 
    mask: '9.99#.###',
    tokens: {
      9: { pattern: /[0-9]/, repeated: true },
    },
    reversed: true,
    pattern: /[\d,.]+/
  }
  const emit = defineEmits(['submitForm', 'changeModelItem', 'onChangeModel', 'emitSelectedValue', 'emitKeyupFunction'])

  /**
   * Consolidates all date formatting functions into a single utility object
   * This reduces code duplication and standardizes date formatting across the component
   */
  const dateFormatter = {
    // Format date to DD/MM/YYYY
    formatDate: (date) => {
      try {
        if (!date) return null
        if (date.getDate) {
          const day = date.getDate()
          const month = date.getMonth() + 1
          const year = date.getFullYear()
          return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
        }
      } catch (error) {
        console.warn('Date formatting error:', error)
      }
      return null
    },
    
    // Format datetime to DD/MM/YYYY HH:MM
    formatDateTime: (date) => {
      try {
        if (!date) return null
        if (date.getDate) {
          const day = date.getDate()
          const month = date.getMonth() + 1
          const year = date.getFullYear()
          const hh = date.getHours().toString().padStart(2, '0')
          const mm = date.getMinutes().toString().padStart(2, '0')
          return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hh}:${mm}`
        }
      } catch (error) {
        console.warn('DateTime formatting error:', error)
      }
      return null
    },
    
    // Convert date string to ISO format
    toIsoString: (date) => {
      if (!date) return ''
      let dateObj = new Date(date)
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      const hours = String(dateObj.getHours()).padStart(2, '0')
      const minutes = String(dateObj.getMinutes()).padStart(2, '0')
      const seconds = String(dateObj.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
    }
  }

  // Replace the individual date formatting functions
  const formatDatePicker = (date) => dateFormatter.formatDate(date)
  const formatDateTimePicker = (date) => dateFormatter.formatDateTime(date)
  const dateIsoLocal = (date) => dateFormatter.toIsoString(date)

  /**
   * Handles date picker interactions
   * @param {boolean} open - Whether the date picker is open
   * @param {Object} item - Configuration object for the date field
   */
  const openDatePicker = (open, item) => {
    if (open) {
      // Ensure form container is above other elements when date picker is open
      const formContainerEl = formContainer.value?.$el || formContainer.value
      if (formContainerEl) {
        formContainerEl.style.zIndex = '1001'
      }
      
      // Apply date configuration (min/max dates)
      if (item) {
        const dateConfig = getMinMaxDateConfig(item, data.value)
        Object.assign(item, dateConfig)
      }
    } else {
      // Reset z-index when picker closes
      const formContainerEl = formContainer.value?.$el || formContainer.value
      if (formContainerEl) {
        formContainerEl.style.zIndex = '1000'
      }
    }
  }

  /**
   * Handles select/autocomplete field focus and data loading
   * Refactored to simplify nested logic and improve readability
   * 
   * @param {boolean} focused - Whether the field is focused
   * @param {Object} item - Field configuration
   * @param {number} index - Index of the field in mauNhapForm array
   */
  const selectAutocomplete = function (focused, item) {
    const itemValue = item?.fieldName
    const indexField = mauNhapForm.findIndex(el => el.fieldName === itemValue)
    // Control keyword search behavior
    enableKeywordSearch.value = focused
    
    // Only process when field becomes focused and is different from last focused item
    if (focused && lastFocusedItem.value !== itemValue) {
      lastFocusedItem.value = itemValue
      
      // Skip if field is not editable
      if (item.hasOwnProperty('edit') && !item?.edit) {
        return
      }
      
      clearTimeout(eventTimeOut.value)
      selectItem.value = {...item}
      indexSelect.value = indexField
      
      // Handle data source from parent field
      if (handleParentDataSource(item, indexField)) {
        return // Data source handled by parent mapping
      }
      
      // Load data from API if needed
      if (shouldLoadDataFromApi(item, focused)) {
        loadDataForSelectField(item, indexField)
      }
    }
  }

  /**
   * Checks and loads data source from a parent field if configured
   * @param {Object} item - Field configuration
   * @param {number} index - Index in mauNhapForm
   * @returns {boolean} True if parent data source was handled
   */
  const handleParentDataSource = function(item, index) {
    if (!item.api && item.parent && item.parentMappingDataSource && data.value[item.parent]) {
      mauNhapForm[index]['dataSource'] = data.value[item.parent] 
        ? data.value[item.parent][item.parentMappingDataSource] 
        : []
      return true
    }
    
    if (item.api && item.parent) {
      let paramsAdd = Object.assign({}, item.params)
      
      // Get parent value for API parameter
      paramsAdd[item.parentMapping] = data.value[item.parent] 
        ? (item.hasOwnProperty('valueParentMapping') 
            ? data.value[item.parent][item.valueParentMapping] 
            : data.value[item.parent]['MaDinhDanh']) 
        : ''
        
      item['loading'] = true
      
      loadDataSource(Object.assign(item, {params: paramsAdd}))
        .then(function(result) {
          item['loading'] = false
          let resultData = item['responseDataApi'] ? result.data[item['responseDataApi']] : result
          
          // Handle property extension if needed
          processDataWithPropertyExt(item, resultData)
          
          mauNhapForm[index]['dataSource'] = resultData
        })
        .catch(function(error){
          console.log(error)
          item['loading'] = false
        })
        
      return true
    }
    
    return false
  }

  /**
   * Determines if data should be loaded from API for a select field
   * @param {Object} item - Field configuration
   * @param {boolean} focused - Whether field is focused
   * @returns {boolean} True if API data should be loaded
   */
  const shouldLoadDataFromApi = function(item, focused) {
    return (item.api && !item.parent && focused &&
           (item['fieldType'] === 'select' || item['fieldType'] === 'selectbox'))
  }

  /**
   * Loads data from API for a select field
   * @param {Object} item - Field configuration
   * @param {number} index - Index in mauNhapForm
   */
  const loadDataForSelectField = function(item, index) {
    let paramsAdd = Object.assign({}, item.params)
    
    if (paramsAdd.hasOwnProperty('keyword')) {
      paramsAdd['keyword'] = ''
    }
    
    item['loading'] = true
    
    if (item.hasOwnProperty('params')) {
      item.params = paramsAdd
    }
  
    loadDataSource(item)
      .then(function(result) {
        item['loading'] = false
				let resultData = item['responseDataApi'] ? result.data[item['responseDataApi']] : result
        
        // Apply filters if needed
        resultData = applyDataFilters(item, resultData)
        
        // Process property extensions
        processDataWithPropertyExt(item, resultData)

        mauNhapForm[index]['dataSource'] = resultData
      })
      .catch(function(error){
        console.log(error)
        item['loading'] = false
      })
  }

  /**
   * Applies configured filters to select field data
   * @param {Object} item - Field configuration
   * @param {Array} resultData - Data to filter
   * @returns {Array} Filtered data
   */
  const applyDataFilters = function(item, resultData) {
    let filteredData = resultData
    
    // Filter out ignored values
    if (item.hasOwnProperty('ignore') && item.ignore) {
      filteredData = filteredData.filter(function (el) {
        return !item.ignore.includes(el[item['itemValue']])
      })
    }
    
    // Filter to only include specified values
    if (item.hasOwnProperty('filterData') && item.filterData) {
      filteredData = filteredData.filter(function (el) {
        return item.filterData.includes(el[item['itemValue']])
      })
    }
    
    return filteredData
  }

  /**
   * Processes property extensions for data items
   * @param {Object} item - Field configuration
   * @param {Array} resultData - Data to process
   */
  const processDataWithPropertyExt = function(item, resultData) {
    if (item.hasOwnProperty('propertyExt')) {
      let valuePropsExt = item.propertyExt.split(":")[1]
      let propsExtKey = item.propertyExt.split(":")[0]
      
      resultData.forEach(element => {
        element[propsExtKey] = getValue(element, valuePropsExt)
      })
    }
  }

  /**
   * Handles typing in a select field to search for options
   * @param {string} val - Current search value
   */
  const changeInputSelect = function (val) {
    if (!selectItem.value || !selectItem.value.hasOwnProperty('keySearch') || !val) {
      return
    }
    
    if (!enableKeywordSearch.value) {
      return
    }
    
    if (selectItem.value.hasOwnProperty('api') && selectItem.value.api) {
      // Debounce API calls
      clearTimeout(eventTimeOut.value)
      eventTimeOut.value = setTimeout(() => {
        // Skip if the value already exists in the options
        if (mauNhapForm[indexSelect.value]['dataSource'].some(
            item => item[selectItem.value['itemText']] === val)) {
          return
        }
        
        // Prepare parameters for API call
        let paramsAdd = Object.assign({}, selectItem.value.params)
        
        // Add parent value if needed
        if (selectItem.value.parent) {
          paramsAdd[selectItem.value.parentMapping] = data.value[selectItem.value.parent] 
            ? (selectItem.value.hasOwnProperty('valueParentMapping') 
                ? data.value[selectItem.value.parent][selectItem.value.valueParentMapping] 
                : data.value[selectItem.value.parent]['MaDinhDanh']) 
            : ''
        }
        
        // Add search keyword
        if (selectItem.value['keySearch']) {
          paramsAdd[selectItem.value['keySearch']] = val ? val : ''
        }
        
        // Load and merge the results
        loadDataSource(Object.assign(selectItem.value, {params: paramsAdd}))
          .then(function(result) {
            let resultData = selectItem.value['responseDataApi'] 
              ? result.data[selectItem.value['responseDataApi']] 
              : result
              
            mauNhapForm[indexSelect.value]['dataSource'] = mergeArraysByProperty(
              mauNhapForm[indexSelect.value]['dataSource'], 
              resultData, 
              selectItem.value.itemValue
            )
          })
          .catch(function(){})
      }, 1000)
    }
  }

  const loadDataSource = async (filter) => {
      let apiGet = filter.api
			if (filter.api.indexOf('http') < 0) {
				apiGet = baseURL + filter.api
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
			};
			let data = await axios(settings)
			return data
    }

  const handlePressEnter = function (item) {
    if (item.hasOwnProperty('emitKeyup')) {
      emit('emitKeyupFunction', item)
    }
  }

  const changeTextModelValue = function (event, item) {
    if (item.hasOwnProperty('emitEvent')) {
      let data = event
      emit('onChangeModel', data, item) 
    }
    if (item.hasOwnProperty('toUpperCaseFirstWord')) {
      if (event) {
        let formatValue = String(event).toLowerCase() // Convert everything to lowercase
        .replace(/(^|\s)\S/g, function (char) {
            return char.toUpperCase(); // Capitalize only the first character after a space or at the start
        });
        data.value[item.fieldName] = formatValue
      }
    }
  }
  const changeModelValue = function (item, data) {
    // let index = mauNhapForm.findIndex(el => el.fieldName === item.fieldName)
    if (item.hasOwnProperty("isResetWhenChangeValue")) {
      if (data.value.hasOwnProperty("DiaChi_HuyenQuan"))
        data.value["DiaChi_HuyenQuan"] = null;
      if (data.value.hasOwnProperty("DiaChi_XaPhuong"))
        data.value["DiaChi_XaPhuong"] = null;
    }
    if (item.hasOwnProperty('emitChangeModelItem')) {
      emit('changeModelItem', item, data)
    }
    if (item.hasOwnProperty('changeUI')) {
      mauNhapForm.forEach((element, index) => {
        if (element.hasOwnProperty('vissibleFollow') && element.vissibleFollow.name === item.fieldName) {
          if (element.vissibleFollow.nameMapping) {
            if (!data.value[item.fieldName] || (data.value[item.fieldName] && element.vissibleFollow.valueCompare.indexOf(data.value[item.fieldName][element.vissibleFollow.nameMapping])) < 0) {
              mauNhapForm[index]['hidden'] = true
            } else {
              mauNhapForm[index]['hidden'] = false
            }
          } else if (element.vissibleFollow.hasOwnProperty('typeBoolean')) {
            if (data.value[item.fieldName] === null || data.value[item.fieldName] !== element.vissibleFollow.valueCompare) {
              mauNhapForm[index]['hidden'] = true
            } else {
              mauNhapForm[index]['hidden'] = false
            }
          } else {
            if (String(element.vissibleFollow.valueCompare).indexOf(data.value[item.fieldName]) < 0) {
              mauNhapForm[index]['hidden'] = true
            } else {
              mauNhapForm[index]['hidden'] = false
            }
          }
        }
      })
    }
    if (item.hasOwnProperty('changeModel') && item.changeModel['modelChange']) {
      data.value[item.changeModel['modelChange']] = data.value[item['fieldName']][item.changeModel['valueMapping']]
    }
  }
  const eventTimeOut = ref(null)
  const textInputOptions = ref({
    format: 'dd/MM/yyyy'
  })
  const textInputOptionsDateTime = ref({
    format: 'dd/MM/yyyy HH:mm'
  })
  const getValue = function (obj, key) {
    const keys = key.split('.')
    let value = obj
    for (let i = 0; i < keys.length; i++) {
      if (value && typeof value === 'object' && keys[i] in value) {
        value = value[keys[i]]
      } else {
        return ''
      }
    }
    return value
  }
	const initForm = async function (type) {
    // console.log('dataInputForm.value-initForm', dataInputForm.value)
    await formCrud.value.reset()
    await formCrud.value.resetValidation()
		for (let key in mauNhapForm) {
			let itemData = mauNhapForm[key]
      if (mauNhapForm[key]['defaultValue']) {
        if (mauNhapForm[key]['defaultValue'] === 'currentDate') {
          data.value[itemData['fieldName']] = new Date()
        } else {
          data.value[itemData['fieldName']] = mauNhapForm[key]['defaultValue']
        }
      }
      if (mauNhapForm[key]['defaultValueToDate']) {
        if (mauNhapForm[key]['defaultValueToDate'] === 'currentDate') {
          data.value[itemData['nameTo']] = new Date()
        } else {
          data.value[itemData['nameTo']] = mauNhapForm[key]['defaultValueToDate']
        }
      }
		}
		if (dataInputForm.value && Object.keys(dataInputForm.value).length) {
			data.value = Object.assign({}, dataInputForm.value)
			for (let key in data.value) {
				let filter = mauNhapForm.find(function (item) {
					return item.fieldName == key
				})
				if (filter && filter.fieldType === 'select' && !filter['multiple']) {
					data.value[key] = Array.isArray(data.value[key]) ? data.value[key][0] : data.value[key]
				}
        if (filter && filter.fieldType === 'numbercurrency' && data.value[key]) {
          data.value[key] = formatNumber(data.value[key])
        }
			}
      // check hiển thị theo trường dữ liệu cấu hình
      for (let key in mauNhapForm) {
        let item = mauNhapForm[key]
        if (item.hasOwnProperty('changeUI')) {
          mauNhapForm.forEach((element, index) => {
            if (element.hasOwnProperty('vissibleFollow') && element.vissibleFollow.name === item.fieldName) {
              if (element.vissibleFollow.hasOwnProperty('typeBoolean')) {
                if (dataInputForm.value[item.fieldName] === null || dataInputForm.value[item.fieldName] !== element.vissibleFollow.valueCompare) {
                  mauNhapForm[index]['hidden'] = true
                } else {
                  mauNhapForm[index]['hidden'] = false
                }
              } else {
                if (!dataInputForm.value[item.fieldName] || element.vissibleFollow.valueCompare.indexOf(dataInputForm.value[item.fieldName][element.vissibleFollow.nameMapping]) < 0) {
                  mauNhapForm[index]['hidden'] = true
                } else {
                  mauNhapForm[index]['hidden'] = false
                }
              }
            }
          })
        }
      }
      // 
      setTimeout(function () {
        if (formCrud.value) {
          formCrud.value.resetValidation()
        }
      }, 200)
		} else {
      setTimeout(function () {
        // formCrud.value.reset()
        if (formCrud.value) {formCrud.value.resetValidation()}
      }, 200)
		}
	}
  const bindData = async function () {
    if (dataInputForm.value) {
			data.value = Object.assign({}, dataInputForm.value)
			for (let key in data.value) {
				let filter = mauNhapForm.find(function (item) {
					return item.fieldName == key
				})
				if (filter && (filter.fieldType === 'select' || filter.fieldType === 'selectbox') && !filter['multiple']) {
					data.value[key] = Array.isArray(data.value[key]) ? data.value[key][0] : data.value[key]
				}
			}
      // check hiển thị theo trường dữ liệu cấu hình
      for (let key in mauNhapForm) {
        let item = mauNhapForm[key]
        if (item.hasOwnProperty('changeUI')) {
          mauNhapForm.forEach((element, index) => {
            if (element.hasOwnProperty('vissibleFollow') && element.vissibleFollow.name === item.fieldName) {
              if (element.vissibleFollow.hasOwnProperty('typeBoolean')) {
                if (dataInputForm.value[item.fieldName] === null || dataInputForm.value[item.fieldName] !== element.vissibleFollow.valueCompare) {
                  mauNhapForm[index]['hidden'] = true
                } else {
                  mauNhapForm[index]['hidden'] = false
                }
              } else {
                if (!dataInputForm.value[item.fieldName] || element.vissibleFollow.valueCompare.indexOf(dataInputForm.value[item.fieldName][element.vissibleFollow.nameMapping]) < 0) {
                  mauNhapForm[index]['hidden'] = true
                } else {
                  mauNhapForm[index]['hidden'] = false
                }
              }
            }
          })
        }
      }
      // 
      setTimeout(function () {
        if (formCrud.value) {formCrud.value.resetValidation()}
      }, 100)
		}
  }
  const customFilter = {
    "LoaiHoSoNghiepVu": function (itemTitle, queryText, item) {
      const textOne = item.raw.MaMuc.toLowerCase()
      const textTwo = item.raw.TenMuc.toLowerCase()
      const searchText = queryText.toLowerCase()
      return textOne.indexOf(searchText) > -1 || textTwo.indexOf(searchText) > -1
    }
  }
	const translateDate = function (date) {
		if (!date) return null
		const [day, month, year] = date.split('/')
		return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
	}
	const dateLocale = function (dateInput) {
		if (!dateInput) return ''
		let date = new Date(dateInput)
		return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
	}
	const convertDate = function (date) {
		if (!date) return ''
		const [day, month, year] = date.split('/')
		let ddd = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
		return (new Date(ddd)).getTime()
	}
  const deleteItem = function (item, index) {
    if (item.multiple) {
      data.value[item.fieldName].splice(index, 1)
    } else {
      data.value[item.fieldName] = null
    }
    if (itemSelectDoiTuong.value.hasOwnProperty('emitSelectedValue')) {
      emit('emitSelectedValue', data.value[item.fieldName])
    }
  }
	const resetForm = function () {
		formCrud.value.reset()
		formCrud.value.resetValidation()
	}
  const resetFormValidation = function () {
		formCrud.value.resetValidation()
	}
  
  /**
   * Number formatting utilities
   * Consolidates all number/currency formatting functions
   */
  const numberFormatter = {
    /**
     * Formats a number with thousand separators
     * @param {string|number} value - The value to format
     * @returns {string} Formatted number with thousand separators
     */
    formatThousand: (value) => {
      if (!value) return ""
      let strValue = typeof value === "string" ? value : BigInt(value).toString()
      let parts = strValue.split(".")
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      return parts.join(",")
    },

    /**
     * Formats a general number for display
     * @param {string|number} value - The value to format
     * @returns {string} Formatted number
     */
    // formatNumber: (value) => {
    //   if (!value) return ""
    //   value = String(value).replace(/[^\d.,]/g, "")
    //   const parts = value.split(",")
    //   if (parts[0].length >= 4) {
    //     parts[0] = parts[0].includes(".")
    //       ? numberFormatter.formatThousand(parts[0])
    //       : numberFormatter.formatThousand(parts[0].replace(/\./g, ""))
    //   }
    //   return parts.join(",")
    // }
  }

  // Reuse the utility functions
  // const formatThousandSeparator = numberFormatter.formatThousand
  // const formatNumber = numberFormatter.formatNumber

  /**
   * Handles input for money/currency fields
   * Ensures proper formatting with thousand separators
   * @param {string} key - Field name in the data object
   */
  const handleInput = function (key) {
    let newValue = data.value[key]
    newValue = formatNumber(newValue.includes(".") ? newValue.replace(/[.]/g, "") : newValue)
    
    // Validate input to only allow numbers, commas and dots
    const isValidInput = /^[0-9.,]*$/.test(newValue) || newValue === ""
    if (isValidInput) {
      data.value[key] = newValue
    } else {
      // Strip invalid characters
      data.value[key] = data.value[key].replace(/[^\d.,]/g, "")
    }
  }

  /**
   * Handles input for number currency fields
   * Similar to handleInput but with special handling for decimal part
   * @param {string} key - Field name in the data object
   */
  const handleInputNumberCurrency = function (key) {
    let newValue = data.value[key]
    newValue = String(newValue).replace(/[^\d.,]/g, "")
    
    // Special handling for the decimal part
    const commaIndex = newValue.indexOf(",")
    if (commaIndex !== -1) {
      newValue =
        newValue.slice(0, commaIndex + 1) +
        newValue.slice(commaIndex + 1).replace(/,/g, "")
    }
    
    newValue = formatNumber(newValue.replace(/\./g, ""))
    
    // Validate input
    const isValidInput = /^[0-9.,]*$/.test(newValue) || newValue === ""
    if (isValidInput) {
      data.value[key] = newValue
    } else {
      data.value[key] = data.value[key].replace(/[^\d.,]/g, "")
    }
  }
  
	const goBack = function () {
		window.history.back()
	}
  const setValue = function (value, fieldName, ignoreValue) {
    let key = fieldName
    if (ignoreValue && data.value[`${key}`] && ignoreValue.includes(data.value[`${key}`].MaMuc)) {
      return
    }
    data.value[`${key}`] = value
  }
  const setAttributeFields = function (fieldName, value, type) {
    if (fieldName) {
      let indexField = mauNhapForm.findIndex(el => el.fieldName === fieldName) 
      if (indexField !== -1) {
        mauNhapForm[indexField][type] = value
      }
    }
  }
  const setDataSource = function (dataSource, fieldName) {
    let indexField = mauNhapForm.findIndex(el => el.fieldName === fieldName)
    if (indexField !== -1) {
      Object.assign(mauNhapForm[indexField], {...mauNhapForm[indexField], dataSource: dataSource})
    } 
    // let key = fieldName
    
    // data.value[`${key}`] = value
  }
  const handleResetValidate = async function () {
    await formCrud.value.resetValidation()
  }

  /**
   * Processes and submits form data
   * Formats data according to field types before submission
   * 
   * @returns {Object} Processed data ready for submission
   */
  const submit = function (type) {
    let dataOutput = Object.assign({}, data.value)
    
    // Process each field according to its type
    for (let key in mauNhapForm) {
      const itemConfig = mauNhapForm[key]
      
      // Skip processing if field is hidden by conditions
      if (isHiddenField(itemConfig)) {
        dataOutput[itemConfig['fieldName']] = null
        continue
      }
      
      // Process by field type
      processFieldByType(itemConfig, dataOutput)
    }
    
    return dataOutput
  }
  
  /**
   * Checks if a field is hidden due to visibility conditions
   * @param {Object} itemConfig - Field configuration
   * @returns {boolean} True if field is hidden
   */
  const isHiddenField = function(itemConfig) {
    return itemConfig.hasOwnProperty('vissibleFollow') && 
           itemConfig.vissibleFollow.name && 
           itemConfig['hidden']
  }
  
  /**
   * Processes a field value based on its type
   * @param {Object} itemConfig - Field configuration
   * @param {Object} dataOutput - Data object to modify
   */
  const processFieldByType = function(itemConfig, dataOutput) {
    const fieldName = itemConfig['fieldName']
    const fieldType = itemConfig.fieldType
    const fieldValue = dataOutput[fieldName]
    
    // Skip processing if no value
    if (!fieldValue && fieldType !== 'number') return
    
    switch (fieldType) {
      case 'date':
      case 'datetime':
        dataOutput[fieldName] = dateIsoLocal(fieldValue)
        break
        
      case 'daterange':
        dataOutput[fieldName] = dateIsoLocal(fieldValue)
        dataOutput[itemConfig['nameTo']] = dateIsoLocal(dataOutput[itemConfig['nameTo']])
        break
        
      case 'select':
        processSelectField(itemConfig, dataOutput)
        break
        
      case 'selectbox':
        processSelectBoxField(itemConfig, dataOutput)
        break
        
      case 'money':
        dataOutput[fieldName] = fieldValue.toString().replace(/\./g, "")
        break
        
      case 'numbercurrency':
        dataOutput[fieldName] = fieldValue.toString().replace(/\./g, "").replace(/,/g, ".")
        break
        
      case 'number':
        dataOutput[fieldName] = String(fieldValue) && !isNaN(fieldValue) ? Number(fieldValue) : 0
        break
        
      case 'json':
        if (typeof(fieldValue) === 'string') {
          dataOutput[fieldName] = JSON.parse(fieldValue)
        }
        break
    }
  }
  
  /**
   * Processes select field values
   * @param {Object} itemConfig - Field configuration
   * @param {Object} dataOutput - Data object to modify
   */
  const processSelectField = function(itemConfig, dataOutput) {
    const fieldName = itemConfig['fieldName']
    const fieldValue = dataOutput[fieldName]
    
    if (!fieldValue) return
    
    let dataCv = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
    let dataArray = Array.from(dataCv, function (item) {
      let itemGet = {}
      if (!itemConfig['returnObject']) {
        itemGet = item
      } else {
        itemGet[itemConfig['itemText']] = item[itemConfig['itemText']]
        itemGet[itemConfig['itemValue']] = item[itemConfig['itemValue']]
      }
      return itemGet
    })
    
    dataOutput[fieldName] = itemConfig.multiple ? dataArray : dataArray[0]
  }
  
  /**
   * Processes selectbox field values
   * @param {Object} itemConfig - Field configuration
   * @param {Object} dataOutput - Data object to modify
   */
  const processSelectBoxField = function(itemConfig, dataOutput) {
    const fieldName = itemConfig['fieldName']
    const fieldValue = dataOutput[fieldName]
    
    if (!fieldValue) return
    
    let dataCv = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
    let dataArray = Array.from(dataCv, function (item) {
      let itemGet = {}
      if (!itemConfig['returnObject']) {
        itemGet = item
      } else {
        if (typeof(item) === 'object') {
          itemGet[itemConfig['itemText']] = item[itemConfig['itemText']]
          itemGet[itemConfig['itemValue']] = item[itemConfig['itemValue']]
          
          // Add additional payload keys if configured
          if (itemConfig.hasOwnProperty('keyAddToPayload') && 
              itemConfig.keyAddToPayload && 
              itemConfig.keyAddToPayload.length) {
            itemConfig.keyAddToPayload.forEach(element => {
              itemGet[element] = item[element]
            })
          }
        } else {
          itemGet[itemConfig['itemText']] = item
          itemGet[itemConfig['itemValue']] = item
        }
      }
      return itemGet
    })
    
    dataOutput[fieldName] = itemConfig.multiple ? dataArray : dataArray[0]
  }
  
  const validateFormData = async function () {
    return await validateForm(formCrud.value, data.value, mauNhapForm)
  }
  
  onMounted(async () => {
    initForm()
  })
  watch(dataInputForm, async(val) => {
    // console.log('dataInputForm', val)
    bindData()
  }, { deep: true })

	defineExpose({
		initForm, 
    bindData, 
    resetForm, 
    resetFormValidation, 
    validateForm: validateFormData, 
    submit, 
    data, 
    setValue, 
    setDataSource, 
    setAttributeFields, 
    handleResetValidate
	})
</script>

<template>
	<v-card
		class="mx-auto form-dynamic" 
		:class="`formDynamic_${props.idForm}`"
		flat
		ref="formContainer"
	>
		<v-form
			ref="formCrud"
			lazy-validation
			class="py-0"
			v-model="validForm"
      @submit.prevent=""
		>
			<v-row class="my-0">
        <template v-for="(itemInput, index) in mauNhap">
          <v-col
            :key="index"
            :class="itemInput['fieldClass'] ? itemInput['fieldClass'] : 'v-col-12'"
            class="py-0 mb-2" v-if="!itemInput.hasOwnProperty('hidden') || (itemInput.hasOwnProperty('hidden') && !itemInput.hidden)"
          >
            <label :style="itemInput['labelStyle'] ? itemInput['labelStyle'] : ''">{{itemInput.fieldLabel}} <span style="color: red" v-if="itemInput.required">(*)</span></label>
            <TextInputControl
              v-if="itemInput.fieldType === 'text'"
              v-model="data[itemInput.fieldName]"
              :item-config="itemInput"
              :rules="getRules(itemInput, data)"
              @changeTextModelValue="changeTextModelValue"
              @keyup:enter="handlePressEnter"
            />
            <v-text-field
              v-if="itemInput.fieldType === 'email'"
              class="w-100 input-form"
              v-model="data[itemInput.fieldName]"
              :placeholder="itemInput['placeHolder']"
              solo
              dense
              hide-details="auto"
              :clearable="!itemInput.hasOwnProperty('edit') || itemInput['edit']"
              :required="itemInput.required"
              :rules="getRules(itemInput, data)"
              :readonly="itemInput.hasOwnProperty('edit') && !itemInput['edit']"
            ></v-text-field>
            <v-text-field
              v-if="itemInput.fieldType === 'phone'"
              class="w-100 input-form"
              v-model="data[itemInput.fieldName]"
              :placeholder="itemInput['placeHolder']"
              solo
              dense
              hide-details="auto"
              :clearable="!itemInput.hasOwnProperty('edit') || itemInput['edit']"
              :required="itemInput.required"
              :rules="getRules(itemInput)"
              :readonly="itemInput.hasOwnProperty('edit') && !itemInput['edit']"
            ></v-text-field>
            <v-text-field
              v-if="itemInput.fieldType === 'number'"
              class="w-100 input-form"
              v-model="data[itemInput.fieldName]"
              :placeholder="itemInput['placeHolder']"
              solo
              dense
              hide-details="auto"
              :clearable="!itemInput.hasOwnProperty('edit') || itemInput['edit']"
              type="number"
              :required="itemInput.required"
              :rules="getRules(itemInput)"
              @keyup.enter.prevent="handlePressEnter(itemInput)"
              @update:modelValue="changeTextModelValue($event, itemInput)"
              :readonly="itemInput.hasOwnProperty('edit') && !itemInput['edit']"
            ></v-text-field>
            <v-text-field
              v-if="itemInput.fieldType === 'money'"
              class="w-100 input-form"
              v-model="data[itemInput.fieldName]"
              :placeholder="itemInput['placeHolder']"
              solo
              dense
              hide-details="auto"
              :clearable="!itemInput.hasOwnProperty('edit') || itemInput['edit']"
              :required="itemInput.required"
              :rules="getRules(itemInput)"
              :readonly="itemInput.hasOwnProperty('edit') && !itemInput['edit']"
              @input="handleInput(itemInput.fieldName)"
              v-maska:[optionsMaska]
            ></v-text-field>
            <v-text-field
              v-if="itemInput.fieldType === 'numbercurrency'"
              class="w-100 input-form"
              v-model="data[itemInput.fieldName]"
              :placeholder="itemInput['placeHolder']"
              solo
              dense
              hide-details="auto"
              :clearable="!itemInput.hasOwnProperty('edit') || itemInput['edit']"
              :required="itemInput.required"
              :rules="getRules(itemInput)"
              :readonly="itemInput.hasOwnProperty('edit') && !itemInput['edit']"
              @input="handleInputNumberCurrency(itemInput.fieldName)"
            ></v-text-field>
            <v-textarea
              v-if="itemInput.fieldType === 'textarea'"
              class="w-100 input-form"
              v-model="data[itemInput.fieldName]"
              :placeholder="itemInput['placeHolder']"
              solo
              dense
              hide-details="auto"
              :clearable="!itemInput.hasOwnProperty('edit') || itemInput['edit']"
              :rows="itemInput.hasOwnProperty('rows') ? itemInput.rows : 3"
              :readonly="itemInput.hasOwnProperty('edit') && !itemInput['edit']"
              :required="itemInput.required"
              @update:modelValue="changeTextModelValue($event, itemInput)"
              :rules="getRules(itemInput)"
            ></v-textarea>
            <v-checkbox v-if="itemInput.fieldType === 'checkbox'" color="var(--main-color)" :label="itemInput.label" hide-details
              :value="true" v-model="data[itemInput.fieldName]" @update:modelValue="changeModelValue(itemInput, data[itemInput.fieldName])"
            ></v-checkbox>
            <v-radio-group v-if="itemInput.fieldType === 'yesno'" :disabled="itemInput.hasOwnProperty('edit') && !itemInput['edit']" inline v-model="data[itemInput.fieldName]" hide-details @update:modelValue="changeModelValue(itemInput, data[itemInput.fieldName])">
              <v-radio :label="itemInput.hasOwnProperty('labelTrue') ? itemInput.labelTrue : 'Có'" :value="true" color="var(--main-color)" class="mr-3"></v-radio>
              <v-radio :label="itemInput.hasOwnProperty('labelFalse') ? itemInput.labelFalse : 'Không'" :value="false" color="var(--main-color)"></v-radio>
            </v-radio-group>
            <v-radio-group v-if="itemInput.fieldType === 'radiogroup'" inline v-model="data[itemInput.fieldName]" hide-details>
              <v-radio v-for="(option, indexOption) in itemInput['options']" :key="indexOption" :label="option?.label" :value="option?.value" color="var(--main-color)" class="mr-3"></v-radio>
            </v-radio-group>
            <DatePickerControl
              v-if="itemInput.fieldType === 'date'"
              v-model="data[itemInput.fieldName]"
              :item-config="itemInput"
              :form-id="props.idForm"
              @open-date-picker="openDatePicker"
              @close-date-picker="openDatePicker(false)"
            />

            <DateTimePickerControl 
              v-if="itemInput.fieldType === 'datetime'"
              v-model="data[itemInput.fieldName]"
              :item-config="itemInput"
              @open-date-picker="openDatePicker"
              @close-date-picker="openDatePicker(false)"
            />

            <DateRangePickerControl 
              v-if="itemInput.fieldType === 'daterange'"
              :modelValueFrom="data[itemInput.fieldName]"
              :modelValueTo="data[itemInput.nameTo]" 
              :item-config="itemInput"
              @update:modelValueFrom="data[itemInput.fieldName] = $event"
              @update:modelValueTo="data[itemInput.nameTo] = $event"
              @open-date-picker="openDatePicker"
              @close-date-picker="openDatePicker(false)"
            />
            
            <SelectInputControl 
              v-if="itemInput.fieldType === 'select'"
              v-model="data[itemInput.fieldName]"
              :item-config="itemInput"
              :rules="getRules(itemInput, data)"
              @update:focused="selectAutocomplete"
              @update:search="changeInputSelect"
              @change-model-value="changeModelValue"
            />

            <SelectBoxControl
              v-if="itemInput.fieldType === 'selectbox'"
              v-model="data[itemInput.fieldName]"
              :item-config="itemInput"
              :rules="getRules(itemInput, data)"
              @update:focused="selectAutocomplete"
              @update:search="changeInputSelect"
              @change-model-value="changeModelValue"
            />

            <div class="w-100" style="width: 100%;" v-if="itemInput.fieldType === 'breakRow'"></div>

          </v-col>
        </template>
			</v-row>
		</v-form>
	</v-card>

</template>
<style>
  /* .ck.ck-editor {
    max-width: 705px;
  } */
  .ck-content ol {
    margin-left: 30px !important;
    margin-right: 30px !important
  }
  .ck.ck-content.ck-editor__editable {
    /* max-width: 705px; */
    padding-left: 25.4mm;
    padding-right: 25.4mm;
    box-sizing: border-box;
  }
  .form-dynamic {
    overflow: visible;
    z-index: 1000;
    width: 100%;
  }

  .required-mark {
    color: red;
  }

  .width-100 {
    width: 100%;
  }

  .flex {
    display: flex;
    width: 100%;
  }
</style>