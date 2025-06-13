<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useAppStore } from '@/stores'
  const appStore = useAppStore()
  const isShow = computed(() => appStore.getIsShowConfirm)
  const dialog = computed(() => appStore.getDialogConfirm)
  const handleClickButton = function ({ target }, confirm) {
    if (confirm) {
      dialog.value.callback()
    } else {
      if (dialog.value.callbackNo) {
        dialog.value.callbackNo()
      } else {
        appStore.SET_CONFIG_CONFIRM_DIALOG(
          {
            auth: false,
            title: '',
            message: '',
            button: {},
            callback: () => {}
          }
        )
      }
    }
    appStore.SET_SHOWCONFIRM(false)
  }
  const handleClickOverlay = function({ target }) {
    return
  }
  onMounted(() => {
    
  })
</script>

<template>
  <transition name="fade">
    <div
      v-if="isShow"
      @click="handleClickOverlay"
      class="vc-overlay"
      id="vueConfirm"
    >
      <transition name="zoom">
        <div v-if="isShow" ref="vueConfirmDialog" class="vc-container">
          <span class="vc-text-grid">
            <h4 v-if="dialog.title" class="vc-title" v-html="dialog.title"></h4>
            <p v-if="dialog.message" class="vc-text" v-html="dialog.message"></p>
            <span v-if="dialog.auth">
              <input
                v-model="password"
                @keyup.enter="e => handleClickButton(e, true)"
                class="vc-input"
                type="password"
                name="vc-password"
                placeholder="Password"
                autocomplete="off"
              />
            </span>
          </span>
          <div
            class="vc-btn-grid"
            :class="{ isMono: !dialog.button.no || !dialog.button.yes }"
          >
            <button
              v-if="dialog.button.no"
              @click.stop="e => handleClickButton(e, false)"
              class="vc-btn left"
              type="button"
            >
              {{ dialog.button.no }}
            </button>

            <button
              v-if="dialog.button.yes"
              :disabled="dialog.auth ? !password : false"
              @click.stop="e => handleClickButton(e, true)"
              class="vc-btn"
              type="button"
            >
              {{ dialog.button.yes }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

