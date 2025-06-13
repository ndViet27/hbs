<template>
  <div class="approval-detail-container">
    <div class="header-section">
      <div class="title-area">
        <h1>{{ pageTitle }}</h1>
        <span class="badge" :class="statusClass">{{ formatStatus(status) }}</span>
      </div>
      <div class="action-buttons">
        <button @click="goBack" class="btn btn-outline-secondary">
          <i class="fas fa-arrow-left"></i> Quay lại
        </button>
        <template v-if="status === 'pending'">
          <button @click="approveItem" class="btn btn-success">
            <i class="fas fa-check"></i> Duyệt
          </button>
          <button @click="rejectItem" class="btn btn-danger">
            <i class="fas fa-times"></i> Từ chối
          </button>
        </template>
        <button v-else-if="status === 'rejected'" @click="restoreItem" class="btn btn-warning">
          <i class="fas fa-undo"></i> Khôi phục
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Content -->
    <div v-else class="content-container">
      <div class="card">
        <div class="card-header">
          <h5>Thông tin chi tiết</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="info-group">
                <label>Tên:</label>
                <div>{{ item.name }}</div>
              </div>
              <div class="info-group">
                <label>Loại dữ liệu:</label>
                <div>{{ formatDataType(item.dataType) }}</div>
              </div>
              <div class="info-group">
                <label>Người gửi:</label>
                <div>{{ item.submitter }}</div>
              </div>
              <div class="info-group">
                <label>Ngày gửi:</label>
                <div>{{ formatDate(item.submittedAt) }}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-group">
                <label>Trạng thái:</label>
                <div>
                  <span class="badge" :class="statusClass">{{ formatStatus(status) }}</span>
                </div>
              </div>
              <div v-if="status !== 'pending'" class="info-group">
                <label>Người xử lý:</label>
                <div>{{ item.processor }}</div>
              </div>
              <div v-if="status !== 'pending'" class="info-group">
                <label>Ngày xử lý:</label>
                <div>{{ formatDate(item.processedAt) }}</div>
              </div>
              <div v-if="status === 'approved'" class="info-group">
                <label>Ghi chú:</label>
                <div>{{ item.notes || 'Không có' }}</div>
              </div>
              <div v-if="status === 'rejected'" class="info-group">
                <label>Lý do từ chối:</label>
                <div class="text-danger">{{ item.reason }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Document preview or more details would go here -->
      <div class="card mt-4">
        <div class="card-header">
          <h5>Nội dung dữ liệu</h5>
        </div>
        <div class="card-body">
          <!-- This would contain the detailed content specific to the data type -->
          <div class="document-preview">
            <p>Đây là nội dung chi tiết của {{ formatDataType(item.dataType) }}.</p>
            <!-- Mock content -->
            <div v-if="item.dataType === 'CoSoGiaoDuc'" class="mock-content">
              <h6>Thông tin cơ sở giáo dục</h6>
              <ul>
                <li><strong>Tên trường:</strong> {{ item.name }}</li>
                <li><strong>Mã trường:</strong> {{ item.schoolCode || 'SCH0001' }}</li>
                <li><strong>Địa chỉ:</strong> {{ item.address || 'Số 123, Đường ABC, Quận XYZ, TP. Hà Nội' }}</li>
                <li><strong>Loại hình:</strong> {{ item.schoolType || 'Công lập' }}</li>
                <li><strong>Cấp học:</strong> {{ item.educationLevel || 'THPT' }}</li>
              </ul>
            </div>
            <div v-else-if="item.dataType === 'NguoiHoc'" class="mock-content">
              <h6>Thông tin người học</h6>
              <ul>
                <li><strong>Họ tên:</strong> {{ item.studentName || item.name }}</li>
                <li><strong>Ngày sinh:</strong> {{ formatDate(item.birthDate) || '01/01/2000' }}</li>
                <li><strong>CMND/CCCD:</strong> {{ item.idNumber || '0123456789' }}</li>
                <li><strong>Trường:</strong> {{ item.schoolName || 'Trường THPT ABC' }}</li>
                <li><strong>Lớp:</strong> {{ item.className || '12A1' }}</li>
              </ul>
            </div>
            <div v-else class="mock-content">
              <p>Nội dung chi tiết đang được tải...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Approval confirmation modal -->
    <div v-if="showApprovalModal" class="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận duyệt</h5>
            <button type="button" class="close" @click="showApprovalModal = false">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn duyệt bản ghi này?</p>
            <div class="form-group">
              <label for="approvalNotes">Ghi chú (không bắt buộc)</label>
              <textarea id="approvalNotes" v-model="approvalNotes" class="form-control" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showApprovalModal = false">Hủy</button>
            <button type="button" class="btn btn-success" @click="confirmApproval">Duyệt</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rejection confirmation modal -->
    <div v-if="showRejectionModal" class="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận từ chối</h5>
            <button type="button" class="close" @click="showRejectionModal = false">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn từ chối bản ghi này?</p>
            <div class="form-group">
              <label for="rejectionReason">Lý do từ chối <span class="text-danger">*</span></label>
              <textarea id="rejectionReason" v-model="rejectionReason" class="form-control" rows="3" required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showRejectionModal = false">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmRejection" :disabled="!rejectionReason">Từ chối</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Restore confirmation modal -->
    <div v-if="showRestoreModal" class="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận khôi phục</h5>
            <button type="button" class="close" @click="showRestoreModal = false">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn khôi phục bản ghi này về trạng thái chờ duyệt?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showRestoreModal = false">Hủy</button>
            <button type="button" class="btn btn-warning" @click="confirmRestore">Khôi phục</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import jsondata from '@/metadata/menuDraw.json';

export default {
  name: 'ApprovalModuleDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const itemId = route.params.id;
    const loading = ref(true);
    const item = ref({});
    const status = ref('pending');
    const dataType = ref('');
    const showApprovalModal = ref(false);
    const showRejectionModal = ref(false);
    const showRestoreModal = ref(false);
    const approvalNotes = ref('');
    const rejectionReason = ref('');

    // Get page title from route and menu configuration
    const pageTitle = computed(() => {
      // Initialize with a default title
      let title = 'Chi tiết dữ liệu';
      
      if (route.meta && route.meta.moduleParams) {
        const moduleParams = route.meta.moduleParams;
        status.value = moduleParams.status || 'pending';
        dataType.value = moduleParams.type || 'all';
        
        // Look up menu title from menuDraw.json
        const menuItems = jsondata.menuDraw;
        for (const menu of menuItems) {
          if (menu.children) {
            for (const submenu of menu.children) {
              if (submenu.moduleParams && 
                  submenu.moduleParams.status === status.value &&
                  submenu.tableId === 'ApprovalModule') {
                title = `Chi tiết ${submenu.title.toLowerCase()}`;
                break;
              }
            }
          }
        }
      }
      
      return title;
    });

    const statusClass = computed(() => {
      switch (status.value) {
        case 'pending':
          return 'badge-warning';
        case 'approved':
          return 'badge-success';
        case 'rejected':
          return 'badge-danger';
        default:
          return 'badge-secondary';
      }
    });

    // Load item data
    const loadData = () => {
      loading.value = true;
      
      // In a real app, you'd make an API call here
      // For now, let's simulate loading with mock data
      setTimeout(() => {
        item.value = generateMockItem(itemId);
        loading.value = false;
      }, 800);
    };

    // Generate mock data for demo
    const generateMockItem = (id) => {
      const dataTypes = ['CoSoGiaoDuc', 'NguoiHoc', 'HocBa', 'VanBangChungChi'];
      const selectedType = dataType.value !== 'all' ? dataType.value : dataTypes[Math.floor(Math.random() * dataTypes.length)];
      
      const submittedAt = new Date();
      submittedAt.setDate(submittedAt.getDate() - Math.floor(Math.random() * 30));
      
      const processedAt = new Date(submittedAt);
      processedAt.setDate(processedAt.getDate() + Math.floor(Math.random() * 5) + 1);
      
      return {
        id: id,
        name: `${formatDataType(selectedType)} ${id}`,
        dataType: selectedType,
        submitter: 'Trường THPT Nguyễn Huệ',
        submittedAt: submittedAt,
        processor: 'Admin',
        processedAt: processedAt,
        status: status.value,
        notes: status.value === 'approved' ? 'Dữ liệu đã được xác thực và duyệt.' : '',
        reason: status.value === 'rejected' ? 'Dữ liệu không đúng định dạng hoặc thiếu thông tin bắt buộc.' : ''
      };
    };

    // Format functions
    const formatStatus = (status) => {
      switch (status) {
        case 'pending':
          return 'Chờ duyệt';
        case 'approved':
          return 'Đã duyệt';
        case 'rejected':
          return 'Từ chối duyệt';
        default:
          return status;
      }
    };

    const formatDataType = (type) => {
      switch (type) {
        case 'CoSoGiaoDuc':
          return 'Cơ sở giáo dục';
        case 'NguoiHoc':
          return 'Người học';
        case 'HocBa':
          return 'Học bạ';
        case 'VanBangChungChi':
          return 'Văn bằng, chứng chỉ';
        default:
          return type;
      }
    };

    const formatDate = (date) => {
      if (!date) return '';
      
      if (typeof date === 'string') {
        date = new Date(date);
      }
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Actions
    const goBack = () => {
      router.back();
    };

    const approveItem = () => {
      showApprovalModal.value = true;
    };

    const rejectItem = () => {
      showRejectionModal.value = true;
    };

    const restoreItem = () => {
      showRestoreModal.value = true;
    };

    const confirmApproval = () => {
      // In a real app, this would send an API request
      // For demo, we'll just simulate with timeout and redirect
      loading.value = true;
      showApprovalModal.value = false;
      
      setTimeout(() => {
        loading.value = false;
        alert('Dữ liệu đã được duyệt thành công!');
        router.push('/da-duyet');
      }, 800);
    };

    const confirmRejection = () => {
      if (!rejectionReason.value) {
        alert('Vui lòng nhập lý do từ chối');
        return;
      }
      
      // In a real app, this would send an API request
      loading.value = true;
      showRejectionModal.value = false;
      
      setTimeout(() => {
        loading.value = false;
        alert('Dữ liệu đã bị từ chối!');
        router.push('/tu-choi-duyet');
      }, 800);
    };

    const confirmRestore = () => {
      // In a real app, this would send an API request
      loading.value = true;
      showRestoreModal.value = false;
      
      setTimeout(() => {
        loading.value = false;
        alert('Dữ liệu đã được khôi phục về trạng thái chờ duyệt!');
        router.push('/cho-duyet');
      }, 800);
    };

    onMounted(() => {
      loadData();
    });

    return {
      loading,
      item,
      status,
      dataType,
      pageTitle,
      statusClass,
      showApprovalModal,
      showRejectionModal,
      showRestoreModal,
      approvalNotes,
      rejectionReason,
      formatStatus,
      formatDataType,
      formatDate,
      goBack,
      approveItem,
      rejectItem,
      restoreItem,
      confirmApproval,
      confirmRejection,
      confirmRestore
    };
  }
};
</script>

<style scoped>
.approval-detail-container {
  padding: 20px;
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
.title-area .badge {
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
}
.action-buttons {
  display: flex;
  gap: 10px;
}
.content-container {
  margin-top: 20px;
}
.info-group {
  margin-bottom: 15px;
}
.info-group label {
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
  color: #555;
}
.loading-container {
  text-align: center;
  padding: 50px;
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
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-dialog {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}
.modal-content {
  background: white;
  border-radius: 4px;
}
.modal-header {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-body {
  padding: 15px;
}
.modal-footer {
  padding: 15px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.badge-warning {
  background-color: #ffc107;
  color: #212529;
}
.badge-success {
  background-color: #28a745;
  color: white;
}
.badge-danger {
  background-color: #dc3545;
  color: white;
}
.document-preview {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
.mock-content {
  margin-top: 15px;
}
</style> 