<script setup>
  import { ref, reactive, onMounted, computed, watch} from 'vue'
  import axios from 'axios'
  const baseURL = import.meta.env.VITE_API_URL
  const emit = defineEmits(['changeModel'])
	const props = defineProps({
    configs: {
      type: Object,
      default: {
        api: '',
        itemText: '',
        itemValue: '',
        dataSource: [],
        responseDataApi: 'content',
        params: {},
        keywordSearch: '',
        multiple: false,
        returnObject: true,
        placeholder: '',
        
      }
    },
    data: {
      type: Object,
      default: null
    }
  })
	const dataModel = ref(props.data)
  const configSelect = ref(props.configs)
  const dataSource = ref([])
  const eventTimeOut = ref(null)
  const enableKeywordSearch = ref(true)
  const mergeArraysByProperty = function (arr1, arr2, propertyName) {
    const propertySet = new Set(arr1.map(item => item[propertyName]))
    const uniqueObjects = arr2.filter(item => !propertySet.has(item[propertyName]))
    const mergedArray = [...arr1, ...uniqueObjects]
    return mergedArray
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
  const changeInputSelect = function (val) {
    if (!enableKeywordSearch.value) {
      return
    }
    clearTimeout(eventTimeOut.value)
    eventTimeOut.value = setTimeout(() => {
      let paramsAdd = Object.assign({}, props.configs.params)
      if (props.configs['keywordSearch']) {
        paramsAdd[props.configs['keywordSearch']] = val ? val : ''
      }
      loadDataSource(Object.assign(props.configs, {params: paramsAdd})).then(function(result) {
        let resultData = props.configs['responseDataApi'] ? result[props.configs['responseDataApi']] : result
        dataSource.value = mergeArraysByProperty(dataSource.value, resultData, props.configs.itemValue)
      }).catch(function(){})
    }, 1000)
  }
  const customFilter = {
    "VanBanChiDao": function (itemTitle, queryText, item) {
      const textOne = item.raw.SoHieuVanBan.toLowerCase()
      const textTwo = item.raw.TieuDeVanBan.toLowerCase()
      const searchText = queryText.toLowerCase()

      return textOne.indexOf(searchText) > -1 || textTwo.indexOf(searchText) > -1
    }
  }
  const selectAutocomplete = function (focused) {
    if (focused) {
      enableKeywordSearch.value = true
    } else {
      enableKeywordSearch.value = false
    }
    if (props.configs.api && focused) {
      let paramsAdd = Object.assign({}, props.configs.params)
      loadDataSource(Object.assign(props.configs, {params: paramsAdd})).then(function(result) {
        let resultData = props.configs['responseDataApi'] ? result[props.configs['responseDataApi']] : result
        dataSource.value = resultData
      }).catch(function(){})
    }
  }
  const changeModelValue = function () {
    enableKeywordSearch.value = false
    emit('changeModel', dataModel.value)
  }
  onMounted(() => {
    if (props.configs.api) {
      let paramsAdd = Object.assign({}, props.configs.params)
      loadDataSource(Object.assign(props.configs, {params: paramsAdd})).then(function(result) {
        let resultData = props.configs['responseDataApi'] ? result[props.configs['responseDataApi']] : result
        dataSource.value = resultData
      }).catch(function(){})
    }
  })
  const initValue = (value) => {
  dataModel.value = value
  };

  defineExpose({
    initValue,
    dataModel,
  });
</script>

<template>
  <v-autocomplete
    v-if="!props.configs.api"
    class="flex input-form"
    hide-no-data
    v-model="dataModel"
    :items="props.configs.dataSource"
    :multiple="props.configs['multiple']"
    :item-title="props.configs.itemText"
    :item-value="props.configs.itemValue"
    :placeholder="props.configs.placeholder"
    :disabled="props.configs.isDisabled"
    dense
    solo
    hide-details="auto"
    :return-object="props.configs.returnObject"
    @update:modelValue="changeModelValue"
    :custom-filter="props.configs.hasOwnProperty('customFilter') ? customFilter[props.configs['customFilter']] : undefined"
    clearable
  >
  </v-autocomplete> 
  <v-autocomplete v-if="props.configs.api && props.configs.keywordSearch" class="flex input-form"
    hide-no-data
    v-model="dataModel"
    :items="dataSource"
    :multiple="props.configs['multiple']"
    :item-title="props.configs.itemText"
    :item-value="props.configs.itemValue"
    :placeholder="props.configs.placeholder"
    :disabled="props.configs.isDisabled"
    dense
    solo
    hide-details="auto"
    :return-object="props.configs.returnObject"
    clearable
    @update:search="changeInputSelect"
    @update:modelValue="changeModelValue"
    @update:focused="selectAutocomplete($event)"
    :custom-filter="props.configs.hasOwnProperty('customFilter') ? customFilter[props.configs['customFilter']] : undefined"
  >
    <template v-if="props.configs.hasOwnProperty('tempCode')" v-slot:item="{ props, item }">
      <v-list-item v-bind="props" class="pa-2" style="cursor: pointer">
        <template v-slot:title>
          <b>{{ item.raw[configSelect['tempCode']] }}</b> - <span>{{ item.raw[configSelect['tempName']] }}</span>
        </template>
      </v-list-item>
    </template>
    <template v-if="props.configs.hasOwnProperty('tempCode')" v-slot:selection="{ props, item }">
      <div v-bind="props">
        <b>{{ item.raw[configSelect['tempCode']] }}</b> - <span>{{ item.raw[configSelect['tempName']] }}</span>
      </div>
    </template>
  </v-autocomplete>
  <v-autocomplete v-if="props.configs.api && !props.configs.keywordSearch" class="flex input-form"
    hide-no-data
    v-model="dataModel"
    :items="dataSource"
    :multiple="props.configs['multiple']"
    :item-title="props.configs.itemText"
    :item-value="props.configs.itemValue"
    :placeholder="props.configs.placeholder"
    :disabled="props.configs.isDisabled"
    dense
    solo
    hide-details="auto"
    :return-object="props.configs.returnObject"
    @update:modelValue="changeModelValue"
    clearable
    :custom-filter="props.configs.hasOwnProperty('customFilter') ? customFilter[props.configs['customFilter']] : undefined"
  >
    <template v-if="props.configs.hasOwnProperty('tempCode')" v-slot:item="{ props, item }">
      <v-list-item v-bind="props" class="pa-2" style="cursor: pointer">
        <template v-slot:title>
          <b>{{ item.raw[configSelect['tempCode']] }}</b> - <span>{{ item.raw[configSelect['tempName']] }}</span>
        </template>
      </v-list-item>
    </template>
    <template v-if="props.configs.hasOwnProperty('tempCode')" v-slot:selection="{ props, item }">
      <div v-bind="props">
        <b>{{ item.raw[configSelect['tempCode']] }}</b> - <span>{{ item.raw[configSelect['tempName']] }}</span>
      </div>
    </template>
  </v-autocomplete>
</template>