<script setup>
  import axios from 'axios'
  import * as pdfjsLib from 'pdfjs-dist'
  import 'pdfjs-dist/legacy/build/pdf.worker.min.mjs'
  
  import * as fabric from 'fabric'
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useAppStore } from '@/stores'
  const props = defineProps({
    pdfBase64: {
      type: String,
      default: ''
    },
    thongTinMauChuKy: {
      type: Object,
      default: null
    },
    mode: {
      type: Number,
      default: 1
    },
    tenFile: {
      type: String,
      default: ''
    }
  })

  const appStore = useAppStore()
  const loadingSign = ref(false)
  const dialogPreview = ref(true)

  const pdfCanvas = ref(null)
  const pdfDataSave = ref(null)
  const fabricCanvas = ref(null);
  const currentPage = ref(1)
  const totalPage = ref(0)
  const rectCoordinate = ref(null)
  const scalePdf = ref(1.5)
  const emits = defineEmits(['handleDataSigned'])

  const initData = function () {
    dialogPreview.value = true
    renderPdfPage()
  }
  // Hàm để render trang PDF
  const renderPdfPage = async () => {
    // console.log('props.pdfBase64', props.pdfBase64)
    let pdf = null
    pdf = await pdfjsLib.getDocument({data: atob(props.pdfBase64)}).promise;
    let page = await pdf.getPage(currentPage.value); // Lấy trang đầu tiên, bạn có thể thay đổi số trang nếu muốn
    totalPage.value = pdf.numPages

    const viewport = page.getViewport({ scale: scalePdf.value });
    const canvas = document.getElementById('pdf-doc');
    const context = canvas.getContext('2d');

    // Cập nhật kích thước canvas
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Khởi tạo fabric canvas sau khi trang PDF được render xong
    initializeFabricCanvas(canvas);
  };

  // Hàm để khởi tạo fabric canvas
  const initializeFabricCanvas = (pdfCanvas) => {
    if (fabricCanvas.value) {
      fabricCanvas.value.dispose(); // Hủy bỏ canvas cũ
    }
    const fabricCanvasElement = document.getElementById('fabric-canvas');
    fabricCanvas.value = new fabric.Canvas(fabricCanvasElement);

    // Đặt kích thước cho fabric canvas khớp với PDF canvas
    fabricCanvasElement.width = pdfCanvas.width;
    fabricCanvasElement.height = pdfCanvas.height;

    fabricCanvas.value.setHeight(pdfCanvas.height);
    fabricCanvas.value.setWidth(pdfCanvas.width);

    // Thêm chức năng vẽ hình chữ nhật
    fabricCanvas.value.isDrawingMode = true;
    // fabricCanvas.value.freeDrawingBrush.width = 0; // Đảm bảo không vẽ tự do
    fabricCanvas.value.selection = false; // Ngăn chọn không cần thiết

    // Tắt chế độ vẽ tự do sau khi vẽ hình chữ nhật
    fabricCanvas.value.on('mouse:up', () => {
      fabricCanvas.value.isDrawingMode = false;
    });

    // Thêm event lắng nghe cho hành động vẽ hình chữ nhật
    fabricCanvas.value.on('mouse:down', function (opt) {
      // Xóa tất cả các đối tượng hiện tại trên canvas trước khi vẽ mới
      fabricCanvas.value.clear();
        // 
      const pointer = fabricCanvas.value.getPointer(opt.e);
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: 'rgba(0,0,0,0.2)',
        stroke: 'black',
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });

      fabricCanvas.value.add(rect);

      fabricCanvas.value.on('mouse:move', function (opt) {
        const pointer = fabricCanvas.value.getPointer(opt.e);
        rect.set({
          width: pointer.x - rect.left,
          height: pointer.y - rect.top,
        });
        fabricCanvas.value.renderAll();
      });

      fabricCanvas.value.on('mouse:up', function () {
        fabricCanvas.value.isDrawingMode = false;
        fabricCanvas.value.off('mouse:move');
        rectCoordinate.value = {
          x: rect.left/scalePdf.value,
          y: rect.top/scalePdf.value,
          w: rect.width/scalePdf.value,
          h: rect.height/scalePdf.value
        }
      });
    });
  };

  // Hàm lấy tọa độ của hình chữ nhật
  const getRectangleCoordinates = () => {
    const rects = fabricCanvas.value.getObjects('rect');
    rects.forEach((rect) => {
      console.log('Rectangle Coordinates:', {
        left: rect.left,
        top: rect.top,
        width: rect.width < 0 ? rect.width*(-1) : rect.width,
        height: rect.height < 0 ? rect.height*(-1) : rect.height,
      });
    });
  };
  const submitCoordinate = function () {
    let data = {...rectCoordinate.value, ...{fileName: props.tenFile, page: currentPage.value, dataSign: props.pdfBase64}}
    let signatureTextOption =  {
      // "withText": props.thongTinMauChuKy.withText,
      "withText": true,
      "withCertCommonName": props.thongTinMauChuKy.withText ? props.thongTinMauChuKy.withCertCommonName : false,
      "withCertEmail": props.thongTinMauChuKy.withText ? props.thongTinMauChuKy.withCertEmail : false,
      "withOrganistion": props.thongTinMauChuKy.withText ? props.thongTinMauChuKy.withOrganistion : false,
      "withTime": props.thongTinMauChuKy.withText ? props.thongTinMauChuKy.withTime : false,
      "customText": props.thongTinMauChuKy.withText ? props.thongTinMauChuKy.customText : '',
      "signerTextPosition": props.thongTinMauChuKy.signerTextPosition,
      "mode": props.mode,
      "delimiter": props.thongTinMauChuKy.withText ? "\n" : ""
    }
    try {
      let dataCheck_SignatureTextOption = JSON.parse(localStorage.getItem('signatureTextOption'))
      if (dataCheck_SignatureTextOption) {
        signatureTextOption = Object.assign(signatureTextOption, dataCheck_SignatureTextOption)
      }
    } catch (error) {
    }
    let signOption = {
      "signatureTextOption": signatureTextOption,
      "signatureImageOption": {
        "withImage": props.thongTinMauChuKy.withImage,
        "signatureImageBase64": props.thongTinMauChuKy.signatureImageBase64
      }
    }
    data = Object.assign(data, signOption)
    console.log('data', data)
    let dataSign = JSON.stringify([data])
    let config = {
      method: 'post',
      url: 'https://localhost:4567/signmultiPDFv2',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : dataSign
    };
    loadingSign.value = true
    axios.request(config)
    .then((response) => {
      loadingSign.value = false
      emits('handleDataSigned', response.result[0]['fileContent'])
    })
    .catch((error) => {
      loadingSign.value = false
      appStore.error("Ký số thất bại");
      console.log(error);
    });
  }
  const submitCoordinate1 = function () {
    let data = {
      "X": rectCoordinate.value.x,
      "Y": rectCoordinate.value.y,
      "w": rectCoordinate.value.w,
      "h": rectCoordinate.value.h,
      "page": currentPage.value, 
      "mode": props.mode, 
      "dataSign": props.pdfBase64
    }
    console.log('data', data)
    let dataSign = JSON.stringify(data)
    let config = {
      method: 'post',
      url: 'https://localhost:4567/signPDF',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : dataSign
    };
    loadingSign.value = true
    axios.request(config)
    .then((response) => {
      loadingSign.value = false
      emits('handleDataSigned', response.result)
    })
    .catch((error) => {
      loadingSign.value = false
      appStore.error("Ký số thất bại");
      console.log(error);
    });
  }
  const changePage = function (action) {
    if (action === 'first') {
      currentPage.value = 1
    } else if (action === 'priv') {
      if (currentPage.value !== 1) {
        currentPage.value -= 1
      } else {
        return
      }
    } else if (action === 'next') {
      if (currentPage.value !== totalPage.value) {
        currentPage.value += 1
      } else {
        return
      }
    } else {
      currentPage.value = totalPage.value
    }
    renderPdfPage();
  }

  // 
  onMounted(() => {
    renderPdfPage();
  })
  defineExpose({
		initData
	})
