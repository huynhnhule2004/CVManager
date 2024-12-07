<script setup>
import { reactive, ref, computed } from 'vue';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { toast } from 'vue3-toastify';
import { useRouter, useRoute } from 'vue-router';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, push, set } from 'firebase/database';
import { storage, database } from '../../../firebase'; // Import database từ Firebase config

const router = useRoute();
const routes = useRouter();

const state = reactive({
    name: '',
    html: '',
    imageFile: null, // File ảnh được chọn
    preview: '', // URL preview ảnh
    progress: 0, // Tiến trình tải ảnh
    uploadedImage: '', // Link ảnh tải lên thành công
});

const rules = computed(() => ({
    name: { required },
    html: { required },
    imageFile: { required },
}));

const v$ = useVuelidate(rules, state);

// Hiển thị ảnh preview
function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
        state.imageFile = file;
        state.preview = URL.createObjectURL(file);
    }
}

// Xử lý thêm danh mục
async function add() {
    const isValid = await v$.value.$validate();
    if (!isValid) {
        toast('Thêm loại sản phẩm thất bại: Vui lòng kiểm tra lại thông tin', { type: 'error' });
        return;
    }

    // Tải ảnh lên Firebase trước
    if (state.imageFile) {
        const storageReference = storageRef(storage, `templates/${state.imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageReference, state.imageFile);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                state.progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            },
            (error) => {
                console.error('Error uploading file:', error);
                toast('Không thể tải lên ảnh, vui lòng thử lại!', { type: 'error' });
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                state.uploadedImage = downloadURL; // Lưu đường dẫn ảnh tải lên
                saveTemplate();
            }
        );
    } else {
        saveTemplate();
    }
}

// Lưu thông tin template vào database
async function saveTemplate() {
    try {
        const categoriesRef = dbRef(database, 'templates'); // Tạo tham chiếu đến node "templates"
        const newCategoryRef = push(categoriesRef); // Tạo ID mới cho danh mục
        await set(newCategoryRef, {
            id: newCategoryRef.key,
            name: state.name,
            html: state.html,
            image: state.uploadedImage,
        });

        toast('Thêm loại sản phẩm thành công!', { type: 'success' });
        routes.push('/templates'); // Quay lại trang danh sách template
    } catch (error) {
        console.error('Error adding template:', error);
        toast('Đã xảy ra lỗi khi thêm danh mục!', { type: 'error' });
    }
}

// Quay về trang trước
function goBack() {
    routes.go(-1);
}
</script>

<template>
    <div class="container">
        <div class="page-inner">
            <h1 class="mb-4 mt-3">Add Template</h1>
            <form>
                <div class="mb-3">
                    <label for="categoryName" class="form-label">Name</label>
                    <input type="text" id="categoryName" class="form-control" v-model="state.name"
                        :class="{ 'is-invalid': v$.name.$error }" />
                    <span class="text-danger" v-if="v$.name.$error">Please enter the name of the template!</span>
                </div>

                <div class="mb-3">
                    <label for="categoryhtml" class="form-label">HTML</label>
                    <textarea id="categoryhtml" class="form-control" v-model="state.html"
                        :class="{ 'is-invalid': v$.html.$error }"></textarea>
                    <span class="text-danger" v-if="v$.html.$error">Please enter the HTML content of the template!</span>
                </div>

                <div class="mb-3">
                    <label for="categoryImage" class="form-label">Image</label>
                    <input type="file" id="categoryImage" class="form-control" @change="handleFileChange"
                        :class="{ 'is-invalid': v$.imageFile.$error }" />
                    <span class="text-danger" v-if="v$.imageFile.$error">Please select an image!</span>

                    <!-- Hiển thị ảnh preview -->
                    <div v-if="state.preview" class="mt-3">
                        <img :src="state.preview" alt="Image Preview" class="img-thumbnail" style="max-width: 200px;" />
                    </div>
                </div>

                <!-- Thanh tiến trình tải ảnh -->
                <div v-if="state.progress > 0 && state.progress < 100" class="progress mt-3">
                    <div class="progress-bar" role="progressbar" :style="{ width: state.progress + '%' }">
                        {{ state.progress }}%
                    </div>
                </div>

                <div>
                    <button type="button" class="btn btn-secondary me-3 mt-3" @click="goBack">Quay về</button>
                    <button type="button" class="btn btn-primary mt-3" @click="add">Thêm danh mục</button>
                </div>
            </form>
        </div>
    </div>
</template>

