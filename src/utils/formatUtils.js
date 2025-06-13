/**
 * Formats a date to dd/mm/yyyy string format
 * @param {Date} date The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  try {
    if (!date) return ''
    
    if (typeof date === 'string') {
      date = new Date(date)
    }
    
    if (date.getDate) {
      const day = date.getDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
    }
  } catch (error) {
    console.error('Error formatting date:', error)
  }
  return ''
}

/**
 * Formats a date to ISO format for API communication
 * @param {Date} date The date to format
 * @returns {string} ISO formatted date string
 */
export function dateIsoLocal(date) {
  if (!date) {
    return ''
  }
  let dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const seconds = String(dateObj.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * Formats a number with thousand separators
 * @param {string|number} value The value to format
 * @returns {string} Formatted number
 */
export function formatNumber(value) {
  if (!value) return ""
  value = String(value).replace(/[^\d.,]/g, "")
  const parts = value.split(",")
  if (parts[0].length >= 4) {
    parts[0] = parts[0].includes(".")
      ? formatThousandSeparator(parts[0])
      : formatThousandSeparator(parts[0].replace(/\./g, ""))
  }
  return parts.join(",")
}

/**
 * Applies thousand separator formatting to a number
 * @param {string|number} value The value to format
 * @returns {string} Formatted number with thousand separators
 */
export function formatThousandSeparator(value) {
  if (value) {
    let strValue = typeof value === "string" ? value : BigInt(value).toString()
    let parts = strValue.split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    return parts.join(",")
  }
  return ""
}

/**
 * Gets a nested property value from an object using a dot notation path
 * @param {Object} obj The object to traverse
 * @param {string} key The dot notation path (e.g., 'user.address.street')
 * @returns {*} The value at the specified path or empty string if not found
 */
export function getValue(obj, key) {
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