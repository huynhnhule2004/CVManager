<script setup>
import { ref as firebaseRef, onValue } from "firebase/database";
import { database } from "../../../../firebase";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Tạo reactive biến để lưu danh sách cvName
const cvNames = ref([]);

// Biến reactive để lưu trang hiện tại
const currentPage = ref(1);

// Số item mỗi trang
const itemsPerPage = 10;

// Biến computed để đếm số lần xuất hiện của từng cvName
const cvNameCounts = computed(() => {
  const counts = {};
  // Đếm số lần xuất hiện của từng tên CV
  cvNames.value.forEach((cv) => {
    counts[cv.name] = (counts[cv.name] || 0) + 1;
  });
  return counts;
});

// Danh sách CV trên trang hiện tại (computed)
const paginatedCVs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const entries = Object.entries(cvNameCounts.value).slice(start, end);
  return entries.map(([name, count]) => ({ name, count }));
});

// Tổng số trang (computed)
const totalPages = computed(() => {
  return Math.ceil(Object.keys(cvNameCounts.value).length / itemsPerPage);
});

// Hàm fetch dữ liệu từ Firebase
const fetchCVs = () => {
  const cvRef = firebaseRef(database, "cv");
  onValue(cvRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Lưu thông tin cvName vào mảng cvNames, chỉ lưu tên CV (chuỗi)
      cvNames.value = Object.keys(data).map((key) => ({
        id: key,
        name: data[key].cvName, // Lưu tên CV dưới dạng chuỗi
      }));
    } else {
      cvNames.value = []; // Nếu không có dữ liệu
    }
  });
};

// Hàm điều hướng tới trang chi tiết
const goToDetail = (cvName) => {
  // Tìm ra đối tượng CV tương ứng với cvName
  const cv = cvNames.value.find((item) => item.name === cvName);
  if (cv) {
    // Chuyển hướng đến trang chi tiết của CV đó với cvId
    router.push(`/admin/cv/${cv.name}`);
  }
};

// Gọi fetchCVs khi component được mounted
onMounted(() => {
  fetchCVs();
});
</script>

<template>
  <div class="container">
    <div class="page-inner">
      <div class="list-cv">
        <h1 class="mb-4">Danh sách CV</h1>
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên CV</th>
                <th>Số lượt tải</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cv, index) in paginatedCVs" :key="cv.name">
                <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
                <td>{{ cv.name }}</td>
                <td>{{ cv.count }}</td>
                <td>
                  <button class="btn btn-info" @click="goToDetail(cv.name)">Xem chi tiết</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bootstrap Pagination, chỉ hiển thị khi có từ 2 trang trở lên -->
        <nav v-if="totalPages > 1" aria-label="Page navigation example">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button
                class="page-link"
                @click="currentPage--"
                :disabled="currentPage === 1"
              >
                Trước
              </button>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="currentPage = page">
                {{ page }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button
                class="page-link"
                @click="currentPage++"
                :disabled="currentPage === totalPages"
              >
                Tiếp
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagination .page-item.disabled .page-link {
  pointer-events: none;
  opacity: 0.6;
}
</style>
