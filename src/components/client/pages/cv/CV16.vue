<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { database } from '../../../../firebase';
import { ref as dbRef, set, onValue, push } from 'firebase/database';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'vue3-toastify';

const cv = ref({
    avatarUrl: '',
    name: 'Jack Doe',
    specialize: 'UI/UX Designer',
    phone: '+1234567890',
    email: 'janedoe@example.com',
    website: 'janedoe.design',
    location: 'New York, USA',
    address: '123, Design Street, New York',
    birthday: '15/08/1995',
    university: 'XYZ University',
    languages: ['English', 'Spanish'],
    certifications: [
        { title: 'Certified UI/UX Designer', year: '2023' },
        { title: 'Advanced Figma', year: '2022' },
    ],
    careerObjective: 'Passionate UI/UX Designer with a keen eye for detail and a focus on creating user-centric designs.',
    introduction: 'I am a UI/UX Designer with 5+ years of experience in creating engaging and intuitive designs for web and mobile applications.',
    experiences: [
        {
            title: 'Lead UI/UX Designer',
            year: '2020 - Present',
            company: 'Creative Solutions Inc.',
            description: 'Led the design team in creating innovative user interfaces for web and mobile applications.',
        }
    ],
    skills: ['Figma', 'Sketch', 'Adobe XD', 'HTML', 'CSS', 'JavaScript'],
    projects: [
        {
            title: 'Redesign of E-commerce Platform',
            year: '2023',
            website: 'www.janedoe.design/e-commerce',
            role: 'Lead Designer',
            description: 'Redesigned the user interface of a major e-commerce platform to improve user experience and conversion rates.',
            tasks: ['Created wireframes and prototypes.', 'Collaborated with developers for implementation.'],
        },
    ],
    hobbies: ['Photography', 'Traveling', 'Reading'],
    awards: [
        { title: 'Best UI Design', year: '2022', event: 'Global Design Awards' },
        { title: 'Innovative Designer of the Year', year: '2021', event: 'UX Awards' },
    ],
    volunteerWork: [
        { role: 'Design Mentor', organization: 'Design for Good', year: '2021' },
        { role: 'Workshop Speaker', organization: 'UX Conference', year: '2020' },
    ],
    socialMedia: [
        { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/janedoe' },
        { platform: 'Twitter', url: 'https://twitter.com/janedoe' },
    ],
    education: [
        { degree: 'Bachelor of Arts in Graphic Design', year: '2017 - 2021', university: 'XYZ University' },
    ],
    courses: [
        { title: 'Advanced UX/UI Design', year: '2022', platform: 'Udemy' },
        { title: 'JavaScript for Designers', year: '2021', platform: 'Coursera' },
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
        cvName: cv.value.cvName || "Mẫu CV Chi tiết",
        createdAt: new Date().toISOString(),
    };

    set(newCvRef, cvData)
        .then(() => {
            toast.success('Lưu CV thành công!');
        })
        .catch((error) => {
            toast.error('Lỗi khi lưu CV:', error);
        });
};

const downloadPDF = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
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
        pdf.save('CV_Chi tiết.pdf');
        saveCV();
    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
    }
    isHidden.value = false;
};
</script>

