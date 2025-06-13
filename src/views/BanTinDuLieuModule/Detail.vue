<template>
  <div class="detail-container">
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
    
    <!-- Content when data is loaded -->
    <div v-else class="detail-content">
      <!-- Header with title and action buttons -->
      <div class="header-section">
        <div class="title-area">
          <h1>{{ item.name }}</h1>
          <span :class="statusClass(item.status)">
            {{ item.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
          </span>
        </div>
        <div class="action-buttons">
          <button @click="goBack" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left"></i> Quay lại
          </button>
          <button @click="editItem" class="btn btn-primary">
            <i class="fas fa-edit"></i> Chỉnh sửa
          </button>
        </div>
      </div>
      
      <!-- General information card -->
      <div class="card mb-4">
        <div class="card-header">
          <h2 class="mb-0">Thông tin chung</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">ID:</dt>
                <dd class="col-sm-8">{{ item.id }}</dd>
                
                <dt class="col-sm-4">Tên:</dt>
                <dd class="col-sm-8">{{ item.name }}</dd>
                
                <dt class="col-sm-4">Ngày tạo:</dt>
                <dd class="col-sm-8">{{ formatDate(item.createdAt) }}</dd>
              </dl>
            </div>
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Mô tả:</dt>
                <dd class="col-sm-8">{{ item.description }}</dd>
                
                <dt class="col-sm-4">Trạng thái:</dt>
                <dd class="col-sm-8">
                  <span :class="statusClass(item.status)">
                    {{ item.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
                  </span>
                </dd>
                
                <dt class="col-sm-4">Ngày cập nhật:</dt>
                <dd class="col-sm-8">{{ formatDate(item.updatedAt) }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Type-specific information cards -->
      <div v-if="dataType === 'CoSoGiaoDuc'" class="card mb-4">
        <div class="card-header">
          <h2 class="mb-0">Thông tin Cơ sở giáo dục</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Mã trường:</dt>
                <dd class="col-sm-8">{{ item.schoolCode }}</dd>
                
                <dt class="col-sm-4">Loại trường:</dt>
                <dd class="col-sm-8">{{ item.schoolType }}</dd>
              </dl>
            </div>
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Địa chỉ:</dt>
                <dd class="col-sm-8">{{ item.address }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="dataType === 'HocBa'" class="card mb-4">
        <div class="card-header">
          <h2 class="mb-0">Thông tin Học bạ</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Học sinh:</dt>
                <dd class="col-sm-8">{{ item.studentName }}</dd>
                
                <dt class="col-sm-4">Mã học sinh:</dt>
                <dd class="col-sm-8">{{ item.studentCode }}</dd>
              </dl>
            </div>
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Năm học:</dt>
                <dd class="col-sm-8">{{ item.schoolYear }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="dataType === 'NguoiHoc'" class="card mb-4">
        <div class="card-header">
          <h2 class="mb-0">Thông tin Người học</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">CMND/CCCD:</dt>
                <dd class="col-sm-8">{{ item.idNumber }}</dd>
                
                <dt class="col-sm-4">Giới tính:</dt>
                <dd class="col-sm-8">
                  {{ item.gender === 'male' ? 'Nam' : 'Nữ' }}
                </dd>
              </dl>
            </div>
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Ngày sinh:</dt>
                <dd class="col-sm-8">{{ formatDate(item.birthDate, true) }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Related data section -->
      <div class="card">
        <div class="card-header">
          <h2 class="mb-0">Dữ liệu liên quan</h2>
        </div>
        <div class="card-body">
          <div v-if="relatedData.length > 0">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Loại</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="related in relatedData" :key="related.id">
                    <td>{{ related.name }}</td>
                    <td>{{ related.type }}</td>
                    <td>{{ formatDate(related.createdAt) }}</td>
                    <td>
                      <button 
                        @click="viewRelated(related)"
                        class="btn btn-sm btn-outline-primary"
                      >
                        <i class="fas fa-eye"></i> Xem
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center">
            <p>Không có dữ liệu liên quan.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BanTinDuLieuModuleDetail',
  data() {
    return {
      dataType: '',
      itemId: null,
      item: {},
      relatedData: [],
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
      
      if (!this.dataType || !this.itemId) {
        this.error = 'Thông tin không hợp lệ. Vui lòng quay lại trang danh sách.';
        this.loading = false;
        return;
      }
      
      this.fetchData();
    },
    fetchData() {
      this.loading = true;
      
      // In a real app, this would be an API call
      // For demo, we'll simulate with a timeout
      setTimeout(() => {
        try {
          this.item = this.generateMockData();
          this.relatedData = this.generateMockRelatedData();
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
        id: this.itemId,
        name: `${this.dataType} ${this.itemId}`,
        description: `Mô tả chi tiết về ${this.dataType} mẫu số ${this.itemId}`,
        status: Math.random() > 0.3 ? 'active' : 'inactive',
        createdAt: new Date(Date.now() - Math.random() * 10000000000),
        updatedAt: new Date(Date.now() - Math.random() * 1000000000)
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
            birthDate: new Date(1990, 0, 1 + parseInt(this.itemId) % 28),
            gender: Math.random() > 0.5 ? 'male' : 'female'
          };
        default:
          return baseItem;
      }
    },
    generateMockRelatedData() {
      // Generate mock related data
      const count = Math.floor(Math.random() * 5);
      const relatedTypes = ['HocBa', 'NguoiHoc', 'CoSoGiaoDuc'].filter(type => type !== this.dataType);
      
      return Array.from({ length: count }, (_, i) => ({
        id: Math.floor(Math.random() * 100) + 1,
        name: `Related ${relatedTypes[i % relatedTypes.length]} ${i + 1}`,
        type: relatedTypes[i % relatedTypes.length],
        createdAt: new Date(Date.now() - Math.random() * 10000000000)
      }));
    },
    statusClass(status) {
      return status === 'active' ? 'badge badge-success' : 'badge badge-secondary';
    },
    formatDate(date, dateOnly = false) {
      if (!date) return '';
      
      if (typeof date === 'string') {
        date = new Date(date);
      }
      
      if (dateOnly) {
        return date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    goBack() {
      // Navigate back to the list view
      this.$router.push({
        name: 'BanTinDuLieuModuleList'
      });
    },
    editItem() {
      // Navigate to edit page
      const basePath = this.$route.path;
      const editPath = basePath.endsWith('/edit') ? basePath : `${basePath}/edit`;
      this.$router.push(editPath);
    },
    viewRelated(related) {
      // In a real app, this would navigate to the related item
      alert(`Navigate to ${related.type} detail with ID ${related.id}`);
    }
  }
};
</script>

<style scoped>
.detail-container {
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
.title-area {
  display: flex;
  align-items: center;
  gap: 15px;
}
.action-buttons {
  display: flex;
  gap: 10px;
}
.card {
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
dl.row {
  margin-bottom: 0;
}
</style> 