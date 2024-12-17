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
        name: 'Charlotte Miller',
        specialize: 'Project Manager',
        phone: '+84123456796',
        email: 'charlotte.miller@gmail.com',
        website: 'charlottemanages.com',
        location: 'Paris, France',
        birthday: '1987-09-22',
        university: 'HEC Paris',
        introduction: 'Project manager with extensive experience in coordinating cross-functional teams...',
        experiences: [
            {
                title: 'Senior Project Manager',
                year: '2015 - Present',
                company: 'Innovative Projects Ltd.',
                description: 'Managed large-scale projects from conception to completion...',
            },
        ],
        skills: ['Agile Methodology', 'Risk Management', 'Resource Allocation', 'Team Leadership'],
        projects: [
            {
                title: 'Product Launch for DEF Inc.',
                year: '2019',
                website: 'definc.com',
                role: 'Project Manager',
                description: 'Oversaw the successful launch of a new product...',
                tasks: ['Plan project milestones', 'Allocate resources', 'Communicate with stakeholders'],
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
        cvName: cv.value.cvName || "Mẫu CV Project Manager", // Tên CV mặc định nếu không nhập
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


            <div>
                <p class="section-title">Contact</p>
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

            <div>
                <p class="section-title">Projects</p>
                <div v-for="(project, index) in cv.projects" :key="index" class="project-item">
                    <h3 contenteditable="true" @input="updateField('projects[' + index + '].title', $event)">{{
                        project.title }}</h3>
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

            <div>
                <p class="section-title">Skill</p>
                <ul>
                    <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                        @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
                </ul>
            </div>
        </div>

        <!-- Right Section -->
        <div class="cv-right">
            <div class="section">
                <h3>About Me</h3>
                <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
            </div>

            <div class="section">
                <h3>Work Experience</h3>
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

.cv-container {
    display: flex;
    max-width: 1200px;
    margin: 20px auto;
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.cv-template {
    display: flex;
    justify-content: space-between;
    width: 100%;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    flex-grow: 1;
}
.cv-left {
    width: 35%;
    background-color: #3b4a6b;
    color: #fff;
    padding: 20px;
    text-align: left;
}

.cv-left img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin-bottom: 20px;
    display: block;
}
.preview-img {
    width: 150px;
    height: 150px;
    object-fit: cover;

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
.cv-left h2 {
    font-size: 24px;
    color: #fff;
}

.cv-left h3 {
    font-size: 18px;
    color: #d1d9e6;
    margin-bottom: 30px;
}

.cv-left .section-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
}

.cv-left ul {
    padding: 0;
    list-style: none;
}

.cv-left ul li {
    margin-bottom: 10px;
}

.cv-left ul li i {
    margin-right: 10px;
}

.cv-right {
    width: 65%;
    padding: 30px;
}

.cv-right .section {
    margin-bottom: 20px;
}

.cv-right .section h3 {
    font-size: 20px;
    margin-bottom: 15px;
    color: #3b4a6b;
    border-bottom: 2px solid #ddd;
    padding-bottom: 5px;
}

.timeline {
    list-style: none;
    padding: 0;
}

.timeline li {
    position: relative;
    padding-left: 25px;
    margin-bottom: 20px;
}

.timeline li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 5px;
    width: 10px;
    height: 10px;
    background: #3b4a6b;
    border-radius: 50%;
}

.timeline li span {
    font-weight: bold;
    display: block;
    color: #3b4a6b;
}
.cv-footer {
    text-align: center;
    margin: 30px;
}
</style>