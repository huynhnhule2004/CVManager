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


<!-- Template 01 -->
<template>
    <div class="container">
        <div class="page-inner">
            <div class="cv-container cv-template">
                <!-- Avatar -->
                <div class="cv-avatar">
                    <img v-if="previewImage" :src="previewImage" alt="Avatar" class="avatar-img" />
                    <input type="file" accept="image/*" @change="uploadProfilePicture" class="avatar-upload" />
                </div>

                <!-- Name & Specialization -->
                <div class="cv-header">
                    <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
                    <h2 contenteditable="true" @input="updateField('specialize', $event)">{{ cv.specialize }}</h2>
                </div>

                <!-- Contact Information -->
                <ul class="cv-contact">
                    <li>Phone: <span contenteditable="true" @input="updateField('phone', $event)">{{ cv.phone }}</span>
                    </li>
                    <li>Email: <span contenteditable="true" @input="updateField('email', $event)">{{ cv.email }}</span>
                    </li>
                    <li>Website: <span contenteditable="true" @input="updateField('website', $event)">{{ cv.website
                            }}</span>
                    </li>
                </ul>

                <!-- About Section -->
                <section class="cv-about">
                    <h3>About Me</h3>
                    <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
                </section>

                <!-- Experience Section -->
                <section class="cv-experience">
                    <h3>Experience</h3>
                    <div v-for="(experience, index) in cv.experiences" :key="index" class="experience-item">
                        <h4 contenteditable="true" @input="updateField(`experiences[${index}].title`, $event)">{{
                            experience.title }}</h4>
                        <p contenteditable="true" @input="updateField(`experiences[${index}].year`, $event)">{{
                            experience.year
                        }}</p>
                        <p contenteditable="true" @input="updateField(`experiences[${index}].company`, $event)">{{
                            experience.company }}</p>
                        <p contenteditable="true" @input="updateField(`experiences[${index}].description`, $event)">{{
                            experience.description }}</p>
                    </div>
                </section>

                <!-- Skills Section -->
                <section class="cv-skills">
                    <h3>Skills</h3>
                    <ul>
                        <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                            @input="updateField(`skills[${index}]`, $event)">{{ skill }}</li>
                    </ul>
                </section>

                <!-- Projects Section -->
                <section class="cv-projects">
                    <h3>Projects</h3>
                    <div v-for="(project, index) in cv.projects" :key="index" class="project-item">
                        <h4 contenteditable="true" @input="updateField(`projects[${index}].title`, $event)">{{
                            project.title
                        }}
                        </h4>
                        <p contenteditable="true" @input="updateField(`projects[${index}].year`, $event)">{{
                            project.year }}
                        </p>
                        <p contenteditable="true" @input="updateField(`projects[${index}].website`, $event)">{{
                            project.website
                        }}</p>
                        <p contenteditable="true" @input="updateField(`projects[${index}].role`, $event)">{{
                            project.role }}
                        </p>
                        <ul>
                            <li v-for="(task, taskIndex) in project.tasks" :key="taskIndex" contenteditable="true"
                                @input="updateField(`projects[${index}].tasks[${taskIndex}]`, $event)">{{ task }}</li>
                        </ul>
                    </div>
                </section>
            </div>
            <div class="d-flex justify-content-center align-items-center my-5">
                <button @click="saveCV" class="me-3 btn btn-info">Lưu CV</button>
                <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
            </div>
        </div>
    </div>

</template>

<style scoped>
.cv-container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
}

.cv-avatar {
    text-align: center;
    margin-bottom: 20px;
}

.avatar-img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
}

.avatar-upload {
    display: block;
    margin: 10px auto;
}

.cv-header h1 {
    font-size: 24px;
    text-align: center;
}

.cv-header h2 {
    font-size: 18px;
    text-align: center;
    color: #666;
}

.cv-contact {
    list-style: none;
    padding: 0;
    margin: 20px 0;
    text-align: center;
}

.cv-contact li {
    margin: 5px 0;
}

.cv-about,
.cv-experience,
.cv-skills,
.cv-projects {
    margin-bottom: 20px;
}
</style>