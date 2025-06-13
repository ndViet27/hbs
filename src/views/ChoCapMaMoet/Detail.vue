<template>
  <div class="detail-view">
    <h1>Chi tiết Chờ cấp mã MOET</h1>
    <div class="actions">
      <button @click="goToEdit" class="btn btn-primary">Chỉnh sửa</button>
      <button @click="goToList" class="btn btn-outline-secondary">Quay lại danh sách</button>
    </div>
    <div v-if="loading" class="loading">
      Đang tải dữ liệu...
    </div>
    <div v-else class="data-detail">
      <!-- Detail content goes here -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChoCapMaMoetDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      item: null,
      loading: false
    }
  },
  methods: {
    fetchData() {
      // API call to fetch data would go here
      this.loading = true
      // Simulate API call
      setTimeout(() => {
        this.loading = false
        this.item = {
          id: this.id,
          // Sample data
        }
      }, 500)
    },
    goToEdit() {
      this.$router.push({ name: 'ChoCapMaMoetEdit', params: { id: this.id } })
    },
    goToList() {
      this.$router.push({ name: 'ChoCapMaMoetList' })
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
.detail-view {
  padding: 20px;
}
.actions {
  margin-bottom: 20px;
}
.loading {
  margin: 20px 0;
  font-style: italic;
}
.data-detail {
  margin-top: 20px;
}
</style>