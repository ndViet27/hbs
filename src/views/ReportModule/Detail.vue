<template>
  <div class="report-detail-container">
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
    <div v-else class="report-content">
      <!-- Header with title and action buttons -->
      <div class="header-section">
        <div class="title-area">
          <h1>{{ report.name }}</h1>
          <span :class="reportTypeClass(report.reportType)">
            {{ formatReportType(report.reportType) }}
          </span>
        </div>
        <div class="action-buttons">
          <button @click="goBack" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left"></i> Quay lại
          </button>
          <button @click="downloadReport" class="btn btn-success">
            <i class="fas fa-download"></i> Tải xuống
          </button>
          <button @click="printReport" class="btn btn-primary">
            <i class="fas fa-print"></i> In báo cáo
          </button>
        </div>
      </div>
      
      <!-- Report information card -->
      <div class="card mb-4">
        <div class="card-header">
          <h2 class="mb-0">Thông tin báo cáo</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">ID:</dt>
                <dd class="col-sm-8">{{ report.id }}</dd>
                
                <dt class="col-sm-4">Loại:</dt>
                <dd class="col-sm-8">
                  <span :class="reportTypeClass(report.reportType)">
                    {{ formatReportType(report.reportType) }}
                  </span>
                </dd>
                
                <dt class="col-sm-4">Khoảng thời gian:</dt>
                <dd class="col-sm-8">{{ formatDate(report.startDate, true) }} - {{ formatDate(report.endDate, true) }}</dd>
              </dl>
            </div>
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Tạo bởi:</dt>
                <dd class="col-sm-8">{{ report.createdBy }}</dd>
                
                <dt class="col-sm-4">Ngày tạo:</dt>
                <dd class="col-sm-8">{{ formatDate(report.createdAt) }}</dd>
                
                <dt class="col-sm-4">Cập nhật lần cuối:</dt>
                <dd class="col-sm-8">{{ formatDate(report.updatedAt) }}</dd>
              </dl>
            </div>
          </div>
          
          <div class="row mt-3">
            <div class="col-12">
              <h5>Mô tả</h5>
              <p>{{ report.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Report content -->
      <div class="card mb-4 report-preview">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h2 class="mb-0">Nội dung báo cáo</h2>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-secondary" @click="changeView('chart')" :class="{ active: currentView === 'chart' }">
              <i class="fas fa-chart-bar"></i> Biểu đồ
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="changeView('table')" :class="{ active: currentView === 'table' }">
              <i class="fas fa-table"></i> Bảng
            </button>
          </div>
        </div>
        <div class="card-body">
          <!-- Chart view -->
          <div v-if="currentView === 'chart'" class="chart-container">
            <div class="chart-header">
              <h3>Biểu đồ {{ formatReportType(report.reportType) }} {{ dataType }}</h3>
              <p>Khoảng thời gian: {{ formatDate(report.startDate, true) }} - {{ formatDate(report.endDate, true) }}</p>
            </div>
            
            <div class="chart-wrapper">
              <!-- Mock chart - in real app, use a chart library like Chart.js -->
              <div class="mock-chart">
                <div v-for="(bar, index) in chartData" :key="index" class="mock-chart-bar" :style="{ height: bar.value + '%' }">
                  <div class="mock-chart-value">{{ bar.value }}%</div>
                </div>
              </div>
              <div class="mock-chart-labels">
                <div v-for="(bar, index) in chartData" :key="'label-'+index" class="mock-chart-label">
                  {{ bar.label }}
                </div>
              </div>
            </div>
            
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color" style="background-color: #4e73df;"></div>
                <div class="legend-label">Dữ liệu {{ dataType }}</div>
              </div>
            </div>
          </div>
          
          <!-- Table view -->
          <div v-else-if="currentView === 'table'" class="table-container">
            <div class="table-responsive">
              <table class="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên</th>
                    <th>Giá trị</th>
                    <th>Thay đổi</th>
                    <th>Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in tableData" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.value }}</td>
                    <td>
                      <span :class="item.change > 0 ? 'text-success' : item.change < 0 ? 'text-danger' : 'text-muted'">
                        <i v-if="item.change > 0" class="fas fa-caret-up"></i>
                        <i v-else-if="item.change < 0" class="fas fa-caret-down"></i>
                        <i v-else class="fas fa-minus"></i>
                        {{ Math.abs(item.change) }}%
                      </span>
                    </td>
                    <td>{{ item.percentage }}%</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="2">Tổng cộng</th>
                    <th>{{ totalValue }}</th>
                    <th>
                      <span :class="totalChange > 0 ? 'text-success' : totalChange < 0 ? 'text-danger' : 'text-muted'">
                        <i v-if="totalChange > 0" class="fas fa-caret-up"></i>
                        <i v-else-if="totalChange < 0" class="fas fa-caret-down"></i>
                        <i v-else class="fas fa-minus"></i>
                        {{ Math.abs(totalChange) }}%
                      </span>
                    </th>
                    <th>100%</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Additional notes -->
      <div class="card mb-4">
        <div class="card-header">
          <h2 class="mb-0">Ghi chú</h2>
        </div>
        <div class="card-body">
          <p v-if="report.notes">{{ report.notes }}</p>
          <p v-else class="text-muted">Không có ghi chú cho báo cáo này.</p>
          
          <div class="form-group mt-3">
            <label for="addNote">Thêm ghi chú</label>
            <textarea id="addNote" v-model="newNote" class="form-control" rows="3"></textarea>
            <button @click="addNote" class="btn btn-primary mt-2">Lưu ghi chú</button>
          </div>
        </div>
      </div>
      
      <!-- Sharing options -->
      <div class="card">
        <div class="card-header">
          <h2 class="mb-0">Chia sẻ báo cáo</h2>
        </div>
        <div class="card-body">
          <div class="share-options">
            <button class="btn btn-outline-primary" @click="shareReport('email')">
              <i class="fas fa-envelope"></i> Email
            </button>
            <button class="btn btn-outline-primary" @click="shareReport('link')">
              <i class="fas fa-link"></i> Sao chép liên kết
            </button>
            <button class="btn btn-outline-primary" @click="shareReport('export')">
              <i class="fas fa-file-export"></i> Xuất báo cáo
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportModuleDetail',
  data() {
    return {
      dataType: '',
      reportId: null,
      report: {},
      loading: true,
      error: null,
      currentView: 'chart',
      newNote: '',
      chartData: [],
      tableData: []
    };
  },
  computed: {
    totalValue() {
      return this.tableData.reduce((sum, item) => sum + item.value, 0);
    },
    totalChange() {
      // Calculate the weighted average change
      const totalValue = this.totalValue;
      if (totalValue === 0) return 0;
      
      return Math.round(this.tableData.reduce((sum, item) => {
        return sum + (item.change * item.value / totalValue);
      }, 0));
    }
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
      
      this.reportId = this.$route.params.id;
      
      if (!this.dataType || !this.reportId) {
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
          this.report = this.generateMockReport();
          this.generateMockChartData();
          this.generateMockTableData();
          this.loading = false;
        } catch (err) {
          this.error = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.';
          this.loading = false;
        }
      }, 800);
    },
    generateMockReport() {
      // Generate mock report data
      const reportTypes = ['tong-hop', 'chi-tiet', 'thong-ke'];
      const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
      
      // Create dates
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
      const updatedAt = new Date();
      updatedAt.setDate(updatedAt.getDate() - Math.floor(Math.random() * 10));
      
      return {
        id: this.reportId,
        name: `Báo cáo ${this.dataType} - ${reportType === 'tong-hop' ? 'Tổng hợp' : reportType === 'chi-tiet' ? 'Chi tiết' : 'Thống kê'} ${this.reportId}`,
        reportType: reportType,
        createdAt: createdAt,
        updatedAt: updatedAt,
        createdBy: 'Admin',
        startDate: startDate,
        endDate: endDate,
        description: `Báo cáo ${reportType === 'tong-hop' ? 'tổng hợp' : reportType === 'chi-tiet' ? 'chi tiết' : 'thống kê'} về dữ liệu ${this.dataType} trong khoảng thời gian từ ${startDate.toLocaleDateString('vi-VN')} đến ${endDate.toLocaleDateString('vi-VN')}.`,
        notes: Math.random() > 0.5 ? `Ghi chú về báo cáo ${this.dataType}. Đây là một số dữ liệu mẫu để minh họa chức năng của hệ thống.` : ''
      };
    },
    generateMockChartData() {
      // Generate random chart data
      this.chartData = [];
      const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
      
      for (let i = 0; i < months.length; i++) {
        this.chartData.push({
          label: months[i],
          value: Math.floor(Math.random() * 80) + 20 // Random value between 20-100
        });
      }
    },
    generateMockTableData() {
      // Generate random table data
      this.tableData = [];
      const categories = [
        'Trường THCS',
        'Trường THPT',
        'Trường Tiểu học',
        'Trung tâm đào tạo',
        'Cơ sở đại học',
        'Cơ sở nghề'
      ];
      
      let total = 0;
      
      // First pass to generate values
      for (let i = 0; i < categories.length; i++) {
        const value = Math.floor(Math.random() * 1000) + 100;
        total += value;
        this.tableData.push({
          name: categories[i],
          value: value,
          change: Math.floor(Math.random() * 30) - 15 // Range from -15 to 15
        });
      }
      
      // Second pass to calculate percentages
      for (let i = 0; i < this.tableData.length; i++) {
        this.tableData[i].percentage = Math.round((this.tableData[i].value / total) * 100);
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
    changeView(view) {
      this.currentView = view;
    },
    goBack() {
      // Navigate back to the list view
      this.$router.push({
        name: 'ReportModuleList'
      });
    },
    downloadReport() {
      // In a real app, this would trigger a download
      alert(`Đang tải xuống báo cáo: ${this.report.name}`);
    },
    printReport() {
      // In a real app, this would trigger the print functionality
      alert(`Đang chuẩn bị in báo cáo: ${this.report.name}`);
      window.print();
    },
    addNote() {
      if (!this.newNote.trim()) {
        return;
      }
      
      // In a real app, this would send the note to the API
      // For demo, just update the local state
      if (this.report.notes) {
        this.report.notes += '\n\n' + this.newNote;
      } else {
        this.report.notes = this.newNote;
      }
      
      this.newNote = '';
      alert('Đã thêm ghi chú vào báo cáo');
    },
    shareReport(method) {
      switch (method) {
        case 'email':
          alert('Đã mở form chia sẻ qua email');
          break;
        case 'link':
          alert('Đã sao chép liên kết báo cáo vào clipboard');
          break;
        case 'export':
          alert('Đang xuất báo cáo ra tệp');
          break;
      }
    }
  }
};
</script>

<style scoped>
.report-detail-container {
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
.share-options {
  display: flex;
  gap: 10px;
}
.report-preview {
  min-height: 400px;
}
.chart-container, .table-container {
  padding: 15px;
}
.chart-header {
  text-align: center;
  margin-bottom: 20px;
}
.chart-wrapper {
  height: 300px;
  margin-bottom: 20px;
}
.mock-chart {
  height: 250px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 0 30px;
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}
.mock-chart-bar {
  width: 40px;
  background-color: #4e73df;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.5s ease;
}
.mock-chart-value {
  position: absolute;
  top: -25px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
}
.mock-chart-labels {
  display: flex;
  justify-content: space-around;
  padding: 0 30px;
  margin-top: 10px;
}
.mock-chart-label {
  width: 40px;
  text-align: center;
  font-size: 12px;
}
.chart-legend {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.legend-item {
  display: flex;
  align-items: center;
  margin: 0 10px;
}
.legend-color {
  width: 15px;
  height: 15px;
  margin-right: 5px;
  border-radius: 3px;
}
@media print {
  .action-buttons, .form-group, .share-options {
    display: none;
  }
}
</style> 