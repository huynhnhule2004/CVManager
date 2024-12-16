<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { get, ref as dbRef } from "firebase/database";
import { database } from "../../../../firebase";

const route = useRoute();
const cvId = route.params.cvId; // Lấy tên CV từ URL
const decodedCvName = decodeURIComponent(cvId); // Giải mã tên CV từ URL
const allUsers = ref([]); // Dữ liệu đầy đủ người dùng
const currentPage = ref(1); // Trang hiện tại
const itemsPerPage = 10; // Số bản ghi mỗi trang

// Biến computed để tính tổng số trang
const totalPages = computed(() => {
  return Math.ceil(allUsers.value.length / itemsPerPage);
});

// Biến computed để lấy danh sách người dùng trên trang hiện tại
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return allUsers.value.slice(start, end);
});

// Hàm format ngày
const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString(); // Chuyển thành định dạng ngày tháng
};

// Hàm lấy người dùng đã tải CV
const fetchUsersForCV = () => {
  const cvRef = dbRef(database, "cv"); // Truy vấn tất cả CV
  get(cvRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const matchingCVs = Object.keys(data).filter(
          (key) => data[key].cvName === decodedCvName // Tìm CV có tên trùng khớp
        );

        // Lặp qua các CV đã tìm được và lấy userId
        matchingCVs.forEach((cvKey) => {
          const userId = data[cvKey].userId; // Lấy userId từ CV

          // Truy vấn thông tin người dùng từ bảng "users"
          const userRef = dbRef(database, `users/${userId}`);
          get(userRef)
            .then((userSnapshot) => {
              if (userSnapshot.exists()) {
                const user = userSnapshot.val();
                allUsers.value.push({
                  ...user,
                  createdAt: data[cvKey].createdAt, // Lưu cả thông tin người dùng và createdAt
                });
              }
            })
            .catch((error) => {
              console.error("Lỗi khi lấy thông tin người dùng:", error);
            });
        });
      } else {
        console.log("Không có dữ liệu CV");
      }
    })
    .catch((error) => {
      console.error("Lỗi khi lấy dữ liệu CV:", error);
    });
};

onMounted(() => {
  fetchUsersForCV(); // Gọi hàm khi component được mounted
});
</script>

<template>
  <div class="container">
    <div class="page-inner">
      <div class="cv-detail">
        <h1>Chi tiết CV: {{ decodedCvName }}</h1>
        <div v-if="allUsers && allUsers.length > 0">
          <h2>Người dùng đã tải CV này</h2>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên Người Dùng</th>
                  <th>Ngày Tạo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, index) in paginatedUsers" :key="user.userId">
                  <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang, chỉ hiển thị khi có từ 2 trang trở lên -->
          <nav v-if="totalPages > 1" aria-label="Page navigation example" class="mt-4">
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
        <div v-else>
          <p>Không có người dùng đã tải CV này.</p>
        </div>
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
