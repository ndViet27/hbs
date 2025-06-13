<template>
  <div class="approval-list-container">
    <!-- Header section with title and action buttons -->
    <div class="header-section">
      <div class="title-area">
        <h1>{{ pageTitle }}</h1>
        <span class="badge" :class="statusClass">{{ formatStatus(status) }}</span>
      </div>
      <div class="action-buttons">
        <button @click="refreshData" class="btn btn-outline-secondary">
          <i class="fas fa-sync"></i> Làm mới
        </button>
        <div v-if="status === 'pending'" class="btn-group">
          <button @click="approveSelected" class="btn btn-success" :disabled="selectedItems.length === 0">
            <i class="fas fa-check"></i> Duyệt đã chọn
          </button>
          <button @click="rejectSelected" class="btn btn-danger" :disabled="selectedItems.length === 0">
            <i class="fas fa-times"></i> Từ chối đã chọn
          </button>
        </div>
      </div>
    </div>
    
    <!-- Filters section -->
    <div class="filters card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label for="searchInput">Tìm kiếm</label>
              <input
                type="text"
                id="searchInput"
                class="form-control"
                v-model="filters.searchText"
                placeholder="Nhập từ khóa..."
                @input="handleSearch"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label for="dataType">Loại dữ liệu</label>
              <select
                id="dataType"
                class="form-control"
                v-model="filters.dataType"
                @change="applyFilters"
              >
                <option value="">Tất cả</option>
                <option value="CoSoGiaoDuc">Cơ sở giáo dục</option>
                <option value="NguoiHoc">Người học</option>
                <option value="HocBa">Học bạ</option>
                <option value="VanBangChungChi">Văn bằng, chứng chỉ</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label for="dateRange">Khoảng thời gian</label>
              <select
                id="dateRange"
                class="form-control"
                v-model="filters.dateRange"
                @change="applyFilters"
              >
                <option value="all">Tất cả</option>
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label for="sortBy">Sắp xếp theo</label>
              <select
                id="sortBy"
                class="form-control"
                v-model="filters.sortBy"
                @change="applyFilters"
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="updatedAt">Ngày cập nhật</option>
                <option value="name">Tên</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Custom date range (visible when dateRange = 'custom') -->
        <div v-if="filters.dateRange === 'custom'" class="row mt-3">
          <div class="col-md-3">
            <div class="form-group">
              <label for="startDate">Từ ngày</label>
              <input
                type="date"
                id="startDate"
                class="form-control"
                v-model="filters.startDate"
                @change="applyFilters"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label for="endDate">Đến ngày</label>
              <input
                type="date"
                id="endDate"
                class="form-control"
                v-model="filters.endDate"
                @change="applyFilters"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>
    
    <!-- Data table -->
    <div v-else-if="items.length > 0" class="data-table card">
      <div class="card-body">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th v-if="status === 'pending'">
                <input type="checkbox" @change="toggleSelectAll" v-model="selectAll">
              </th>
              <th>#</th>
              <th>Tên</th>
              <th>Loại dữ liệu</th>
              <th>Người gửi</th>
              <th>Ngày gửi</th>
              <th v-if="status !== 'pending'">Người duyệt</th>
              <th v-if="status !== 'pending'">Ngày xử lý</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="item.id">
              <td v-if="status === 'pending'">
                <input type="checkbox" v-model="selectedItems" :value="item.id">
              </td>
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ formatDataType(item.dataType) }}</td>
              <td>{{ item.submitter }}</td>
              <td>{{ formatDate(item.submittedAt) }}</td>
              <td v-if="status !== 'pending'">{{ item.processor }}</td>
              <td v-if="status !== 'pending'">{{ formatDate(item.processedAt) }}</td>
              <td>
                <div class="btn-group">
                  <button
                    @click="viewDetail(item)"
                    class="btn btn-sm btn-outline-primary"
                    title="Xem chi tiết"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <template v-if="status === 'pending'">
                    <button
                      @click="approveItem(item)"
                      class="btn btn-sm btn-outline-success"
                      title="Duyệt"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button
                      @click="rejectItem(item)"
                      class="btn btn-sm btn-outline-danger"
                      title="Từ chối"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </template>
                  <button v-else-if="status === 'rejected'"
                    @click="restoreItem(item)"
                    class="btn btn-sm btn-outline-warning"
                    title="Khôi phục"
                  >
                    <i class="fas fa-undo"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else class="empty-container card">
      <div class="card-body text-center">
        <i class="fas fa-clipboard-check fa-3x text-muted mb-3"></i>
        <h3>Không có dữ liệu</h3>
        <p>Không có dữ liệu {{ formatStatus(status).toLowerCase() }} nào phù hợp với bộ lọc.</p>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-container">
      <ul class="pagination">
        <li :class="{'page-item': true, 'disabled': currentPage === 1}">
          <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
            <i class="fas fa-chevron-left"></i>
          </a>
        </li>
        <li
          v-for="page in paginationItems"
          :key="page.value"
          :class="{'page-item': true, 'active': page.active, 'disabled': page.disabled}"
        >
          <span v-if="page.disabled" class="page-link">...</span>
          <a
            v-else
            class="page-link"
            href="#"
            @click.prevent="changePage(page.value)"
          >
            {{ page.value }}
          </a>
        </li>
        <li :class="{'page-item': true, 'disabled': currentPage === totalPages}">
          <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
            <i class="fas fa-chevron-right"></i>
          </a>
        </li>
      </ul>
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
            <p>Bạn có chắc chắn muốn duyệt {{ selectedItems.length > 1 ? selectedItems.length + ' bản ghi' : 'bản ghi này' }}?</p>
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
            <p>Bạn có chắc chắn muốn từ chối {{ selectedItems.length > 1 ? selectedItems.length + ' bản ghi' : 'bản ghi này' }}?</p>
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
import jsondata from '@/metadata/menuDraw.json';

