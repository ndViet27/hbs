<script setup>
  import { useCookies } from 'vue3-cookies'
  import { ref, reactive, computed, onMounted, defineAsyncComponent } from 'vue'
  import { generalApi } from '@/api'
  import DOMPurify from 'dompurify'
  const Pagination = defineAsyncComponent(() =>
    import('./Pagination.vue')
  )
  const TepTinDinhKem = defineAsyncComponent(() =>
    import('./TepTinDinhKem.vue')
  )
  const props = defineProps({
    selected: {
      type: Array,
      default: []
    },
    itemUpdate: {
      type: Object,
      default: {}
    },
    itemsPerPage: {
      type: Number,
      default: 15
    },
    loadingForm: {
      type: Boolean,
      default: false
    },
    triggerSelected: {
      type: Boolean,
      default: false
    },
    isRequireEndIssuance: {
      type: Boolean,
      default: false
    }
  })
  const emit = defineEmits(['submitChonDoiTuong', 'triggerSelected'])
  const isSelectAll = ref(false)
  const doiTuongDaChon = ref([])
  const keywordSearch = ref('')
  const loadingData = ref(false)
  const page = ref(0)
  const pageCount = ref(0)
  const total = ref(0)
  const dsDoiTuong = ref([])
  const getData = function (type) {
    if (type == 'reset') {
      page.value = 0
    }
    let filter = {
      api: props.itemUpdate.api,
      params: Object.assign(props.itemUpdate.paramsSearch, {
        keyword: keywordSearch.value,
        page: page.value,
        size: props.itemsPerPage
      }),
      data: {}
    }
    loadingData.value = true
    generalApi.getData(filter).then(function(result) {
      loadingData.value = false
      dsDoiTuong.value = props.itemUpdate.hasOwnProperty('responseDataApi') ? result[props.itemUpdate.responseDataApi] : result.content
      total.value = result.totalElements
      pageCount.value = result.totalPages
      // console.log('dsDoiTuong', dsDoiTuong.value)
    }).catch(function(){
      loadingData.value = false
      total.value = 0
      pageCount.value = 0
    })
  }
  const renderTemplate = function(item, temp) {
    let template = temp
    let replacedTemplate = template.replace(/data\['(\w+)'\]\['(\w+)'\]/g, (match, key1, key2) => {
      return item[key1] && item[key1][key2] ? item[key1][key2] : ''
    })
    let cleanTemp = DOMPurify.sanitize(replacedTemplate, { USE_PROFILES: { html: true } })
    return cleanTemp
  }
  const dateLocale = function (dateInput) {
		if (!dateInput) return ''
		let date = new Date(dateInput)
		return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
	}
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
  const changePage = function (pagePagination) {
    page.value = pagePagination.value - 1
    getData()
  }
  
  const init = function () {
    keywordSearch.value = ''
    doiTuongDaChon.value = [].concat(props.selected)
    // console.log('itemUpdate', props.itemUpdate)
    getData('reset')
  }
  const selectDoiTuong = function (item, index) {
    let exits = doiTuongDaChon.value ? doiTuongDaChon.value.find(function (x) {
      return item[props.itemUpdate.valueMapping] == x[props.itemUpdate.valueMapping]
    }) : false
    if (exits) {
      doiTuongDaChon.value = doiTuongDaChon.value.filter(function (y) {
        return y[props.itemUpdate.valueMapping] != item[props.itemUpdate.valueMapping]
      })

      isSelectAll.value = false;
    } else {
      if (props.itemUpdate.multiple) {
        doiTuongDaChon.value.push(item)
      } else {
        doiTuongDaChon.value = [item]
      }
    }
    if (props.triggerSelected) {
      emit('triggerSelected', doiTuongDaChon.value)
    }
  }
  const handleSelectAll = () => {
    isSelectAll.value = !isSelectAll.value;
    if (isSelectAll.value) {
      dsDoiTuong.value.forEach(element => {
        let check = doiTuongDaChon.value.find(function (el) {
          return el[props.itemUpdate.valueMapping] === element[props.itemUpdate.valueMapping]
        })
        if (!check) {
          doiTuongDaChon.value.push({...element})
        }
      })
    } else {
      let ds = [...doiTuongDaChon.value]
      ds.forEach(element => {
        let check = dsDoiTuong.value.find(function (el) {
          return el[props.itemUpdate.valueMapping] === element[props.itemUpdate.valueMapping]
        })
        if (check) {
          ds = ds.filter(function (y) {
            return y[props.itemUpdate.valueMapping] != element[props.itemUpdate.valueMapping]
          })
        }
      })
      doiTuongDaChon.value = [...ds];
    }
  }
  const deleteItem = function (item) {
    doiTuongDaChon.value = doiTuongDaChon.value.filter(function (i) {
      return i.MaDinhDanh !== item.MaDinhDanh
    })
    // console.log('doiTuongDaChon', doiTuongDaChon.value)
    if (props.triggerSelected) {
      emit('triggerSelected', doiTuongDaChon.value)
    }
  }  
  const checkExits = function (item) {
    if (!doiTuongDaChon.value.length) {
      return false
    } else {
      let x = doiTuongDaChon.value.find(function (i) {
        return i[props.itemUpdate.valueMapping] == item[props.itemUpdate.valueMapping]
      })
      return x ? true : false
    }
  }
  const getFormattedAddress = (addressObj) => {
    if (!addressObj) {
      return "";
    }
    const parts = [
      addressObj["SoNhaChiTiet"],
      addressObj.XaPhuong?.TenMuc,
      addressObj.HuyenQuan?.TenMuc,
      addressObj.TinhThanh?.TenMuc,
    ];
    const filteredParts = parts.filter((part) => part != null && part !== "");

    // Xử lý từng phần của địa chỉ
    let formattedAddress = "";
    for (let i = 0; i < filteredParts.length; i++) {
      formattedAddress += filteredParts[i];

      // Thêm dấu phẩy nếu không phải là phần tử cuối cùng
      // và phần tử tiếp theo tồn tại
      if (i < filteredParts.length - 1 && filteredParts[i + 1]) {
        formattedAddress += ", ";
      }
    }

    return formattedAddress || "";
  };
  const xacNhan = function () {
    console.log('doiTuongDaChon123', doiTuongDaChon.value)
    emit('submitChonDoiTuong', doiTuongDaChon.value)
  }
  onMounted(() => {
    init()
  })
  defineExpose({
		init, doiTuongDaChon
	})
