import { ref } from 'vue'

export function useDatePicker() {
  const textInputOptions = ref({
    format: 'dd/MM/yyyy'
  })

  const textInputOptionsDateTime = ref({
    format: 'dd/MM/yyyy HH:mm'
  })

  const formatDatePicker = (date) => {
    try {
      if (date && date.getDate) {
        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
      }
    } catch (error) {
      console.error('Error formatting date', error)
    }
    return ''
  }

  const formatDateTimePicker = (date) => {
    try {
      if (date && date.getDate) {
        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        const hh = date.getHours().toString().padStart(2, '0')
        const mm = date.getMinutes().toString().padStart(2, '0')
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hh}:${mm}`
      }
    } catch (error) {
      console.error('Error formatting datetime', error)
    }
    return ''
  }

  const getMinMaxDateConfig = (item, formData) => {
    const config = {
      minDateValue: null,
      maxDateValue: null,
      maxToDateValue: null
    }

    // Handle min date
    if (item.hasOwnProperty('minDate')) {
      if (item.minDate === 'currentDate') {
        config.minDateValue = new Date()
      } else {
        config.minDateValue = formData[item.minDate] ? new Date(formData[item.minDate]) : null
      }
    }

    // Handle max date
    if (item.hasOwnProperty('maxDate')) {
      if (item.maxDate === 'currentDate') {
        config.maxDateValue = new Date()
      } else {
        config.maxDateValue = formData[item.maxDate] ? new Date(formData[item.maxDate]) : null
      }
    }

    // Handle max to date for daterange
    if (item.hasOwnProperty('maxToDate')) {
      if (item.maxToDate === 'currentDate') {
        config.maxToDateValue = new Date()
      } else {
        config.maxToDateValue = item.maxToDate ? new Date(item.maxToDate) : new Date()
      }
    }

    return config
  }

  return {
    textInputOptions,
    textInputOptionsDateTime,
    formatDatePicker,
    formatDateTimePicker,
    getMinMaxDateConfig
  }
} 