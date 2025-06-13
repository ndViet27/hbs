import { ref } from 'vue'
import { dateIsoLocal } from '../utils/formatUtils'
import { useNumberFormat } from './useNumberFormat'

export function useFormProcessor() {
  const { processNumberFields } = useNumberFormat()
  
  // Process entire form data for submission
  const processFormData = (formData, formConfig) => {
    let processedData = { ...formData }
    
    // Process number fields first
    processedData = processNumberFields(processedData, formConfig)
    
    formConfig.forEach(item => {
      // Skip processing for hidden fields
      if (item.hasOwnProperty('vissibleFollow') && item.vissibleFollow.name && item['hidden']) {
        processedData[item['fieldName']] = null
        return
      }
      
      // Handle date fields
      if ((item.fieldType === 'date' || item.fieldType === 'datetime') && processedData[item['fieldName']]) {
        processedData[item['fieldName']] = dateIsoLocal(processedData[item['fieldName']])
      }
      
      // Handle date range fields
      if (item.fieldType === 'daterange') {
        processedData[item['fieldName']] = dateIsoLocal(processedData[item['fieldName']])
        processedData[item['nameTo']] = dateIsoLocal(processedData[item['nameTo']])
      }
      
      // Handle select fields
      if (item.fieldType === 'select' && processedData[item['fieldName']]) {
        processSelectField(processedData, item)
      }
      
      // Handle selectbox fields
      if (item.fieldType === 'selectbox' && processedData[item['fieldName']]) {
        processSelectBoxField(processedData, item)
      }
      
      // Handle JSON fields
      if (item.fieldType === 'json' && processedData[item['fieldName']]) {
        if (typeof(processedData[item['fieldName']]) === 'string') {
          processedData[item['fieldName']] = JSON.parse(processedData[item['fieldName']])
        }
      }
    })
    
    return processedData
  }
  
  const processSelectField = (data, item) => {
    let dataCv = Array.isArray(data[item['fieldName']]) 
      ? data[item['fieldName']] 
      : [data[item['fieldName']]]
    
    let dataArray = Array.from(dataCv, function (itemVal) {
      let itemGet = {}
      if (!item['returnObject']) {
        itemGet = itemVal
      } else {
        itemGet[item['itemText']] = itemVal[item['itemText']]
        itemGet[item['itemValue']] = itemVal[item['itemValue']]
      }
      return itemGet
    })
    
    data[item['fieldName']] = item.multiple ? dataArray : dataArray[0]
  }
  
  const processSelectBoxField = (data, item) => {
    let dataCv = Array.isArray(data[item['fieldName']]) 
      ? data[item['fieldName']] 
      : [data[item['fieldName']]]
    
    let dataArray = Array.from(dataCv, function (itemVal) {
      let itemGet = {}
      if (!item['returnObject']) {
        itemGet = itemVal
      } else {
        if (typeof(itemVal) === 'object') {
          itemGet[item['itemText']] = itemVal[item['itemText']]
          itemGet[item['itemValue']] = itemVal[item['itemValue']]
          
          if (item.hasOwnProperty('keyAddToPayload') && item.keyAddToPayload && item.keyAddToPayload.length) {
            item.keyAddToPayload.forEach(element => {
              itemGet[element] = itemVal[element]
            });
          }
        } else {
          itemGet[item['itemText']] = itemVal
          itemGet[item['itemValue']] = itemVal
        }
      }
      return itemGet
    })
    
    data[item['fieldName']] = item.multiple ? dataArray : dataArray[0]
  }
  
  // Update form visibility based on field changes
  const updateFieldVisibility = (item, formData, formConfig) => {
    if (!item.hasOwnProperty('changeUI')) return
    
    formConfig.forEach((element, index) => {
      if (element.hasOwnProperty('vissibleFollow') && element.vissibleFollow.name === item.fieldName) {
        // For boolean type comparison
        if (element.vissibleFollow.hasOwnProperty('typeBoolean')) {
          if (formData[item.fieldName] === null || formData[item.fieldName] !== element.vissibleFollow.valueCompare) {
            formConfig[index]['hidden'] = true
          } else {
            formConfig[index]['hidden'] = false
          }
        } 
        // For object property comparison
        else if (element.vissibleFollow.nameMapping) {
          if (!formData[item.fieldName] || 
              (formData[item.fieldName] && 
               element.vissibleFollow.valueCompare.indexOf(formData[item.fieldName][element.vissibleFollow.nameMapping]) < 0)) {
            formConfig[index]['hidden'] = true
          } else {
            formConfig[index]['hidden'] = false
          }
        } 
        // For simple string comparison
        else {
          if (String(element.vissibleFollow.valueCompare).indexOf(formData[item.fieldName]) < 0) {
            formConfig[index]['hidden'] = true
          } else {
            formConfig[index]['hidden'] = false
          }
        }
      }
    })
  }

  // Process formData before binding
  const processDataForBinding = (dataInput, formConfig) => {
    if (!dataInput) return {}
    
    const processedData = { ...dataInput }
    
    // Process form fields
    for (let key in processedData) {
      const field = formConfig.find(item => item.fieldName === key)
      
      if (field && (field.fieldType === 'select' || field.fieldType === 'selectbox') && !field['multiple']) {
        processedData[key] = Array.isArray(processedData[key]) ? processedData[key][0] : processedData[key]
      }
      
      if (field && field.fieldType === 'numbercurrency' && processedData[key]) {
        processedData[key] = formatNumber(processedData[key])
      }
    }
    
    return processedData
  }

  return {
    processFormData,
    updateFieldVisibility,
    processDataForBinding
  }
} 