export default {
  name: 'ApprovalModuleList',
  data() {
    return {
      dataType: '',
      status: 'pending', // Default status is pending
      items: [],
      loading: false,
      filters: {
        searchText: '',
        dataType: '',
        dateRange: 'all',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        sortBy: 'createdAt'
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0
      },
      selectedItems: [],
      selectAll: false,
      showApprovalModal: false,
      showRejectionModal: false,
      showRestoreModal: false,
      itemToProcess: null,
      approvalNotes: '',
      rejectionReason: '',
      searchTimeout: null,
      menuTitle: '' // Store the current menu title
    };
  },
  computed: {
    // ... existing computed properties ...
    
    // Get the page title from menuDraw based on current route
    pageTitle() {
      // If we already have a menu title, use it
      if (this.menuTitle) {
        return this.menuTitle;
      }
      
      // Otherwise use a default based on status
      return this.getPageTitle();
    }
  },
  created() {
    this.initializeData();
    this.findMenuTitle();
    this.loadData();
  },
  methods: {
    // Find menu title from menuDraw.json based on current route
    findMenuTitle() {
      const currentPath = this.$route.path;
      const menuItems = jsondata.menuDraw;
      
      // Search through all menu items to find the matching route
      for (const menu of menuItems) {
        if (menu.children) {
          for (const submenu of menu.children) {
            if (submenu.to === currentPath) {
              this.menuTitle = submenu.title;
              return;
            }
          }
        } else if (menu.to === currentPath) {
          this.menuTitle = menu.title;
          return;
        }
      }
    },
    
    initializeData() {
      if (this.$route.meta && this.$route.meta.moduleParams) {
        // Get dataType
        this.dataType = this.$route.meta.moduleParams.type || 'all';
        
        // Get status
        this.status = this.$route.meta.moduleParams.status || 'pending';
        
        // Update filters if dataType is specified
        if (this.dataType !== 'all') {
          this.filters.dataType = this.dataType;
        }
      }
    },
    getPageTitle() {
      // This is a fallback if we can't find the title in the menu
      switch (this.status) {
        case 'pending':
          return 'Dữ liệu chờ duyệt';
        case 'approved':
          return 'Dữ liệu đã duyệt';
        case 'rejected':
          return 'Dữ liệu từ chối duyệt';
        default:
          return 'Kiểm duyệt dữ liệu';
      }
    },
    // ... rest of existing methods ...
  }
};
</script> 