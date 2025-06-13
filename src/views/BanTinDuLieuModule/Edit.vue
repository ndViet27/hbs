<template>
  <div class="edit-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-container card">
      <div class="card-body text-center">
        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
        <h3>Đã xảy ra lỗi</h3>
        <p>{{ error }}</p>
        <button @click="goBack" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Quay lại
        </button>
      </div>
    </div>
    
    <!-- Edit form when data is loaded -->
    <div v-else class="edit-content">
      <!-- Header with title and action buttons -->
      <div class="header-section">
        <div class="title-area">
          <h1>{{ isCreating ? `Tạo mới ${dataType}` : `Chỉnh sửa ${dataType}` }}</h1>
        </div>
        <div class="action-buttons">
          <button @click="goBack" class="btn btn-outline-secondary">
            <i class="fas fa-times"></i> Hủy
          </button>
          <button @click="saveChanges" class="btn btn-primary">
            <i class="fas fa-save"></i> Lưu
          </button>
        </div>
      </div>
      
      <!-- Form content -->
      <form @submit.prevent="saveChanges" class="form-wrapper card">
        <div class="card-header">
          <h2 class="mb-0">Thông tin chung</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="name">Tên <span class="text-danger">*</span></label>
                <input
                  type="text"
                  id="name"
                  v-model="formData.name"
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="status">Trạng thái</label>
                <select id="status" v-model="formData.status" class="form-control">
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Mô tả</label>
            <textarea
              id="description"
              v-model="formData.description"
              class="form-control"
              rows="3"
            ></textarea>
          </div>
        </div>
      </form>
      
      <!-- Type-specific forms -->
      <form v-if="dataType === 'CoSoGiaoDuc'" class="form-wrapper card mt-4">
        <div class="card-header">
          <h2 class="mb-0">Thông tin Cơ sở giáo dục</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="schoolCode">Mã trường <span class="text-danger">*</span></label>
                <input
                  type="text"
                  id="schoolCode"
                  v-model="formData.schoolCode"
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="schoolType">Loại trường</label>
                <select
                  id="schoolType"
                  v-model="formData.schoolType"
                  class="form-control"
                >
                  <option value="Công lập">Công lập</option>
                  <option value="Tư thục">Tư thục</option>
                  <option value="Dân lập">Dân lập</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="address">Địa chỉ <span class="text-danger">*</span></label>
            <input
              type="text"
              id="address"
              v-model="formData.address"
              class="form-control"
              required
            />
          </div>
        </div>
      </form>
      
      <form v-else-if="dataType === 'HocBa'" class="form-wrapper card mt-4">
        <div class="card-header">
          <h2 class="mb-0">Thông tin Học bạ</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="studentName">Tên học sinh <span class="text-danger">*</span></label>
                <input
                  type="text"
                  id="studentName"
                  v-model="formData.studentName"
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="studentCode">Mã học sinh <span class="text-danger">*</span></label>
                <input
                  type="text"
                  id="studentCode"
                  v-model="formData.studentCode"
                  class="form-control"
                  required
                />
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="schoolYear">Năm học <span class="text-danger">*</span></label>
            <input
              type="text"
              id="schoolYear"
              v-model="formData.schoolYear"
              class="form-control"
              required
            />
          </div>
        </div>
      </form>
      
      <form v-else-if="dataType === 'NguoiHoc'" class="form-wrapper card mt-4">
        <div class="card-header">
          <h2 class="mb-0">Thông tin Người học</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="idNumber">Số CMND/CCCD <span class="text-danger">*</span></label>
                <input
                  type="text"
                  id="idNumber"
                  v-model="formData.idNumber"
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="gender">Giới tính</label>
                <select
                  id="gender"
                  v-model="formData.gender"
                  class="form-control"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="birthDate">Ngày sinh <span class="text-danger">*</span></label>
            <input
              type="date"
              id="birthDate"
              v-model="formData.birthDate"
              class="form-control"
              required
            />
          </div>
        </div>
      </form>
      
      <!-- Form actions -->
      <div class="form-actions">
        <button @click="goBack" class="btn btn-outline-secondary">
          <i class="fas fa-times"></i> Hủy
        </button>
        <button @click="saveChanges" class="btn btn-primary">
          <i class="fas fa-save"></i> Lưu
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BanTinDuLieuModuleEdit',
  data() {
    return {
      dataType: '',
      itemId: null,
      isCreating: true,
      formData: {
        name: '',
        description: '',
        status: 'active'
      },
      loading: true,
      error: null
    };
  },
  created() {
    this.initializeData();
  },
  methods: {
    initializeData() {
      // Get parameters from route
      if (this.$route.meta && this.$route.meta.moduleParams) {
        this.dataType = this.$route.meta.moduleParams.type || '';
      }
      
      this.itemId = this.$route.params.id;
      this.isCreating = !this.itemId;
      
      if (!this.dataType) {
        this.error = 'Thông tin không hợp lệ. Vui lòng quay lại trang danh sách.';
        this.loading = false;
        return;
      }
      
      if (this.isCreating) {
        // For creating new item, just initialize form data
        this.initializeFormData();
        this.loading = false;
      } else {
        // For editing existing item, fetch data
        this.fetchData();
      }
    },
    initializeFormData() {
      // Initialize base form data
      this.formData = {
        name: '',
        description: '',
        status: 'active'
      };
      
      // Add type-specific default fields
      switch (this.dataType) {
        case 'CoSoGiaoDuc':
          this.formData = {
            ...this.formData,
            schoolCode: '',
            address: '',
            schoolType: 'Công lập'
          };
          break;
        case 'HocBa':
          this.formData = {
            ...this.formData,
            studentName: '',
            studentCode: '',
            schoolYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
          };
          break;
        case 'NguoiHoc':
          this.formData = {
            ...this.formData,
            idNumber: '',
            birthDate: new Date().toISOString().split('T')[0],
            gender: 'male'
          };
          break;
        default:
          break;
      }
    },
    fetchData() {
      this.loading = true;
      
      // In a real app, this would be an API call
      // For demo, we'll simulate with a timeout
      setTimeout(() => {
        try {
          this.formData = this.generateMockData();
          this.loading = false;
        } catch (err) {
          this.error = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.';
          this.loading = false;
        }
      }, 800);
    },
    generateMockData() {
      // Generate mock data based on data type and ID
      const baseItem = {
        name: `${this.dataType} ${this.itemId}`,
        description: `Mô tả chi tiết về ${this.dataType} mẫu số ${this.itemId}`,
        status: Math.random() > 0.3 ? 'active' : 'inactive'
      };
      
      // Add type-specific fields
      switch (this.dataType) {
        case 'CoSoGiaoDuc':
          return {
            ...baseItem,
            schoolCode: `SCH${this.itemId.toString().padStart(4, '0')}`,
            address: `Địa chỉ ${this.itemId}, Phường X, Quận Y, TP. HCM`,
            schoolType: ['Công lập', 'Tư thục', 'Dân lập'][Math.floor(Math.random() * 3)]
          };
        case 'HocBa':
          return {
            ...baseItem,
            studentName: `Học sinh ${this.itemId}`,
            studentCode: `HS${this.itemId.toString().padStart(4, '0')}`,
            schoolYear: '2023-2024'
          };
        case 'NguoiHoc':
          return {
            ...baseItem,
            idNumber: `00${this.itemId.toString().padStart(9, '0')}`,
            birthDate: new Date(1990, 0, 1 + parseInt(this.itemId) % 28).toISOString().split('T')[0],
            gender: Math.random() > 0.5 ? 'male' : 'female'
          };
        default:
          return baseItem;
      }
    },
    saveChanges() {
      // In a real app, this would save the form data via API
      // For demo, we'll just simulate with a timeout
      this.loading = true;
      
      setTimeout(() => {
        this.loading = false;
        
        // After saving, navigate back
        if (this.isCreating) {
          // Show success message
          alert('Tạo mới thành công!');
          // Navigate to list
          this.goToList();
        } else {
          // Show success message
          alert('Cập nhật thành công!');
          // Navigate to detail
          this.goToDetail();
        }
      }, 800);
    },
    goBack() {
      if (this.isCreating) {
        this.goToList();
      } else {
        this.goToDetail();
      }
    },
    goToDetail() {
      // Navigate to detail view
      const basePath = this.$route.path.split('/edit')[0];
      this.$router.push(basePath);
    },
    goToList() {
      // Navigate to list view
      this.$router.push({
        name: 'BanTinDuLieuModuleList'
      });
    }
  }
};
</script>

<style scoped>
.edit-container {
  padding: 20px;
}
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  text-align: center;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-left-color: #09f;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.action-buttons {
  display: flex;
  gap: 10px;
}
.form-wrapper {
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.card-header {
  background-color: #f8f9fa;
  padding: 12px 16px;
}
h2 {
  font-size: 1.2rem;
  margin-bottom: 0;
}
.form-group {
  margin-bottom: 15px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style> 