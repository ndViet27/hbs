<script setup>
import { ref, toRef, reactive, onMounted, defineAsyncComponent, watch } from 'vue'
import axios from 'axios'
const VueDatePicker = defineAsyncComponent(() =>
  import("@vuepic/vue-datepicker")
);
// import '@vuepic/vue-datepicker/dist/main.css'


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
  }
})
const mauNhapForm = reactive(props.mauNhap)
// const dataInputForm = reactive(props.dataInput)
const dataInputForm = toRef(props, 'dataInput')
const data = ref({})
const validForm = ref(false)
const formCrud = ref(null)
const selectItem = ref(null)
const indexSelect = ref(null)
const refChonDoiTuong = ref(false)
const refChonCaNhanToChuc = ref(null)
const dialogChonCaNhanToChuc = ref(false)
const dialogChonDoiTuong = ref(false)
const itemSelectDoiTuong = ref({})
const selectedDoiTuong = ref([])
const optionsMaska = {
  mask: '9.99#.###',
  tokens: {
    9: { pattern: /[0-9]/, repeated: true },
  },
  reversed: true,
  pattern: /[\d,.]+/
}
const emit = defineEmits(['submitSearch'])
const submit = function (type) {
  let dataOutput = Object.assign({}, data.value)
  for (let key in mauNhapForm) {
    let itemConfig = mauNhapForm[key]
    if ((itemConfig.fieldType == 'date' || itemConfig.fieldType == 'datetime') && dataOutput[itemConfig['fieldName']]) {
      dataOutput[itemConfig['fieldName']] = dateLocale(dataOutput[itemConfig['fieldName']])
    }
    if (itemConfig.fieldType == 'daterange') {
      // console.log('itemConfig', itemConfig)
      dataOutput[itemConfig['fieldName']] = dateLocale(dataOutput[itemConfig['fieldName']])
      dataOutput[itemConfig['nameTo']] = dateLocale(dataOutput[itemConfig['nameTo']])
    }
    if (itemConfig.fieldType == 'select' && dataOutput[itemConfig['fieldName']]) {
      let dataCv = Array.isArray(dataOutput[itemConfig['fieldName']]) ? dataOutput[itemConfig['fieldName']] : [dataOutput[itemConfig['fieldName']]]
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
      dataOutput[itemConfig['fieldName']] = itemConfig.multiple ? dataArray : dataArray[0]
    }
    if (itemConfig.hasOwnProperty('vissibleFollow') && itemConfig.vissibleFollow.name && itemConfig['hidden']) {
      dataOutput[itemConfig['fieldName']] = null
    }
    if ((itemConfig.fieldType == 'numbercurrency' || itemConfig.fieldType == 'money') && dataOutput[itemConfig['fieldName']]) {
      dataOutput[itemConfig['fieldName']] = dataOutput[itemConfig['fieldName']].replace(/\./g, "")
    }
    if (itemConfig.fieldType == 'number') {
      dataOutput[itemConfig['fieldName']] = String(dataOutput[itemConfig['fieldName']]) && !isNaN(dataOutput[itemConfig['fieldName']]) ? Number(dataOutput[itemConfig['fieldName']]) : 0
    }
  }

  let dataSearchOutput = { ...dataOutput }
  for (let key in mauNhapForm) {
    let itemConfig = mauNhapForm[key]
    if (itemConfig.fieldType == 'select' && dataSearchOutput[itemConfig['fieldName']]) {
      if (itemConfig.multiple && Array.isArray(dataSearchOutput[itemConfig['fieldName']])) {
        if (itemConfig.mapping) {
          dataSearchOutput[itemConfig['fieldName']] = dataSearchOutput[itemConfig['fieldName']].map((item) => item[itemConfig.mapping]).toString()
        }
      } else {
        if (itemConfig.mapping) {
          dataSearchOutput[itemConfig['fieldName']] = dataSearchOutput[itemConfig['fieldName']][itemConfig.mapping]
        }
      }
    }
  }
  console.log('dataFormOutput-2', dataOutput)
  // return dataOutput
  emit('submitSearch', dataOutput, dataSearchOutput)
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
const getRules = function (item) {
  let regex = []
  let require = item.required ? [v => (v !== '' && v !== null && v !== undefined) || 'Thông tin bắt buộc'] : []
  if (item.hasOwnProperty('regex') && item['regex']) {
    regex = item['regex']
  }
  if (item.fieldName === 'SoHieuVanBan' || item.fieldName === 'SoQuyetDinh') {
    regex = [v => !v || (v && /^(\d+(\/\d+){0,2}\/[a-zA-Z0-9đĐÊêÔôơƠăĂâÂ]+)?(-[a-zA-Z0-9đĐÊêÔôơƠăĂâÂ]+){0,2}?$/.test(v)) || 'Số hiệu văn bản không đúng định dạng']
  }
  return require.concat(regex)
}
const mergeArraysByProperty = function (arr1, arr2, propertyName) {
  const propertySet = new Set(arr1.map(item => item[propertyName]))
  const uniqueObjects = arr2.filter(item => !propertySet.has(item[propertyName]))
  const mergedArray = [...arr1, ...uniqueObjects]
  return mergedArray
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
const formatDateTimePicker = (date) => {
  try {
    if (date.getDate()) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hh = date.getHours().toString().padStart(2, '0');
      const mm = date.getMinutes().toString().padStart(2, '0');;
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hh}:${mm}`;
    } else {

    }
  } catch (error) {
  }
}
const changeDatePicker = (name) => {
  // console.log('dateInput', data.value[name])
}
const openDatePicker = (open, item) => {
  if (open) {
    // $('.v-window').css("overflow", "visible")
    // $('.v-overlay__content>.v-card').css("overflow", "initial")
    try {
      let heightContent = $(`.formDynamic_${props.idForm}`).height()
      if (heightContent < 300) {
        $('.v-overlay__content>.v-card').css("overflow", "visible")
      }
    } catch (error) {
    }
    if (item.hasOwnProperty('minDate')) {
      if (item.minDate === 'currentDate') {
        item.minDateValue = new Date()
      } else {
        item.minDateValue = data.value[item.minDate] ? new Date(data.value[item.minDate]) : null
      }
    } else {
      item.minDateValue = null
    }
    if (item.hasOwnProperty('maxDate')) {
      if (item.maxDate === 'currentDate') {
        item.maxDateValue = new Date()
      } else {
        item.maxDateValue = data.value[item.maxDate] ? new Date(data.value[item.maxDate]) : null
      }
    } else {
      item.maxDateValue = null
    }
  } else {
    // $('.v-window').css("overflow", "hidden")
    // $('.v-dialog .v-card').css("overflow", "hidden")
    $('.v-overlay__content>.v-card').css("overflow", "auto")
  }
}
const selectAutocomplete = function (focused, item, index) {
  selectItem.value = item
  indexSelect.value = index
  if (!item.api && item.parent && item.parentMappingDataSource && data.value[item.parent]) {
    mauNhapForm[index]['dataSource'] = data.value[item.parent] ? data.value[item.parent][item.parentMappingDataSource] : []
  }
  if (item.api && item.parent && focused) {
    let paramsAdd = Object.assign({}, item.params)
    paramsAdd[item.parentMapping] = data.value[item.parent] ? (item.hasOwnProperty('valueParentMapping') ? data.value[item.parent][item.valueParentMapping] : data.value[item.parent]['MaDinhDanh']) : ''
    item['loading'] = true
    loadDataSource(Object.assign(item, { params: paramsAdd })).then(function (result) {
      item['loading'] = false
      let resultData = item['responseDataApi'] ? result[item['responseDataApi']] : result
      if (item.hasOwnProperty('propertyExt')) {
        let valuePropsExt = item.propertyExt.split(":")[1]
        let propsExtKey = item.propertyExt.split(":")[0]
        resultData.forEach(element => {
          element[propsExtKey] = getValue(element, valuePropsExt)
        })
        console.log('resultData', resultData)
      }
      mauNhapForm[index]['dataSource'] = resultData
    }).catch(function () {
      item['loading'] = false
    })
  }
}
const changeModelValue = function (item, index) {
  // console.log('item', item)
  // console.log('modelValue', data.value[item.fieldName])
  // console.log('mauNhap', mauNhapForm)
  if (item.hasOwnProperty('changeUI')) {
    mauNhapForm.forEach((element, index) => {
      if (element.hasOwnProperty('vissibleFollow') && element.vissibleFollow.name === item.fieldName) {
        if (element.vissibleFollow.nameMapping) {
          if (data.value[item.fieldName] && element.vissibleFollow.valueCompare.indexOf(data.value[item.fieldName][element.vissibleFollow.nameMapping]) < 0) {
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
const changeInputSelect = function (val) {
  if (!selectItem.value || !selectItem.value.hasOwnProperty('keySearch') || !val) {
  } else {
    if (selectItem.value.hasOwnProperty('api') && selectItem.value.api) {
      clearTimeout(eventTimeOut.value)
      eventTimeOut.value = setTimeout(() => {
        //
        if (mauNhapForm[indexSelect.value]['dataSource'].some(item => item[selectItem.value['itemText']] === val)) {
          return
        }
        // 
        let paramsAdd = Object.assign({}, selectItem.value.params)
        if (selectItem.value.parent) {
          paramsAdd[selectItem.value.parentMapping] = data.value[selectItem.value.parent] ? data.value[selectItem.value.parent]['MaDinhDanh'] : ''
        }
        if (selectItem.value['keySearch']) {
          paramsAdd[selectItem.value['keySearch']] = val ? val : ''
        }
        loadDataSource(Object.assign(selectItem.value, { params: paramsAdd })).then(function (result) {
          let resultData = selectItem.value['responseDataApi'] ? result[selectItem.value['responseDataApi']] : result
          mauNhapForm[indexSelect.value]['dataSource'] = mergeArraysByProperty(mauNhapForm[indexSelect.value]['dataSource'], resultData, selectItem.value.itemValue)
        }).catch(function () { })
      }, 1000)
    }
  }
}

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
  // console.log('dataInputForm.value', dataInputForm.value)
  await formCrud.value.reset()
  await formCrud.value.resetValidation()
  for (let key in mauNhapForm) {
    let itemData = mauNhapForm[key]
    if (itemData['fieldType'] === 'select' && itemData.hasOwnProperty('api') && itemData['api'] && !itemData['parent']) {
      let paramsAdd = Object.assign({}, itemData.params)
      loadDataSource(Object.assign(itemData, { params: paramsAdd })).then(function (result) {
        let resultData = itemData['responseDataApi'] ? result[itemData['responseDataApi']] : result
        if (itemData.hasOwnProperty('ignore') && itemData.ignore) {
          resultData = resultData.filter(function (el) {
            return !itemData.ignore.includes(el[itemData['itemValue']])
          })
        }
        if (itemData.hasOwnProperty('filterData') && itemData.filterData) {
          resultData = resultData.filter(function (el) {
            return itemData.filterData.includes(el[itemData['itemValue']])
          })
        }
        if (itemData.hasOwnProperty('propertyExt')) {
          let valuePropsExt = itemData.propertyExt.split(":")[1]
          let propsExtKey = itemData.propertyExt.split(":")[0]
          resultData.forEach(element => {
            element[propsExtKey] = getValue(element, valuePropsExt)
          })
        }
        mauNhapForm[key]['dataSource'] = resultData
      }).catch(function () { })
    }
    if (mauNhapForm[key]['defaultValue']) {
      if (mauNhapForm[key]['defaultValue'] === 'currentDate') {
        data.value[itemData['fieldName']] = new Date()
      } else {
        data.value[itemData['fieldName']] = mauNhapForm[key]['defaultValue']
      }
    }
  }
  // console.log('dataInputForm', dataInputForm)
  if (dataInputForm.value) {
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
      if (filter && filter.fieldType === 'date') {
        data.value[key] = convertDate(data.value[key])
      }
    }
    // check hiển thị theo trường dữ liệu cấu hình
    for (let key in mauNhapForm) {
      let item = mauNhapForm[key]
      if (item.hasOwnProperty('changeUI')) {
        mauNhapForm.forEach((element, index) => {
          if (element.hasOwnProperty('vissibleFollow') && element.vissibleFollow.name === item.fieldName) {
            if (element.vissibleFollow.valueCompare.indexOf(dataInputForm.value[item.fieldName][element.vissibleFollow.nameMapping]) < 0) {
              mauNhapForm[index]['hidden'] = true
            } else {
              mauNhapForm[index]['hidden'] = false
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
      if (formCrud.value) { formCrud.value.resetValidation() }
    }, 200)
  }
}
const bindData = async function () {
  // console.log('dataInputForm - bindData', dataInputForm.value)
  if (dataInputForm.value) {
    data.value = Object.assign({}, dataInputForm.value)
    for (let key in data.value) {
      let filter = mauNhapForm.find(function (item) {
        return item.fieldName == key
      })
      if (filter && filter.fieldType === 'select' && !filter['multiple']) {
        data.value[key] = Array.isArray(data.value[key]) ? data.value[key][0] : data.value[key]
      }
      if (filter && filter.fieldType === 'date') {
        data.value[key] = convertDate(data.value[key])
      }
    }
    setTimeout(function () {
      if (formCrud.value) { formCrud.value.resetValidation() }
    }, 100)
  }
}
const getMinDate = function (item) {
  if (item.minDate === 'currentDate') {
    return new Date()
  } else {
    if (data) {

    }
    return new Date()
  }
}
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
const customFilter = {
  "VanBanChiDao": function (itemTitle, queryText, item) {
    const textOne = item.raw.SoHieuVanBan.toLowerCase()
    const textTwo = item.raw.TieuDeVanBan.toLowerCase()
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
  return dateIsoLocal(ddd)
}
const dateIsoLocal = function (data) {
  if (!data) {
    return ''
  }
  let date = new Date(data)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const zone = String(-(new Date().getTimezoneOffset() / 60)).padStart(2, 0);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
const resetForm = async function () {
  await formCrud.value.reset()
  await formCrud.value.resetValidation()
  for (let key in mauNhapForm) {
    let itemData = mauNhapForm[key]
    if (itemData['fieldType'] === 'date') {
      data.value[itemData['fieldName']] = null
    }
    if (itemConfig.fieldType == 'daterange') {
      dataOutput[itemConfig['fieldName']] = null
      dataOutput[itemConfig['nameTo']] = null
    }
  }
  submit()
}
const resetFormValidation = function () {
  this.$refs.formCrud.resetValidation()
}
const validateForm = async function () {
  const { valid } = await this.$refs.formCrud.validate()
  return valid
}
const formatThousandSeparator = function (value) {
  if (value) {
    let moneyCur = (Number(value) / 1).toFixed(0).replace('.', ',')
    return moneyCur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
  return ''
}
const handleInput = function (key) {
  let newValue = data.value[key]
  newValue = formatNumber(newValue)
  const isValidInput = /^[0-9.,]*$/.test(newValue) || newValue === ''
  if (isValidInput) {
    data.value[key] = newValue
  } else {
    data.value[key] = data.value[key].replace(/[^\d.,]/g, '')
  }
}
const formatNumber = function (value) {
  if (!value) return ''
  value = String(value).replace(/[^\d.,]/g, '')
  const parts = value.split(',')
  if (parts[0].length >= 4) {
    parts[0] = formatThousandSeparator(parts[0].replace(/\./g, ""))
  }
  return parts.join(',')
}
const resetFormTimKiem = function () {
  resetForm()
  submit()
}
const goBack = function () {
  window.history.back()
}
onMounted(() => {
  initForm()
})
watch(dataInputForm, async (val) => {
  // console.log('dataInputForm', val)
  bindData()
}, { deep: true })
defineExpose({
  initForm, bindData, resetForm, resetFormValidation, validateForm, submit, data
})
</script>

<template>
  <v-card class="mx-auto" :class="`formDynamic_${props.idForm}`" flat
    style="overflow: visible;z-index: 1000;width: 100%">
    <v-form ref="formCrud" lazy-validation class="py-0" v-model="validForm">
      <v-row class="my-0">
        <template v-for="(itemInput, index) in mauNhap" v-bind:key="index">
          <v-col :class="itemInput['fieldClass'] ? itemInput['fieldClass'] : 'v-col-12'" class="py-0 mb-2"
            v-if="!itemInput.hasOwnProperty('hidden') || (itemInput.hasOwnProperty('hidden') && !itemInput.hidden)">
            <label :style="itemInput['labelStyle'] ? itemInput['labelStyle'] : ''">{{ itemInput.fieldLabel }}</label>
            <v-text-field v-if="itemInput.fieldType === 'text'" class="flex input-form"
              v-model="data[itemInput.fieldName]" :placeholder="itemInput['placeHolder']" solo dense hide-details="auto"
              :clearable="!itemInput.hasOwnProperty('edit') || itemInput['edit']" :required="itemInput.required"
              :rules="getRules(itemInput)"
              :readonly="itemInput.hasOwnProperty('edit') && !itemInput['edit']"></v-text-field>
            <v-text-field v-if="itemInput.fieldType === 'number'" class="flex input-form"
              v-model="data[itemInput.fieldName]" :placeholder="itemInput['placeHolder']" solo dense hide-details="auto"
              :clearable="!itemInput.hasOwnProperty('edit') || itemInput['edit']" type="number"
              :required="itemInput.required" :rules="getRules(itemInput)"
              :readonly="itemInput.hasOwnProperty('edit') && !itemInput['edit']"></v-text-field>
            <v-textarea v-if="itemInput.fieldType === 'textarea'" class="flex input-form"
              v-model="data[itemInput.fieldName]" :placeholder="itemInput['placeHolder']" solo dense hide-details="auto"
              :clearable="!itemInput.hasOwnProperty('edit') || itemInput['edit']"
              :rows="itemInput.hasOwnProperty('rows') ? itemInput.rows : 3"
              :readonly="itemInput.hasOwnProperty('edit') && !itemInput['edit']" :required="itemInput.required"
              :rules="getRules(itemInput)"></v-textarea>
            <v-checkbox v-if="itemInput.fieldType === 'checkbox'" :label="itemInput.label" hide-details
              style="margin-top: 20px;" :value="true" v-model="data[itemInput.fieldName]"
              @update:modelValue="changeModelValue(itemInput, index)"></v-checkbox>
            <VueDatePicker class="flex" position="left" v-if="itemInput.fieldType === 'date'"
              :enable-time-picker="false" select-text="Chọn" cancel-text="Thoát" v-model="data[itemInput.fieldName]"
              text-input :format="formatDatePicker" placeholder="dd/mm/yyyy" :text-input-options="textInputOptions"
              auto-apply locale="vi" :day-names="['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
              :min-date="itemInput.hasOwnProperty('minDate') ? itemInput.minDateValue : null"
              :max-date="itemInput.hasOwnProperty('maxDate') ? itemInput.maxDateValue : null"
              @update:model-value="changeDatePicker(itemInput.fieldName)" @open="openDatePicker(true, itemInput)"
              @closed="openDatePicker(false)">
            </VueDatePicker>

            <VueDatePicker class="flex" position="left" v-if="itemInput.fieldType === 'datetime'" select-text="Chọn"
              cancel-text="Thoát" v-model="data[itemInput.fieldName]" text-input :format="formatDateTimePicker"
              placeholder="dd/mm/yyyy" :text-input-options="textInputOptionsDateTime" time-picker-inline auto-apply
              locale="vi" :day-names="['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
              :min-date="itemInput.hasOwnProperty('minDate') ? itemInput.minDateValue : null"
              :max-date="itemInput.hasOwnProperty('maxDate') ? itemInput.maxDateValue : null"
              @update:model-value="changeDatePicker(itemInput.fieldName)" @open="openDatePicker(true, itemInput)"
              @closed="openDatePicker(false)">
            </VueDatePicker>

            <v-row v-if="itemInput.fieldType === 'daterange'">
              <v-col>
                <VueDatePicker class="flex" position="left" select-text="Chọn" cancel-text="Thoát"
                  :enable-time-picker="false" v-model="data[itemInput.fieldName]" text-input :format="formatDatePicker"
                  placeholder="dd/mm/yyyy" :text-input-options="textInputOptions" auto-apply locale="vi"
                  :day-names="['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
                  @update:model-value="changeDatePicker(itemInput.fieldName)" @open="openDatePicker(true, itemInput)"
                  @closed="openDatePicker(false)">
                </VueDatePicker>
              </v-col>
              <v-col class="px-0" style="width: 20px;max-width: 20px; padding-top: 15px;">
                <v-icon size="24" color="var(--main-color)">mdi-minus</v-icon>
              </v-col>
              <v-col>
                <VueDatePicker class="flex" position="left" select-text="Chọn" cancel-text="Thoát"
                  :enable-time-picker="false" v-model="data[itemInput.nameTo]" text-input :format="formatDatePicker"
                  placeholder="dd/mm/yyyy" :text-input-options="textInputOptions" auto-apply locale="vi"
                  :day-names="['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']" @blur="changeDatePicker(itemInput.nameTo)"
                  @open="openDatePicker(true, itemInput)" @closed="openDatePicker(false)">
                </VueDatePicker>
              </v-col>
            </v-row>

            <v-autocomplete v-if="itemInput.fieldType === 'select' && !itemInput.api" class="flex input-form"
              hide-no-data v-model="data[itemInput.fieldName]" :items="itemInput.dataSource"
              :multiple="itemInput['multiple']" :item-title="itemInput.itemText" :item-value="itemInput.itemValue" dense
              solo hide-details="auto" :chips="itemInput.hasOwnProperty('chips')"
              :closable-chips="itemInput.hasOwnProperty('chips')"
              :return-object="itemInput.hasOwnProperty('returnObject') && !itemInput.returnObject ? false : true"
              :readonly="itemInput.hasOwnProperty('edit') && !itemInput['edit']"
              :clearable="(!itemInput.hasOwnProperty('edit') || itemInput['edit']) && (!itemInput.hasOwnProperty('clearable') || itemInput.clearable)"
              :required="itemInput.required"
              :rules="itemInput.required ? [v => (v !== '' && v !== null && v !== undefined) || 'Thông tin bắt buộc'] : []"
              @update:focused="selectAutocomplete($event, itemInput, index)" @update:search="changeInputSelect"
              @update:modelValue="changeModelValue(itemInput, index)">
              <template v-if="itemInput.hasOwnProperty('tempCode')" v-slot:item="{ props, item }">
                <v-list-item v-bind="props" class="pa-2" style="cursor: pointer">
                  <template v-slot:title>
                    <b>{{ item.raw[itemInput['tempCode']] }}</b> - <span>{{ item.raw[itemInput['tempName']] }}</span>
                  </template>
                </v-list-item>
              </template>
              <template v-if="itemInput.hasOwnProperty('tempCode')" v-slot:selection="{ props, item }">
                <div v-bind="props">
                  <b>{{ item.raw[itemInput['tempCode']] }}</b> - <span>{{ item.raw[itemInput['tempName']] }}</span>
                </div>
              </template>
            </v-autocomplete>

            <v-autocomplete v-if="itemInput.fieldType === 'select' && itemInput.api" class="flex input-form"
              no-data-text="Không có dữ liệu" v-model="data[itemInput.fieldName]"
              :return-object="itemInput.hasOwnProperty('returnObject') && !itemInput.returnObject ? false : true"
              :items="itemInput.dataSource" :multiple="itemInput['multiple']" :item-title="itemInput.itemText"
              :item-value="itemInput.itemValue" :chips="itemInput.hasOwnProperty('chips')"
              :closable-chips="itemInput.hasOwnProperty('chips')" dense solo hide-details="auto"
              :readonly="itemInput.hasOwnProperty('edit') && !itemInput['edit']"
              :clearable="(!itemInput.hasOwnProperty('edit') || itemInput['edit']) && (!itemInput.hasOwnProperty('clearable') || itemInput.clearable)"
              :required="itemInput.required"
              :rules="itemInput.required ? [v => (v !== '' && v !== null && v !== undefined) || 'Thông tin bắt buộc'] : []"
              @update:focused="selectAutocomplete($event, itemInput, index)" @update:search="changeInputSelect"
              @update:modelValue="changeModelValue(itemInput, index)" :loading="itemInput.loading"
              :custom-filter="itemInput.hasOwnProperty('customFilter') ? customFilter[itemInput['customFilter']] : undefined">
              <template v-if="itemInput.hasOwnProperty('tempCode')" v-slot:item="{ props, item }">
                <v-list-item v-bind="props" class="pa-2" style="cursor: pointer">
                  <template v-slot:title>
                    <b>{{ item.raw[itemInput['tempCode']] }}</b> - <span>{{ item.raw[itemInput['tempName']] }}</span>
                  </template>
                </v-list-item>
              </template>
              <template v-if="itemInput.hasOwnProperty('tempCode')" v-slot:selection="{ props, item }">
                <div v-bind="props">
                  <b>{{ item.raw[itemInput['tempCode']] }}</b> - <span>{{ item.raw[itemInput['tempName']] }}</span>
                </div>
              </template>
            </v-autocomplete>
            <div class="flex" style="width: 100%;" v-if="itemInput.fieldType === 'breakRow'"></div>
          </v-col>
        </template>
      </v-row>
      <v-row class="mx-0 my-0">
        <v-col class="py-2 px-3" cols="12" style="text-align: center;">
          <v-btn size="small" color="var(--main-color)" class="mx-0" @click.stop="submit" style="width: 125px;">
            <v-icon size="18" class="">mdi-magnify</v-icon>&nbsp;Tìm kiếm
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-card>
</template>