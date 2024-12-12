<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { database } from '../../../firebase'; // Firebase config file
import { ref as dbRef, set, onValue } from 'firebase/database';
import { useRouter, useRoute } from 'vue-router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const router = useRouter();
const route = useRoute();

const cv = ref({
    avatarUrl: '',
    name: 'HO HOANG',
    specialize: 'Front-End Developer',
    phone: '+84123456789',
    email: 'hohoang.dev@gmail.com',
    website: 'lundevweb.com',
    location: 'HCMC - VietNam',
    birthday: '01/01/0101',
    university: 'AAAA University',
    introduction: 'Lorem ipsum dolor sit amet consectetur adipisicing elit...',
    experiences: [
        {
            title: 'Front-End Developer',
            year: '2020 - 2022',
            company: 'ABC D company',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit...',
        },
        {
            title: 'Student',
            year: '2015 - 2019',
            company: 'ACDC University',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit...',
        },
    ],
    skills: ['HTML', 'CSS', 'Bootstrap', 'Javascript', 'PHP', 'MySql', 'Git', 'Laravel'],
    projects: [
        {
            title: 'Website shopping',
            year: '2020',
            website: 'www.lundevweb.com',
            role: 'Front-End Developer',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit...',
            tasks: ['Lorem ipsum dolordolores.', 'Lorem ipsum dolor sit amet consectetur.', 'Lorem ipsum dolor sit amet consectetur dolores.'],
        },
    ],
});
const previewImage = ref('');
const isHidden = ref(false);


const updateField = (field, event) => {
    cv.value[field] = event.target.innerText;
};



const uploadProfilePicture = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const imageBase64 = e.target.result;
        // cv.value.avatarUrl = imageBase64;
        // previewImage.value = imageBase64;
        saveCV();
    };
    reader.readAsDataURL(file);

};



const saveCV = () => {
    const cvRef = dbRef(database, 'cv/user2');
    set(cvRef, { ...cv.value });
};


const downloadPDF = async () => {
    const element = document.querySelector('.cv-template');
    isHidden.value = true;
    await nextTick();
    if (isHidden.value) {
        console.log('Đã ẩn phần tử');
    } else {
        console.log('Phần tử vẫn hiển thị');
    }


    if (!element) {
        console.error('Không tìm thấy phần tử CV để xuất PDF.');
        return;
    }

    try {
        const imgData = previewImage.value;
        // if (!imgData || !imgData.startsWith('data:image')) {
        //     console.error('Không có ảnh đại diện hợp lệ để chèn vào PDF.');
        //     return;
        // }
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
        });

        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const imgDataCanvas = canvas.toDataURL('image/png');
        console.log('Dữ liệu base64 của canvas:', imgDataCanvas);

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 190;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgDataCanvas, 'PNG', 10, 10, pdfWidth, pdfHeight);

        pdf.save('CV.pdf');
    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
    }
    isHidden.value = false;
};

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
