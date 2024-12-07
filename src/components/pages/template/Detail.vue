<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { database } from '../../../firebase'; // Firebase config file
import { ref as dbRef, set, onValue } from 'firebase/database';
import { useRouter, useRoute } from 'vue-router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const router = useRouter();
const route = useRoute();

const templateContent = ref("");


// Lấy dữ liệu từ Firebase khi khởi động
onMounted(() => {
    const templateId = route.params.id; // Lấy ID từ URL
    const htmlRef = dbRef(database, `templates/${templateId}/html`);
    const cssRef = dbRef(database, `templates/${templateId}/css`);
    const scriptRef = dbRef(database, `templates/${templateId}/script`); // Dữ liệu script

    // Lấy dữ liệu HTML từ Firebase
    onValue(htmlRef, (snapshot) => {
        const htmlData = snapshot.val();
        if (htmlData) {
            templateContent.value = htmlData; // Gán nội dung HTML vào biến
            nextTick(() => {
                console.log('DOM đã được cập nhật, có thể hiển thị dữ liệu CV');
            });
        } else {
            templateContent.value = "<p>Không tìm thấy nội dung HTML.</p>";
        }
    });

    // Lấy dữ liệu CSS từ Firebase
    onValue(cssRef, (snapshot) => {
        const cssData = snapshot.val();
        if (cssData) {
            // Tạo thẻ style và thêm CSS vào thẻ đó
            const styleElement = document.createElement('style');
            styleElement.innerHTML = cssData; // Gán CSS vào thẻ style
            styleElement.setAttribute('scoped', ''); // Thêm thuộc tính scoped để đảm bảo chỉ áp dụng trong component này
            document.head.appendChild(styleElement); // Thêm vào head của document
            console.log('CSS đã được áp dụng.');
        } else {
            console.log('Không tìm thấy dữ liệu CSS.');
        }
    });
});
</script>


<template>
    <div class="container">
        <div class="page-inner">
            <div v-html="templateContent"></div>
            <div class="d-flex justify-content-center align-items-center my-5">
                <button @click="handleDownloadPDF" class="me-3 btn btn-info">Lưu CV</button>
                <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
