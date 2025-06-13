import { formatNumber, formatThousandSeparator } from '../utils/formatUtils'

export function useNumberFormat() {
  const maskOptions = {
    mask: '9.99#.###',
    tokens: {
      9: { pattern: /[0-9]/, repeated: true },
    },
    reversed: true,
    pattern: /[\d,.]+/
  }

  const handleInputNumber = (value, formData, key) => {
    let newValue = formData[key]
    newValue = formatNumber(newValue.includes(".") ? newValue.replace(/[.]/g, "") : newValue)
    
    const isValidInput = /^[0-9.,]*$/.test(newValue) || newValue === ""
    if (isValidInput) {
      formData[key] = newValue
    } else {
      formData[key] = formData[key].replace(/[^\d.,]/g, "")
    }
  }

  const handleInputNumberCurrency = (value, formData, key) => {
    let newValue = formData[key]
    newValue = String(newValue).replace(/[^\d.,]/g, "")
    
    const commaIndex = newValue.indexOf(",")
    if (commaIndex !== -1) {
      newValue =
        newValue.slice(0, commaIndex + 1) +
        newValue.slice(commaIndex + 1).replace(/,/g, "")
    }
    
    newValue = formatNumber(newValue.replace(/\./g, ""))
    
    const isValidInput = /^[0-9.,]*$/.test(newValue) || newValue === ""
    if (isValidInput) {
      formData[key] = newValue
    } else {
      formData[key] = formData[key].replace(/[^\d.,]/g, "")
    }
  }

  // Process numbers for form submission
  const processNumberFields = (formData, formConfig) => {
    const processed = { ...formData }

    formConfig.forEach(item => {
      // Handle money fields
      if (item.fieldType === 'money' && processed[item.fieldName]) {
        processed[item.fieldName] = processed[item.fieldName].toString().replace(/\./g, "")
      }
      
      // Handle currency fields
      if (item.fieldType === 'numbercurrency' && processed[item.fieldName]) {
        processed[item.fieldName] = processed[item.fieldName].toString().replace(/\./g, "").replace(/,/g, ".")
      }
      
      // Handle number fields
      if (item.fieldType === 'number') {
        processed[item.fieldName] = String(processed[item.fieldName]) && !isNaN(processed[item.fieldName]) 
          ? Number(processed[item.fieldName]) 
          : 0
      }
    })

    return processed
  }

  return {
    maskOptions,
    handleInputNumber,
    handleInputNumberCurrency,
    processNumberFields
  }
} 