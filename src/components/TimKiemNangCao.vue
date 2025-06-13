<script setup>
import { ref, reactive, defineAsyncComponent, watch, onMounted } from 'vue'
const VueDatePicker = defineAsyncComponent(() =>
  import("@vuepic/vue-datepicker")
);
// import '@vuepic/vue-datepicker/dist/main.css'
import axios from 'axios'
const baseURL = import.meta.env.VITE_APP_PATH_API;
const props = defineProps({
	mauNhap: {
		type: Object,
		default: {}
	},
	dataInput: {
		type: Object,
		default: {}
	},
	formType: {
		type: String,
		default: ''
	}
})

// Sử dụng ref thay vì reactive để tránh loop
const mauNhapSearch = ref(Array.isArray(props.mauNhap) ? [...props.mauNhap] : [])
const dataInputSearch = ref(props.dataInput ? {...props.dataInput} : {})
const data = ref({})
const selectItem = ref(null)
const indexSelect = ref(null)
const formTimKiem = ref(null)
const lastFocusedItem = ref(null)
const autoSubmitTimeout = ref(null)
const enableKeywordSearch = ref(true)
const isInitialized = ref(false)
const isInitializing = ref(false) // Flag để tránh việc gọi initForm đệ quy
const initSource = ref('') // Theo dõi nguồn gọi initForm
const emit = defineEmits(['submitSearch', 'changeFormSearch', 'mounted'])
const prevData = ref({})
const dataChanged = ref(false) // Flag để theo dõi thay đổi từ bên ngoài
const userInteraction = ref(false) // Flag để đánh dấu thay đổi do người dùng tương tác
const emitTimeout = ref(null) // Để debounce việc emit sự kiện

// Hàm kiểm tra xem có thể khởi tạo form hay không
const canInitializeForm = () => {
  // Đảm bảo mauNhapSearch được truyền vào và hợp lệ
  return mauNhapSearch.value && Array.isArray(mauNhapSearch.value) && mauNhapSearch.value.length > 0
}
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
const formatDataOutput = function () {
	let dataOutput = Object.assign({}, data.value)
	for (let key in mauNhapSearch.value) {
		let itemConfig = mauNhapSearch.value[key]
		if (itemConfig.type == 'date' && dataOutput[itemConfig['name']]) {
			dataOutput[itemConfig['name']] = dateLocale(dataOutput[itemConfig['name']])
		}
		if (itemConfig.type == 'daterange') {
			dataOutput[itemConfig['name']] = dateLocale(dataOutput[itemConfig['name']])
			dataOutput[itemConfig['nameTo']] = dateLocale(dataOutput[itemConfig['nameTo']])
		}
		if (itemConfig.type == 'select' && dataOutput[itemConfig['name']]) {
			if (itemConfig.multiple && Array.isArray(dataOutput[itemConfig['name']])) {
				if (itemConfig.mapping) {
					if (!itemConfig.returnObject) {
						// Nếu return-object là false, giá trị đã là giá trị primitive nên không cần mapping
						dataOutput[itemConfig['name']] = dataOutput[itemConfig['name']].toString()
					} else {
						// Nếu return-object là true hoặc không định nghĩa, mặc định trả về object nên cần mapping
						dataOutput[itemConfig['name']] = dataOutput[itemConfig['name']].map((item) => getValue(item, itemConfig.mapping)).toString()
					}
				}
			} else {
				if (itemConfig.mapping) {
					if (!itemConfig.returnObject) {
						// Nếu return-object là false, giá trị đã là giá trị primitive nên không cần mapping
						dataOutput[itemConfig['name']] = dataOutput[itemConfig['name']]
					} else {
						// Nếu return-object là true hoặc không định nghĩa, mặc định trả về object nên cần mapping
						dataOutput[itemConfig['name']] = getValue(dataOutput[itemConfig['name']], itemConfig.mapping)
					}
				}
			}
		}
	}
	console.log('dataFormOutput-2', dataOutput)
	return dataOutput
}
const submitForm = function () {
	let dataOutput = formatDataOutput()
	console.log('submitForm')
	emit('submitSearch', dataOutput)
}

