<template>
  <div>
    <v-dialog max-width="1000" v-model="dialogModel" persistent scrollable>
      <v-card>
        <v-toolbar dark color="primary" class="px-0">
          <div class="sub-header d-flex align-center justify-start py-0 px-0">
            <div class="sub-header-content">
              {{ name ?? 'Thông tin tệp XML' }}
            </div>
            <div class="triangle-header"></div>
          </div>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-custom"
              size="small"
              icon
              color="#E9FFF2"
              @click="close()"
            >
              <v-icon size="20">mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="px-3 pt-3" style="overflow-y: hidden">
          <div v-if="loading" class="d-flex justify-center align-center h-100">
            <v-progress-circular
              color="var(--main-color)"
              indeterminate
            ></v-progress-circular>
          </div>
          <div v-else>
            <div
              v-if="noiDungGoiTin"
              class="editor-config"
              style="
                border: 1px solid #e0e0e0;
                max-height: 700px;
                overflow-y: scroll;
                margin-top: 10px;
              "
            >
              <highlightjs language="xml" :code="noiDungGoiTin" />
            </div>
            <v-row class="my-0 mx-0" v-else>
              <v-col class="px-0 py-0">
                <v-data-table
                  :headers="headers"
                  :items="dsNoiDungTraLoi"
                  :items-per-page="itemsPerPage"
                  item-value="primKey"
                  hide-default-footer
                  class="table-base"
                  :loading="loadingData"
                  no-data-text="Không có dữ liệu"
                  loading-text="Đang tải"
                >
                  <template #headers>
                    <tr>
                      <th
                        v-for="header in headers"
                        :key="header.value"
                        :class="header.class"
                        :width="header.width"
                      >
                        <div
                          :style="
                            header.hasOwnProperty('style') ? header.style : ''
                          "
                        >
                          <span>{{ header.title }}</span>
                        </div>
                      </th>
                    </tr>
                  </template>
                  <template v-slot:item="{ item, index }">
                    <tr>
                      <td
                        v-for="(itemHeader, indexHeader) in headers"
                        :key="indexHeader"
                        :class="itemHeader['class']"
                        :width="
                          itemHeader.hasOwnProperty('width')
                            ? itemHeader.width
                            : ''
                        "
                      >
                        <div v-if="itemHeader.type == 'index'">
                          <div
                            :style="
                              itemHeader.hasOwnProperty('style')
                                ? itemHeader.style
                                : ''
                            "
                          >
                            {{ index + 1 }}
                          </div>
                        </div>
                        <div
                          v-else-if="itemHeader.type == 'date'"
                          :style="
                            itemHeader.hasOwnProperty('style')
                              ? itemHeader.style
                              : ''
                          "
                        >
                          {{
                            item.hasOwnProperty(itemHeader.value)
                              ? dateLocale(item[itemHeader.value])
                              : ''
                          }}
                        </div>
                        <div
                          v-else-if="itemHeader.type == 'object'"
                          :style="
                            itemHeader.hasOwnProperty('style')
                              ? itemHeader.style
                              : ''
                          "
                        >
                          {{
                            item.hasOwnProperty(itemHeader.value) &&
                            item[itemHeader.value]
                              ? item[itemHeader.value][itemHeader.mapping]
                              : ''
                          }}
                        </div>
                        <div
                          v-else
                          :style="
                            itemHeader.hasOwnProperty('style')
                              ? itemHeader.style
                              : ''
                          "
                        >
                          {{ getValue(item, itemHeader.value) }}
                        </div>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
                <!-- <Pagination
                  :pageInput="page + 1"
                  :pageCount="pageCount"
                  :total="total"
                  @changePage="changePage"
                  style="margin-bottom: 50px"
                ></Pagination> -->
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="ma-auto">
          <v-btn
            class="btn-custom"
            variant="outlined"
            color="var(--main-color)"
            @click="close()"
          >
            <v-icon size="20">mdi-close</v-icon>
            Thoát
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getValue, dateLocale } from '@/helpers/index'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import 'highlight.js/styles/default.css'
const highlightjs = hljsVuePlugin.component
import { generalApi } from '@/api'

const emit = defineEmits(['closePopup'])

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: '',
  },
  maDinhDanh: {
    type: String,
    default: '',
  },
  infoXML: {
    type: String,
    default: '',
  },
})

const noiDungGoiTin = ref('')
const dsNoiDungTraLoi = ref([])
const dialogModel = ref(props.dialog)
const loading = ref(false)

const headers = ref([
  {
    key: 0,
    sortable: false,
    title: 'STT',
    align: 'center',
    value: 'stt',
    type: 'index',
    class: 'th-center verticalAlignTop td-center py-1',
    width: 50,
  },
  {
    key: 1,
    sortable: false,
    title: 'Tên học sinh',
    align: 'center',
    value: 'ten_hoc_sinh',
    class: 'th-left verticalAlignTop',
    width: 150,
  },
  {
    key: 2,
    sortable: false,
    title: 'Mã học sinh',
    align: 'center',
    value: 'ma_hoc_sinh',
    class: 'th-center text-center verticalAlignTop',
    width: 150,
  },
  {
    key: 4,
    sortable: false,
    title: 'Số CCCD',
    align: 'center',
    value: 'so_cccd',
    class: 'th-center text-center',
    width: 150,
  },
  {
    key: 5,
    sortable: false,
    title: 'Mã học bạ',
    align: 'center',
    value: 'ma_dinh_danh_hoc_ba',
    class: 'th-left',
    width: 150,
  },
])

const formatXML = function (xml) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xml, 'text/xml')
  const serializer = new XMLSerializer()
  return serializer
    .serializeToString(xmlDoc)
    .replace(/></g, '>\n<')
    .replace(/><\/(\w+)>/g, '>\n</$1>')
    .replace(/<(\w+)><(\w+)/g, '<$1>\n<$2')
}

const xemGoiTin = function () {
  try {
    if (props.infoXML) {
      noiDungGoiTin.value = props.infoXML
    } else {
      loading.value = true
      let filter = {
        api: `/dulieuchu/tracuu/internal/tepdulieu/1.0/viewfile?fileName=${props.maDinhDanh}`,
      }
      generalApi.getData(filter).then((result) => {
        // Decode base64 with proper UTF-8 handling
        if (result.data?.content) {
          const base64 = result.data.content
          const binary = window.atob(base64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
          }
          const xmlString = new TextDecoder('utf-8').decode(bytes)
          noiDungGoiTin.value = formatXML(xmlString)
        } else {
          dsNoiDungTraLoi.value = result?.data?.Body?.Result?.Items?.Item
          dsNoiDungTraLoi.value = dsNoiDungTraLoi.value.filter(
            (el) => el.trang_thai === '1'
          )
          console.log(dsNoiDungTraLoi.value)
        }
        loading.value = false
      })
    }
  } catch (error) {
    loading.value = false
    console.log(error)
  }
}

onMounted(() => {
  xemGoiTin()
})

function close() {
  emit('closePopup')
}
</script>
