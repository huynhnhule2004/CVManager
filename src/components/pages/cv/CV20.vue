<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { database } from '../../../firebase';
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
        cv.value.avatarUrl = imageBase64;
        previewImage.value = imageBase64;
        saveCV();
    };
    reader.readAsDataURL(file);

};



const saveCV = () => {
    const cvRef = dbRef(database, 'cv/user2');
    set(cvRef, { ...cv.value });
};


const downloadPDF = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        // Lưu trạng thái thông báo
        localStorage.setItem("toastMessage", "Bạn cần đăng nhập để tải CV");
        router.push('/login');
        return;
    }
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
            console.error('Không có ảnh đại diện hợp lệ để chèn vào PDF.');
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
        console.log('Dữ liệu base64 của canvas:', imgDataCanvas);

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 190;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgDataCanvas, 'PNG', 10, 10, pdfWidth, pdfHeight);

        pdf.save('CV Kế toán.pdf');
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
                    <h2>INTRODUCTION</h2>
                    <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
                </div>
                <div class="skills">
                    <h2>SKILLS</h2>
                    <ul>
                        <li v-for="(skill, index) in cv.designSkills" :key="index" contenteditable="true"
                            @input="updateField('designSkills[' + index + ']', $event)">{{ skill }}</li>
                    </ul>
                </div>
                <div class="tools">
                    <h2>TOOLS</h2>
                    <ul>
                        <li v-for="(tool, index) in cv.designTools" :key="index" contenteditable="true"
                            @input="updateField('designTools[' + index + ']', $event)">{{ tool }}</li>
                    </ul>
                </div>
                <div class="experiences">
                    <h2>EXPERIENCE</h2>
                    <div v-for="(experience, index) in cv.experiences" :key="index" class="experience-item">
                        <h4 contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">{{
                            experience.title }}</h4>
                        <div class="time">
                            <span contenteditable="true"
                                @input="updateField('experiences[' + index + '].year', $event)">{{ experience.year
                                }}</span>
                        </div>
                        <div class="company" contenteditable="true"
                            @input="updateField('experiences[' + index + '].company', $event)">{{ experience.company }}
                        </div>
                        <div class="description" contenteditable="true"
                            @input="updateField('experiences[' + index + '].description', $event)">
                            {{ experience.description }}
                        </div>
                    </div>
                </div>
                <div class="portfolio">
                    <h2>PORTFOLIO</h2>
                    <div v-for="(project, index) in cv.portfolio" :key="index" class="item">
                        <h4 contenteditable="true" @input="updateField('portfolio[' + index + '].title', $event)">{{
                            project.title }}</h4>
                        <div class="time">
                            <span contenteditable="true"
                                @input="updateField('portfolio[' + index + '].year', $event)">{{ project.year }}</span>
                        </div>
                        <div class="web" contenteditable="true"
                            @input="updateField('portfolio[' + index + '].website', $event)">{{ project.website }}</div>
                        <div class="role" contenteditable="true"
                            @input="updateField('portfolio[' + index + '].role', $event)">{{ project.role }}</div>
                        <div class="des" contenteditable="true"
                            @input="updateField('portfolio[' + index + '].description', $event)">
                            {{ project.description }}
                            <ul>
                                <li v-for="(item, i) in project.tasks" :key="i" contenteditable="true"
                                    @input="updateField('portfolio[' + index + '].tasks[' + i + ']', $event)">
                                    {{ item }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-center align-items-center my-5">
                <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
            </div>
        </div>
    </div>
</template>


<style scoped>
body {
    background-color: #f4f4f9;
    font-family: 'Arial', sans-serif;
    color: #333;
}

.container1 {
    background-color: #ffffff;
    width: 1000px;
    max-width: 100%;
    margin: auto;
    padding: 40px;
    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.1);
    display: grid;
    grid-template-columns: 35% 60%;
    column-gap: 5%;
    row-gap: 30px;
}

.avatar-wrapper {
    position: relative;
    display: inline-block;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    margin-bottom: 20px;
}

.preview-img {
    width: 100%;
    height: 100%;
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
    cursor: pointer;
}

.name {
    padding-left: 30px;
    border-left: 2px solid #00bcd4;
}

.name h1 {
    font-weight: 300;
    font-size: 2rem;
    margin: 0 0 10px;
    color: #333;
}

.name .specialize {
    margin: 0;
    font-weight: bold;
    letter-spacing: 2px;
    color: #777;
}

.name .contact {
    padding: 0;
    list-style: none;
    margin-top: 10px;
}

.name .contact li {
    display: flex;
    align-items: center;
    padding: 5px 0;
}

.name .contact span {
    background-color: #00bcd4;
    width: 20px;
    height: 20px;
    color: #fff;
    text-align: center;
    border-radius: 50%;
    font-size: 12px;
    margin-right: 15px;
}

.info ul {
    padding: 0;
    margin: 0;
    list-style: none;
    text-align: right;
    line-height: 30px;
    color: #555;
}

h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    border-bottom: 2px solid #00bcd4;
    padding-bottom: 5px;
    color: #333;
}

.intro,
.experience,
.project {
    margin-top: 30px;
}

.intro p,
.experience li,
.project li {
    font-size: 1rem;
    line-height: 1.6;
}

.project .item {
    margin-top: 20px;
    position: relative;
}

.project .item::before {
    position: absolute;
    width: 13px;
    height: 13px;
    background-color: #00bcd4;
    content: '';
    border-radius: 50%;
    left: -37px;
    top: 10px;
}

.skills {
    margin-top: 50px;
    font-size: 1.2rem;
    color: #333;
}

.skills li {
    margin-bottom: 10px;
    font-size: 1rem;
}

.project .web {
    color: #00bcd4;
    padding: 10px 0;
}

.project .location {
    font-weight: 500;
    padding-bottom: 10px;
}

.project .des ul {
    list-style: none;
    padding: 0;
}

.project .des li {
    padding: 5px 0;
}

.experience h4,
.project h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
}

.container1 .section {
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
}
.experiences {
    margin-top: 50px;
    font-size: 1.2rem;
    color: #333;
}

.experience-item {
    margin-bottom: 20px;
}

.experience-item h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
}

.experience-item .time {
    font-size: 1rem;
    color: #777;
}

.experience-item .company {
    font-weight: bold;
    color: #00bcd4;
}

.experience-item .description {
    font-size: 1rem;
    line-height: 1.6;
}
</style>