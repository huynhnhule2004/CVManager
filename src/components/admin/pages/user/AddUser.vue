<script setup>
import { reactive, ref as vueRef, computed } from 'vue'; // Dùng vueRef cho Vue
import { required, email } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';
import {
    storage,
    storageRef,
    uploadBytesResumable,
    getDownloadURL,
    database,
    set,
    push,
    ref as dbRef, // Đổi tên ref từ firebase.database thành dbRef để tránh xung đột
} from '../../../../firebase';
import { get } from 'firebase/database';

const router = useRouter();
const state = reactive({
    name: '',
    email: '',
    password: '',
    profilePicture: null,
    uploadProgress: 0, // Thêm để theo dõi tiến trình upload
});
const rules = computed(() => ({
    name: { required },
    email: { required, email },
    password: { required },
    profilePicture: { required },
}));
const v$ = useVuelidate(rules, state);

const avatarPreview = vueRef(null); // Dùng vueRef cho ảnh preview
const error = vueRef(null);

function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
        state.profilePicture = file;
        avatarPreview.value = URL.createObjectURL(file); // Tạo preview ảnh
    }
}

async function addUser() {
    const isValid = await v$.value.$validate();
    if (!isValid) {
        toast("Thêm loại người dùng thất bại: Vui lòng kiểm tra lại thông tin", {
            type: "error",
        });
        return;
    }

    try {
        // Kiểm tra email trùng lặp
        const usersRef = dbRef(database, 'users');
        const snapshot = await get(usersRef);
        const users = snapshot.val();
        if (users) {
            const emailExists = Object.values(users).some(user => user.email === state.email);
            if (emailExists) {
                toast("Email này đã được sử dụng!", { type: "error" });
                return;
            }
        }

        let fileUrl = null;

        // Tạo một userId duy nhất
        const userRef = push(usersRef);
        const userId = userRef.key;

        // Upload ảnh profile nếu có
        if (state.profilePicture) {
            const fileRef = storageRef(storage, `uploads/${userId}/${state.profilePicture.name}`);
            const uploadTask = uploadBytesResumable(fileRef, state.profilePicture);

            // Theo dõi tiến trình upload
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    state.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                },
                (err) => {
                    throw err;
                }
            );

            // Chờ đợi upload xong và lấy URL
            await uploadTask;
            fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
        }

        // Lưu thông tin người dùng vào Realtime Database
        await set(userRef, {
            userId, // Lưu userId tự động tạo
            name: state.name,
            email: state.email,
            password: state.password, // Cần mã hóa mật khẩu trước khi lưu trong thực tế
            profilePicture: fileUrl || '',
        });

        toast("Thêm người dùng thành công!", { type: "success" });
        router.push('/admin/users');
    } catch (err) {
        error.value = err.message;
        toast("Đã xảy ra lỗi khi thêm người dùng!", { type: "error" });
        console.error(err);
    }
}

function goBack() {
    router.go(-1);
}
</script>

<template>
    <div class="container">
        <div class="page-inner">
            <h1 class="mb-4">Thêm Người Dùng</h1>
            <form>
                <div class="mb-3">
                    <label for="name" class="form-label">Họ và tên</label>
                    <input type="text" id="name" class="form-control" v-model="state.name" 
                        :class="{ 'is-invalid': v$.name.$invalid && v$.name.$dirty }" />
                    <span class="text-danger" v-if="v$.name.$invalid && v$.name.$dirty">
                        Vui lòng nhập tên người dùng!
                    </span>
                </div>

                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" class="form-control" v-model="state.email" 
                        :class="{ 'is-invalid': v$.email.$invalid && v$.email.$dirty }" />
                    <span class="text-danger" v-if="v$.email.$invalid && v$.email.$dirty">
                        Vui lòng nhập email hợp lệ!
                    </span>
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label">Mật khẩu</label>
                    <input type="password" id="password" class="form-control" v-model="state.password" 
                        :class="{ 'is-invalid': v$.password.$invalid && v$.password.$dirty }" />
                    <span class="text-danger" v-if="v$.password.$invalid && v$.password.$dirty">
                        Vui lòng nhập mật khẩu!
                    </span>
                </div>

                <div class="mb-3">
                    <label for="profilePicture" class="form-label">Avatar</label>
                    <input type="file" id="profilePicture" class="form-control" @change="handleFileChange" 
                        :class="{ 'is-invalid': v$.profilePicture.$invalid && v$.profilePicture.$dirty }" />
                    <span class="text-danger" v-if="v$.profilePicture.$invalid && v$.profilePicture.$dirty">
                        Vui lòng chọn ảnh đại diện!
                    </span>

                    <!-- Hiển thị preview ảnh nếu đã chọn -->
                    <div v-if="avatarPreview" class="mt-3">
                        <img :src="avatarPreview" alt="Preview" class="img-thumbnail" width="150" />
                    </div>
                </div>

                <!-- Hiển thị thanh tiến trình -->
                <div v-if="state.uploadProgress > 0" class="mb-3">
                    <progress :value="state.uploadProgress" max="100" class="w-100"></progress>
                    <p>{{ state.uploadProgress.toFixed(2) }}%</p>
                </div>

                <div>
                    <button type="button" class="btn btn-secondary me-3" @click="goBack">Quay về</button>
                    <button type="button" class="btn btn-primary" @click="addUser">Thêm người dùng</button>
                </div>
            </form>
        </div>
    </div>
</template>
