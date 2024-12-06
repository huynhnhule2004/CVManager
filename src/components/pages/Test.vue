<template>
    <div :key="componentKey">
      <input type="file" @change="uploadProfilePicture" />
      <img v-if="previewImage" :src="previewImage" alt="Image preview" />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick } from 'vue';
  
  const componentKey = ref(0);  // Key để ép tái render lại component
  const previewImage = ref(null);
  
  onMounted(() => {
    console.log('Component đã được mounted');
  });
  
  const uploadProfilePicture = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      previewImage.value = e.target.result; // Cập nhật ảnh mới
  
      // Thay đổi key để tái tạo lại component
      componentKey.value++;
  
      // Đảm bảo Vue hoàn tất render lại DOM trước khi tiếp tục
      await nextTick();
  
      console.log('Ảnh đã được tải lên và DOM đã được cập nhật');
    };
    reader.readAsDataURL(file); // Đọc ảnh dưới dạng base64
  };
  </script>
  