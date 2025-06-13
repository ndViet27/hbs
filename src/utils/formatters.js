/**
 * Formats a date to Vietnamese locale format DD/MM/YYYY
 * @param {String|Date} dateInput - The date to format
 * @returns {String} Formatted date string
 */
export function dateLocale(dateInput) {
  if (!dateInput) return ''
  let date = new Date(dateInput)
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
}

/**
 * Formats a date with time to Vietnamese locale format HH:mm DD/MM/YYYY
 * @param {String|Date} dateInput - The date to format
 * @returns {String} Formatted date and time string
 */
export function dateLocaleTime(dateInput) {
  if (!dateInput) return ''
  let date = new Date(dateInput)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
}

/**
 * Formats a number with thousand separators (dot as thousand separator, comma as decimal separator)
 * @param {Number|String} value - The value to format
 * @returns {String} Formatted number string
 */
export function formatThousandSeparator(value) {
  if (!value && value !== 0) return ""
  
  let [integerPart, decimalPart] = value.toString().split(".")
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return decimalPart ? `${integerPart},${decimalPart}` : integerPart
}

/**
 * Formats a square meter value with appropriate decimals
 * @param {Number|String} value - The value to format
 * @returns {String} Formatted square meter value
 */
export function formatSquare(value) {
  if (!value && value !== 0) return ''
  
  let moneyCur = value.toString().includes(".")
    ? (Number(value) / 1).toFixed(2).toString().replace(".", ",")
    : (Number(value) / 1).toFixed(0).replace(".", ",")
  
  return moneyCur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Converts an array to a comma-separated string
 * @param {Array} arr - The array to convert
 * @param {String} name - Optional property name to extract from array items
 * @returns {String} Comma-separated string
 */
export function arrayToString(arr, name) {
  if (!arr || !arr.length) return ''
  
  let arrayString = ''
  if (name) {
    let arrConvert = Array.from(arr, (item) => item[name])
    arrayString = arrConvert.toString()
  } else {
    arrayString = arr.toString()
  }
  
  return arrayString.replace(/,/g, ", ")
}

/**
 * Gets a nested property value from an object using dot notation
 * @param {Object} obj - The object to extract value from
 * @param {String} key - The property path using dot notation (e.g., 'user.address.street')
 * @returns {*} The extracted value or empty string if not found
 */
export function getValue(obj, key) {
  if (!obj || !key) return ''
  
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