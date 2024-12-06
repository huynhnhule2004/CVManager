<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { database } from '../../firebase'; // Firebase config file
import { ref as dbRef, set, onValue } from 'firebase/database';
// import { useRouter } from 'vue-router';
import { useRouter, useRoute } from 'vue-router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const router = useRouter();
const route = useRoute();

// Dữ liệu CV
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
// Biến lưu ảnh preview
const previewImage = ref('');
const isHidden = ref(false);


// Cập nhật trường nội dung
const updateField = (field, event) => {
    cv.value[field] = event.target.innerText;
};



// Upload ảnh đại diện
const uploadProfilePicture = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const imageBase64 = e.target.result; // Đọc ảnh dưới dạng base64
        cv.value.avatarUrl = imageBase64; // Lưu ảnh dưới dạng base64 vào CV
        previewImage.value = imageBase64; // Cập nhật ảnh preview
        saveCV(); // Lưu CV vào Firebase   
    };
    reader.readAsDataURL(file); // Đọc ảnh dưới dạng base64

};



// Lưu CV vào Firebase
const saveCV = () => {
    const cvRef = dbRef(database, 'cv/user2');
    set(cvRef, { ...cv.value });
};


// Tải xuống PDF
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
        const imgData = previewImage.value; // Sử dụng base64 từ CV
        if (!imgData || !imgData.startsWith('data:image')) {
            console.error('Không có ảnh đại diện hợp lệ để chèn vào PDF.');
            return;
        }
        // Lấy canvas từ toàn bộ phần tử CV
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: null, // Loại bỏ nền gốc
        });

        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#ffffff'; // Màu nền trắng
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Lấy dữ liệu ảnh từ canvas
        const imgDataCanvas = canvas.toDataURL('image/png');
        console.log('Dữ liệu base64 của canvas:', imgDataCanvas);

        // Tạo PDF và thêm hình ảnh đã render từ canvas
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 190; // Chiều rộng PDF
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Tỉ lệ dựa trên chiều cao canvas

        pdf.addImage(imgDataCanvas, 'PNG', 10, 10, pdfWidth, pdfHeight);

        // Lưu PDF
        pdf.save('CV.pdf');
    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
    }
    isHidden.value = false;
};




// Load dữ liệu từ Firebase khi khởi động
onMounted(() => {
    const cvRef = dbRef(database, 'cv/user2');
    onValue(cvRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            cv.value = data;
            if (data.avatarUrl) {
                previewImage.value = data.avatarUrl;
            }
        }
    });
});

