<script setup>
import { ref, reactive, computed } from 'vue';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, push, query, orderByChild, equalTo, get } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';
import { required, email, minLength, helpers  } from '@vuelidate/validators';
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
const storage = getStorage(app);
const database = getDatabase(app);

// Form state
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  file: null,
});
const sameAsPassword = helpers.withMessage(
  'Mật khẩu xác nhận không khớp!',
  (value, { password }) => value === password
);
// Vuelidate rules
const rules = computed(() => ({
  name: { required },
  email: { required, email },
  password: { required, minLength: minLength(6) },
  confirmPassword: { required,sameAsPassword  },
}));

const v$ = useVuelidate(rules, form);

// For preview and progress
const imagePreview = ref(null);
const uploadProgress = ref(null);

// Router for navigation
const router = useRouter();

// Handle file upload
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  form.file = file;
  imagePreview.value = URL.createObjectURL(file);
};

// Save user data
const saveUserData = (userId, fileUrl = null) => {
  const userData = {
    userId,
    name: form.name,
    email: form.email,
    password: form.password,
    ...(fileUrl && { profilePicture: fileUrl }),
  };

  push(dbRef(database, 'users'), userData)
    .then(() => {
      toast.success('Đăng ký thành công!');
      Object.keys(form).forEach((key) => (form[key] = key === 'file' ? null : ''));
      imagePreview.value = null;
      uploadProgress.value = null;
      router.push('/login');
    })
    .catch((error) => {
      toast.error('Lỗi: ' + error.message);
    });
};

// Handle form submission
const handleSubmit = async () => {
  v$.value.$touch(); // Trigger validation
  if (v$.value.$invalid) {
    toast.error('Vui lòng kiểm tra lại thông tin nhập!');
    return;
  }

  try {
    const emailQuery = query(dbRef(database, 'users'), orderByChild('email'), equalTo(form.email));
    const snapshot = await get(emailQuery);

    if (snapshot.exists()) {
      toast.error('Email đã tồn tại!');
      return;
    }

    const newUserRef = push(dbRef(database, 'users'));
    const userId = newUserRef.key;

    if (form.file) {
      const fileRef = storageRef(storage, `uploads/${form.file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, form.file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          toast.error('Lỗi tải tệp: ' + error.message);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            saveUserData(userId, downloadURL);
          });
        }
      );
    } else {
      saveUserData(userId);
    }
  } catch (error) {
    toast.error('Đã xảy ra lỗi: ' + error.message);
  }
};
</script>


<template>
  <div class="container w-25 card shadow-sm p-4 mt-5 mb-5">
    <h2 class="text-center mb-4">Đăng Ký Tài Khoản</h2>
    <form @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label for="name" class="form-label">Họ Tên</label>
        <input type="text" id="name" v-model="form.name" :class="{ 'is-invalid': v$.name.$error }" class="form-control" />
        <div v-if="v$.name.$error" class="text-danger">Họ tên là bắt buộc!</div>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" id="email" v-model="form.email" :class="{ 'is-invalid': v$.email.$error }" class="form-control" />
        <div v-if="v$.email.$error" class="text-danger">
          <div v-if="v$.email.$invalid">Email không hợp lệ!</div>
        </div>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Mật Khẩu</label>
        <input type="password" id="password" v-model="form.password" :class="{ 'is-invalid': v$.password.$error }" class="form-control" />
        <div v-if="v$.password.$error" class="text-danger">
          <div v-if="v$.password.$invalid">Mật khẩu phải có ít nhất 6 ký tự!</div>
        </div>
      </div>
      <div class="mb-3">
        <label for="confirmPassword" class="form-label">Xác Nhận Mật Khẩu</label>
        <input type="password" id="confirmPassword" v-model="form.confirmPassword" :class="{ 'is-invalid': v$.confirmPassword.$error }" class="form-control" />
        <div v-if="v$.confirmPassword.$error" class="text-danger">
          <div v-if="v$.confirmPassword.$invalid">Mật khẩu xác nhận không khớp!</div>
        </div>
      </div>
      <div class="mb-3">
        <label for="file" class="form-label">Ảnh Đại Diện</label>
        <input type="file" id="file" @change="handleFileUpload" class="form-control" />
        <div v-if="imagePreview" class="mt-3">
          <img :src="imagePreview" alt="Preview" class="img-thumbnail" />
        </div>
        <div v-if="uploadProgress !== null" class="mt-3">
          <progress :value="uploadProgress" max="100" class="progress-bar w-100"></progress>
          <div>{{ uploadProgress }}%</div>
        </div>
      </div>
      <button type="submit" class="btn btn-primary w-100">Đăng Ký</button>
    </form>
  </div>
</template>


<style scoped>
/* Style the progress bar to make it appear longer and customize its color */
.progress-bar {
  height: 10px;
  border-radius: 5px;
  background-color: #e0e0e0; /* Light gray background color */
  transition: background-color 0.3s ease;
}

progress[value] {
  background-color: #e0e0e0; /* Set the background color of the progress bar */
}

progress[value]::-webkit-progress-bar {
  background-color: #e0e0e0; /* Light gray background for WebKit browsers */
}

progress[value]::-webkit-progress-value {
  background-color: #002f6c; /* Dark blue color for the progress bar */
}

progress[value]::-moz-progress-bar {
  background-color: #002f6c; /* Dark blue color for Firefox */
}
</style>