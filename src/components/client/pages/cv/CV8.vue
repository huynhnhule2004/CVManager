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
        name: 'Ethan Harris',
        specialize: 'Cybersecurity Specialist',
        phone: '+84123456795',
        email: 'ethan.harris@gmail.com',
        website: 'cybersecureethan.com',
        location: 'Toronto, Canada',
        birthday: '1990-11-11',
        university: 'University of Toronto',
        introduction: 'Cybersecurity specialist dedicated to securing networks and systems...',
        experiences: [
            {
                title: 'Cybersecurity Analyst',
                year: '2018 - Present',
                company: 'SecureTech Solutions',
                description: 'Implemented security protocols and monitored for threats...',
            },
        ],
        skills: ['Network Security', 'Ethical Hacking', 'Penetration Testing', 'Firewall Configuration', 'SIEM'],
        projects: [
            {
                title: 'Security Audit for XYZ Corp',
                year: '2020',
                website: 'xyzcorp.com',
                role: 'Lead Analyst',
                description: 'Conducted a full security audit to identify vulnerabilities...',
                tasks: ['Perform vulnerability assessment', 'Implement fixes', 'Create audit reports'],
            },
        ],
    },);

const previewImage = ref('https://htmediagroup.vn/wp-content/uploads/2023/03/Anh-profile-nam-12-min.jpg');
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
        return
    }

    const userCVRef = dbRef(database, `cv`); // Đường dẫn nhánh của user
    const newCvRef = push(userCVRef); // Tạo ID tự động cho CV

    // Thông tin CV, bao gồm trường 'cvName'
    const cvData = {
        ...cv.value,
        cvId: newCvRef.key,          // Lưu ID tự động
        userId: userId.value,              // Gắn thêm userId để dễ truy xuất
        cvName: cv.value.cvName || "Mẫu CV Cybersecurity", // Tên CV mặc định nếu không nhập
        createdAt: new Date().toISOString(), // Lưu thời gian tạo
    };

    set(newCvRef, cvData)
        .then(() => {
            // toast.success('Lưu CV thành công!');
            console.log('CV đã được lưu thành công với ID:', newCvRef.key);
        })
        .catch((error) => {
            toast.error('Lỗi khi lưu CV:', error);
            // console.error('Lỗi khi lưu CV:', error);
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
        console.log('Dữ liệu base64 của canvas:', imgDataCanvas);

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
    <div class="cv-container">
        <div class="cv-template">
        <!-- Left Section -->
        <div class="cv-left">
            <div class="avatar-wrapper">
                <img v-if="previewImage" :src="previewImage" alt="Ảnh đại diện" class="preview-img" />
                <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture" class="mt-2" />
            </div>
            <h2 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h2>
            <h3 contenteditable="true" @input="updateField('specialize', $event)">{{
                cv.specialize }}</h3>
            <div class="about">
                <h4>About Me</h4>
                <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
            </div>

            <ul class="contact-info">
                <li> <i class="fas fa-phone"></i>
                    <p contenteditable="true" @input="updateField('phone', $event)">{{ cv.phone }}</p>
                </li>
                <li><i class="fas fa-envelope"></i>
                    <p contenteditable="true" @input="updateField('email', $event)">{{ cv.email }}</p>
                </li>
                <li><i class="fas fa-link"></i>
                    <p contenteditable="true" @input="updateField('website', $event)">{{ cv.website }}</p>
                </li>
            </ul>

            <div class="skills">
                <h4>Skills</h4>
                <ul>
                    <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                        @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
                </ul>
            </div>
        </div>

        <!-- Right Section -->
        <div class="cv-right">
            <div class="cv-section">
                <h3>Projects</h3>
                <div v-for="(project, index) in cv.projects" :key="index" class="project-item">
                    <h4 contenteditable="true" @input="updateField('projects[' + index + '].title', $event)">{{
                        project.title }}</h4>
                    <p><span contenteditable="true"
                            @input="updateField('projects[' + index + '].year', $event)">{{ project.year }}</span></p>
                    <p><span contenteditable="true"
                            @input="updateField('projects[' + index + '].website', $event)">{{ project.website }}</span>
                    </p>
                    <p><span contenteditable="true"
                            @input="updateField('projects[' + index + '].role', $event)">{{ project.role }}</span></p>
                    <p contenteditable="true" @input="updateField('projects[' + index + '].description', $event)">{{
                        project.description }}</p>
                </div>
            </div>

            <div class="cv-section">
                <h3>Experience</h3>
                <div v-for="(exp, index) in cv.experiences" :key="index" class="experience-item">
                    <h4 contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">{{
                        exp.title }}</h4>
                    <p><b>Năm:</b> <span contenteditable="true"
                            @input="updateField('experiences[' + index + '].year', $event)">{{ exp.year }}</span></p>
                    <p><b>Công ty:</b> <span contenteditable="true"
                            @input="updateField('experiences[' + index + '].company', $event)">{{ exp.company }}</span>
                    </p>
                    <p contenteditable="true" @input="updateField('experiences[' + index + '].description', $event)">{{
                        exp.description }}</p>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="d-flex justify-content-center align-items-center my-5">
                <!-- <button @click="saveCV" class="me-3 btn btn-info">Lưu CV</button> -->
                <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
            </div>
</template>
<style scoped>
body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    margin: 0;
    padding: 0;
}
.cv-template {
    display: flex;
    justify-content: space-between;
    width: 100%;
    background-color: #ffffff;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    flex-grow: 1;
}
.cv-container {
    display: flex;
    max-width: 1200px;
    margin: 20px auto;
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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

}

.cv-left {
    width: 30%;
    background-color: #e6e9f4;
    padding: 20px;
    /* text-align: center; */
}

.cv-left img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin-bottom: 15px;
}

.cv-left h2 {
    font-size: 22px;
    color: #333;
}

.cv-left h3 {
    font-size: 16px;
    color: #777;
    margin-bottom: 20px;
}

.cv-left .skills,
.cv-left .about {
    margin-bottom: 20px;
}

.contact-info {
    list-style: none;
    padding: 0;
    margin-top: 15px;
    margin-bottom: 40px;
}

.contact-info li {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.contact-info i {
    margin-bottom: 15px;
}

.cv-left .skills ul {
    list-style: none;
    float: left;
}

.cv-left .contact-info i {
    margin-right: 10px;
    color: #4a4a4a;
}

.cv-right {
    width: 70%;
    padding: 20px;
}

.cv-section {
    margin-bottom: 20px;
}

.cv-section h3 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #4a4a4a;
    border-bottom: 2px solid #ddd;
    padding-bottom: 5px;
}

.cv-section .timeline {
    list-style: none;
    padding: 0;
}

.cv-section .timeline li {
    position: relative;
    padding-left: 25px;
    margin-bottom: 15px;
}

.cv-section .timeline li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 5px;
    width: 10px;
    height: 10px;
    /* background: #007bff; */
    border-radius: 50%;
}

.cv-section .timeline li span {
    font-weight: bold;
    display: block;
}
.cv-footer {
    text-align: center;
    margin: 30px;
}

</style>