<template>
    <div class="container">
        <div class="cv-template">
            <div class="header">
                <div class="avatar">
                    <img v-if="previewImage" :src="previewImage" alt="Avatar" class="avatar-img" />
                    <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture" />
                </div>
                <div class="personal-info">
                    <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
                    <p contenteditable="true" @input="updateField('specialize', $event)">{{ cv.specialize }}</p>
                    <ul class="contact-info">
                        <li><i class="fas fa-phone"></i><span contenteditable="true"
                                @input="updateField('phone', $event)">{{ cv.phone }}</span></li>
                        <li><i class="fas fa-envelope"></i><span contenteditable="true"
                                @input="updateField('email', $event)">{{ cv.email }}</span></li>
                        <li><i class="fas fa-globe"></i><span contenteditable="true"
                                @input="updateField('website', $event)">{{ cv.website }}</span></li>
                    </ul>
                </div>
            </div>

            <div class="section">
                <h2>Career Objective</h2>
                <p contenteditable="true" @input="updateField('careerObjective', $event)">{{ cv.careerObjective }}</p>
            </div>

            <div class="section">
                <h2>Introduce</h2>
                <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
            </div>

            <div class="section">
                <h2>Work experience</h2>
                <ul>
                    <li v-for="(experience, index) in cv.experiences" :key="index">
                        <p contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">{{
                            experience.title }}</p>
                        <p contenteditable="true" @input="updateField('experiences[' + index + '].company', $event)">{{
                            experience.company }}</p>
                        <p contenteditable="true"
                            @input="updateField('experiences[' + index + '].description', $event)">{{
                            experience.description }}</p>
                    </li>
                </ul>
            </div>

            <div class="section">
                <h2>Skill</h2>
                <ul>
                    <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                        @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
                </ul>
            </div>

            <div class="section">
                <h2>Project</h2>
                <ul>
                    <li v-for="(project, index) in cv.projects" :key="index">
                        <p contenteditable="true" @input="updateField('projects[' + index + '].title', $event)">{{
                            project.title }}</p>
                        <p contenteditable="true" @input="updateField('projects[' + index + '].role', $event)">{{
                            project.role }}</p>
                        <p contenteditable="true" @input="updateField('projects[' + index + '].description', $event)">{{
                            project.description }}</p>
                        <ul>
                            <li v-for="(task, taskIndex) in project.tasks" :key="taskIndex" contenteditable="true"
                                @input="updateField('projects[' + index + '].tasks[' + taskIndex + ']', $event)">{{ task
                                }}</li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div class="section">
                <h2>Prize</h2>
                <ul>
                    <li v-for="(award, index) in cv.awards" :key="index">
                        <p contenteditable="true" @input="updateField('awards[' + index + '].title', $event)">{{
                            award.title }}</p>
                        <p contenteditable="true" @input="updateField('awards[' + index + '].event', $event)">{{
                            award.event }}</p>
                    </li>
                </ul>
            </div>

            <div class="section">
                <h2>Volunteer work</h2>
                <ul>
                    <li v-for="(volunteer, index) in cv.volunteerWork" :key="index">
                        <p contenteditable="true" @input="updateField('volunteerWork[' + index + '].role', $event)">{{
                            volunteer.role }}</p>
                        <p contenteditable="true"
                            @input="updateField('volunteerWork[' + index + '].organization', $event)">{{
                            volunteer.organization }}</p>
                    </li>
                </ul>
            </div>

            <div class="section">
                <h2>Education</h2>
                <ul>
                    <li v-for="(education, index) in cv.education" :key="index">
                        <p contenteditable="true" @input="updateField('education[' + index + '].degree', $event)">{{
                            education.degree }}</p>
                        <p contenteditable="true" @input="updateField('education[' + index + '].university', $event)">{{
                            education.university }}</p>
                    </li>
                </ul>
            </div>

            <div class="section">
                <h2>Course</h2>
                <ul>
                    <li v-for="(course, index) in cv.courses" :key="index">
                        <p contenteditable="true" @input="updateField('courses[' + index + '].title', $event)">{{
                            course.title }}</p>
                        <p contenteditable="true" @input="updateField('courses[' + index + '].platform', $event)">{{
                            course.platform }}</p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div class="d-flex justify-content-center align-items-center my-5">
        <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    padding: 20px;
    font-family: 'Arial', sans-serif;
}

.cv-template {
    width: 100%;
    max-width: 800px;
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 20px;
    background-color: #fff;
}

.header {
    display: flex;
    justify-content: flex-start;
    /* Giảm khoảng cách giữa avatar và personal-info */
    align-items: center;
    /* Căn giữa theo chiều dọc */
    margin-bottom: 20px;
}

.avatar {
    width: 180px;
    /* Giảm kích thước avatar */
    height: 160px;
    /* Giảm kích thước avatar */
    border-radius: 50%;
    position: relative;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.personal-info {
    padding-left: 105px;
    /* Giảm khoảng cách giữa avatar và thông tin cá nhân */
}

.contact-info {
    list-style: none;
    padding: 0;
}

.contact-info li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.contact-info i {
    margin-right: 10px;
}

.section {
    margin-bottom: 20px;
}

.section h2 {
    font-size: 1.6rem;
    font-weight: bold;
}

.section ul {
    list-style: none;
    padding-left: 20px;
}

.section ul li {
    margin-bottom: 10px;
}

.action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
</style>
