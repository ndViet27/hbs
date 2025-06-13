import { ref } from 'vue'

export function useFormValidation() {
  const getRules = function (item, formData) {
    let regex = []
    let require = item.required ? [v => (String(v).trim() !== '' && v !== null && v !== undefined) || 'Thông tin bắt buộc'] : []
    if (item.hasOwnProperty('regex') && item['regex']) {
      regex = item['regex']
    }
    if (item.fieldType === 'number') {
      regex = [v => !v || (v && /^\d+$/.test(v)) || 'Không đúng định dạng!']
    }
    if (item.fieldType === 'phone') {
      regex = [v => !v || (v && /^\d+$/.test(v)) || 'Số điện thoại không đúng định dạng!']
    }
    if (item.fieldType === 'email') {
      regex = [v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Email không đúng định dạng!']
    }
    if (item.fieldType === 'number') {
      if (item.hasOwnProperty('lowerThanKey')) {
        regex = regex.concat([v => !v || Number(v) <= Number(formData[item['lowerThanKey']]) || item['regexText']])
      }
      if (item.hasOwnProperty('lowerThanNumber')) {
        regex = regex.concat([v => !v || Number(v) <= item['lowerThanNumber'] || item['regexText']])
      }
    }
    if (item.hasOwnProperty('isPassword') && item.isPassword) {
      regex = [v => !v || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v) || (item['regexText'] ?? 'Mật khẩu không đúng định dạng')]
    }
    if (item.hasOwnProperty('isConfirmPassword') && item.isConfirmPassword) {
      regex = [v => !v || v === formData[item['keyToCompare']] || (item['regexText'] ?? 'Mật khẩu không khớp')]
    }
    return require.concat(regex)
  }

  const validateForm = async (formRef, formData, formConfig) => {
    const { valid } = await formRef.validate()
    
    let dateRequired = formConfig.find(function (item) {
      return item.fieldType === 'date' && !item.hidden && item.required && !formData[item.fieldName]
    })
    
    let multipleRequired = formConfig.find(function (item) {
      return item.fieldType === 'tableSelect' && !item.hidden && item.required && 
             (!formData[item.fieldName] || Array.isArray(formData[item.fieldName]) && formData[item.fieldName].length === 0)
    })
    
    return valid && !dateRequired && !multipleRequired
  }

  return {
    getRules,
    validateForm
  }
} 