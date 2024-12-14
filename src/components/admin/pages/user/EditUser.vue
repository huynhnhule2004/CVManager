<script setup>
import { reactive, ref as vueRef, computed, onMounted } from 'vue'; // Dùng vueRef cho Vue
import { required, email } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { toast } from 'vue3-toastify';
import { useRoute, useRouter } from 'vue-router';
import { database, ref as dbRef, get, update } from '../../../../firebase'; // Firebase

const router = useRouter();
const route = useRoute();

// Dữ liệu người dùng đang chỉnh sửa
const state = reactive({
    name: '',
    email: '',
    password: '',
    profilePicture: null,
    avatarPreview: null, // Để hiển thị ảnh preview
    uploadProgress: 0, // Theo dõi tiến trình upload ảnh
});
const rules = computed(() => ({
    name: { required },
    email: { required, email },
    password: { required },
    profilePicture: { required },
}));
const v$ = useVuelidate(rules, state);

// Lỗi và thông báo
const error = vueRef(null);

// Lấy thông tin người dùng từ Firebase
const fetchUser = async () => {
    const userId = route.params.id; // Lấy userId từ URL
    const userRef = dbRef(database, `users/${userId}`);

    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            state.name = userData.name;
            state.email = userData.email;
            state.password = userData.password;
            state.profilePicture = userData.profilePicture;
            state.avatarPreview = userData.profilePicture; // Hiển thị avatar nếu có
        } else {
            error.value = 'Người dùng không tồn tại';
        }
    } catch (err) {
        error.value = err.message;
        toast("Lỗi khi tải thông tin người dùng!", { type: "error" });
    }
};

// Xử lý thay đổi ảnh đại diện
function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
        state.profilePicture = file;
        state.avatarPreview = URL.createObjectURL(file); // Tạo preview ảnh
    }
}

// Cập nhật người dùng
async function updateUser() {
    const isValid = await v$.value.$validate();
    if (!isValid) {
        toast("Cập nhật thất bại: Vui lòng kiểm tra lại thông tin", { type: "error" });
        return;
    }

    const userId = route.params.id;
    const userRef = dbRef(database, `users/${userId}`);

    try {
        // Cập nhật thông tin người dùng
        await update(userRef, {
            name: state.name,
            email: state.email,
            password: state.password,
            profilePicture: state.profilePicture,
        });

        toast("Cập nhật người dùng thành công!", { type: "success" });
        router.push('/admin/users');
    } catch (err) {
        error.value = err.message;
        toast("Đã xảy ra lỗi khi cập nhật người dùng!", { type: "error" });
    }
}

onMounted(fetchUser); // Tải dữ liệu người dùng khi trang được mount
</script>

<template>
    <div class="container">
        <div class="page-inner">
            <h1 class="mb-4">Chỉnh Sửa Người Dùng</h1>

            <!-- Hiển thị lỗi nếu có -->
            <div v-if="error" class="text-danger text-center">
                <p>{{ error }}</p>
            </div>

            <form @submit.prevent="updateUser">
                <!-- Tên người dùng -->
                <div class="mb-3">
                    <label for="name" class="form-label">Họ và tên</label>
                    <input type="text" id="name" class="form-control" v-model="state.name"
                        :class="{ 'is-invalid': v$.name.$invalid && v$.name.$dirty }" />
                    <span class="text-danger" v-if="v$.name.$invalid && v$.name.$dirty">
                        Vui lòng nhập tên người dùng!
                    </span>
                </div>

                <!-- Email người dùng -->
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" class="form-control" v-model="state.email"
                        :class="{ 'is-invalid': v$.email.$invalid && v$.email.$dirty }" />
                    <span class="text-danger" v-if="v$.email.$invalid && v$.email.$dirty">
                        Vui lòng nhập email hợp lệ!
                    </span>
                </div>
                <!-- Mật khẩu -->
                <div class="mb-3 position-relative">
                    <label for="password" class="form-label">Mật khẩu</label>
                    <input :type="state.showPassword ? 'text' : 'password'" id="password" class="form-control pe-5"
                        v-model="state.password"
                        :class="{ 'is-invalid': v$.password.$invalid && v$.password.$dirty }" />
                    <!-- Nút biểu tượng con mắt bên trong input -->
                    <button type="button"
                        class="btn eye position-absolute top-50 end-0 translate-middle-y pe-0"
                        @click="state.showPassword = !state.showPassword">
                        <i :class="state.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                    <span class="text-danger" v-if="v$.password.$invalid && v$.password.$dirty">
                        Vui lòng nhập mật khẩu!
                    </span>
                </div>
                <!-- Avatar -->
                <div class="mb-3">
                    <label for="profilePicture" class="form-label">Avatar</label>
                    <input type="file" id="profilePicture" class="form-control" @change="handleFileChange"
                        :class="{ 'is-invalid': v$.profilePicture.$invalid && v$.profilePicture.$dirty }" />
                    <span class="text-danger" v-if="v$.profilePicture.$invalid && v$.profilePicture.$dirty">
                        Vui lòng chọn ảnh đại diện!
                    </span>

                    <!-- Hiển thị preview ảnh nếu đã chọn -->
                    <div v-if="state.avatarPreview" class="mt-3">
                        <img :src="state.avatarPreview" alt="Preview" class="img-thumbnail" width="150" />
                    </div>
                </div>

                <!-- Thanh tiến trình -->
                <div v-if="state.uploadProgress > 0" class="mb-3">
                    <progress :value="state.uploadProgress" max="100" class="w-100"></progress>
                    <p>{{ state.uploadProgress.toFixed(2) }}%</p>
                </div>

                <!-- Các nút hành động -->
                <div>
                    <button type="button" class="btn btn-secondary me-3" @click="router.go(-1)">Quay về</button>
                    <button type="submit" class="btn btn-primary">Cập nhật người dùng</button>
                </div>
            </form>
        </div>
    </div>
</template>
<style scoped>
.position-relative {
    position: relative;
}

.position-absolute {
    position: absolute;
}

.translate-middle-y {
    transform: translateY(-50%);
}

.pe-5 {
    padding-right: 3rem; /* Dành không gian cho biểu tượng con mắt */
}

.pe-0 {
    padding: 0;
}

.eye {
    top: 70% !important;
    margin-right: 10px;
}
</style>