const initForm = function (source = 'unknown') {
    if (isInitializing.value) {
      return
    }
    if (isInitialized.value) {
      return
    }
    if (!canInitializeForm()) {
      return
    }
    try {
      isInitializing.value = true
      initSource.value = source
      for (let key in mauNhapSearch.value) {
        let itemData = mauNhapSearch.value[key]
        if (mauNhapSearch.value[key]['defaultValue']) {
          data.value[itemData['name']] = mauNhapSearch.value[key]['defaultValue']
        }
      }
      
      if (dataInputSearch.value && Object.keys(dataInputSearch.value).length > 0) {
        data.value = {...dataInputSearch.value}
        for (let key in data.value) {
          let filter = mauNhapSearch.value.find(function (item) {
            return item.name == key
          })
          if (filter && filter.type === 'date') {
            data.value[key] = convertDate(key)
          }
					if (filter && filter.type === 'daterange') {
						data.value[filter.name] = convertDate(data.value[filter.name])
						data.value[filter.nameTo] = convertDate(data.value[filter.nameTo])
					}
          if (filter && filter.type === 'money') {
            data.value[key] = currency(data.value[key])
          }
          if (filter && filter.type === 'select') {
            // Xử lý trường select với return-object
            if (!filter['multiple']) {
              // Trường select đơn
              if (Array.isArray(data.value[key])) {
                data.value[key] = data.value[key][0]
              }
              
              // Kiểm tra và chuyển đổi giá trị nếu cần
              if (!filter.returnObject && typeof data.value[key] === 'object' && data.value[key] !== null) {
                // Nếu return-object là false nhưng giá trị là object, lấy giá trị theo mapping
                data.value[key] = filter.mapping ? getValue(data.value[key], filter.mapping) : 
                  (data.value[key][filter.itemValue] || data.value[key].id || data.value[key].MaMuc)
              }
              
              // Nếu có API, gọi API để lấy danh sách dựa trên giá trị ban đầu
              if (filter.api && (!filter.dataSource || filter.dataSource.length === 0)) {
                // Tìm index thực của filter trong mauNhapSearch.value
                const filterIndex = mauNhapSearch.value.findIndex(item => item.name === filter.name)
                const searchValue = !filter.returnObject ? data.value[filter.name] : 
                  (filter.mapping ? getValue(data.value[filter.name], filter.mapping) : 
                  (data.value[filter.name][filter.itemValue] || data.value[filter.name].id || data.value[filter.name].MaMuc || ''))
                
                if (searchValue && filterIndex !== -1) {
                  // Đánh dấu là đang tải dữ liệu
                  mauNhapSearch.value[filterIndex]['loading'] = true
                  
                  // Tạo tham số cho API
                  let paramsAdd = Object.assign({}, filter.params || {})
                  if (filter['keySearch']) {
                    paramsAdd[filter['keySearch']] = searchValue
                  }
                  
                  // Gọi API
                  loadDataSource(Object.assign({...filter}, { params: paramsAdd })).then(function (result) {
                    mauNhapSearch.value[filterIndex]['loading'] = false
                    let resultData = filter['responseDataApi'] ? 
                      (result.data && result.data[filter['responseDataApi']] ? result.data[filter['responseDataApi']] : 
                      (result[filter['responseDataApi']] || result.data || result)) : 
                      (result.data || result)
                    
                    if (Array.isArray(resultData)) {
                      mauNhapSearch.value[filterIndex]['dataSource'] = resultData
                    } else {
                      console.error('API response is not an array:', resultData)
                      mauNhapSearch.value[filterIndex]['dataSource'] = Array.isArray(resultData) ? resultData : []
                    }
                    
                    // Nếu return-object là false, đảm bảo giá trị là primitive
                    if (!filter.returnObject && typeof data.value[filter.name] === 'object') {
                      const foundItem = resultData.find(item => 
                        item[filter.itemValue] === data.value[filter.name][filter.itemValue] || 
                        item.id === data.value[filter.name].id || 
                        item.MaMuc === data.value[filter.name].MaMuc
                      )
                      if (foundItem) {
                        data.value[filter.name] = filter.mapping ? 
                          getValue(foundItem, filter.mapping) : 
                          (foundItem[filter.itemValue] || foundItem.id || foundItem.MaMuc)
                      }
                    } else if (filter.returnObject && typeof data.value[filter.name] !== 'object') {
                      // Nếu return-object là true nhưng giá trị không phải object, tìm và thay thế
                      const foundItem = resultData.find(item => 
                        filter.mapping ? 
                        getValue(item, filter.mapping) === data.value[filter.name] :
                        (item[filter.itemValue] || item.id || item.MaMuc) === data.value[filter.name]
                      )
                      if (foundItem) {
                        data.value[filter.name] = foundItem
                      }
                    }
                    
                    // Đánh dấu đã được cache
                    // mauNhapSearch.value[filterIndex]['cached'] = true
                  }).catch(function (error) {
                    mauNhapSearch.value[filterIndex]['loading'] = false
                    console.error('Error loading initial select data:', error)
                  })
                }
              }
            } else {
              // Trường select nhiều
              if (!Array.isArray(data.value[key])) {
                if (typeof data.value[key] === 'string') {
                  // Nếu là chuỗi, chuyển thành mảng
                  data.value[key] = data.value[key].split(',')
                } else {
                  // Nếu không phải mảng và không phải chuỗi, bọc vào mảng
                  data.value[key] = [data.value[key]]
                }
              }
              
              // Kiểm tra và chuyển đổi giá trị nếu cần
              if (!filter.returnObject) {
                // Đảm bảo tất cả giá trị trong mảng là primitive
                data.value[key] = data.value[key].map(item => {
                  if (typeof item === 'object' && item !== null) {
                    return filter.mapping ? getValue(item, filter.mapping) : 
                      (item[filter.itemValue] || item.id || item.MaMuc)
                  }
                  return item
                })
              }
              
              // Nếu có API và có giá trị ban đầu, gọi API với từng giá trị để lấy danh sách
              if (filter.api && (!filter.dataSource || filter.dataSource.length === 0) && data.value[key].length > 0) {
                // Tìm index thực của filter trong mauNhapSearch.value
                const filterIndex = mauNhapSearch.value.findIndex(item => item.name === filter.name)
                const searchValues = data.value[key].map(item => {
                  if (typeof item === 'object' && item !== null) {
                    return filter.mapping ? getValue(item, filter.mapping) : 
                      (item[filter.itemValue] || item.id || item.MaMuc)
                  }
                  return item
                }).join(',')
                
                if (searchValues && filterIndex !== -1) {
                  // Đánh dấu là đang tải dữ liệu
                  mauNhapSearch.value[filterIndex]['loading'] = true
                  
                  // Tạo tham số cho API
                  let paramsAdd = Object.assign({}, filter.params || {})
                  if (filter['keySearch']) {
                    paramsAdd[filter['keySearch']] = searchValues
                  }
                  
                  // Gọi API
                  loadDataSource(Object.assign({...filter}, { params: paramsAdd })).then(function (result) {
                    mauNhapSearch.value[filterIndex]['loading'] = false
                    let resultData = filter['responseDataApi'] ? 
                      (result.data && result.data[filter['responseDataApi']] ? result.data[filter['responseDataApi']] : 
                      (result[filter['responseDataApi']] || result.data || result)) : 
                      (result.data || result)
                    
                    if (Array.isArray(resultData)) {
                      mauNhapSearch.value[filterIndex]['dataSource'] = resultData
                    } else {
                      console.error('API response is not an array:', resultData)
                      mauNhapSearch.value[filterIndex]['dataSource'] = Array.isArray(resultData) ? resultData : []
                    }
                    
                    // Cập nhật giá trị nếu cần
                    if (!filter.returnObject && data.value[filter.name].some(item => typeof item === 'object')) {
                      data.value[filter.name] = data.value[filter.name].map(item => {
                        if (typeof item === 'object' && item !== null) {
                          const foundItem = resultData.find(resultItem => 
                            resultItem[filter.itemValue] === item[filter.itemValue] || 
                            resultItem.id === item.id || 
                            resultItem.MaMuc === item.MaMuc
                          )
                          return foundItem ? (filter.mapping ? 
                            getValue(foundItem, filter.mapping) : 
                            (foundItem[filter.itemValue] || foundItem.id || foundItem.MaMuc)) : item
                        }
                        return item
                      })
                    } else if (filter.returnObject && data.value[filter.name].some(item => typeof item !== 'object')) {
                      data.value[filter.name] = data.value[filter.name].map(item => {
                        if (typeof item !== 'object' || item === null) {
                          const foundItem = resultData.find(resultItem => 
                            filter.mapping ? 
                            getValue(resultItem, filter.mapping) === item :
                            (resultItem[filter.itemValue] || resultItem.id || resultItem.MaMuc) === item
                          )
                          return foundItem || item
                        }
                        return item
                      })
                    }
                    
                    // Đánh dấu đã được cache
                    // mauNhapSearch.value[filterIndex]['cached'] = true
                  }).catch(function (error) {
                    mauNhapSearch.value[filterIndex]['loading'] = false
                    console.error('Error loading initial select data for multiple select:', error)
                  })
                }
              }
            }
          }
        }
				// console.log('data.value', data.value)
      }

      isInitialized.value = true
    } catch (error) {
      console.error('Error initializing form:', error)
    } finally {
      isInitializing.value = false
    }
}

