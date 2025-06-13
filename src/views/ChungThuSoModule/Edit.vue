<template>
  <div class="edit-view">
    <h1>{{ isCreate ? 'Thêm mới' : 'Cập nhật' }} Chứng thư số</h1>
    <div class="actions">
      <button @click="saveData" class="btn btn-primary">Lưu</button>
      <button @click="cancel" class="btn btn-outline-secondary">Hủy</button>
    </div>
    <div v-if="loading" class="loading">
      Đang tải dữ liệu...
    </div>
    <div v-else class="form-content">
      <!-- Form fields go here -->
      <div class="mb-3">
        <label for="name" class="form-label">Tên chứng thư số</label>
        <input type="text" class="form-control" id="name" v-model="form.name">
      </div>
      <div class="mb-3">
        <label for="issueDate" class="form-label">Ngày cấp</label>
        <input type="date" class="form-control" id="issueDate" v-model="form.issueDate">
      </div>
      <div class="mb-3">
        <label for="expiryDate" class="form-label">Ngày hết hạn</label>
        <input type="date" class="form-control" id="expiryDate" v-model="form.expiryDate">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChungThuSoEdit',
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
        name: '',
        issueDate: '',
        expiryDate: ''
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
          name: 'Chứng thư số ' + this.id,
          issueDate: '2023-01-01',
          expiryDate: '2024-01-01'
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
        this.$router.push({ 
          path: `/chung-thu-so-co-so-giao-duc/${this.id}` 
        })
      } else {
        this.$router.push({ 
          path: '/chung-thu-so-co-so-giao-duc' 
        })
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