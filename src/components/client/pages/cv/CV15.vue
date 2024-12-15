<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { database } from '../../../../firebase';
import { ref as dbRef, set, onValue, push } from 'firebase/database';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'vue3-toastify';

const cv = ref({
    avatarUrl: '',
    name: 'JANE DOE',
    specialize: 'Web Developer',
    phone: '+1234567890',
    email: 'janedoe@example.com',
    website: 'janedoe.dev',
    location: 'New York, USA',
    address: '456, Modern Street, New York',
    birthday: '15/06/1995',
    university: 'XYZ University',
    languages: ['English', 'Spanish'],
    certifications: [
        { title: 'Certified Web Developer', year: '2024' },
        { title: 'Advanced JavaScript', year: '2023' },
    ],
    careerObjective: 'Passionate and skilled web developer with expertise in frontend and backend technologies. Seeking to leverage my skills to build cutting-edge web applications.',
    introduction: 'I am a web developer with a strong background in HTML, CSS, JavaScript, and modern web frameworks. I love to create user-friendly and responsive websites that deliver excellent user experiences.',
    experiences: [
        {
            title: 'Frontend Developer',
            year: '2022 - Present',
            company: 'Tech Innovations',
            description: 'Developed interactive and responsive websites using React and Vue.js.',
        }
    ],
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue.js', 'Node.js'],
    projects: [
        {
            title: 'E-commerce Website',
            year: '2023',
            website: 'www.janedoe.dev',
            role: 'Lead Developer',
            description: 'Led the development of a full-stack e-commerce website, integrating payment gateways and dynamic product listings.',
            tasks: ['Built responsive UI with React.', 'Integrated backend APIs with Node.js.', 'Ensured cross-browser compatibility and performance optimization.'],
        },
        {
            title: 'Portfolio Website',
            year: '2022',
            website: 'www.janedoe.dev',
            role: 'Web Developer',
            description: 'Created a personal portfolio website to showcase my skills and projects.',
            tasks: ['Designed and developed the website using HTML, CSS, and JavaScript.', 'Optimized the website for SEO and performance.'],
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
        cvName: cv.value.cvName || "Mẫu CV Marketing 01",
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
        pdf.save('CV_Marketing 01.pdf');
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
                        <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture" class="mt-2" />
                    </div>
                </div>
                <div class="name">
                    <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
                    <div class="specialize" contenteditable="true" @input="updateField('specialize', $event)">{{ cv.specialize }}</div>
                    <ul class="contact">
                        <li><span>P</span><p class="d-inline-block m-0" contenteditable="true" @input="updateField('phone', $event)">{{ cv.phone }}</p></li>
                        <li><span>E</span><p class="d-inline-block m-0" contenteditable="true" @input="updateField('email', $event)">{{ cv.email }}</p></li>
                        <li><span>W</span><p class="d-inline-block m-0" contenteditable="true" @input="updateField('website', $event)">{{ cv.website }}</p></li>
                    </ul>
                </div>

                <!-- Địa chỉ -->
                <div class="address">
                    <h2>Address</h2>
                    <p contenteditable="true" @input="updateField('address', $event)">{{ cv.address }}</p>
                </div>

                <!-- Ngôn ngữ -->
                <div class="languages">
                    <h2>Languages</h2>
                    <ul>
                        <li v-for="(language, index) in cv.languages" :key="index" contenteditable="true" @input="updateField('languages[' + index + ']', $event)">{{ language }}</li>
                    </ul>
                </div>

                <!-- Chứng chỉ -->
                <div class="certifications">
                    <h2>Certifications</h2>
                    <ul>
                        <li v-for="(cert, index) in cv.certifications" :key="index">
                            <p contenteditable="true" @input="updateField('certifications[' + index + '].title', $event)">{{ cert.title }}</p>
                            <span contenteditable="true" @input="updateField('certifications[' + index + '].year', $event)">{{ cert.year }}</span>
                        </li>
                    </ul>
                </div>

                <!-- Mục tiêu nghề nghiệp -->
                <div class="career-objective">
                    <h2>Career Objective</h2>
                    <p contenteditable="true" @input="updateField('careerObjective', $event)">{{ cv.careerObjective }}</p>
                </div>

                <!-- Giới thiệu bản thân -->
                <div class="introduction">
                    <h2>Introduction</h2>
                    <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
                </div>

                <!-- Kinh nghiệm -->
                <div class="experiences">
                    <h2>Experience</h2>
                    <ul>
                        <li v-for="(experience, index) in cv.experiences" :key="index">
                            <p contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">{{ experience.title }}</p>
                            <p contenteditable="true" @input="updateField('experiences[' + index + '].company', $event)">{{ experience.company }}</p>
                            <p contenteditable="true" @input="updateField('experiences[' + index + '].description', $event)">{{ experience.description }}</p>
                        </li>
                    </ul>
                </div>

                <!-- Kỹ năng -->
                <div class="skills">
                    <h2>Skills</h2>
                    <ul>
                        <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true" @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
                    </ul>
                </div>

                <!-- Dự án -->
                <div class="projects">
                    <h2>Projects</h2>
                    <ul>
                        <li v-for="(project, index) in cv.projects" :key="index">
                            <p contenteditable="true" @input="updateField('projects[' + index + '].title', $event)">{{ project.title }}</p>
                            <p contenteditable="true" @input="updateField('projects[' + index + '].description', $event)">{{ project.description }}</p>
                        </li>
                    </ul>
                </div>
            </div>
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
    margin-bottom: 5px;
}

.name .specialize {
    font-weight: bold;
    font-size: 18px;
    margin: 5px 0;
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

.contact li p {
    margin: 0;
}

.skills ul, .languages ul, .certifications ul, .experiences ul, .projects ul {
    padding: 0;
    list-style: none;
}

.skills li, .languages li, .certifications li, .experiences li, .projects li {
    padding: 5px 0;
    font-size: 16px;
}

.career-objective, .address, .languages, .certifications, .skills, .experiences, .projects {
    margin-top: 20px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-bottom: 2px solid #ddd; /* Đường gạch ngăn giữa các mục */
}

.career-objective h2, .address h2, .languages h2, .certifications h2, .skills h2, .experiences h2, .projects h2 {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.career-objective p, .address p, .languages p, .certifications p, .skills li, .experiences li, .projects li {
    font-size: 16px;
    color: #555;
    line-height: 1.6;
}

.career-objective p {
    font-style: italic;
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

.skills h2, .languages h2, .certifications h2, .projects h2, .experiences h2 {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.experiences ul {
    padding: 0;
    list-style: none;
}

.experiences li {
    padding: 10px 0;
    border-bottom: 1px solid #ddd; /* Đường gạch ngăn giữa các kinh nghiệm */
}

.projects ul {
    padding: 0;
    list-style: none;
}

.projects li {
    padding: 10px 0;
    border-bottom: 1px solid #080404; /* Đường gạch ngăn giữa các dự án */
}

.career-objective, .address, .languages, .certifications, .skills, .experiences, .projects {
    margin-top: 20px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.skills li, .languages li, .certifications li, .experiences li, .projects li {
    padding: 5px 0;
    font-size: 16px;
}

.projects li {
    padding: 10px 0;
    margin-bottom: 20px;
    border-left: 4px solid #000000;
    padding-left: 10px;
}

</style>