watch(
  () => props.mauNhap,
  (newMauNhap) => {
    // Chỉ xử lý khi có dữ liệu hợp lệ và chưa được khởi tạo
    if (!isInitialized.value && !isInitializing.value) {
      if (newMauNhap && (Array.isArray(newMauNhap) ? newMauNhap.length > 0 : Object.keys(newMauNhap).length > 0)) {
        mauNhapSearch.value = Array.isArray(newMauNhap) ? [...newMauNhap] : []
        // Nếu có dữ liệu mauNhap, gọi initForm
        if (mauNhapSearch.value.length > 0) {
          initForm('mauNhap-watcher')
        }
      }
    }
  },
  { deep: true, immediate: false }
)
watch(
  () => props.dataInput,
  (newDataInput) => {
    if (!isInitialized.value && !isInitializing.value) {
      if (newDataInput && Object.keys(newDataInput).length > 0) {
        dataInputSearch.value = { ...newDataInput }
      } else {
        dataInputSearch.value = {}
      }
    } else if (isInitialized.value) {
		let isHaveDefault = mauNhapSearch.value && mauNhapSearch.value.map(el => el.defaultValue).filter(el => el)
		if (isHaveDefault && isHaveDefault.length) {
			return
		}
		if (newDataInput && Object.keys(newDataInput).length > 0) {
			data.value = { ...newDataInput }
		} else {
			data.value = {}
		}
    }
  },
  { deep: true, immediate: false }
)
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
			'Content-Type': 'application/json',
		},
		"data": {},
		"params": filter.params ? filter.params : {}
	};
	
	let data = await axios(settings)
	return data
}
const mergeArraysByProperty = function (arr1, arr2, propertyName) {
	const propertySet = new Set(arr1 && arr1.length > 0 ? arr1.map(item => item[propertyName]) : [])
	const uniqueObjects = arr2 && arr2.length > 0 ? arr2.filter(item => !propertySet.has(item[propertyName])) : []
	const mergedArray = [...arr1, ...uniqueObjects]
	return mergedArray
}
const eventTimeOut = ref(null)
const selectAutocomplete = function (focused, item, index) {
  const itemValue = item?.name
	if (focused) {
		enableKeywordSearch.value = true
	} else {
		enableKeywordSearch.value = false
	}

	selectItem.value = item
	indexSelect.value = index

	if (focused && lastFocusedItem.value !== itemValue) {
		lastFocusedItem.value = itemValue;

		// Return khi focus vào field đang có thuộc tính readonly
		if (item.hasOwnProperty('readonly') && item['readonly']) {
			return
		}
		// Xử lý trường hợp có parent trước
		if (item.api && item.parent && focused) {
			clearTimeout(eventTimeOut.value)

			let paramsAdd = Object.assign({}, item.params)

			let itemParent = mauNhapSearch.value.find(el => el.name === item.parent)

			if (itemParent && itemParent.hasOwnProperty('returnObject')) {
				paramsAdd[item.parentMapping] = data.value[item.parent] ? (item.hasOwnProperty('valueParentMapping') ? data.value[item.parent][item.valueParentMapping] : data.value[item.parent]['MaDinhDanh']) : ''
			} else {
				paramsAdd[item.parentMapping] = data.value[item.parent]
			}
			// Đánh dấu là đang tải dữ liệu
			mauNhapSearch.value[index]['loading'] = true

			loadDataSource(Object.assign({...item}, {params: paramsAdd})).then(function(result) {
				mauNhapSearch.value[index]['loading'] = false
				let resultData = item['responseDataApi'] ? result.data[item['responseDataApi']] : result
				mauNhapSearch.value[index]['dataSource'] = resultData
				
				// Đánh dấu đã được cache
				mauNhapSearch.value[index]['cached'] = true
			}).catch(function(){
				mauNhapSearch.value[index]['loading'] = false
			})
		}
		// Xử lý trường hợp không có parent nhưng có API khi focus
		// else if (item.api && focused && (!item.cached || !mauNhapSearch.value[index]['dataSource'] || mauNhapSearch.value[index]['dataSource'].length == 0)) {
		else if (item.api && focused && (!item.cached)) {	

			clearTimeout(eventTimeOut.value)
			
			let paramsAdd = Object.assign({}, item.params)
			
			// Đánh dấu là đang tải dữ liệu
			mauNhapSearch.value[index]['loading'] = true
			
			loadDataSource(Object.assign({...item}, {params: paramsAdd})).then(function(result) {
				mauNhapSearch.value[index]['loading'] = false
				let resultData = item['responseDataApi'] ? result.data[item['responseDataApi']] : result
				mauNhapSearch.value[index]['dataSource'] = resultData
				
				// Đánh dấu đã được cache
				mauNhapSearch.value[index]['cached'] = true
			}).catch(function(error){
				mauNhapSearch.value[index]['loading'] = false
				console.error('Error loading data source:', error)
			})
		}
	}
}

