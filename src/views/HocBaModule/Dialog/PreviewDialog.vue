<template>
  <v-dialog v-model="props.isShowDialog" persistent fullscreen>
    <v-card style="overflow-y: hidden">
      <v-row class="my-0 mx-0" style="height: 40px !important">
        <v-col
          cols="3"
          style="
            background-color: #00717d;
            border-bottom: 1px solid #e0e0e0;
            height: 40px !important;
          "
          class="sub-header d-flex align-center justify-start py-0 px-0 text-h6"
        >
          <span
            class="ml-3 d-flex align-center uppercase font-weight-bold text-white h-100"
          >
            Thông tin chữ ký số
          </span>
        </v-col>
        <v-col
          cols="9"
          class="d-flex align-center justify-end text-right bg-white px-0 py-0"
          style="height: 40px !important"
        >
          <v-btn variant="flat" size="small" icon @click="toggleDialog">
            <v-icon size="25" color="#FF0000">mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-card-text class="my-0 px-0 py-0" style="overflow-y: hidden">
        <v-row class="my-0 mx-0">
          <v-col
            v-if="!loading"
            cols="3"
            class="px-0 py-0 position-fixed"
            style="border-right: 1px solid #e0e0e0"
          >
            <div
              class="pa-2"
              style="overflow-y: scroll; height: calc(100vh - 90px)"
            >
              <div v-for="(item, index) in dsChuKySo" :key="index">
                <div v-if="item?.ho_va_ten" class="pb-4">
                  <div class="d-flex align-center">
                    <v-icon color="#C0C0C0" class="mr-2">mdi-file-sign</v-icon>
                    <p class="font-weight-bold">
                      {{ `Ký bởi: ${item?.ho_va_ten ?? ''}` }}
                    </p>
                  </div>
                  <div class="content-certificate ml-1">
                    <div
                      class="mb-1 font-weight-bold"
                      v-if="item?.chuc_vu_cong_tac?.ten_chuc_vu_cong_tac"
                    >
                      Chức vụ:
                      <span class="font-weight-regular">{{
                        item?.chuc_vu_cong_tac?.ten_chuc_vu_cong_tac ?? ''
                      }}</span>
                    </div>
                    <div
                      class="d-flex align-center font-weight-bold cursor-pointer"
                      @click.stop="handleDownloadFileCer(item)"
                    >
                      Chứng thư số:
                      <img
                        class="img-login-logo ml-2"
                        src="../../../assets/images/icon-certificate.svg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="9" class="px-0 py-0" style="margin-left: 25%">
            <div
              v-if="loading"
              class="d-flex justify-center align-center h-100"
            >
              <v-progress-circular
                size="50"
                color="var(--main-color)"
                indeterminate
              ></v-progress-circular>
            </div>
            <div v-else>
              <iframe
                v-if="previewUrl"
                :src="previewUrl"
                type="application/pdf"
                width="100%"
                height="100%"
                style="overflow: auto; min-height: 100vh"
                frameborder="0"
              >
              </iframe>
              <div
                v-else
                class="d-flex flex-column align-center justify-center"
                style="overflow: auto; min-height: 600px"
              >
                <div class="text-h5 pt-2">Không có dữ liệu</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import JSZip from 'jszip'
import * as docx from 'docx-preview'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import PizZipUtils from 'pizzip/utils/index.js'
import angularParser from 'docxtemplater/js/expressions'
import { onMounted, ref, watch } from 'vue'
import { generalApi } from '@/api'
import { useAppStore } from '@/stores'
import { base64ToBlob, blobToBase64, convertNameFile } from '@/helpers/index'
const props = defineProps({
  dialogName: {
    type: String,
    default: '',
  },
  isShowDialog: {
    type: Boolean,
    default: false,
  },
  urlPreview: {
    type: String,
    default: '',
  },
  infoHocBa: {
    type: Object,
    default: {},
  },
})

const emits = defineEmits(['toggleDialog', 'setPreviewUrl'])

const appStore = useAppStore()

const loading = ref(true)

const urlTempDocxTieuHoc = ref('../templates/HOC_BA_TIEU_HOC.docx')
const urlTempDocxTHCS = ref('../templates/HOC_BA_THCS.docx')
const urlTempDocxTHPT = ref('../templates/HOC_BA_THPT.docx')

const previewUrl = ref('')
const thongTinHocBa = ref({})
const dsChuKySo = ref([])
const toggleDialog = () => {
  emits('toggleDialog')
}

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback)
}

const getChungThuCoSoGiaoDuc = async (id, ngayKy) => {
  if (id && ngayKy) {
    let filter = {
      api: '/dulieuchu/tracuu/internal/chungthuso/1.0/cosogiaoduc',
      params: {
        coSoGiaoDucId: id,
        ngayKyPhatHanh: '2024-11-10',
      },
    }
    return await generalApi.getData(filter)
  }
}

