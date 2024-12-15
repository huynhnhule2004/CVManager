<script setup>
import { ref, inject, reactive, computed, onMounted } from 'vue';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref as dbRef, query, orderByChild, equalTo, get } from 'firebase/database';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';
import { required, email } from '@vuelidate/validators'; // Thêm validator email
import useVuelidate from '@vuelidate/core';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAJSlLv3-LxG2FvXATzivaZlrKKTyMTceU",
    authDomain: "vuejs-cb0f7.firebaseapp.com",
    projectId: "vuejs-cb0f7",
    storageBucket: "vuejs-cb0f7.appspot.com",
    messagingSenderId: "422783484607",
    appId: "1:422783484607:web:807c56bdbdaeb8e1c63c0a",
    measurementId: "G-247N50KPPP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Reactive form state
const form = reactive({
    email: '',
    password: '',
});

// Validation rules
const rules = computed(() => ({
    email: { required, email }, // Yêu cầu email đúng định dạng
    password: { required }, // Yêu cầu mật khẩu không được bỏ trống
}));

// Vuelidate instance
const v$ = useVuelidate(rules, form);

// Vue Router
const router = useRouter();

// Inject authState
const authState = inject('authState');

// Handle login
const handleLogin = async () => {
    v$.value.$touch(); // Đánh dấu tất cả các trường là đã chạm vào

    if (v$.value.$invalid) {
        toast.error('Vui lòng kiểm tra lại thông tin nhập!');
        return;
    }

    try {
        const { email, password } = form;

        // Query to check email in Firebase Realtime Database
        const userQuery = query(dbRef(database, 'users'), orderByChild('email'), equalTo(email));
        const snapshot = await get(userQuery);

        if (snapshot.exists()) {
            const userData = Object.values(snapshot.val())[0]; // Get the first matched user

            if (userData.password === password) {
                // Save user data to authState
                authState.user = userData;

                // Save to localStorage
                localStorage.setItem('user', JSON.stringify(userData));

                // Redirect to homepage
                router.push('/');
                localStorage.setItem("loginSuccess", "Đăng nhập thành công!");
                // toast.success(`Chào mừng ${userData.name}!`);
            } else {
                toast.error('Mật khẩu không chính xác!');
            }
        } else {
            toast.error('Email không tồn tại trong hệ thống!');
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra thông tin người dùng:', error);
        toast.error('Đã xảy ra lỗi, vui lòng thử lại sau.');
    }
};

onMounted(() => {
    const toastMessage = localStorage.getItem('toastMessage');
    const register = localStorage.getItem('registerSuccess');
    if (toastMessage) {
        toast.error(toastMessage); // Hiển thị thông báo
        localStorage.removeItem('toastMessage'); // Xóa sau khi hiển thị
    }
    if (register) {
        toast.success(register); // Hiển thị thông báo
        localStorage.removeItem('registerSuccess'); // Xóa sau khi hiển thị
    }
});
</script>

<template>
    <div class="page-inner mb-3">
        <div class="container w-25 card shadow-sm p-4 mt-5 mb-5">
            <h2 class="text-center mb-4">Đăng Nhập</h2>
            <form @submit.prevent="handleLogin">
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" v-model="form.email"
                        :class="{ 'is-invalid': v$.email.$error }" />
                    <span class="text-danger" v-if="v$.email.$error">
                        Vui lòng nhập email hợp lệ!
                    </span>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Mật Khẩu</label>
                    <input type="password" class="form-control" id="password" v-model="form.password"
                        :class="{ 'is-invalid': v$.password.$error }" />
                    <span class="text-danger" v-if="v$.password.$error">
                        Vui lòng nhập mật khẩu!
                    </span>
                </div>
                <button type="submit" class="btn btn-primary w-100">Đăng Nhập</button>
            </form>
            <div class="mt-3 text-center">
                <p>
                    Chưa có tài khoản?
                    <router-link to="/register">Đăng ký ngay</router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
