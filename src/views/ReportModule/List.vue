<template>
  <div class="report-list-container">
    <!-- Header section with title and action buttons -->
    <div class="header-section">
      <div class="title-area">
        <h1>Báo cáo {{ dataType }}</h1>
      </div>
      <div class="action-buttons">
        <button @click="generateReport" class="btn btn-primary">
          <i class="fas fa-file-export"></i> Tạo báo cáo mới
        </button>
        <button @click="refreshData" class="btn btn-outline-secondary">
          <i class="fas fa-sync"></i> Làm mới
        </button>
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
              <label for="reportType">Loại báo cáo</label>
              <select
                id="reportType"
                class="form-control"
                v-model="filters.reportType"
                @change="applyFilters"
              >
                <option value="">Tất cả</option>
                <option value="tong-hop">Tổng hợp</option>
                <option value="chi-tiet">Chi tiết</option>
                <option value="thong-ke">Thống kê</option>
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
                <option value="quarter">Quý này</option>
                <option value="year">Năm nay</option>
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
                <option value="name">Tên báo cáo</option>
                <option value="reportType">Loại báo cáo</option>
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
    <div v-else-if="reports.length > 0" class="data-table card">
      <div class="card-body">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên báo cáo</th>
              <th>Loại báo cáo</th>
              <th>Ngày tạo</th>
              <th>Người tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in reports" :key="report.id">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ report.name }}</td>
              <td>
                <span :class="reportTypeClass(report.reportType)">
                  {{ formatReportType(report.reportType) }}
                </span>
              </td>
              <td>{{ formatDate(report.createdAt) }}</td>
              <td>{{ report.createdBy }}</td>
              <td>
                <div class="btn-group">
                  <button
                    @click="viewReport(report)"
                    class="btn btn-sm btn-outline-primary"
                    title="Xem báo cáo"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    @click="downloadReport(report)"
                    class="btn btn-sm btn-outline-success"
                    title="Tải xuống"
                  >
                    <i class="fas fa-download"></i>
                  </button>
                  <button
                    @click="deleteReport(report)"
                    class="btn btn-sm btn-outline-danger"
                    title="Xóa"
                  >
                    <i class="fas fa-trash"></i>
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
        <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
        <h3>Không có báo cáo</h3>
        <p>Chưa có báo cáo {{ dataType }} nào được tạo hoặc không có kết quả phù hợp với bộ lọc.</p>
        <button @click="generateReport" class="btn btn-primary mt-3">
          <i class="fas fa-file-export"></i> Tạo báo cáo mới
        </button>
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
    
    <!-- Delete confirmation modal -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="close" @click="showDeleteModal = false">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa báo cáo "{{ reportToDelete ? reportToDelete.name : '' }}"?</p>
            <p class="text-danger">Thao tác này không thể hoàn tác.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Report generation modal -->
    <div v-if="showGenerateModal" class="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tạo báo cáo {{ dataType }}</h5>
            <button type="button" class="close" @click="showGenerateModal = false">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="reportName">Tên báo cáo</label>
              <input
                type="text"
                id="reportName"
                v-model="newReport.name"
                class="form-control"
                placeholder="Nhập tên báo cáo"
              />
            </div>
            <div class="form-group">
              <label for="modalReportType">Loại báo cáo</label>
              <select id="modalReportType" v-model="newReport.reportType" class="form-control">
                <option value="tong-hop">Tổng hợp</option>
                <option value="chi-tiet">Chi tiết</option>
                <option value="thong-ke">Thống kê</option>
              </select>
            </div>
            <div class="form-group">
              <label for="reportStartDate">Từ ngày</label>
              <input
                type="date"
                id="reportStartDate"
                v-model="newReport.startDate"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label for="reportEndDate">Đến ngày</label>
              <input
                type="date"
                id="reportEndDate"
                v-model="newReport.endDate"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label for="reportDescription">Mô tả</label>
              <textarea
                id="reportDescription"
                v-model="newReport.description"
                class="form-control"
                rows="3"
                placeholder="Mô tả về báo cáo"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showGenerateModal = false">Hủy</button>
            <button type="button" class="btn btn-primary" @click="createReport">Tạo báo cáo</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportModuleList',
  data() {
    return {
      dataType: '',
      reports: [],
      loading: false,
      filters: {
        searchText: '',
        reportType: '',
        dateRange: 'month',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        sortBy: 'createdAt'
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0
      },
      showDeleteModal: false,
      reportToDelete: null,
      showGenerateModal: false,
      newReport: {
        name: '',
        reportType: 'tong-hop',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        description: ''
      },
      searchTimeout: null
    };
  },
  computed: {
    currentPage() {
      return this.pagination.currentPage;
    },
    pageSize() {
      return this.pagination.pageSize;
    },
    totalItems() {
      return this.pagination.totalItems;
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.pageSize);
    },
    paginationItems() {
      const pages = [];
      const maxButtons = 5;
      
      // Always show first page
      pages.push({
        value: 1,
        active: this.currentPage === 1,
        disabled: false
      });
      
      // Show dots if needed
      if (this.currentPage > 3) {
        pages.push({
          value: null,
          active: false,
          disabled: true
        });
      }
      
      // Show current page and surrounding pages
      const startPage = Math.max(2, this.currentPage - 1);
      const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== this.totalPages) {
          pages.push({
            value: i,
            active: this.currentPage === i,
            disabled: false
          });
        }
      }
      
      // Show dots if needed
      if (this.currentPage < this.totalPages - 2) {
        pages.push({
          value: null,
          active: false,
          disabled: true
        });
      }
      
      // Always show last page if more than 1 page
      if (this.totalPages > 1) {
        pages.push({
          value: this.totalPages,
          active: this.currentPage === this.totalPages,
          disabled: false
        });
      }
      
      return pages;
    }
  },
  created() {
    this.initDataType();
    this.loadData();
  },
  methods: {
    initDataType() {
      if (this.$route.meta && this.$route.meta.moduleParams) {
        this.dataType = this.$route.meta.moduleParams.type || '';
      }
    },
    loadData() {
      this.loading = true;
      
      // In a real application, this would be an API call with proper parameters
      // For now, we'll generate mock data
      setTimeout(() => {
        const mockData = this.generateMockData();
        this.reports = mockData.items;
        this.pagination.totalItems = mockData.totalItems;
        this.loading = false;
      }, 500);
    },
    generateMockData() {
      // Generate mock data based on filters and pagination
      const allReports = [];
      const totalItems = Math.floor(Math.random() * 30) + 10; // Random total between 10-40
      
      const reportTypes = ['tong-hop', 'chi-tiet', 'thong-ke'];
      const users = ['Admin', 'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'];
      
      for (let i = 1; i <= totalItems; i++) {
        const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
        
        // Skip items that don't match the report type filter
        if (this.filters.reportType && reportType !== this.filters.reportType) {
          continue;
        }
        
        // Create a random date within the last 90 days
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90));
        
        // Skip if outside the date range filter
        if (this.filters.dateRange === 'custom') {
          const startDate = new Date(this.filters.startDate);
          const endDate = new Date(this.filters.endDate);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          
          if (createdAt < startDate || createdAt > endDate) {
            continue;
          }
        } else if (this.filters.dateRange === 'today') {
          const today = new Date();
          if (createdAt.getDate() !== today.getDate() || 
              createdAt.getMonth() !== today.getMonth() ||
              createdAt.getFullYear() !== today.getFullYear()) {
            continue;
          }
        } else if (this.filters.dateRange === 'week') {
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          
          if (createdAt < startOfWeek) {
            continue;
          }
        } else if (this.filters.dateRange === 'month') {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          if (createdAt < startOfMonth) {
            continue;
          }
        } else if (this.filters.dateRange === 'quarter') {
          const now = new Date();
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
          
          if (createdAt < startOfQuarter) {
            continue;
          }
        } else if (this.filters.dateRange === 'year') {
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          
          if (createdAt < startOfYear) {
            continue;
          }
        }
        
        const report = {
          id: i,
          name: `Báo cáo ${this.dataType} - ${reportType === 'tong-hop' ? 'Tổng hợp' : reportType === 'chi-tiet' ? 'Chi tiết' : 'Thống kê'} ${i}`,
          reportType: reportType,
          createdAt: createdAt,
          createdBy: users[Math.floor(Math.random() * users.length)],
          description: `Mô tả về báo cáo ${this.dataType} số ${i}`
        };
        
        // Apply search filter
        if (this.filters.searchText) {
          const searchTerm = this.filters.searchText.toLowerCase();
          const searchIn = report.name.toLowerCase() + ' ' + report.description.toLowerCase() + ' ' + report.createdBy.toLowerCase();
          
          if (!searchIn.includes(searchTerm)) {
            continue;
          }
        }
        
        allReports.push(report);
      }
      
      // Sort items
      allReports.sort((a, b) => {
        const sortField = this.filters.sortBy;
        let direction = -1; // Default descending order for date
        
        if (sortField === 'name' || sortField === 'reportType') {
          direction = 1; // Ascending for text fields
        }
        
        if (typeof a[sortField] === 'string') {
          return direction * a[sortField].localeCompare(b[sortField]);
        } else if (sortField === 'createdAt') {
          return direction * (a[sortField].getTime() - b[sortField].getTime());
        } else {
          return direction * (a[sortField] - b[sortField]);
        }
      });
      
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const paginatedItems = allReports.slice(startIndex, startIndex + this.pageSize);
      
      return {
        items: paginatedItems,
        totalItems: allReports.length
      };
    },
    refreshData() {
      this.loadData();
    },
    handleSearch() {
      // Debounce search to avoid too many calls
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.currentPage = 1;
        this.loadData();
      }, 300);
    },
    applyFilters() {
      this.pagination.currentPage = 1;
      this.loadData();
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.pagination.currentPage = page;
      this.loadData();
    },
    reportTypeClass(type) {
      switch (type) {
        case 'tong-hop':
          return 'badge badge-primary';
        case 'chi-tiet':
          return 'badge badge-info';
        case 'thong-ke':
          return 'badge badge-success';
        default:
          return 'badge badge-secondary';
      }
    },
    formatReportType(type) {
      switch (type) {
        case 'tong-hop':
          return 'Tổng hợp';
        case 'chi-tiet':
          return 'Chi tiết';
        case 'thong-ke':
          return 'Thống kê';
        default:
          return type;
      }
    },
    formatDate(date) {
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
    },
    viewReport(report) {
      // Navigate to report detail view
      this.$router.push(`${this.$route.path}/${report.id}`);
    },
    downloadReport(report) {
      // In a real app, this would trigger a download
      alert(`Đang tải xuống báo cáo: ${report.name}`);
    },
    generateReport() {
      // Reset the form
      this.newReport = {
        name: `Báo cáo ${this.dataType} - ${new Date().toLocaleDateString('vi-VN')}`,
        reportType: 'tong-hop',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        description: `Báo cáo ${this.dataType} được tạo tự động`
      };
      
      // Show modal
      this.showGenerateModal = true;
    },
    createReport() {
      // Validate form
      if (!this.newReport.name) {
        alert('Vui lòng nhập tên báo cáo');
        return;
      }
      
      this.loading = true;
      this.showGenerateModal = false;
      
      // In a real app, this would send data to the API
      // For demo, we'll just simulate creation with a timeout
      setTimeout(() => {
        // Create new report and add to the list
        const newReportId = Math.floor(Math.random() * 1000) + 100;
        const createdReport = {
          id: newReportId,
          name: this.newReport.name,
          reportType: this.newReport.reportType,
          createdAt: new Date(),
          createdBy: 'Admin',
          description: this.newReport.description
        };
        
        // Add to the top of the list
        this.reports.unshift(createdReport);
        
        // Update pagination
        this.pagination.totalItems++;
        
        this.loading = false;
        
        // Show success and redirect to detail
        alert('Báo cáo đã được tạo thành công!');
        this.viewReport(createdReport);
      }, 1000);
    },
    deleteReport(report) {
      this.reportToDelete = report;
      this.showDeleteModal = true;
    },
    confirmDelete() {
      // Here would be an API call to delete the report
      // For now, we'll just simulate deletion
      this.reports = this.reports.filter(report => report.id !== this.reportToDelete.id);
      this.showDeleteModal = false;
      this.reportToDelete = null;
      
      // Update pagination
      this.pagination.totalItems--;
      
      // Refresh the data after deletion to keep pagination correct
      this.loadData();
    }
  }
};
</script>

<style scoped>
.report-list-container {
  padding: 20px;
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
.filters {
  margin-top: 20px;
}
.form-group {
  margin-bottom: 15px;
}
.loading-container {
  text-align: center;
  padding: 50px;
}
.empty-container {
  text-align: center;
  padding: 50px;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
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
</style> 