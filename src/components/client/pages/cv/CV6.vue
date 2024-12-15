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

const cv = ref( {
        avatarUrl: '',
        name: 'Michael Brown',
        specialize: 'Data Scientist',
        phone: '+84123456792',
        email: 'michael.brown@gmail.com',
        website: 'michaelbrown.com',
        location: 'Berlin, Germany',
        birthday: '1988-08-08',
        university: 'Technical University of Berlin',
        introduction: 'Data scientist with expertise in machine learning and AI...',
        experiences: [
            {
                title: 'Lead Data Scientist',
                year: '2017 - Present',
                company: 'AI Solutions GmbH',
                description: 'Developed machine learning models for predictive analytics...',
            },
        ],
        skills: ['Python', 'R', 'TensorFlow', 'Data Visualization', 'SQL'],
        projects: [
            {
                title: 'AI-Powered Recommendation System',
                year: '2021',
                website: 'aisolutions.com',
                role: 'Team Lead',
                description: 'Designed and implemented a recommendation engine...',
                tasks: ['Data preprocessing', 'Model training', 'Performance evaluation'],
            },
        ],
});

const previewImage = ref('https://top10review.com.vn/wp-content/uploads/2021/11/Top-10-phong-cach-chup-hinh-doanh-nhan-chuyen-nghiep-1.1.jpg');
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
        cvName: cv.value.cvName || "Mẫu CV IT 01", // Tên CV mặc định nếu không nhập
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
            <div class="avatar-section">
                <div class="avatar-wrapper">
                            <img v-if="previewImage" :src="previewImage" alt="Ảnh đại diện" class="preview-img" />
                            <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture"
                            class="mt-2" />
                        </div>
                <div class="name-info">
                    <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
                    <p class="specialize" contenteditable="true" @input="updateField('specialize', $event)">{{
                        cv.specialize }}</p>
                    <div class="contact-info">
                        <span class="icon">📞</span>
                        <p contenteditable="true" @input="updateField('phone', $event)">{{ cv.phone }}</p>
                        <span class="icon">📧</span>
                        <p contenteditable="true" @input="updateField('email', $event)">{{ cv.email }}</p>
                        <span class="icon">🌐</span>
                        <p contenteditable="true" @input="updateField('website', $event)">{{ cv.website }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="cv-body">
            <div class="section">
                <h2>Thông Tin Cá Nhân</h2>
                <ul>
                    <li><b>Địa chỉ:</b> <span contenteditable="true" @input="updateField('location', $event)">{{
                            cv.location }}</span></li>
                    <li><b>Ngày sinh:</b> <span contenteditable="true" @input="updateField('birthday', $event)">{{
                            cv.birthday }}</span></li>
                    <li><b>Trường Đại học:</b> <span contenteditable="true"
                            @input="updateField('university', $event)">{{ cv.university }}</span></li>
                </ul>
            </div>

            <div class="section">
                <h2>Giới Thiệu Bản Thân</h2>
                <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
            </div>

            <div class="section">
                <h2>Kinh Nghiệm Làm Việc</h2>
                <div v-for="(exp, index) in cv.experiences" :key="index" class="experience-item">
                    <h3 contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">{{
                        exp.title }}</h3>
                    <p><b>Năm:</b> <span contenteditable="true"
                            @input="updateField('experiences[' + index + '].year', $event)">{{ exp.year }}</span></p>
                    <p><b>Công ty:</b> <span contenteditable="true"
                            @input="updateField('experiences[' + index + '].company', $event)">{{ exp.company }}</span>
                    </p>
                    <p contenteditable="true" @input="updateField('experiences[' + index + '].description', $event)">{{
                        exp.description }}</p>
                </div>
            </div>

            <div class="section">
                <h2>Kỹ Năng</h2>
                <ul>
                    <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                        @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
                </ul>
            </div>

            <div class="section">
                <h2>Dự Án</h2>
                <div v-for="(project, index) in cv.projects" :key="index" class="project-item">
                    <h3 contenteditable="true" @input="updateField('projects[' + index + '].title', $event)">{{
                        project.title }}</h3>
                    <p><b>Năm:</b> <span contenteditable="true"
                            @input="updateField('projects[' + index + '].year', $event)">{{ project.year }}</span></p>
                    <p><b>Website:</b> <span contenteditable="true"
                            @input="updateField('projects[' + index + '].website', $event)">{{ project.website }}</span>
                    </p>
                    <p><b>Vai trò:</b> <span contenteditable="true"
                            @input="updateField('projects[' + index + '].role', $event)">{{ project.role }}</span></p>
                    <p contenteditable="true" @input="updateField('projects[' + index + '].description', $event)">{{
                        project.description }}</p>
                </div>
            </div>
        </div>


    </div>
    <div class="cv-footer">
        <button @click="downloadPDF()" class="btn-download">Tải CV</button>
    </div>
</template>

<style scoped>
/* Global Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background-color: #f0f0f0;
    font-family: 'Arial', sans-serif;
    color: #333;
}
.preview-img {
    width: 150px;
    height: 150px;
    object-fit: cover;

}
/* CV Wrapper */
.cv-container {
    max-width: 800px;
    margin: 30px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Header */
.cv-template {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 20px;
    flex-grow: 1;
    width: 100%;
}

.avatar-section {
    display: flex;
    align-items: center;
}

.avatar-wrapper {
    width: 150px;
    height: 150px;
    position: relative;
    border: 3px solid #ddd;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin: 20px;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

.name-info {
    max-width: 60%;
}

.name-info h1 {
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: 5px;
}

.specialize {
    font-size: 1.2rem;
    color: #007BFF;
    margin-bottom: 10px;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.contact-info .icon {
    font-size: 1.2rem;
    color: #007BFF;
}

/* Body */
.cv-body .section {
    margin-bottom: 30px;
}

h2 {
    font-size: 1.5rem;
    color: #444;
    margin-bottom: 15px;
    border-bottom: 2px solid #007BFF;
    padding-bottom: 5px;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    margin-bottom: 10px;
}

.project-item,
.experience-item {
    margin-bottom: 20px;
}

.project-item h3,
.experience-item h3 {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 5px;
}

.project-item p,
.experience-item p {
    margin-bottom: 8px;
}

/* Footer */
.cv-footer {
    text-align: center;
    margin: 30px;
}

.btn-download {
    font-size: 1.2rem;
    padding: 12px 30px;
    background-color: #007BFF;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-download:hover {
    background-color: #0056b3;
}
</style>