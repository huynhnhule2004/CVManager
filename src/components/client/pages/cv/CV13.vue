<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { database } from '../../../../firebase';
import { ref as dbRef, set, onValue, push } from 'firebase/database';
import { useRouter, useRoute } from 'vue-router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'vue3-toastify';

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
            tasks: ['Lorem ipsum dolor sit amet.', 'Lorem ipsum dolor sit amet consectetur.'],
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
    };
    reader.readAsDataURL(file);
};

const userId = ref('');

const saveCV = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
        const user = JSON.parse(userString);
        userId.value = user.userId;
    } else {
        console.error('Không tìm thấy thông tin người dùng trong localStorage.');
        return;
    }

    const userCVRef = dbRef(database, `cv`);
    const newCvRef = push(userCVRef);

    const cvData = {
        ...cv.value,
        cvId: newCvRef.key,
        userId: userId.value,
        cvName: cv.value.cvName || "Mẫu CV Simple 01",
        createdAt: new Date().toISOString(),
    };

    set(newCvRef, cvData)
        .then(() => {
            console.log('CV đã được lưu thành công với ID:', newCvRef.key);
        })
        .catch((error) => {
            toast.error('Lỗi khi lưu CV:', error);
        });
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
    if (!element) {
        console.error('Không tìm thấy phần tử CV để xuất PDF.');
        return;
    }

    try {
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
        pdf.save('CV.pdf');
        saveCV();
    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
    }
    isHidden.value = false;
};

function goBack() {
    router.go(-1);
}

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
                        <!-- <ProfilePicture :key="imageKey" :src="previewImage" /> -->
                        <img v-if="previewImage" :src="previewImage" alt="Ảnh đại diện" class="preview-img" />
                        <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture"
                            class="mt-2" />
                    </div>
                </div>
                <div class="name">
                    <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
                    <div class="specialize" contenteditable="true" @input="updateField('specialize', $event)">{{
                        cv.specialize
                    }}</div>
                    <ul class="contact">
                        <li>
                            <span>P</span>
                            <p class="d-inline-block m-0" contenteditable="true" @input="updateField('phone', $event)">
                                {{
                                    cv.phone }}</p>
                        </li>
                        <li>
                            <span>E</span>
                            <p class="d-inline-block m-0" contenteditable="true" @input="updateField('email', $event)">
                                {{
                                    cv.email }}</p>
                        </li>
                        <li>
                            <span>W</span>
                            <p class="d-inline-block m-0" contenteditable="true"
                                @input="updateField('website', $event)">{{
                                    cv.website }}</p>
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
                <div class="experience">
                    <h2>EXPERIENCE</h2>
                    <div v-for="(exp, index) in cv.experiences" :key="index" class="item">
                        <h4 contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">{{
                            exp.title
                        }}</h4>
                        <div class="time">
                            <span contenteditable="true"
                                @input="updateField('experiences[' + index + '].year', $event)">{{
                                    exp.year }}</span>
                            <span contenteditable="true"
                                @input="updateField('experiences[' + index + '].company', $event)">{{
                                    exp.company }}</span>
                        </div>
                        <div class="des" contenteditable="true"
                            @input="updateField('experiences[' + index + '].description', $event)">{{ exp.description }}
                        </div>
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
                        <div class="web" contenteditable="true"
                            @input="updateField('projects[' + index + '].website', $event)">
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
            <div class="d-flex justify-content-center align-items-center my-5">
                <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
            </div>
        </div>
    </div>

</template>

<style scoped>
body {
    background-color: #f4f4f4;
    font-family: 'Helvetica', sans-serif;
    margin: 0;
    padding: 0;
}

.container1 {
    background-color: #ffffff;
    width: 900px;
    max-width: 100%;
    margin: 40px auto;
    padding: 40px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    display: grid;
    grid-template-columns: 1fr 2fr;
    column-gap: 40px;
    row-gap: 30px;
    border-radius: 10px;
}

.avatar-wrapper {
    position: relative;
    display: inline-block;
    width: 160px;
    height: 160px;
    margin-bottom: 20px;
    border-radius: 50%;
    
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.name h1 {
    font-weight: 600;
    font-size: 36px;
    margin-bottom: 5px;
    color: #333;
}

.name .specialize {
    font-weight: 500;
    font-size: 20px;
    color: #777;
}

.name .contact li {
    padding: 5px 0;
    background-color: #f8f8f8;
    color: #555;
    transition: background-color 0.3s ease;
}

.name .contact li:hover {
    background-color: #e0e0e0;
}

.info ul {
    padding: 0;
    margin: 0;
    list-style: none;
    text-align: left;
    line-height: 30px;
}

h2 {
    margin: 20px 0;
    font-size: 26px;
    font-weight: 500;
    color: #333;
    text-transform: uppercase;
    border-bottom: 2px solid #ddd;
    padding-bottom: 5px;
}

.intro {
    text-align: left;
    margin-top: 20px;
}

.intro p {
    font-size: 16px;
    color: #555;
    line-height: 1.5;
}

.experience h4 {
    margin: 20px 0;
    font-size: 20px;
    color: #555;
}

.skills {
    margin-top: 30px;
}

.experience ul {
    padding: 0;
    margin: 0;
    list-style: none;
}

.project {
    padding-left: 30px;
    text-align: left;
    border-left: 2px solid #ddd;
    margin-top: 30px;
}

.project h4 {
    margin: 20px 0 10px;
    font-size: 20px;
    color: #555;
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
    margin-bottom: 20px;
}

.project .item::before {
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: #333;
    content: '';
    border-radius: 50%;
    left: -20px;
    top: 5px;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #0c7373;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #065757;
}
</style>
