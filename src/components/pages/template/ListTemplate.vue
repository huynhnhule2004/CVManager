<script setup>
import { ref, onMounted } from 'vue';
import { onValue, ref as dbRef } from 'firebase/database';
import { database } from '../../../firebase'; // Import cấu hình Firebase
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

const data = ref([]);
const error = ref(null);
const router = useRouter();

// Lấy dữ liệu từ Firebase
async function fetchData() {
  const templatesRef = dbRef(database, 'templates');
  try {
    onValue(templatesRef, (snapshot) => {
      const templates = snapshot.val();
      if (templates) {
        data.value = Object.entries(templates).map(([id, item]) => ({ id, ...item }));
      } else {
        data.value = [];
      }
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Không thể tải dữ liệu.';
  }
}

// Xóa template
async function deleteItem(id) {
  const result = await Swal.fire({
    title: 'Bạn có chắc chắn muốn xóa?',
    text: 'Hành động này không thể hoàn tác!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy'
  });

  if (result.isConfirmed) {
    try {
      const templateRef = dbRef(database, `templates/${id}`);
      await templateRef.remove();
      Swal.fire({
        title: 'Đã xóa!',
        text: 'Template đã được xóa thành công.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      fetchData(); // Làm mới danh sách
    } catch (err) {
      console.error('Error deleting template:', err);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không thể xóa template, vui lòng thử lại.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }
}

onMounted(() => {
  fetchData();
});
</script>


<template>
  <div class="container">
    <div class="page-inner">
      <h1 class="mb-4 mt-3">List Template</h1>

      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Image</th>
              <th scope="col">Name</th>
              <th scope="col">Detail</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in data" :key="item.id">
              <th scope="row">{{ index + 1 }}</th>
              <td>
                <img
                  :src="item.image"
                  alt="Category Image"
                  class="img-thumbnail"
                  width="100"
                  height="100"
                  style="object-fit: contain;"
                />
              </td>
              <td>{{ item.name }}</td>
              <td>
                <RouterLink :to="`/templates/${item.id}`" class="btn btn-info">Xem chi tiết</RouterLink>
              </td>
              <td>
                <RouterLink
                  :to="'/templates/' + item.id"
                  class="btn btn-warning me-2"
                >
                  Sửa
                </RouterLink>
                <button @click="deleteItem(item.id)" class="btn btn-danger">
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Custom styles for responsive table */
.container {
    padding: 20px;
}

.table img {
    object-fit: cover;
    width: 100px;
    height: 100px;
}
</style>
