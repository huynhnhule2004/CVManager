<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { database } from '../../../../firebase';
import { ref as dbRef, set, onValue, push } from 'firebase/database';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'vue3-toastify';

const cv = ref({
    avatarUrl: '',
    name: 'NGUYEN THI LAN',
    specialize: 'Back-End Developer',
    phone: '+84987654321',
    email: 'nguyenlan.dev@gmail.com',
    website: 'nguyenlanweb.com',
    location: 'Hanoi - VietNam',
    birthday: '15/05/1995',
    university: 'XYZ University',
    careerObjective: 'A highly motivated and detail-oriented web developer with a passion for creating innovative and user-friendly websites. Seeking to leverage my expertise in front-end and back-end development to contribute to a dynamic team and further develop my skills in a challenging environment',
    introduction: 'I am a passionate back-end developer with experience in building scalable systems. I am skilled in working with databases, server-side technologies, and API development. I strive to create high-quality code and efficient solutions.',
    experiences: [
        {
            title: 'Back-End Developer',
            year: '2021 - Present',
            company: 'Tech Solutions',
            description: 'Developing and maintaining server-side applications using Node.js and Express. Working with databases such as MySQL and MongoDB. Implementing RESTful APIs and integrating third-party services.',
        },
        {
            title: 'Junior Developer',
            year: '2018 - 2021',
            company: 'XYZ Technologies',
            description: 'Assisted in the development of back-end systems and APIs. Wrote SQL queries and optimized database performance. Participated in code reviews and team discussions.',
        },
    ],
    skills: ['Node.js', 'Express', 'MongoDB', 'MySQL', 'RESTful APIs', 'Git', 'Docker', 'AWS'],
    projects: [
        {
            title: 'E-commerce Platform',
            year: '2022',
            website: 'www.nguyenlanweb.com',
            role: 'Back-End Developer',
            description: 'Developed the back-end for an e-commerce platform, including product management, order processing, and user authentication.',
            tasks: ['Designed and implemented the product catalog API.', 'Integrated payment gateway and order tracking system.', 'Optimized database queries for better performance.'],
        },
        {
            title: 'Task Management System',
            year: '2021',
            website: 'www.nguyenlanweb.com',
            role: 'Back-End Developer',
            description: 'Built a task management system for team collaboration, including task creation, assignment, and tracking.',
            tasks: ['Developed APIs for task management and user roles.', 'Implemented real-time notifications using WebSockets.', 'Set up continuous integration and deployment pipelines.'],
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
        pdf.save('CV_Simple 02.pdf');
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
                <!-- Thông tin cá nhân -->
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
                        <li><span>P</span>
                            <p class="d-inline-block m-0" contenteditable="true" @input="updateField('phone', $event)">
                                {{ cv.phone }}</p>
                        </li>
                        <li><span>E</span>
                            <p class="d-inline-block m-0" contenteditable="true" @input="updateField('email', $event)">
                                {{ cv.email }}</p>
                        </li>
                        <li><span>W</span>
                            <p class="d-inline-block m-0" contenteditable="true"
                                @input="updateField('website', $event)">{{ cv.website }}</p>
                        </li>
                    </ul>
                </div>

                <!-- Mục tiêu nghề nghiệp -->
                <div class="career-objective">
                    <h2>Career Objective</h2>
                    <p contenteditable="true" @input="updateField('careerObjective', $event)">
                        {{ cv.careerObjective }}
                    </p>
                </div>

                <!-- Kỹ năng -->
                <div class="skills">
                    <h2>Skill</h2>
                    <ul>
                        <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                            @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
                    </ul>
                </div>

                <!-- Kinh nghiệm -->
                <div class="experience">
                    <h2>Experience</h2>
                    <div v-for="(exp, index) in cv.experiences" :key="index" class="item">
                        <h4 contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">{{
                            exp.title }}</h4>
                        <div class="time">
                            <span contenteditable="true"
                                @input="updateField('experiences[' + index + '].year', $event)">{{ exp.year }}</span>
                            <span contenteditable="true"
                                @input="updateField('experiences[' + index + '].company', $event)">{{ exp.company
                                }}</span>
                        </div>
                        <div class="des" contenteditable="true"
                            @input="updateField('experiences[' + index + '].description', $event)">{{ exp.description }}
                        </div>
                    </div>
                </div>

                <!-- Dự án -->
                <div class="projects">
                    <h2>Project</h2>
                    <div v-for="(project, index) in cv.projects" :key="index" class="item">
                        <h4 contenteditable="true" @input="updateField('projects[' + index + '].title', $event)">{{
                            project.title }}</h4>
                        <div class="time">
                            <span contenteditable="true" @input="updateField('projects[' + index + '].year', $event)">{{
                                project.year }}</span>
                        </div>
                        <div class="web" contenteditable="true"
                            @input="updateField('projects[' + index + '].website', $event)">{{ project.website }}</div>
                        <div class="role" contenteditable="true"
                            @input="updateField('projects[' + index + '].role', $event)">{{ project.role }}</div>
                        <div class="des" contenteditable="true"
                            @input="updateField('projects[' + index + '].description', $event)">{{ project.description
                            }}</div>
                    </div>
                </div>
            </div>

            <!-- Nút tải CV -->
            <div class="d-flex justify-content-center align-items-center my-5">
                <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container1 {
    background-color: #f5f5f5;
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

.name h1 {
    font-weight: 500;
    font-size: 30px;
}

.name .specialize {
    font-weight: bold;
    font-size: 18px;
    margin: 5px 0;
}

.skills ul {
    padding: 0;
    list-style: none;
}

.skills li {
    padding: 5px 0;
    font-size: 16px;
}

.projects .item {
    padding: 10px 0;
    margin-bottom: 20px;
    border-left: 4px solid #007bff;
    padding-left: 10px;
}

.projects .item h4 {
    font-size: 18px;
    margin: 10px 0;
}

.projects .item .role {
    font-weight: bold;
    margin: 5px 0;
}

.projects .item .web {
    color: #0c7373;
    margin: 5px 0;
}

.projects .item .des {
    margin-top: 10px;
    font-size: 14px;
}

.career-objective p {
    font-style: italic;
    color: #555;
    text-align: justify;
}

.contact li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.contact li span {
    font-weight: bold;
    margin-right: 10px;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    background-color: #007bff;
    color: white;
    border: none;
}

button:hover {
    background-color: #0056b3;
}

.skills {
    margin-top: 20px;
}

.skills h2 {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
}

.skills ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    padding: 0;
    list-style: none;
}

.skills li {
    background-color: #f1f1f1;
    padding: 10px;
    border-radius: 8px;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    color: #555;
}
.career-objective {
    margin-top: 20px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.career-objective h2 {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.career-objective p {
    font-size: 16px;
    line-height: 1.6;
    color: #555;
    text-align: justify;
    font-style: italic;
    margin-bottom: 0;
}

.career-objective p::before {
    content: '🌟'; /* Thêm biểu tượng để làm nổi bật */
    font-size: 20px;
    margin-right: 10px;
    color: #007bff;
}

.career-objective p:hover {
    color: #333;
    transition: color 0.3s ease;
}
</style>
