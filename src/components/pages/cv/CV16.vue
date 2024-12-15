<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { database } from '../../../../firebase';
import { ref as dbRef, set, onValue, push } from 'firebase/database';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'vue3-toastify';

const cv = ref({
    avatarUrl: '',
    name: 'NGUYEN THI BICH',
    specialize: 'Marketing Specialist',
    phone: '+84987654321',
    email: 'nguyenbich.marketing@gmail.com',
    website: 'nguyenbichmarketing.com',
    location: 'Hanoi - VietNam',
    address: '123, Example Street, Hanoi',
    birthday: '25/08/1990',
    university: 'ABC University',
    languages: ['Vietnamese', 'English'],
    certifications: [
        { title: 'Google Ads Certified', year: '2023' },
        { title: 'HubSpot Content Marketing', year: '2022' },
    ],
    careerObjective: 'A creative and results-driven marketing professional with over 5 years of experience in digital marketing, content creation, and brand strategy. Seeking to leverage my expertise in online marketing and customer engagement to drive business growth and build brand awareness.',
    introduction: 'I am a passionate marketing specialist with experience in creating digital marketing campaigns, SEO strategies, and social media management. I aim to help brands grow by building strong online presences and engaging with target audiences effectively.',
    experiences: [
        {
            title: 'Marketing Manager',
            year: '2021 - Present',
            company: 'Digital Solutions',
            description: 'Lead digital marketing campaigns, including SEO, PPC, and social media marketing. Analyzed marketing data and adjusted strategies to improve ROI. Managed a team of 5 marketing specialists.',
        },
    ],
    skills: ['SEO', 'PPC', 'Google Analytics', 'Content Marketing', 'Social Media Marketing', 'Email Marketing', 'Brand Strategy', 'Market Research'],
    projects: [
        {
            title: 'E-commerce Campaign',
            year: '2022',
            website: 'www.nguyenbichmarketing.com',
            role: 'Campaign Manager',
            description: 'Led a successful e-commerce marketing campaign that increased sales by 30% within 3 months.',
            tasks: ['Created targeted ad campaigns on Facebook and Google.', 'Optimized landing pages for higher conversion rates.', 'Analyzed campaign performance and optimized strategies for better results.'],
        },
        {
            title: 'Social Media Strategy for Startup',
            year: '2021',
            website: 'www.nguyenbichmarketing.com',
            role: 'Social Media Strategist',
            description: 'Developed and executed a social media strategy for a new startup, resulting in a 50% increase in followers and engagement.',
            tasks: ['Created engaging content for Instagram, Facebook, and LinkedIn.', 'Managed influencer partnerships and collaborations.', 'Monitored social media analytics to optimize performance.'],
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
        cvName: cv.value.cvName || "Mẫu CV Chi tiết", // Tên CV mặc định nếu không nhập
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
                        <li><i class="fas fa-phone"></i><span contenteditable="true" @input="updateField('phone', $event)">{{ cv.phone }}</span></li>
                        <li><i class="fas fa-envelope"></i><span contenteditable="true" @input="updateField('email', $event)">{{ cv.email }}</span></li>
                        <li><i class="fas fa-globe"></i><span contenteditable="true" @input="updateField('website', $event)">{{ cv.website }}</span></li>
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
                        <p contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">{{ experience.title }}</p>
                        <p contenteditable="true" @input="updateField('experiences[' + index + '].company', $event)">{{ experience.company }}</p>
                        <p contenteditable="true" @input="updateField('experiences[' + index + '].description', $event)">{{ experience.description }}</p>
                    </li>
                </ul>
            </div>

            <div class="section">
                <h2>Skill</h2>
                <ul>
                    <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true" @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
                </ul>
            </div>

            <div class="section">
                <h2>Project</h2>
                <ul>
                    <li v-for="(project, index) in cv.projects" :key="index">
                        <p contenteditable="true" @input="updateField('projects[' + index + '].title', $event)">{{ project.title }}</p>
                        <p contenteditable="true" @input="updateField('projects[' + index + '].role', $event)">{{ project.role }}</p>
                        <p contenteditable="true" @input="updateField('projects[' + index + '].description', $event)">{{ project.description }}</p>
                        <ul>
                            <li v-for="(task, taskIndex) in project.tasks" :key="taskIndex" contenteditable="true" @input="updateField('projects[' + index + '].tasks[' + taskIndex + ']', $event)">{{ task }}</li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div class="section">
                <h2>Prize</h2>
                <ul>
                    <li v-for="(award, index) in cv.awards" :key="index">
                        <p contenteditable="true" @input="updateField('awards[' + index + '].title', $event)">{{ award.title }}</p>
                        <p contenteditable="true" @input="updateField('awards[' + index + '].event', $event)">{{ award.event }}</p>
                    </li>
                </ul>
            </div>

            <div class="section">
                <h2>Volunteer work</h2>
                <ul>
                    <li v-for="(volunteer, index) in cv.volunteerWork" :key="index">
                        <p contenteditable="true" @input="updateField('volunteerWork[' + index + '].role', $event)">{{ volunteer.role }}</p>
                        <p contenteditable="true" @input="updateField('volunteerWork[' + index + '].organization', $event)">{{ volunteer.organization }}</p>
                    </li>
                </ul>
            </div>

            <div class="section">
                <h2>Education</h2>
                <ul>
                    <li v-for="(education, index) in cv.education" :key="index">
                        <p contenteditable="true" @input="updateField('education[' + index + '].degree', $event)">{{ education.degree }}</p>
                        <p contenteditable="true" @input="updateField('education[' + index + '].university', $event)">{{ education.university }}</p>
                    </li>
                </ul>
            </div>

            <div class="section">
                <h2>Course</h2>
                <ul>
                    <li v-for="(course, index) in cv.courses" :key="index">
                        <p contenteditable="true" @input="updateField('courses[' + index + '].title', $event)">{{ course.title }}</p>
                        <p contenteditable="true" @input="updateField('courses[' + index + '].platform', $event)">{{ course.platform }}</p>
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
    justify-content: flex-start; /* Giảm khoảng cách giữa avatar và personal-info */
    align-items: center; /* Căn giữa theo chiều dọc */
    margin-bottom: 20px;
}

.avatar {
    width: 180px; /* Giảm kích thước avatar */
    height: 160px; /* Giảm kích thước avatar */
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
    padding-left: 105px; /* Giảm khoảng cách giữa avatar và thông tin cá nhân */
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

