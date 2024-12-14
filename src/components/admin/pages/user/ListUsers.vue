<script setup>
import { ref, onMounted } from 'vue';
import { database, ref as dbRef, onValue, update, set } from '../../../../firebase'; // Đảm bảo đường dẫn đúng đến firebase.js
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const users = ref([]); // Danh sách người dùng
const loading = ref(true); // Hiển thị trạng thái tải dữ liệu
const error = ref(null); // Thông báo lỗi
const router = useRouter();

// Hàm tải dữ liệu người dùng từ Firebase
const fetchUsers = async () => {
    const usersRef = dbRef(database, 'users');

    try {
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                users.value = Object.entries(data).map(([id, user]) => ({ id, ...user }));
            } else {
                users.value = [];
            }
            loading.value = false;
        });
    } catch (err) {
        error.value = err.message;
        toast("Lỗi khi tải danh sách người dùng!", { type: "error" });
        loading.value = false;
    }
};

onMounted(fetchUsers);

async function handleDelete(userId) {
  // Show SweetAlert confirmation dialog
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

  // Proceed with deletion if confirmed
  if (result.isConfirmed) {
    const userRef = dbRef(database, `users/${userId}`);
    set(userRef, null)
      .then(() => {
        toast("Xóa người dùng thành công!", { type: "success" });
      })
      .catch((err) => {
        toast("Lỗi khi xóa người dùng!", { type: "error" });
      });
  }
}

function handleEdit(userId) {
    router.push(`/admin/edit/${userId}`);
}
</script>

<template>
    <div class="container mt-5">
        <div class="page-inner pt-5">
            <h1 class="mb-4">Danh Sách Người Dùng</h1>

            <!-- Hiển thị trạng thái tải dữ liệu -->
            <div v-if="loading" class="text-center">
                <p>Đang tải dữ liệu...</p>
            </div>

            <!-- Hiển thị lỗi nếu có -->
            <div v-if="error" class="text-danger text-center">
                <p>{{ error }}</p>
            </div>

            <!-- Hiển thị bảng danh sách người dùng -->
            <div v-if="!loading && users.length > 0">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Họ và Tên</th>
                                <th>Email</th>
                                <th>Avatar</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user, index) in users" :key="user.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ user.name }}</td>
                                <td>{{ user.email }}</td>
                                <td>
                                    <img v-if="user.profilePicture" :src="user.profilePicture" alt="Avatar" width="50"
                                        class="rounded" />
                                    <span v-else class="text-muted">Không có</span>
                                </td>
                                <td>
                                    <button class="btn btn-warning btn-sm me-2" @click="handleEdit(user.id)">Sửa</button>
                                    <button class="btn btn-danger btn-sm" @click="handleDelete(user.id)">Xóa</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Thông báo nếu danh sách trống -->
            <div v-if="!loading && users.length === 0" class="text-center">
                <p>Không có người dùng nào trong hệ thống.</p>
            </div>
        </div>

    </div>
</template>

<style>
.container {
    max-width: 800px;
    margin: auto;
}

.table img {
    object-fit: cover;
    height: 50px;
}
</style>
