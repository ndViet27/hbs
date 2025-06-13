<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { useAppStore } from '@/stores'
import FormCRUD from '@/components/FormCRUD.vue'

const props = defineProps({
  modelValue: Boolean,
  loadingAction: {
    type: Boolean,
    default: false
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'submitFormXetDuyet', 'cancel'])

const appStore = useAppStore()
const refsFormDuyetChungThu = ref(null)

const mauTuChoi = [
  {
    "fieldName": "LyDoTuChoi",
    "fieldLabel": "Lý do từ chối",
    "fieldType": "textarea",
    "fieldClass": "v-col-xs-12 v-col-12",
    "placeHolder": "Nhập lý do từ chối",
    "defaultValue": "",
    "dataType": "",
    "dataSource": "",
    "autoEvent": "",
    "required": true,
    "rules": [],
    "readonly": false
  }
]

const closeDialog = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const submitForm = async () => {
  let valid = await refsFormDuyetChungThu.value.validateForm()
  if (!valid) {
    appStore.error('Vui lòng nhập đầy đủ thông tin')
    return
  }
  
  const dataForm = await refsFormDuyetChungThu.value.submit()
  emit('submitFormXetDuyet', {
    accepted: false,
    lyDoTuChoi: dataForm.LyDoTuChoi,
    items: props.items
  })
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="700">
    <v-card>
      <v-toolbar dark color="var(--main-color)" class="px-0">
        <v-col col="12" class="sub-header d-flex align-center justify-start py-0 px-0">
          <div class="sub-header-content">
            <span>Xét duyệt chứng thư</span>
          </div>
          <div class="triangle-header"></div>
        </v-col>
        <v-toolbar-items>
          <v-btn variant="flat" size="small" icon color="#E9FFF2" @click="closeDialog">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="px-3">
        <FormCRUD ref="refsFormDuyetChungThu" :mauNhap="mauTuChoi"></FormCRUD>
        <v-col cols="12" class="align-center justify-center py-0 px-0 mt-3">
          <v-btn
            class="mr-3"
            size="small"
            variant="outlined"
            color="var(--main-color)"
            @click="closeDialog"
            height="28px"
          >
            <v-icon size="18" color="var(--main-color)" class="mr-1">mdi-close</v-icon>
            <span style="font-size: 14px; text-transform: none">Hủy</span>
          </v-btn>
          <v-btn
            size="small"
            color="var(--main-color)"
            @click.stop="submitForm" 
            class="mx-0 white--text"
            :loading="loadingAction"
            :disabled="loadingAction"
          >
            <v-icon size="18" class="">mdi-content-save-check-outline</v-icon>
            &nbsp;
            <span>Xác nhận</span>
          </v-btn>
        </v-col>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
