<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { get, ref as dbRef } from "firebase/database";
import { database } from "../../../../firebase";

const route = useRoute();
const cvId = route.params.cvId; // Lấy tên CV từ URL
const decodedCvName = decodeURIComponent(cvId); // Giải mã tên CV từ URL
const users = ref([]);

// Hàm để format ngày (createdAt)
const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString(); // Chuyển thành định dạng ngày tháng
};

// Hàm lấy người dùng đã tải CV
// Hàm lấy người dùng đã tải CV
const fetchUsersForCV = () => {
  const cvRef = dbRef(database, "cv"); // Truy vấn tất cả CV
  get(cvRef).then((snapshot) => {
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
        get(userRef).then((userSnapshot) => {
          if (userSnapshot.exists()) {
            const user = userSnapshot.val();
            users.value.push({ ...user, createdAt: data[cvKey].createdAt }); // Lưu cả thông tin người dùng và createdAt
          }
        }).catch((error) => {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
        });
      });
    } else {
      console.log("Không có dữ liệu CV");
    }
  }).catch((error) => {
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
        <div v-if="users && users.length > 0">
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
                <tr v-for="(user, index) in users" :key="user.userId">
                  <td>{{ index + 1 }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else>
          <p>Không có người dùng đã tải CV này.</p>
        </div>
      </div>
    </div>
  </div>
</template>
