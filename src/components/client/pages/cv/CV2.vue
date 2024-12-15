<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { database } from '../../../../firebase';
import { ref as dbRef, set, onValue, push } from 'firebase/database';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'vue3-toastify';

const cv = ref({
    avatarUrl: '',
    name: 'John Doe',
    specialize: 'Graphic Designer',
    phone: '+84123456789',
    email: 'johndoe@example.com',
    website: 'www.johndoe.com',
    location: 'HCMC, Vietnam',
    birthday: '01/01/1990',
    university: 'Design University',
    introduction: 'Creative graphic designer with 5 years of experience...',
    skills: ['Photoshop', 'Illustrator', 'InDesign', 'Sketch', 'Figma'],
    projects: [
        {
            title: 'Brand Identity for ABC Corp',
            year: '2022',
            company: 'ABC Corp',
            description: 'Designed the complete brand identity including logo, website, and business cards...',
        },
        {
            title: 'UI Design for XYZ App',
            year: '2021',
            company: 'XYZ Ltd.',
            description: 'Created a modern and user-friendly UI design for the XYZ mobile app...',
        },
    ],
});

const previewImage = ref('https://i.pinimg.com/564x/eb/57/6f/eb576ff023487bcb1fa3ad61ee7b23ee.jpg');
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
        cv.value.avatarUrl = imageBase64;
        previewImage.value = imageBase64;
        // saveCV();
    };
    reader.readAsDataURL(file);
};

const userId = ref('');

const saveCV = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
        const user = JSON.parse(userString); // Chuyển chuỗi JSON thành đối tượng
        userId.value = user.userId; // Truy cập userId
        console.log('User ID:', userId.value);
    } else {
        console.error('Không tìm thấy thông tin người dùng trong localStorage.');
        return;
    }

    const userCVRef = dbRef(database, `cv`); // Đường dẫn nhánh của user
    const newCvRef = push(userCVRef); // Tạo ID tự động cho CV

    const cvData = {
        ...cv.value,
        cvId: newCvRef.key,          // Lưu ID tự động
        userId: userId.value,        // Gắn thêm userId để dễ truy xuất
        cvName: cv.value.cvName || "Mẫu CV Designer", // Tên CV mặc định nếu không nhập
        createdAt: new Date().toISOString(), // Lưu thời gian tạo
    };

    set(newCvRef, cvData)
        .then(() => {
            console.log('User ID:', userId.value);
            // toast.success('Lưu CV thành công!');
        })
        .catch((error) => {
            toast.error('Lỗi khi lưu CV:', error);
        });
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
        if (!imgData || !imgData.startsWith('data:image')) {
            toast.error('Vui lòng chọn ảnh đại diện');
            isHidden.value = false;

            return;

        }
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
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 190;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgDataCanvas, 'PNG', 10, 10, pdfWidth, pdfHeight);
        pdf.save('CV_Designer.pdf');
        saveCV();

    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
    }
    isHidden.value = false;
};

</script>

<template>
    <div class="container">
        <div class="page-inner">
            <div class="container1 cv-template">
                <div class="avatar1">
                    <div class="avatar-wrapper">
                        <img v-if="previewImage" :src="previewImage" alt="Ảnh đại diện" class="preview-img" />
                        <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture"
                            class="mt-2" />
                    </div>
                </div>
                <div class="name">
                    <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
                    <div class="specialize" contenteditable="true" @input="updateField('specialize', $event)">{{
                        cv.specialize }}</div>
                    <ul class="contact">
                        <li>
                            <span>P</span>
                            <p class="d-inline-block m-0" contenteditable="true" @input="updateField('phone', $event)">
                                {{ cv.phone }}</p>
                        </li>
                        <li>
                            <span>E</span>
                            <p class="d-inline-block m-0" contenteditable="true" @input="updateField('email', $event)">
                                {{ cv.email }}</p>
                        </li>
                        <li>
                            <span>W</span>
                            <p class="d-inline-block m-0" contenteditable="true"
                                @input="updateField('website', $event)">{{ cv.website }}</p>
                        </li>
                    </ul>
                </div>
                <div class="info">
                    <ul>
                        <li>
                            From <b contenteditable="true" @input="updateField('location', $event)">{{ cv.location
                                }}</b>
                        </li>
                        <li contenteditable="true" @input="updateField('birthday', $event)">{{ cv.birthday }}</li>
                        <li contenteditable="true" @input="updateField('university', $event)">{{ cv.university }}</li>
                    </ul>
                </div>
                <div class="intro">
                    <h2>INTRODUCE MYSELF</h2>
                    <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
                </div>
                <div class="skills">
                    <h2>SKILLS</h2>
                    <ul>
                        <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                            @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
                    </ul>
                </div>
                <div class="projects">
                    <h2>PROJECTS</h2>
                    <div v-for="(project, index) in cv.projects" :key="index" class="item">
                        <h4 contenteditable="true" @input="updateField('projects[' + index + '].title', $event)">{{
                            project.title }}</h4>
                        <div class="time">
                            <span contenteditable="true" @input="updateField('projects[' + index + '].year', $event)">{{
                                project.year }}</span>
                            <span contenteditable="true"
                                @input="updateField('projects[' + index + '].company', $event)">{{ project.company
                                }}</span>
                        </div>
                        <div class="des" contenteditable="true"
                            @input="updateField('projects[' + index + '].description', $event)">
                            {{ project.description }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-center align-items-center my-5">
                <!-- <button @click="saveCV" class="me-3 btn btn-info">Lưu CV</button> -->
                <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
            </div>
        </div>
    </div>
</template>
<style scoped>
.avatar-wrapper {
    position: relative;
    display: inline-block;
    width: 150px;
    height: 150px;
}

.preview-img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 50%;
}

.container1 {
    background-color: #fafafa;
    width: 900px;
    max-width: 100%;
    margin: auto;
    padding: 50px;
    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.1);
    display: grid;
    grid-template-columns: 30% 60%;
    column-gap: 5%;
    row-gap: 30px;
}

.name {
    padding-left: 30px;
    border-left: 1px solid #000;
}

.name h1 {
    font-weight: bold;
    font-size: 2em;
}

.name .specialize {
    margin: 10px 0;
    font-weight: bold;
    font-style: italic;
}

.skills ul {
    list-style: none;
    padding: 0;
}

.skills li {
    padding: 5px 0;
}

.project h4 {
    font-weight: bold;
    color: #0c7373;
}

.project .web {
    font-size: 1.1em;
}

.intro {
    text-align: justify;
    font-style: italic;
}

button {
    padding: 10px 30px;
    background-color: #0c7373;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
</style>
