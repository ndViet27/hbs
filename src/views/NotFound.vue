<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Trang không tồn tại</h2>
      <p>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      <button @click="goHome" class="btn btn-primary">Quay về trang chủ</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}
.not-found-content {
  max-width: 500px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
h1 {
  font-size: 80px;
  margin: 0;
  color: #e53935;
}
h2 {
  font-size: 30px;
  margin: 10px 0 20px;
}
p {
  color: #666;
  margin-bottom: 30px;
}
</style> 