const changeInputSelect = function (val) {
    userInteraction.value = true // Đánh dấu đây là tương tác của người dùng
    if (!selectItem.value || !selectItem.value.hasOwnProperty('keySearch') || !val) {
	} else {
		if (!enableKeywordSearch.value) {
			return
		}
		if (selectItem.value.hasOwnProperty('api') && selectItem.value.api) {
			clearTimeout(eventTimeOut.value)
			eventTimeOut.value = setTimeout(() => {
				//
				if (mauNhapSearch.value[indexSelect.value]['dataSource'] && 
					mauNhapSearch.value[indexSelect.value]['dataSource'].some(item => item[selectItem.value['itemText']] === val)) {
					return
				}
				// 
				let paramsAdd = Object.assign({}, selectItem.value.params)
				if (selectItem.value['keySearch']) {
					paramsAdd[selectItem.value['keySearch']] = val ? val : ''
				}
				
				// Đánh dấu đang tải dữ liệu
				mauNhapSearch.value[indexSelect.value]['loading'] = true
				
				loadDataSource(Object.assign({...selectItem.value}, { params: paramsAdd })).then(function (result) {
					mauNhapSearch.value[indexSelect.value]['loading'] = false
					
					let resultData = selectItem.value['responseDataApi'] ? result.data[selectItem.value['responseDataApi']] : result

					// Nếu đã có dữ liệu, merge, nếu chưa có thì gán mới
					if (mauNhapSearch.value[indexSelect.value]['dataSource'] && 
						mauNhapSearch.value[indexSelect.value]['dataSource'].length > 0) {
						mauNhapSearch.value[indexSelect.value]['dataSource'] = mergeArraysByProperty(
							mauNhapSearch.value[indexSelect.value]['dataSource'], 
							resultData, 
							selectItem.value.itemValue
						)
					} else {
						mauNhapSearch.value[indexSelect.value]['dataSource'] = resultData
					}
					
					// Đánh dấu đã được cache
					mauNhapSearch.value[indexSelect.value]['cached'] = true
				}).catch(function (error) {
					mauNhapSearch.value[indexSelect.value]['loading'] = false
					console.error('Error loading search data:', error)
				})
			}, 1000)
		}
	}
}
const formatDatePicker = (date) => {
	try {
		if (date.getDate()) {
			const day = date.getDate();
			const month = date.getMonth() + 1;
			const year = date.getFullYear();
			return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
		} else {

		}
	} catch (error) {
	}
}
const changeDatePicker = (item, name) => {
	if (item.hasOwnProperty('isDisableToField')) {
		if (data.value[item.name]) {
			data.value[item.nameTo] = Number(data.value[item.name]) +1
		} else {
			data.value[item.nameTo] = null
		}
	}
    userInteraction.value = true // Đánh dấu đây là tương tác của người dùng
	// if (item.hasOwnProperty('changeModel')) {
	// 	if (item.type === 'daterange') {
	// 		emit('changeFormSearch', item, { [`${name}`]: dateLocale(data.value[name]) })
	// 	} else if (item.type === 'yearrange') {
	// 		emit('changeFormSearch', item, { [`${name}`]: data.value[name] })
	// 	} else {
	// 		emit('changeFormSearch', item, data.value[name] ? dateLocale(data.value[name]) : '')
	// 	}
	// }
}
const openDatePicker = (open) => {
	if (open) {
		$('.v-window').css("overflow", "visible")
	} else {
		$('.v-window').css("overflow", "hidden")
	}
}
const textInputOptions = ref({
	format: 'dd/MM/yyyy'
})
const formatBirthDate = function (name) {
	let lengthDate = String(data.value[name]).trim().length
	let splitDate = String(data.value[name]).split('/')
	let splitDate2 = String(data.value[name]).split('-')
	if (lengthDate && lengthDate > 4 && splitDate.length === 3 && splitDate[2]) {
		data.value[name] = translateDate(data.value[name])
	} else if (lengthDate && lengthDate === 8) {
		let date = String(data.value[name])
		data.value[name] = date.slice(0, 2) + '/' + date.slice(2, 4) + '/' + date.slice(4, 8)
	} else if (splitDate2[1]) {
		data.value[name] = dateLocale(data.value[name])
	} else {
		// data[name] = ''
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
const resetForm = function () {
	if (formTimKiem.value) {
		data.value = {}
		formTimKiem.value.reset()
	}
}
const goBack = function () {
	window.history.back()
}

const changeModelValue = function (item, data) {
    userInteraction.value = true // Đánh dấu đây là tương tác của người dùng
	// if (item.hasOwnProperty('changeModel')) {
	// 	emit('changeFormSearch', item ,data)
	// }
	// console.log('data', item, data)
}

const changeTextModelValue = function (event, item) {
    userInteraction.value = true // Đánh dấu đây là tương tác của người dùng
	if (item.hasOwnProperty('changeModel')) {
		clearTimeout(eventTimeOut.value)
		eventTimeOut.value = setTimeout(() => {
			emit('changeFormSearch', item, event)
		}, 1000)
	}
}

const setAttributeFields = function (fieldName, value, type) {
	if (fieldName) {
		let indexField = mauNhapSearch.value.findIndex(el => el.name === fieldName) 
		if (indexField !== -1) {
			mauNhapSearch.value[indexField][type] = value
		}
	}
}

const setValue = function (value, fieldName, ignoreValue) {
    let key = fieldName
    if (ignoreValue && data.value[`${key}`] && ignoreValue.includes(data.value[`${key}`].MaMuc)) {
      return
    }
    data.value[`${key}`] = value
}

const debouncedEmitChange = (output) => {
  clearTimeout(emitTimeout.value)
  emit('changeFormSearch', output)
  emitTimeout.value = setTimeout(() => {
	console.log('debouncedEmitChange', output)
  }, 300) 
}

onMounted(() => {
  if (!isInitialized.value && !isInitializing.value) {
    mauNhapSearch.value = Array.isArray(props.mauNhap) ? [...props.mauNhap] : []
    if (mauNhapSearch.value.length > 0) {
      initForm('mounted')
    }
  }
  
  // Nếu có dataInput từ props (từ URL query)
  if (props.dataInput && Object.keys(props.dataInput).length > 0) {
    dataChanged.value = true
    data.value = {...props.dataInput}
		
    for (let key in data.value) {
      let filter = mauNhapSearch.value.find(item => item.name == key)
      if (filter) {
        if (filter.type === 'date') {
          data.value[key] = convertDate(data.value[key])
        }
				if (filter.type === 'daterange') {
					data.value[filter.name] = convertDate(data.value[filter.name])
					data.value[filter.nameTo] = convertDate(data.value[filter.nameTo])
				}
        if (filter.type === 'money') {
          data.value[key] = currency(data.value[key])
        }
        if (filter.type === 'select' && !filter['multiple']) {
          data.value[key] = Array.isArray(data.value[key]) ? data.value[key][0] : data.value[key]
        }
      }
    }
  }
  
  emit('mounted')
})


watch(
  data,
  (newVal) => {
		// console.log('data', newVal)
	const newValStr = JSON.stringify(newVal)
    const prevDataStr = JSON.stringify(prevData.value)
    if (newValStr !== prevDataStr) {
      prevData.value = JSON.parse(JSON.stringify(newVal))
      if (userInteraction.value || !dataChanged.value) {
        let dataOutput = formatDataOutput()
        debouncedEmitChange(dataOutput)
        userInteraction.value = false
      } else {
        dataChanged.value = false
      }
    }
  },
  { deep: true }
)


defineExpose({
	initForm, data, resetForm, submitForm, setAttributeFields, setValue
})
</script>

<template>
	<v-card class="mx-auto" style="overflow: initial;position: initial;" flat>
		<v-form ref="formTimKiem" lazy-validation>
			<v-row :class="formType === 'normalSearch' ? 'my-0' : 'my-0 mx-0 rounded-lg py-3'" :style="formType === 'normalSearch' ? '' : 'border: 1px solid var(--main-color)'">
				<v-col v-for="(item, index) in mauNhap" v-bind:key="index" :class="item['fieldClass']"
					class="py-0 mb-2">
					<label>{{ item.title }} </label>
					<v-text-field v-if="item.type === 'textfield'" class="flex input-form" v-model="data[item.name]"
						@update:modelValue="changeTextModelValue($event, item)"
						:placeholder="item['placeHolder']" solo dense hide-details="auto" clearable ></v-text-field>
					<v-text-field v-if="item.type === 'number'" class="flex input-form" v-model="data[item.name]"
						:placeholder="item['placeHolder']" solo dense hide-details="auto" clearable
						type="number"></v-text-field>
					<v-textarea v-if="item.type === 'textarea'" class="flex input-form" v-model="data[item.name]"
						:placeholder="item['placeHolder']" solo dense hide-details="auto" clearable
						:rows="item.hasOwnProperty('rows') ? item.rows : 3"></v-textarea>
					<v-checkbox v-if="item.type === 'checkbox'" color="var(--main-color)" class="flex" v-model="data[item.name]"
						solo dense hide-details="auto" clearable></v-checkbox>
					<v-date-picker class="flex" position="left" v-if="item.type === 'date'" select-text="Chọn"
						cancel-text="Thoát" :enable-time-picker="false" v-model="data[item.name]" text-input
						:format="formatDatePicker" placeholder="dd/mm/yyyy" :text-input-options="textInputOptions"
						auto-apply locale="vi" :day-names="['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
						@update:model-value="changeDatePicker(item, item.name)"
						@blur="changeDatePicker(item.name)" @open="openDatePicker(true)"
						@closed="openDatePicker(false)">
					</v-date-picker>
					<v-row v-if="item.type === 'daterange'">
						<v-col class="pr-0">
							<VueDatePicker class="flex" position="left" select-text="Chọn" cancel-text="Thoát"
								:enable-time-picker="false" v-model="data[item.name]" text-input
								:format="formatDatePicker" placeholder="dd/mm/yyyy"
								:text-input-options="textInputOptions" auto-apply locale="vi"
								:day-names="['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
								@update:model-value="changeDatePicker(item, item.name)"
								@blur="changeDatePicker(item.name)">
							</VueDatePicker>
						</v-col>
						<v-col class="px-0" style="width: 25px;max-width: 25px; padding-top: 15px;">
							<v-icon size="24" color="var(--main-color)">mdi-minus</v-icon>
						</v-col>
						<v-col class="pl-0">
							<VueDatePicker class="flex" position="left" select-text="Chọn" cancel-text="Thoát"
								:enable-time-picker="false" v-model="data[item.nameTo]" text-input
								:format="formatDatePicker" placeholder="dd/mm/yyyy"
								:text-input-options="textInputOptions" auto-apply locale="vi"
								:day-names="['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
								@update:model-value="changeDatePicker(item, item.nameTo)"
								@blur="changeDatePicker(item.nameTo)">
							</VueDatePicker>
						</v-col>
					</v-row>
					<v-row v-if="item.type === 'yearrange'">
						<v-col class="pr-0">
							<VueDatePicker 
								class="flex" 
								position="left" 
								select-text="Chọn" 
								cancel-text="Thoát"
								v-model="data[item.name]" text-input
								:placeholder="item['yearFromPlaceholder']"
								auto-apply 
								locale="vi"
								year-picker
								@update:model-value="changeDatePicker(item, item.name)"
								@blur="changeDatePicker(item.name)">
							</VueDatePicker>
						</v-col>
						<v-col class="px-0" style="width: 25px;max-width: 25px; padding-top: 15px;">
							<v-icon size="24" color="var(--main-color)">mdi-minus</v-icon>
						</v-col>
						<v-col class="pl-0">
							<VueDatePicker 
								class="flex" 
								position="left" 
								select-text="Chọn" 
								cancel-text="Thoát"
								v-model="data[item.nameTo]" text-input
								:placeholder="item['yearToPlaceholder']"
								auto-apply 
								locale="vi"
								year-picker
								:disabled="item.hasOwnProperty('isDisableToField')"
								@update:model-value="changeDatePicker(item, item.nameTo)"
								@blur="changeDatePicker(item.nameTo)">
							</VueDatePicker>
						</v-col>
					</v-row>
					<v-autocomplete v-if="item.type === 'select' && !item.api" class="flex input-form" hide-no-data
						v-model="data[item.name]" :items="item.dataSource" :multiple="item['multiple']"
						:item-title="item.itemText" :item-value="item.itemValue" dense solo hide-details="auto"
						@update:modelValue="changeModelValue(item, data[item.name])" :return-object="item.returnObject"
						:clearable="item.clearable">
					</v-autocomplete>
					<v-autocomplete v-if="item.type === 'select' && item.api && !item['keySearch']"
						class="flex input-form" hide-no-data v-model="data[item.name]" :items="item.dataSource"
						:multiple="item['multiple']" :item-title="item.itemText" :item-value="item.itemValue" dense solo
						hide-details="auto" :return-object="item.returnObject" :clearable="item.clearable"
						:readonly="item.hasOwnProperty('readonly') && item['readonly']"
						:loading="item.loading"
						@update:modelValue="changeModelValue(item, data[item.name])"
						@update:focused="selectAutocomplete($event, item, index)">
					</v-autocomplete>
					<v-autocomplete v-if="item.type === 'select' && item.api && item['keySearch']"
						class="flex input-form" no-data-text="Không có dữ liệu" v-model="data[item.name]" :return-object="item.returnObject"
						:items="item.dataSource" :multiple="item['multiple']" :item-title="item.itemText"
						:item-value="item.itemValue" dense solo hide-details="auto"
						:clearable="!item.hasOwnProperty('clearable') || item['clearable']"
						:readonly="item.hasOwnProperty('readonly') && item['readonly']"
						:loading="item.loading"
						@update:focused="selectAutocomplete($event, item, index)" @update:search="changeInputSelect"
						@update:modelValue="changeModelValue(item, data[item.name])">
					</v-autocomplete>
				</v-col>
				<!-- <v-col v-if="formType !== 'normalSearch'" class="py-2 px-3" cols="12" style="text-align: center;">
					<v-btn
						size="small"
						color="#DE0000"
						class="mx-0 white--text"
						variant="outlined"
						@click="resetForm"
					>
						<v-icon size="18" color="#DE0000"
							>mdi-filter-variant-remove</v-icon
						>&nbsp;Xoá bộ lọc
					</v-btn>
					<v-btn size="small" color="var(--main-color)" class="mx-0 ml-3" @click.stop="submitForm">
						<v-icon size="18" class="">mdi-magnify</v-icon>&nbsp;Tìm kiếm
					</v-btn>
				</v-col> -->
			</v-row>
			<v-row v-if="formType !== 'normalSearch'" class="my-0">
				<v-col class="py-3 px-3" cols="12" style="text-align: center;">
					<v-btn
						size="small"
						color="#DE0000"
						class="mx-0 white--text"
						variant="outlined"
						@click="resetForm"
					>
						<v-icon size="18" color="#DE0000"
							>mdi-filter-variant-remove</v-icon
						>&nbsp;Xoá bộ lọc
					</v-btn>
					<v-btn size="small" color="var(--main-color)" class="mx-0 ml-3" @click.stop="submitForm">
						<v-icon size="18" class="">mdi-magnify</v-icon>&nbsp;Tìm kiếm
					</v-btn>
				</v-col>
			</v-row>
		</v-form>
	</v-card>
</template>