<script setup>
  import { ref, reactive, computed, onMounted, defineAsyncComponent } from 'vue'
  import { generalApi } from '@/api'
  import { addressToString } from '@/helpers'
  import { getValue } from '@/utils/formatters'
  const Pagination = defineAsyncComponent(() =>
    import('./Pagination.vue')
  )
  const TepTinDinhKem = defineAsyncComponent(() =>
    import('./TepTinDinhKem.vue')
  )
  const StandardTableView = defineAsyncComponent(() => import('./table/StandardTableView.vue'))
  const props = defineProps({
    tableConfigs: {
      type: Object,
      default: {
        api: '',
        headers: [],
        itemsPerPage: 15,
        responseDataApi: 'content',
        paramsSearch: {},
        data: [],
        groupBy: false,
        selected: false,
        search: true
      },
      peviewSelected: false
    },
    items: {
      type: Array,
      default: []
    },
    selected: {
      type: Array,
      default: []
    },
    thongTinDoiTuong: {
      type: Object,
      default: {}
    },
    loadingForm: {
      type: Boolean,
      default: false
    },
    permisson: {
      type: Object,
      default: {
        edit: true,
        delete: true,
        download: false
      }
    },
    componentPage: {
      type: Number,
      default: 0
    },
    titleEdit: {
      type: String,
      default: "Sửa"
    }
  })
  const emit = defineEmits(['editDoiTuong', 'xoaDoiTuong', 'downloadDoiTuong', 'previewDoiTuong', 'emitAction'])
  const keywordSearch = ref('')
  const doiTuongDaChon = ref([])
  const loadingData = ref(false)
  const page = ref(0)
  const pageCount = ref(0)
  const total = ref(0)
  const dsDoiTuongScope = ref([])
  const dsDoiTuong = computed(() => {
    if (!props.tableConfigs.api) {
      return props.tableConfigs.groupBy ? groupByFnc(props.items, props.tableConfigs.groupBy) : props.items
    } else {
      return props.tableConfigs.groupBy ? groupByFnc(dsDoiTuongScope.value, props.tableConfigs.groupBy) : dsDoiTuongScope.value
    }
  })
  const groupByFnc = function (arr, groupBy) {
    let groups = {}
    arr.forEach(item => {
      const groupKey = groupBy.hasOwnProperty('valueMapping') ? item[groupBy['keyGroup']][groupBy['valueMapping']] : item[groupBy['keyGroup']]
      if (!groups[groupKey]) {
        groups[groupKey] = {
          name: groupBy.hasOwnProperty('valueMapping') ? item[groupBy['keyGroup']][groupBy['nameMapping']] : item[groupBy['keyGroup']],
          value: groupBy.hasOwnProperty('valueMapping') ? item[groupBy['keyGroup']][groupBy['valueMapping']] : item[groupBy['valueMapping']],
          childrens: [],
        };
      }
      groups[groupKey].childrens.push(item);
    })
    return Object.values(groups);
  }
  const getData = function (type) {
    if (type === 'reset') {
      page.value = 0
    }
    let filter = {
      api: props.tableConfigs.api,
      params: Object.assign(props.tableConfigs.paramsSearch, {
        keyword: keywordSearch.value,
        page: page.value,
        size: props.tableConfigs.hasOwnProperty('itemsPerPage') ? props.tableConfigs.itemsPerPage : 15
      }),
      data: {}
    }
    loadingData.value = true
    total.value = 0
    generalApi.getData(filter).then(function(result) {
      loadingData.value = false
      let data = props.tableConfigs.hasOwnProperty('responseDataApi') ? result[props.tableConfigs.responseDataApi] : result.content
      dsDoiTuongScope.value = data
      total.value = result.totalElements
      pageCount.value = result.totalPages
    }).catch(function(){
      loadingData.value = false
      total.value = 0
      pageCount.value = 0
    })
  }
  const filterSearch = function () {
    if (props.tableConfigs.api) {
      getData()
    }
  }
  const changePage = function (pagePagination) {
    page.value = pagePagination.value - 1
    getData()
  }
  const init = function () {
    keywordSearch.value = ''
    if (props.tableConfigs.selected) {
      doiTuongDaChon.value = [].concat(props.selected)
    }
    if (props.tableConfigs.api) {
      getData('reset')
    }
  }
  const selectDoiTuong = function (item, index) {
    let exits = doiTuongDaChon.value ? doiTuongDaChon.value.find(function (x) {
      return item[props.tableConfigs.valueMapping] == x[props.tableConfigs.valueMapping]
    }) : false
    if (exits) {
      doiTuongDaChon.value = doiTuongDaChon.value.filter(function (y) {
        return y[props.tableConfigs.valueMapping] != item[props.tableConfigs.valueMapping]
      })
    } else {
      if (props.tableConfigs.multiple) {
        doiTuongDaChon.value.push(item)
      } else {
        doiTuongDaChon.value = [item]
      }
    }
  }
  const deleteItem = function (index) {
    doiTuongDaChon.value.splice(index, 1)
  }
  const checkExits = function (item) {
    if (!doiTuongDaChon.value.length) {
      return false
    } else {
      let x = doiTuongDaChon.value.find(function (i) {
        return i[props.tableConfigs.valueMapping] == item[props.tableConfigs.valueMapping]
      })
      return x ? true : false
    }
  }
  const editDoiTuong = function (item, index) {
    emit('editDoiTuong', {"item": item, "index": index})
  }
  const xoaDoiTuong = function (item, index) {
    emit('xoaDoiTuong', {"item": item, "index": index})
  }
  const downloadDoiTuong =  function (item, index) {
    emit('downloadDoiTuong', {"item": item, "index": index})
  }
  const previewDoiTuong =  function (item, index) {
    emit('previewDoiTuong', {"item": item, "index": index})
  }
  const handleEmitButtonAction = function (item, infoBanGhi) {
    emit('emitAction', item, infoBanGhi)
  }
  const dateLocale = function (dateInput) {
		if (!dateInput) return ''
		let date = new Date(dateInput)
		return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
	}
  const dateLocaleTime = function(dateInput) {
    let date = new Date(dateInput)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  }
  const formatThousandSeparator = function (value) {
    if (value) {
      let [integerPart, decimalPart] = value.toString().split(".");
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
    }
    return "";
  }
  const formatSquare = function (value) {
    if (value) {
      let moneyCur = value.toString().includes(".")
        ? (Number(value) / 1).toFixed(2).toString().replace(".", ",")
        : (Number(value) / 1).toFixed(0).replace(".", ",");
      return moneyCur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
    return ''
  }
  const arrayToString = function (arr, name) {
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
  const conditionChangeRowColor = (item) => {
    if (props.tableConfigs.hasOwnProperty('changeColorRow')) {
      if (props.tableConfigs.hasOwnProperty('keyCheck2')) {
        return item[props.tableConfigs.keyCheck1][props.tableConfigs.keyCheck2]
      } else {
        return item[props.tableConfigs.keyCheck1]
      }
    } else {
      return false
    }
  } 

  const conditionDeleteRowColor = (item) => {
    if (props.tableConfigs.hasOwnProperty('changeColorRow')) {
      if (props.tableConfigs.hasOwnProperty('keyCheck3')) {
        return item[props.tableConfigs.keyCheck1][props.tableConfigs.keyCheck3]
      } else {
        return item[props.tableConfigs.keyCheck1]
      }
    } else {
      return false
    }
  } 
  
  onMounted(() => {
    init()
  })
  defineExpose({
		init, doiTuongDaChon
	})
</script>
<template>
  <v-card class="pa-0 thanhphanhoso" style="box-shadow: none !important;width: 100%;border-radius: 0px;">
    <v-row class="mx-0 my-0">
      <v-col v-if="tableConfigs.search" cols="12" class="py-0 px-0 mb-2">
        <v-text-field
          v-model="keywordSearch"
          append-inner-icon="mdi-magnify"
          @keyup.enter="filterSearch"
          @click:append-inner="filterSearch"
          @click:prepend-inner="filterSearch"
          placeholder="Nhập từ khóa tìm kiếm"
          dense
          hide-details="auto"
          class="input-form"
          clearable
        ></v-text-field>
      </v-col>
      <StandardTableView
        :table-configs="tableConfigs"
        :items="dsDoiTuong"
        :page="page"
        :page-count="pageCount"
        :total="total"
        :loading="loadingData"
        :loading-form="loadingForm"
        :permisson="permisson"
        :check-exits="checkExits"
        :component-page="componentPage"
        :title-edit="titleEdit"
        @edit-doi-tuong="editDoiTuong"
        @xoa-doi-tuong="xoaDoiTuong"
        @select-doi-tuong="selectDoiTuong"
        @change-page="changePage"
      />
    </v-row>
  </v-card>
</template>
<style>
  .table-base tbody td {
    vertical-align: top;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
  }
  .disabled-color {
    background-color: #c0c0c0;
  }
  .delete-color {
    background-color: #FFEBEE;
  }
</style>