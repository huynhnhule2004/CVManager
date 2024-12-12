<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { inject } from 'vue';

const authState = inject('authState');
// Tạo biến trạng thái
const name = ref('');

// Kiểm tra trạng thái đăng nhập khi component được khởi tạo
onMounted(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (storedUser) {
    name.value = storedUser.name; // Chỉ lấy tên người dùng
  }
});

// Hàm đăng xuất
const logout = () => {
  localStorage.removeItem('user'); // Xóa thông tin khỏi localStorage
  authState.user = null; // Xóa thông tin trong trạng thái toàn cục
};
</script>

<template>
  <header class="header container-fluid">
    <div class="logo">
      <!-- Logo hình ảnh -->
      <img src="./../../../assets/img/logo-new.png" alt="TopCV AI Logo" class="img-fluid" />
    </div>
    <nav>
      <ul class="nav-list d-flex list-unstyled">
        <li><a href="#features">Tính năng</a></li>
        <li><a href="#pricing">Giá cả</a></li>
        <li><a href="#about">Giới thiệu</a></li>
        <li><a href="#contact">Liên hệ</a></li>

        <!-- Kiểm tra trạng thái đăng nhập -->
        <template v-if="authState.user">
          <div class="dropdown">
            <button class="btn btn-warning dropdown-toggle" type="button" id="dropdownMenuButton1"
              data-bs-toggle="dropdown" aria-expanded="false">
              Hi, {{ authState.user.name }}
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li><button @click="logout" class="dropdown-item">Đăng xuất</button></li>
            </ul>
          </div>

          <li>
          </li>
        </template>
        <template v-else>
          <li>
            <RouterLink to="/login">Đăng nhập</RouterLink>
          </li>
          <li>
            <RouterLink to="/register" class="btn-signup">Đăng ký</RouterLink>
          </li>
        </template>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
/* Header */
.header {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background-color: #002f6c;
  color: #fff;
  align-items: center;
}

.logo img {
  width: 120px;
}

.nav-list {
  list-style: none;
  display: flex;
  gap: 20px;
}

.nav-list li {
  font-size: 16px;
}

.nav-list a {
  color: #fff;
  padding: 10px;
}

/* .nav-list a:hover {
  background-color: #f57c00;
  border-radius: 5px;
  color: #fff;
} */

.btn-start {
  background-color: #f57c00;
  padding: 15px 30px;
  border-radius: 5px;
  color: #fff;
  font-size: 18px;
}

.nav-list .btn-logout {
  background-color: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 10px;
}

.nav-list .btn-logout:hover {
  color: #f57c00;
}
</style>
