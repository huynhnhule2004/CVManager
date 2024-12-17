<script setup>
import { database } from "../../firebase";
import { ref as dbRef, get, query, orderByChild, limitToFirst,onValue } from "firebase/database";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// Thống kê
const totalCustomers = ref(0);

const fetchStatistics = async () => {
  try {
    // Lấy tổng số khách hàng
    const usersSnapshot = await get(dbRef(database, "users"));
    if (usersSnapshot.exists()) {
      totalCustomers.value = Object.keys(usersSnapshot.val()).length; // Số lượng khách hàng
    }

  } catch (error) {
    console.error("Error fetching statistics:", error);
  }
};

// Gọi hàm khi component mount
// onMounted(fetchStatistics);


// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


// Tạo reactive biến để lưu danh sách templates
const templates = ref([]);

// Biến reactive để lưu trang hiện tại
const currentPage = ref(1);

// Số item mỗi trang
const itemsPerPage = 5;

// Biến computed để đếm số lần xuất hiện của từng template
const templateUsageCounts = computed(() => {
  const counts = {};
  // Đếm số lần xuất hiện của từng template
  templates.value.forEach((template) => {
    counts[template.name] = (counts[template.name] || 0) + 1;
  });
  return counts;
});

// Danh sách template trên trang hiện tại (computed)
const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const entries = Object.entries(templateUsageCounts.value).slice(start, end);
  return entries.map(([name, count]) => ({ name, count }));
});

// Tổng số trang (computed)
const totalPages = computed(() => {
  return Math.ceil(Object.keys(templateUsageCounts.value).length / itemsPerPage);
});

// Hàm fetch dữ liệu từ Firebase
const fetchTemplates = () => {
  const templatesRef = dbRef(database, "cv");
  onValue(templatesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Lưu thông tin template vào mảng templates, chỉ lưu tên template
      templates.value = Object.keys(data).map((key) => ({
        id: key,
        name: data[key].cvName, // Lưu tên template dưới dạng chuỗi
      }));
    } else {
      templates.value = []; // Nếu không có dữ liệu
    }
  });
};

// Hàm điều hướng tới trang chi tiết
const goToTemplateDetail = (templateName) => {
  // Tìm ra đối tượng template tương ứng với templateName
  const template = templates.value.find((item) => item.name === templateName);
  if (template) {
    // Chuyển hướng đến trang chi tiết của template đó với templateId
    router.push(`/admin/templates/${template.name}`);
  }
};

// Tạo biểu đồ cho 5 template được sử dụng nhiều nhất
const createChart = () => {
  const labels = Object.keys(templateUsageCounts.value).slice(0, 5); // Lấy tên các template
  const data = labels.map((label) => templateUsageCounts.value[label]);

  const ctx = document.getElementById("templateChart").getContext("2d");
  new Chart(ctx, {
    type: "bar", // Loại biểu đồ: cột
    data: {
      labels: labels,
      datasets: [{
        label: 'Số lượt sử dụng',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

// Gọi fetchTemplates và tạo biểu đồ khi component được mounted
onMounted(() => {
  fetchStatistics();
  fetchTemplates();
  createChart();
});
</script>

<template>
  <div class="container">
    <div class="page-inner">
      <div class="row">
        <!-- Tổng số khách hàng -->
        <div class="col-md-4">
          <div class="card shadow-sm rounded-lg text-white bg-primary mb-4">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <h5 class="card-title">Tổng khách hàng</h5>
                <i class="fas fa-users fa-2x"></i>
              </div>
              <p class="card-text fs-4 fw-bold">{{ totalCustomers }}</p>
            </div>
          </div>
        </div>

        <!-- Top 5 template được sử dụng -->
        <div class="col-md-8">
          <div class="card shadow-sm rounded-lg mb-4">
            <div class="card-body">
              <h5 class="card-title">Top 5 Template được sử dụng nhiều nhất</h5>
        <!-- Biểu đồ thống kê -->
            <div class="chart-container">
              <canvas id="templateChart"></canvas>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  max-width: 600px;
  margin: 0 auto;
  margin-bottom: 30px;
}

.pagination .page-item.disabled .page-link {
  pointer-events: none;
  opacity: 0.6;
}
</style>
