<script setup>
import { ref, onMounted, reactive, provide } from 'vue';
import { database } from './firebase'; // Firebase config file
import { ref as dbRef, set, onValue } from 'firebase/database';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CV1 from './components/pages/cv/CV1.vue';
import Test from './components/pages/Test.vue';
import IndexClient from './components/client/layout/IndexClient.vue';

// Tạo trạng thái toàn cục
const authState = reactive({
  user: null, // Lưu thông tin người dùng
});

// Cung cấp trạng thái cho các component con
provide('authState', authState);

</script>

<template>
  <!-- <CV1></CV1> -->
  <IndexClient></IndexClient>
</template>