</script>
<template>
  <v-card class="pa-0 thanhphanhoso" style="box-shadow: none !important;width: 100%;">
    <v-row class="mx-0 my-2">
      <v-col class="py-0 px-0 mb-2">
        <v-text-field
          v-model="keywordSearch"
          append-inner-icon="mdi-magnify"
          @keyup.enter="getData('reset')"
          @click:append-inner="getData('reset')"
          @click:prepend-inner="getData('reset')"
          placeholder="Nhập từ khóa tìm kiếm"
          dense
          hide-details="auto"
          class="input-form"
          clearable
        ></v-text-field>
      </v-col>

    </v-row>
    <v-row class="mx-0 my-0">
      <v-col cols="12" class="px-0 py-0 pb-1" v-if="doiTuongDaChon.length" style="max-height: 150px; overflow-y: scroll;">
        <span>Đã chọn ({{doiTuongDaChon.length}}):</span>
        <v-chip v-for="(item) in doiTuongDaChon" :key="item.MaDinhDanh" class="chipSelectedTable ma-2" closable color="var(--main-color)" label 
          @click:close="deleteItem(item)" style="padding: 5px 11px;font-size: 14px;"
        >
          <span v-if="itemUpdate.hasOwnProperty('customNameDisplay')">
            {{ item['BoNhiemViTri'][0]['CanBo']['HoVaTen'] }}
          </span>
          <span v-else>
            {{ itemUpdate.hasOwnProperty('nameDisplay2') ? item[itemUpdate.nameDisplay][itemUpdate.nameDisplay2] : item[itemUpdate.nameDisplay] }}
          </span>
        </v-chip>
      </v-col>
      <v-col cols="12" class="px-0 py-0 text-left my-0 mb-3 mt-2" v-if="doiTuongDaChon.length">
        <v-btn
          size="small"
          color="var(--main-color)"
          @click.stop="xacNhan" class="mx-0 white--text"
        >
          <v-icon size="18" class="">mdi-content-save-check-outline</v-icon>
          &nbsp;
          <span>Xác nhận</span>
        </v-btn>
      </v-col>
      <v-data-table
        :headers="itemUpdate.headers"
        :items="dsDoiTuong"
        :items-per-page="props.itemsPerPage"
        item-value="primKey"
        hide-default-footer
        class="table-base table-tphs"
        no-data-text="Không có dữ liệu"
        loading-text="Đang tải"
        :loading="loadingData"
      >
        <template v-slot:headers>
          <tr>
            <th v-for="(header, i) in itemUpdate.headers" :key="i" :class="header['class']">
              <span class="text-header v-data-table-header__content" v-if="header.type !== 'select'" style="font-weight: 600;">
                {{ header.title }}
              </span>
              <div v-else>
                <v-checkbox
                  v-if="itemUpdate?.multiple"
                  class="checkbox-remember"
                  color="var(--main-color)"
                  hide-details
                  :model-value="isSelectAll"
                  @click.stop="handleSelectAll"
                  readonly
                ></v-checkbox>
              </div>
            </th>
          </tr>
        </template>

        <template v-slot:item="{ item, index }">
          <tr>
            <td v-for="(itemHeader, indexHeader) in itemUpdate.headers" style="vertical-align: top" :key="indexHeader" :class="itemHeader['class']" :width="itemHeader.hasOwnProperty('width') ? itemHeader.width : ''">
              <div v-if="itemHeader.type == 'select'">
                <div :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">
                  <v-checkbox
                    class="checkbox-remember"
                    color="var(--main-color)"
                    :model-value="checkExits(item)"
                    @click.stop="selectDoiTuong(item, index)"
                    hide-details
                  ></v-checkbox>
                </div>
              </div>
              <div v-if="itemHeader.type == 'index'">
                <div v-if="itemsPerPage" :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">{{ (page+1) * itemsPerPage - itemsPerPage + index + 1 }}</div>
                <div v-else :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">{{ (page+1) * itemsPerPage - itemsPerPage + index + 1 }}</div>
              </div>
              <div v-else-if="itemHeader.type == 'date'" :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">
                {{ item.hasOwnProperty(itemHeader.value) && item[itemHeader.value] ? dateLocale(item[itemHeader.value]) : '' }}
              </div>
              <div v-else-if="itemHeader.type == 'thongtindiachi'" :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">
                {{ getFormattedAddress(item['DiaChi']) }}
              </div>
              <div v-else-if="itemHeader.type == 'object'" :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">
                {{ item.hasOwnProperty(itemHeader.value) && item[itemHeader.value] ? item[itemHeader.value][itemHeader.mapping] : '' }}
              </div>
              <div v-else-if="itemHeader.type == 'object-2'" :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">
                {{ item.hasOwnProperty(itemHeader.value) && item[itemHeader.value][itemHeader.mapping] ? item[itemHeader.value][itemHeader.mapping][itemHeader.mapping2] : '' }}
              </div>
              <div v-else-if="itemHeader.type == 'objectDate'" :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">
                {{ item.hasOwnProperty(itemHeader.value) && item[itemHeader.value] ? dateLocale(item[itemHeader.value][itemHeader.mapping]) : '' }}
              </div>
              <div v-else-if="itemHeader.type == 'template'" :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">
                <div v-html="renderTemplate(item, itemHeader.template)"></div>
              </div>
              <div v-else-if="itemHeader.type == 'thongtincanhantochuc'" :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">
                <p><b>{{ item['TenGoi'] }}</b></p>
                <p class="mt-1">
                  Số giấy: <b>{{ item?.GiayToChungNhan?.SoGiay }}</b>
                  - Nơi cấp: <b>{{ item?.GiayToChungNhan?.NoiCap }}</b>
                  - Ngày cấp: <b>{{ dateLocale(item?.GiayToChungNhan?.NgayCap) }}</b>
                </p>
              </div>
              <div v-else-if="itemHeader.type == 'checkbox'" :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : 'text-align: center;'">
                <v-checkbox
                  class="checkbox-remember"
                  color="var(--main-color)"
                  :model-value="item[itemHeader.value]"
                  hide-details
                  readonly
                ></v-checkbox>
              </div>
              <div v-else-if="itemHeader.type == 'mark'" :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : 'text-align: center'">
                <v-icon v-if="item[itemHeader.value]" size="22" color="var(--main-color)">mdi-check</v-icon>
              </div>
              <div v-else-if="itemHeader.type == 'TepDinhKem'" :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">
                <div class="">
                  <TepTinDinhKem ref="uploadRefX" :idComponent="'x'" 
                  :tepInput="item[itemHeader['value']] ? (Array.isArray(item[itemHeader['value']]) ? item[itemHeader['value']] : [item[itemHeader['value']]]) : []" :edit="false"></TepTinDinhKem>
                </div>
              </div>
              <div v-else :style="itemHeader.hasOwnProperty('style') ? itemHeader.style : ''">
                {{ getValue(item, itemHeader.value) }}
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
      <Pagination v-if="total" :pageInput="page+1" :pageCount="pageCount" :total="total" @changePage="changePage"></Pagination>
    </v-row>
    <v-row v-if="total" class="mt-3">
      <v-col class="align-center justify-center py-0 px-0 mb-4">
        <v-btn
          size="small"
          color="var(--main-color)"
          @click.stop="xacNhan" class="mx-0 white--text"
          :loading="props.loadingForm"
        >
          <v-icon size="18" class="">mdi-content-save-check-outline</v-icon>
          &nbsp;
          <span>Xác nhận</span>
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<style>
  .chipSelectedTable {
    height: auto !important;
    overflow: visible !important;
    white-space: pre-wrap !important;
  }
</style>