</script>
<template>
    <div class="container1 cv-template">
        <div class="avatar1">
            <div class="avatar-wrapper">
                <!-- <ProfilePicture :key="imageKey" :src="previewImage" /> -->
                <img v-if="previewImage" :src="previewImage" alt="Ảnh đại diện" class="preview-img" />
                <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture" class="mt-2" />
            </div>
        </div>
        <div class="name">
            <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
            <div class="specialize" contenteditable="true" @input="updateField('specialize', $event)">{{ cv.specialize
                }}</div>
            <ul class="contact">
                <li>
                    <span>P</span>
                    <p class="d-inline-block m-0" contenteditable="true" @input="updateField('phone', $event)">{{
                        cv.phone }}</p>
                </li>
                <li>
                    <span>E</span>
                    <p class="d-inline-block m-0" contenteditable="true" @input="updateField('email', $event)">{{
                        cv.email }}</p>
                </li>
                <li>
                    <span>W</span>
                    <p class="d-inline-block m-0" contenteditable="true" @input="updateField('website', $event)">{{
                        cv.website }}</p>
                </li>
            </ul>
        </div>
        <div class="info">
            <ul>
                <li>
                    From <b contenteditable="true" @input="updateField('location', $event)">{{ cv.location }}</b>
                </li>
                <li contenteditable="true" @input="updateField('birthday', $event)">{{ cv.birthday }}</li>
                <li contenteditable="true" @input="updateField('university', $event)">{{ cv.university }}</li>
            </ul>
        </div>
        <div class="intro">
            <h2>INTRODUCE MYSELF</h2>
            <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
        </div>
        <div class="experience">
            <h2>EXPERIENCE</h2>
            <div v-for="(exp, index) in cv.experiences" :key="index" class="item">
                <h4 contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">{{ exp.title
                    }}</h4>
                <div class="time">
                    <span contenteditable="true" @input="updateField('experiences[' + index + '].year', $event)">{{
                        exp.year }}</span>
                    <span contenteditable="true" @input="updateField('experiences[' + index + '].company', $event)">{{
                        exp.company }}</span>
                </div>
                <div class="des" contenteditable="true"
                    @input="updateField('experiences[' + index + '].description', $event)">{{ exp.description }}</div>
            </div>
            <h2 class="skills">SKILLS</h2>
            <ul>
                <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                    @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
            </ul>
        </div>
        <div class="project">
            <h2>PROJECTS</h2>
            <div v-for="(project, index) in cv.projects" :key="index" class="item">
                <h4 contenteditable="true" @input="updateField('projects[' + index + '].title', $event)">{{
                    project.title }}</h4>
                <div class="time">
                    <span contenteditable="true" @input="updateField('projects[' + index + '].year', $event)">{{
                        project.year }}</span>
                </div>
                <div class="web" contenteditable="true" @input="updateField('projects[' + index + '].website', $event)">
                    {{ project.website }}
                </div>
                <div class="location" contenteditable="true"
                    @input="updateField('projects[' + index + '].role', $event)">
                    {{ project.role }}
                </div>
                <div class="des" contenteditable="true"
                    @input="updateField('projects[' + index + '].description', $event)">
                    {{ project.description }}
                    <ul>
                        <li v-for="(item, i) in project.tasks" :key="i" contenteditable="true"
                            @input="updateField('projects[' + index + '].tasks[' + i + ']', $event)">
                            {{ item }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="d-flex justify-content-center align-items-center mt-5">
        <button @click="saveCV" class="me-3 btn btn-info">Lưu CV</button>
        <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
    </div>
</template>




<style scoped>
.avatar-wrapper {
    position: relative;
    display: inline-block;
    width: 200px;
    height: 200px;
}

.preview-img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 50%;
}

.file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    /* Ẩn input đi, chỉ giữ phần diện tích */
    cursor: pointer;
}

body {
    background-color: #d5d5d5;
    font-family: system-ui;
}

.container1 {
    background-color: #e9e7ea;
    width: 1000px;
    max-width: 100%;
    margin: auto;
    padding: 50px;
    box-shadow: 0 10px 50px #858585;
    display: grid;
    grid-template-columns: 35% 60%;
    column-gap: 5%;
    row-gap: 30px;
}

.avatar1 .avatar-wrapper img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 50%;
}

.avatar1 {
    display: flex;
    justify-content: end;
    align-items: center;
}

.name {
    padding-left: 30px;
    border-left: 1px solid #000;
}

.name h1 {
    font-weight: 300;
    font-size: xxx-large;
    margin: 0px 0 5px;
}

.name .specialize {
    margin: 0;
    font-weight: bold;
    letter-spacing: 3px;
}

.name .contact {
    padding: 0;
    list-style: none;
}

.name .contact span {
    display: inline-block;
    background-color: #000;
    width: 20px;
    height: 20px;
    color: #fff;
    text-align: center;
    border-radius: 50%;
    font-size: small;
    margin-right: 20px;
}

.name .contact li {
    padding: 5px 0;
    transform: translate(-40px);
    background-color: #e9e7ea;
}

.info ul {
    padding: 0;
    margin: 0;
    list-style: none;
    text-align: right;
    line-height: 30px;
}

h2 {
    padding: 0;
    margin: 0 0 20px 0;
}

.intro {
    padding-left: 30px;
    border-left: 1px solid #000;
    text-align: justify;
}

.experience {
    text-align: right;
}

.experience h4 {
    margin: 20px 0 10px;
}

.skills {
    margin-top: 50px;
}

.experience ul {
    padding: 0;
    margin: 0;
    list-style: none;
}

.experience li {
    padding: 10px 0;
}

.project {
    padding-left: 30px;
    text-align: justify;
    border-left: 1px solid #000;
}

.project h4 {
    margin: 20px 0 10px;
}

.project .web {
    color: #0c7373;
    padding: 10px 0;
}

.project .location {
    font-weight: 500;
    padding-bottom: 10px;
}

.project .item {
    position: relative;
}

.project .item::before {
    position: absolute;
    width: 13px;
    height: 13px;
    background-color: #000;
    content: '';
    border-radius: 50%;
    left: -37px;
}
</style>