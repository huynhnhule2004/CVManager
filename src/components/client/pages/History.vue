<script setup>
import { ref, computed, onMounted } from "vue";
import { getDatabase, ref as dbRef, get, child } from "firebase/database";
import { database } from "../../../firebase";

// Reactive variables
const userId = ref(null);
const history = ref([]);
const currentPage = ref(1); // Current page number
const itemsPerPage = 10; // Number of items per page

// Paginated data (computed)
const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return history.value.slice(start, end);
});

// Total pages (computed)
const totalPages = computed(() => {
  return Math.ceil(history.value.length / itemsPerPage);
});

// Function to fetch data from Firebase
const fetchHistory = async () => {
  if (!userId.value) {
    console.error("Không tìm thấy userId trong localStorage");
    return;
  }

  try {
    const dbRefRoot = dbRef(database);
    const snapshot = await get(child(dbRefRoot, `cv`));

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Filter CVs by userId
      history.value = Object.keys(data)
        .map((key) => data[key])
        .filter((cv) => cv.userId === userId.value);
    } else {
      console.log("Không tìm thấy dữ liệu.");
      history.value = [];
    }
  } catch (error) {
    console.error("Lỗi khi truy vấn dữ liệu:", error);
  }
};

// Function to format date
const formatDate = (date) => {
  return new Date(date).toLocaleString("vi-VN");
};

// Lifecycle hook to initialize
onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.userId) {
    userId.value = user.userId;
    fetchHistory();
  } else {
    console.error("Không tìm thấy thông tin user hoặc userId trong localStorage.");
  }
});
</script>

<template>
  <div>
    <div class="container">
      <div class="page-inner">
        <h1>Lịch sử tải template</h1>
        <div class="table-responsive">
          <table v-if="paginatedHistory.length" class="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên CV</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedHistory" :key="item.cvId">
                <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
                <td>{{ item.cvName }}</td>
                <td>{{ formatDate(item.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>Không có lịch sử tải template.</p>
        </div>

        <!-- Bootstrap Pagination -->
        <nav v-if="totalPages > 1" aria-label="Page navigation example">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                Trước
              </button>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
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
