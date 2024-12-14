<script setup>
import { ref as firebaseRef, onValue } from "firebase/database";
import { database } from "../../../../firebase";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Tạo reactive biến để lưu danh sách cvName
const cvNames = ref([]);

// Biến computed để đếm số lần xuất hiện của từng cvName
const cvNameCounts = computed(() => {
  const counts = {};
  // Đếm số lần xuất hiện của từng tên CV
  cvNames.value.forEach((cv) => {
    counts[cv.name] = (counts[cv.name] || 0) + 1;
  });
  return counts;
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
                <th>Số lượt</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(count, name, index) in cvNameCounts" :key="name">
                <td>{{ index + 1 }}</td>
                <td>{{ name }}</td>
                <td>{{ count }}</td>
                <td>
                  <button class="btn btn-info" @click="goToDetail(name)">Xem chi tiết</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

</template>



<style scoped>
</style>