</script>
<template>
  <v-card class="pa-0 thanhphanhoso" style="box-shadow: none !important;width: 100%;">
    <v-dialog fullscreen
      v-model="dialogPreview"
      persistent
    >
      <v-card>
        <v-toolbar
          dark
          color="var(--main-color)" class="px-0"
        >
          <v-col class="sub-header d-flex align-center justify-start py-0 px-0">
            <div class="sub-header-content">
              Chọn vị trí đặt chữ ký
            </div>
            <div class="triangle-header"></div>
          </v-col>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn variant="flat" size="small" icon color="#E9FFF2" @click="dialogPreview = false" >
              <v-icon size="20">mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="my-0 px-0 py-0" style="margin: 0 auto;">
          <div style="text-align: center; position: relative">
            <div style="display: inline-block;">
              <button class="btn-pdf-page" @click="changePage('first')"><i class="fa fa-angle-double-left icon-btn"></i></button>
              <button class="btn-pdf-page" @click="changePage('priv')"><i class="fa fa-angle-left icon-btn"></i></button>
              <span style="font-size: 18px;color: #6c757d;padding: 5px 10px;border-radius: 5px;">
                Trang {{ currentPage }} / {{ totalPage }}
              </span>
              <button class="btn-pdf-page" @click="changePage('next')"><i class="fa fa-angle-right icon-btn"></i></button>
              <button class="btn-pdf-page" @click="changePage('last')"><i class="fa fa-angle-double-right icon-btn"></i></button>
            </div>
            <v-btn
              size="small"
              color="var(--main-color)"
              class="mx-0"
              @click.stop="submitCoordinate"
              height="32px"
              :loading="loadingSign"
              :disabled="!rectCoordinate || loadingSign"
              :readonly="!rectCoordinate"
              style="position: absolute; right: 0"
            >
              <v-icon size="16" color="#ffffff" class="mr-2">mdi-content-save-all
              </v-icon>
              <span>Tiếp tục</span>
            </v-btn>
          </div>
          <div id="canvas-container" style="position: relative;">
            <canvas id="pdf-doc" ref="pdfCanvas"  style=" border: 2px solid #dedede"></canvas>
            <canvas id="fabric-canvas" style="position: absolute; top: 0; left: 0;"></canvas>
          </div>
          <div style="text-align: center; position: relative">
            <div style="display: inline-block;">
              <button class="btn-pdf-page" @click="changePage('first')"><i class="fa fa-angle-double-left icon-btn"></i></button>
              <button class="btn-pdf-page" @click="changePage('priv')"><i class="fa fa-angle-left icon-btn"></i></button>
              <span style="font-size: 18px;color: #6c757d;padding: 5px 10px;border-radius: 5px;">
                Trang {{ currentPage }} / {{ totalPage }}
              </span>
              <button class="btn-pdf-page" @click="changePage('next')"><i class="fa fa-angle-right icon-btn"></i></button>
              <button class="btn-pdf-page" @click="changePage('last')"><i class="fa fa-angle-double-right icon-btn"></i></button>
            </div>
            <v-btn
              size="small"
              color="var(--main-color)"
              class="mx-0"
              @click.stop="submitCoordinate"
              height="32px"
              :loading="loadingSign"
              :disabled="!rectCoordinate || loadingSign"
              :readonly="!rectCoordinate"
              style="position: absolute; right: 0"
            >
              <v-icon size="16" color="#ffffff" class="mr-2">mdi-content-save-all
              </v-icon>
              <span>Tiếp tục</span>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
  
</template>

<style>
  .canvas-container {
    position: absolute !important;
    top: 0 !important;
    left: 0
  }
  .btn-pdf-page {
    width: 32px;
    height: 36px;
  }
  .table-tphs tr td {
    height: 42px !important;
    min-height: 42px
  }
  @media (min-width: 1024px) {
    .about {
      min-height: 100vh;
      display: flex;
      align-items: center;
    }
  }
</style>
