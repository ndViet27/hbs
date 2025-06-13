<template>
  <div class="edit-view">
    <h1>{{ isCreate ? 'Thêm mới' : 'Cập nhật' }} Kế hoạch tuyển sinh</h1>
    <div class="actions">
      <button @click="saveData" class="btn btn-primary">Lưu</button>
      <button @click="cancel" class="btn btn-outline-secondary">Hủy</button>
    </div>
    <div v-if="loading" class="loading">
      Đang tải dữ liệu...
    </div>
    <div v-else class="form-content">
      <!-- Form fields go here -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'KeHoachTuyenSinhEdit',
  props: {
    id: {
      type: [String, Number],
      required: false,
      default: null
    }
  },
  data() {
    return {
      form: {
        // Form fields go here
      },
      loading: false,
      saving: false
    }
  },
  computed: {
    isCreate() {
      return !this.id
    }
  },
  methods: {
    fetchData() {
      if (!this.id) return
      
      this.loading = true
      // Simulate API call
      setTimeout(() => {
        this.loading = false
        this.form = {
          id: this.id,
          // Sample data
        }
      }, 500)
    },
    saveData() {
      this.saving = true
      // Simulate API call
      setTimeout(() => {
        this.saving = false
        this.goBack()
      }, 500)
    },
    cancel() {
      this.goBack()
    },
    goBack() {
      if (this.id) {
        this.$router.push({ name: 'KeHoachTuyenSinhDetail', params: { id: this.id } })
      } else {
        this.$router.push({ name: 'KeHoachTuyenSinhList' })
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  watch: {
    id: {
      handler() {
        this.fetchData()
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.edit-view {
  padding: 20px;
}
.actions {
  margin-bottom: 20px;
}
.loading {
  margin: 20px 0;
  font-style: italic;
}
.form-content {
  margin-top: 20px;
}
</style>