const getThongTinDoiTuong = function () {
  let filter = {
    path: '/dulieuchu/tracuu/internal',
    collection: 'hocba',
    primKey: props.infoHocBa?.primKey,
  }
  loading.value = true
  generalApi
    .getChiTietDoiTuong(filter)
    .then(async function (result) {
      thongTinHocBa.value = result.data

      const chuKyCSDL = await getChungThuCoSoGiaoDuc(
        result.data.co_so_giao_duc.co_so_giao_duc_id,
        result.data.ngay_ky_phat_hanh
      )

      if (chuKyCSDL && chuKyCSDL.data) {
        let info = chuKyCSDL.data
        dsChuKySo.value.push({
          ho_va_ten: info?.doi_tuong_thue_bao?.ten_doi_tuong_thue_bao,
          signature: info?.thong_tin_chung_thu?.x_509_certificate,
        })
      }

      dsChuKySo.value.push(result.data.giam_hieu_ky_hoc_ba)
      dsChuKySo.value.push({
        ...result.data.giao_vien_chu_nhiem,
        chuc_vu_cong_tac: {
          ten_chuc_vu_cong_tac: 'Giáo viên chủ nhiệm',
        },
      })

      let dsGVBM = result.data.bang_diem_hoc_ba
        .map((el) => ({
          ...el['giao_vien_bo_mon'],
          chuc_vu_cong_tac: {
            ten_chuc_vu_cong_tac: 'Giáo viên bộ môn',
          },
        }))
        .filter((el) => el.ho_va_ten)

      console.log('dsGVBM', dsGVBM)

      dsChuKySo.value = dsChuKySo.value.concat(dsGVBM)

      console.log('dsChuKySo.value', dsChuKySo.value)

      genDocxTempRemote(thongTinHocBa.value)
    })
    .catch(function (error) {
      console.log(error)
      loading.value = false
    })
}

const handleDownloadFileCer = (data) => {
  if (!data.signature) {
    appStore.error('Không có thông tin chữ ký số')
    return
  }
  const base64 = btoa(data.signature)

  let fileName = `ChuKySo-${convertNameFile(data.ho_va_ten)}`

  // Create blob from base64
  let blobFile = base64ToBlob(base64, fileName, 'application/x-x509-ca-cert')
  let urlFile = window.URL.createObjectURL(blobFile)

  // Create download link
  let a = document.createElement('a')
  document.body.appendChild(a)
  a.style = 'display: none'
  a.href = urlFile
  a.download = `${fileName}.cer`
  a.click()

  // Cleanup
  window.URL.revokeObjectURL(urlFile)
  document.body.removeChild(a)
}

const genDocxTempRemote = function (data) {
  console.log('data', data)
  try {
    let docxTemplateUrl
    if (data?.cap_hoc_id === '03') {
      docxTemplateUrl = urlTempDocxTHCS.value
    } else if (data?.cap_hoc_id === '04') {
      docxTemplateUrl = urlTempDocxTHPT.value
    } else {
      docxTemplateUrl = urlTempDocxTieuHoc.value
    }
    if (!docxTemplateUrl) {
      alert('Chưa có mẫu học bạ')
      return
    }
    loading.value = true
    loadFile(docxTemplateUrl, function (error, content) {
      if (error) {
        throw error
      }
      const zip = new PizZip(content)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: angularParser,
      })
      doc.setData(data)
      try {
        doc.render()
      } catch (error) {
        function replaceErrors(key, value) {
          if (value instanceof Error) {
            return Object.getOwnPropertyNames(value).reduce(function (
              error,
              key
            ) {
              error[key] = value[key]
              return error
            },
            {})
          }
          return value
        }
        console.log(JSON.stringify({ error: error }, replaceErrors))
        if (error.properties && error.properties.errors instanceof Array) {
          const errorMessages = error.properties.errors
            .map(function (error) {
              return error.properties.explanation
            })
            .join('\n')
          console.log('errorMessages', errorMessages)
        }
        throw error
      }
      let blob = doc.getZip().generate({
        type: 'blob',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        compression: 'DEFLATE',
      })

      blobToBase64(blob)
        .then(function (base64) {
          let data = {
            base64docx: base64,
          }
          loading.value = true
          generalApi
            .docxToPdf(data)
            .then(function (result) {
              loading.value = false
              previewUrl.value = window.URL.createObjectURL(result.data)

              emits('setPreviewUrl', previewUrl.value)
              loading.value = false
            })
            .catch((error) => {
              appStore.error('Lỗi không tải được mẫu học bạ')
              console.log('error-convert-pdf', error)
              loading.value = false
            })
        })
        .catch((error) => {
          console.log('error-convert-pdf', error)
          loading.value = false
        })
    })
  } catch (error) {
    console.log('error', error)
    loading.value = false
  }
}

watch(
  () => props.isShowDialog,
  (newVal, oldVal) => {
    if (newVal) {
      if (props.infoHocBa?.previewUrl) {
        previewUrl.value = props.infoHocBa?.previewUrl
      } else {
        getThongTinDoiTuong()
      }
    }
  }
)
</script>

<style scoped>
.content-certificate {
  border-left: 2px solid #c0c0c0;
  padding-left: 20px;
}
</style>
