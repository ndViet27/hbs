<template>
  <div>
    <v-dialog width="600" v-model="dialogModel" persistent scrollable>
      <v-card>
        <v-toolbar dark color="primary" class="px-0">
          <div class="sub-header d-flex align-center justify-start py-0 px-0">
            <div class="sub-header-content">Thông tin tệp chứng thư</div>
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
        <v-card-text class="px-3 pt-3">
          <v-row class="mx-0 my-0">
            <v-col class="px-0 py-0">
              <div
                class="info-group d-flex mb-2"
                v-for="(item, index) in formInfo"
                :key="index"
              >
                <label class="mr-1">{{ `${item.label}:` }}</label>
                <div v-if="item.type === 'date'">
                  {{
                    infoFileCer.hasOwnProperty(item.value) &&
                    infoFileCer[item.value]
                      ? dateLocale(infoFileCer[item.value])
                      : ''
                  }}
                </div>
                <div v-else-if="item.type === 'boolean'">
                  <v-checkbox
                    :model-value="infoFileCer[item.value]"
                    color="var(--main-color)"
                    class="flex"
                    hide-details
                    readonly
                  >
                  </v-checkbox>
                </div>
                <div v-else-if="item.type === 'list'">
                  {{ arrayToString(infoFileCer[item.value], item.mapping) }}
                </div>
                <div v-else-if="item.type === 'object'">
                  {{
                    infoFileCer.hasOwnProperty(item.value) &&
                    infoFileCer[item.value]
                      ? infoFileCer[item.value][item.mapping]
                      : ''
                  }}
                </div>
                <div v-else>
                  {{ getValue(infoFileCer, item.value) }}
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getValue, dateLocale, arrayToString } from '@/helpers/index'
const emit = defineEmits(['closePopup'])
const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {},
  },
})
const dialogModel = ref(props.dialog)
const infoFileCer = ref(props.data)
const loading = ref(false)
const formInfo = ref([
  {
    label: 'Ngày hiệu lực',
    value: 'valid_from',
    type: 'date',
  },
  {
    label: 'Ngày hết hạn',
    value: 'valid_to',
    type: 'date',
  },
  {
    label: 'Nhà phát hành',
    value: 'x_509_issuer_name',
    type: 'text',
  },
  {
    label: 'Kiểu chữ ký',
    value: 'kieu_chu_ky_id',
    type: 'text',
  },
  {
    label: 'Serial của chứng thư',
    value: 'x_509_serial_number',
    type: 'text',
  },
])
function close() {
  dialogModel.value = false
  emit('closePopup')
}
</script>

<style scoped>
.text-main-color {
  color: var(--main-color);
}
</style>
