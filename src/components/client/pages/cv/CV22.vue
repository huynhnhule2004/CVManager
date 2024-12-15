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
    name: 'DR. JOHN DOE',
    specialize: 'Cardiologist',
    phone: '+84123456789',
    email: 'johndoe.med@gmail.com',
    website: 'www.johndoeclinic.com',
    location: 'HCMC - VietNam',
    birthday: '01/01/1980',
    university: 'Medical University of HCMC',
    introduction: 'Experienced Cardiologist with over 10 years of practice in heart disease treatment...',
    medicalSkills: ['ECG', 'Cardiac Surgery', 'Patient Care', 'Heart Disease Diagnosis', 'Electrocardiography', 'Cardiac Surgery Assistance', 'Patient Monitoring', 'Medical Research'],
    experiences: [
        {
            title: 'Cardiologist',
            year: '2015 - Present',
            company: 'Heart Care Hospital',
            description: 'Specialized in diagnosing and treating cardiovascular diseases...',
        },
        {
            title: 'Resident Doctor',
            year: '2010 - 2015',
            company: 'Medical University of HCMC',
            description: 'Trained under top cardiologists, specializing in clinical research...',
        },
    ],
    skills: ['Cardiology', 'ECG', 'Cardiac Surgery', 'Patient Care', 'Medical Research', 'Emergency Response'],
    projects: [
        {
            title: 'Cardiac Care Program',
            year: '2020',
            website: 'www.johndoeclinic.com',
            role: 'Lead Cardiologist',
            description: 'Led a team to improve cardiac care services for patients...',
            tasks: ['Developed treatment plans', 'Coordinated with medical staff', 'Provided patient education'],
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
        return
    }

    const userCVRef = dbRef(database, `cv`); // Đường dẫn nhánh của user
    const newCvRef = push(userCVRef); // Tạo ID tự động cho CV

    // Thông tin CV, bao gồm trường 'cvName'
    const cvData = {
        ...cv.value,
        cvId: newCvRef.key,          // Lưu ID tự động
        userId: userId.value,              // Gắn thêm userId để dễ truy xuất
        cvName: cv.value.cvName || "Mẫu CV Bác sĩ", // Tên CV mặc định nếu không nhập
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

        pdf.save('CV Bác sĩ.pdf');
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
    <div class="container">
        <div class="page-inner">
            <div class="container1 cv-template">
                <div class="avatar1">
                    <div class="avatar-wrapper">
                        <img v-if="previewImage" :src="previewImage" alt="Ảnh đại diện" class="preview-img" />
                        <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture"
                            class="file-input" />
                    </div>
                </div>
                <div class="name">
                    <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
                    <div class="specialize" contenteditable="true" @input="updateField('specialize', $event)">
                        {{ cv.specialize }}
                    </div>
                    <ul class="contact">
                        <li>
                            <p contenteditable="true" @input="updateField('phone', $event)"><i class="fas fa-phone"></i>
                                {{ cv.phone }}</p>
                        </li>
                        <li>
                            <p contenteditable="true" @input="updateField('email', $event)"><i
                                    class="fas fa-envelope"></i> {{ cv.email }}</p>
                        </li>
                        <li>
                            <p contenteditable="true" @input="updateField('website', $event)"><i
                                    class="fas fa-globe"></i> {{ cv.website }}</p>
                        </li>
                    </ul>
                </div>
                <div class="info">
                    <ul>
                        <li>From <b contenteditable="true" @input="updateField('location', $event)">{{ cv.location
                                }}</b></li>
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
                            exp.title }}</h4>
                        <div class="time">
                            <span contenteditable="true"
                                @input="updateField('experiences[' + index + '].year', $event)">{{ exp.year }}</span>
                            <span contenteditable="true"
                                @input="updateField('experiences[' + index + '].company', $event)">{{ exp.company
                                }}</span>
                        </div>
                        <div class="des" contenteditable="true"
                            @input="updateField('experiences[' + index + '].description', $event)">
                            {{ exp.description }}
                        </div>
                    </div>
                </div>
                <div class="skills">
                    <h2>SKILLS</h2>
                    <ul>
                        <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                            @input="updateField('skills[' + index + ']', $event)">
                            {{ skill }}
                        </li>
                    </ul>
                </div>
                <div class="medical-skills">
                    <h2>MEDICAL SKILLS</h2>
                    <ul>
                        <li v-for="(skill, index) in cv.medicalSkills" :key="index" contenteditable="true"
                            @input="updateField('medicalSkills[' + index + ']', $event)">
                            {{ skill }}
                        </li>
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
                <button @click="downloadPDF()" class="btn-info">Tải CV về</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
body {
    background-color: #f4f7fc;
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
}

.container1 {
    background-color: #ffffff;
    width: 80%;
    max-width: 1000px;
    margin: 50px auto;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 30px;
    border-radius: 10px;
    position: relative;
}

.avatar-wrapper {
    position: relative;
    display: inline-block;
    width: 180px;
    height: 180px;
    margin-bottom: 20px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    border: 5px solid #f1f1f1;
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

.name h1 {
    font-size: 36px;
    font-weight: 700;
    color: #333;
    margin: 0;
}

.name .specialize {
    font-size: 22px;
    color: #777;
    font-weight: 500;
    margin-top: 10px;
}

.contact li {
    list-style: none;
    margin: 12px 0;
    font-size: 18px;
    color: #333;
}

.contact span {
    background-color: #0c7373;
    color: white;
    padding: 6px;
    border-radius: 50%;
    font-size: 16px;
    margin-right: 10px;
}

.info ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 18px;
    color: #555;
}

.intro p {
    font-size: 18px;
    color: #555;
    line-height: 1.8;
    margin-top: 10px;
}

.experience,
.project {
    margin-top: 30px;
}

.experience h2,
.project h2 {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    border-bottom: 2px solid #0c7373;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.experience .item,
.project .item {
    margin-bottom: 20px;
    padding-left: 30px;
    position: relative;
}

.experience .item::before,
.project .item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 10px;
    width: 8px;
    height: 8px;
    background-color: #0c7373;
    border-radius: 50%;
}

.experience h4,
.project h4 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
}

.skills li {
    list-style: none;
    font-size: 18px;
    color: #555;
    margin: 10px 0;
    padding-left: 20px;
    position: relative;
}

.skills li::before {
    content: '•';
    position: absolute;
    left: 0;
    top: 0;
    color: #0c7373;
}

.project .item .web,
.project .item .location {
    font-size: 16px;
    color: #0c7373;
    margin-top: 5px;
}

.project .item .des {
    font-size: 16px;
    color: #555;
    margin-top: 10px;
}

.project .item .des ul {
    padding-left: 20px;
}

.project .item .des ul li {
    font-size: 16px;
    color: #555;
    margin-bottom: 5px;
}

.btn-info {
    background-color: #0c7373;
    color: white;
    padding: 12px 25px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-size: 18px;
}

.btn-info:hover {
    background-color: #085f5f;
}

.divider {
    border-top: 2px solid #0c7373;
    margin: 20px 0;
    width: 100%;
}
</style>