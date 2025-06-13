import { ref } from 'vue'
import { useDataSource } from './useDataSource'
import { getValue } from '../utils/formatUtils'

export function useSelectInput() {
  const { loadDataSource, mergeArraysByProperty } = useDataSource()
  
  const lastFocusedItem = ref(null)
  const selectItem = ref(null)
  const indexSelect = ref(null)
  const enableKeywordSearch = ref(true)
  const searchDebounce = ref(null)
  
  const handleSelectFocus = (focused, item, index, formData, formConfig) => {
    const itemValue = item?.fieldName
    
    if (focused) {
      enableKeywordSearch.value = true
    } else {
      enableKeywordSearch.value = false
    }
    
    if (focused && lastFocusedItem.value !== itemValue) {
      lastFocusedItem.value = itemValue
      
      // Skip if item is not editable
      if (item.hasOwnProperty('edit') && !item?.edit) {
        return
      }
      
      clearTimeout(searchDebounce.value)
      selectItem.value = {...item}
      indexSelect.value = index
      
      // Handle parent-child related data sources
      if (!item.api && item.parent && item.parentMappingDataSource && formData[item.parent]) {
        formConfig[index]['dataSource'] = formData[item.parent] 
          ? formData[item.parent][item.parentMappingDataSource] 
          : []
      }
      
      // Handle dependent API data loading
      if (item.api && item.parent && focused) {
        loadDependentDataSource(item, formData, formConfig, index)
      }
      
      // Handle independent data source loading on focus
      if (item.api && !item.parent && focused) {
        loadIndependentDataSource(item, formConfig, index)
      }
    }
  }
  
  const loadDependentDataSource = (item, formData, formConfig, index) => {
    let paramsAdd = Object.assign({}, item.params)
    paramsAdd[item.parentMapping] = formData[item.parent] 
      ? (item.hasOwnProperty('valueParentMapping') 
          ? formData[item.parent][item.valueParentMapping] 
          : formData[item.parent]['MaDinhDanh']) 
      : ''
    
    item['loading'] = true
    
    loadDataSource(Object.assign(item, {params: paramsAdd}))
      .then(function(result) {
        item['loading'] = false
        let resultData = item['responseDataApi'] ? result[item['responseDataApi']] : result
        
        if (item.hasOwnProperty('propertyExt')) {
          let valuePropsExt = item.propertyExt.split(":")[1]
          let propsExtKey = item.propertyExt.split(":")[0]
          resultData.forEach(element => {
            element[propsExtKey] = getValue(element, valuePropsExt)
          })
        }
        
        formConfig[index]['dataSource'] = resultData
      })
      .catch(function(){
        item['loading'] = false
      })
  }
  
  const loadIndependentDataSource = (item, formConfig, index) => {
    let paramsAdd = Object.assign({}, item.params)
    if (paramsAdd.hasOwnProperty('keyword')) {
      paramsAdd['keyword'] = ''
    }
    
    if ((item['fieldType'] === 'select' || item['fieldType'] === 'selectbox') && 
        item.hasOwnProperty('api') && item['api']) {
      
      item['loading'] = true
      
      if (item.hasOwnProperty('params')) {
        item.params = paramsAdd
      }
      
      loadDataSource(item)
        .then(function(result) {
          item['loading'] = false
          let resultData = item['responseDataApi'] ? result[item['responseDataApi']] : result
          
          // Filter ignored items
          if (item.hasOwnProperty('ignore') && item.ignore) {
            resultData = resultData.filter(function (el) {
              return !item.ignore.includes(el[item['itemValue']])
            })
          }
          
          // Filter to only include specific items
          if (item.hasOwnProperty('filterData') && item.filterData) {
            resultData = resultData.filter(function (el) {
              return item.filterData.includes(el[item['itemValue']])
            })
          }
          
          // Add extended properties
          if (item.hasOwnProperty('propertyExt')) {
            let valuePropsExt = item.propertyExt.split(":")[1]
            let propsExtKey = item.propertyExt.split(":")[0]
            resultData.forEach(element => {
              element[propsExtKey] = getValue(element, valuePropsExt)
            })
          }
          
          formConfig[index]['dataSource'] = resultData
        })
        .catch(function(){
          item['loading'] = false
        })
    }
  }
  
  const handleSearch = (searchText, formConfig) => {
    if (!selectItem.value || !selectItem.value.hasOwnProperty('keySearch') || !searchText) {
      return
    }
    
    if (!enableKeywordSearch.value) {
      return
    }
    
    if (selectItem.value.hasOwnProperty('api') && selectItem.value.api) {
      clearTimeout(searchDebounce.value)
      
      searchDebounce.value = setTimeout(() => {
        // Skip if the item text already exists in the data source
        if (formConfig[indexSelect.value]['dataSource'].some(item => 
          item[selectItem.value['itemText']] === searchText)) {
          return
        }
        
        // Prepare API parameters
        let paramsAdd = Object.assign({}, selectItem.value.params)
        
        if (selectItem.value.parent) {
          paramsAdd[selectItem.value.parentMapping] = formData[selectItem.value.parent] 
            ? (selectItem.value.hasOwnProperty('valueParentMapping') 
                ? formData[selectItem.value.parent][selectItem.value.valueParentMapping] 
                : formData[selectItem.value.parent]['MaDinhDanh']) 
            : ''
        }
        
        if (selectItem.value['keySearch']) {
          paramsAdd[selectItem.value['keySearch']] = searchText ? searchText : ''
        }
        
        loadDataSource(Object.assign(selectItem.value, {params: paramsAdd}))
          .then(function(result) {
            let resultData = selectItem.value['responseDataApi'] 
              ? result[selectItem.value['responseDataApi']] 
              : result
            
            formConfig[indexSelect.value]['dataSource'] = mergeArraysByProperty(
              formConfig[indexSelect.value]['dataSource'], 
              resultData, 
              selectItem.value.itemValue
            )
          })
          .catch(function(){})
      }, 300) // Reduced debounce time for better responsiveness
    }
  }

  return {
    handleSelectFocus,
    handleSearch,
    lastFocusedItem,
    selectItem,
    indexSelect,
    enableKeywordSearch
  }
} 