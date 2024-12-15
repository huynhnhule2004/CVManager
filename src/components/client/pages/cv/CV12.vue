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
    name: 'Sophia Nguyen',
    specialize: 'Data Scientist',
    phone: '+84123456799',
    email: 'sophia.nguyen@gmail.com',
    website: 'datasophia.com',
    location: 'Singapore',
    birthday: '1993-03-03',
    university: 'National University of Singapore',
    introduction: 'Data scientist with a strong background in machine learning, data visualization, and big data analytics...',
    experiences: [
        {
            title: 'Senior Data Scientist',
            year: '2020 - Present',
            company: 'Big Data Analytics Co.',
            description: 'Built predictive models and analyzed large datasets to extract actionable insights...',
        },
        {
            title: 'Data Analyst',
            year: '2017 - 2020',
            company: 'Tech Innovators Inc.',
            description: 'Created dashboards and visualizations to support decision-making processes...',
        },
    ],
    skills: ['Python', 'R', 'Machine Learning', 'Big Data', 'Data Visualization', 'TensorFlow', 'Tableau', 'SQL'],
    projects: [
        {
            title: 'Customer Churn Prediction Model',
            year: '2022',
            website: 'bigdataanalytics.com',
            role: 'Lead Data Scientist',
            description: 'Developed a machine learning model to predict customer churn and improve retention strategies...',
            tasks: ['Data preprocessing', 'Model development', 'Visualization of results', 'Presenting findings to stakeholders'],
        },
    ],
});
const previewImage = ref('https://bizweb.dktcdn.net/100/175/849/files/chup-anh-beauty-shot-nguoi-nuoc-ngoai-o-viet-nam-trong-studio-ha-noi-08.jpg?v=1552714764093');
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
        cvName: cv.value.cvName || "Mẫu CV Data Scientist", // Tên CV mặc định nếu không nhập
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
        <div class="left-section">
            <div class="avatar-wrapper">
                    <img v-if="previewImage" :src="previewImage" alt="Ảnh đại diện" class="preview-img" />
                    <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture" class="mt-2" />
                </div>
            <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
            <h2 contenteditable="true" @input="updateField('specialize', $event)">{{
                    cv.specialize }}</h2>
            <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>

            <div class="contact-info">
                <div class="section-title">Contact</div>
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
            </div>

            <div class="section-title">Projects</div>
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

        <!-- Right Section -->
        <div class="right-section">
            <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>

            <div>
                <h3>Experience</h3>
                <div class="timeline">
                    <div class="timeline-item">
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

            <div>
                <h3>Skills</h3>
                <ul>
                    <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                        @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
                </ul>
            </div>
        </div>
        </div>
    </div>
    <div class="cv-footer">
        <button @click="downloadPDF()" class="btn-download">Tải CV</button>
    </div>
</template>
<style scoped>


body {
    font-family: 'Arial', sans-serif;
    /* background-color: #f4f4f4; */
    padding: 20px;
    display: flex;
    justify-content: center;
}

.cv-container {
    display: flex;
    max-width: 1200px;
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin: 25px auto;
}

.left-section {
    width: 35%;
    background-color: #e5d4c3;
    color: #333;
    padding: 30px;
    text-align: center;
}

.left-section img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 20px;
}
.preview-img {
    width: 150px;
    height: 150px;
    object-fit: cover;

}
.left-section h1 {
    font-size: 24px;
    margin-bottom: 10px;
    font-weight: bold;
}

.left-section h2 {
    font-size: 18px;
    margin-bottom: 20px;
    font-weight: normal;
}

.left-section p {
    font-size: 14px;
    margin-bottom: 20px;
    line-height: 1.6;
}

.section-title {
    font-size: 18px;
    font-weight: bold;
    margin: 20px 0 10px;
}
.contact-info {
    list-style: none;
    padding: 0;
    margin-top: 15px;
    margin-bottom: 40px;
    align-items: center;
}
.cv-template {
    display: flex;
    justify-content: space-between;
    width: 100%;
    background-color: #ffffff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    line-height: 1.5;
    flex-grow: 1;

}
.contact-info ul {
    list-style: none;
    padding: 0;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center; /* Căn giữa theo chiều ngang */
    justify-content: center; /* Căn giữa theo chiều dọc */
}

.contact-info ul li {
    font-size: 14px;
    margin-bottom: 10px;
    display: flex;
    align-items: center; /* Căn giữa icon và text */
    justify-content: center; /* Căn giữa nội dung */
    text-align: center; /* Căn giữa text */
}


.contact-info ul li i {
    margin-right: 10px;
    margin-bottom: 15px;
}

.right-section {
    width: 65%;
    padding: 30px;
}

.right-section h1 {
    font-size: 36px;
    margin-bottom: 10px;
    font-weight: bold;
    color: #5a4231;
}

.right-section h3 {
    font-size: 20px;
    margin-bottom: 10px;
    font-weight: bold;
}

.timeline {
    margin-top: 20px;
}

.timeline-item {
    margin-bottom: 20px;
}

.timeline-item h4 {
    font-size: 16px;
    font-weight: bold;
}

.timeline:before {
    display: none !important;
}

.cv-footer {
    text-align: center;
    margin: 30px;
}

.btn-download {
    font-size: 1.2rem;
    padding: 12px 30px;
    background-color: #007BFF;
    /* color: #fff; */
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-download:hover {
    background-color: #0056b3;
}
</style>