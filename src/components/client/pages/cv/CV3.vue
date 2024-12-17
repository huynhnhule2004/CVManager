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
    name: 'Devit',
    specialize: 'Front-End Developer',
    phone: '+84123456789',
    email: 'Devit.dev@gmail.com',
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
        cvName: cv.value.cvName || "Mẫu CV IT 02", // Tên CV mặc định nếu không nhập
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
    <div class="container">
        <div class="page-inner">
            <div class="container1 cv-template">
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
                        cv.specialize
                        }}</div>
                    <ul class="contact">
                        <li>
                            <span>P</span>
                            <p class="d-inline-block m-0" contenteditable="true" @input="updateField('phone', $event)">
                                {{
                                    cv.phone }}</p>
                        </li>
                        <li>
                            <span>E</span>
                            <p class="d-inline-block m-0" contenteditable="true" @input="updateField('email', $event)">
                                {{
                                    cv.email }}</p>
                        </li>
                        <li>
                            <span>W</span>
                            <p class="d-inline-block m-0" contenteditable="true"
                                @input="updateField('website', $event)">{{
                                    cv.website }}</p>
                        </li>
                    </ul>
                </div>
                <div class="info">
                    <ul>
                        <li>
                            From <b contenteditable="true" @input="updateField('location', $event)">{{ cv.location
                                }}</b>
                        </li>
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
                            exp.title
                            }}</h4>
                        <div class="time">
                            <span contenteditable="true"
                                @input="updateField('experiences[' + index + '].year', $event)">{{
                                    exp.year }}</span>
                            <span contenteditable="true"
                                @input="updateField('experiences[' + index + '].company', $event)">{{
                                    exp.company }}</span>
                        </div>
                        <div class="des" contenteditable="true"
                            @input="updateField('experiences[' + index + '].description', $event)">{{ exp.description }}
                        </div>
                    </div>
                    <h2 class="skills">SKILLS</h2>
                    <ul>
                        <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                            @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
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
                <!-- <button @click="saveCV" class="me-3 btn btn-info">Lưu CV</button> -->
                <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
            </div>
        </div>
    </div>

</template>




<style scoped>
/* Tạo nền trang web nhẹ nhàng */
body {
    background-color: #f4f7f6;
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    color: #333;
}

/* Container chính của CV */
.container1 {
    background-color: #fff;
    width: 90%;
    max-width: 1200px;
    margin: 30px auto;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 30px;
}

/* Avatar */
.avatar-wrapper {
    position: relative;
    display: inline-block;
    width: 200px;
    height: 200px;
}

.preview-img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 50%;
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

/* Phần thông tin cơ bản */
.name {
    padding-left: 30px;
    border-left: 3px solid #4CAF50;
}

.name h1 {
    font-size: 36px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 10px;
}

.name .specialize {
    font-size: 20px;
    font-weight: 600;
    color: #7f8c8d;
}

.name .contact {
    list-style: none;
    padding: 0;
    margin: 10px 0;
}

.name .contact li {
    padding: 5px 0;
    display: flex;
    align-items: center;
    color: #7f8c8d;
}

.name .contact span {
    display: inline-block;
    background-color: #4CAF50;
    width: 20px;
    height: 20px;
    color: #fff;
    text-align: center;
    border-radius: 50%;
    font-size: 12px;
    margin-right: 10px;
}

/* Thông tin địa điểm, ngày sinh */
.info ul {
    list-style: none;
    padding: 0;
    margin: 0;
    line-height: 1.8;
    color: #7f8c8d;
}

h2 {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 20px;
}

/* Phần giới thiệu */
.intro {
    padding-left: 30px;
    border-left: 3px solid #4CAF50;
}

.intro p {
    text-align: justify;
    color: #7f8c8d;
    line-height: 1.6;
}

/* Kinh nghiệm */
.experience h4 {
    font-size: 20px;
    color: #2c3e50;
    font-weight: 600;
    margin: 20px 0;
}

.experience ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.experience li {
    padding: 10px 0;
    color: #7f8c8d;
}

.skills ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.skills li {
    display: inline-block;
    background-color: #4CAF50;
    color: white;
    padding: 8px 16px;
    margin: 5px;
    border-radius: 20px;
    font-weight: 600;
    text-transform: uppercase;
}

/* Phần dự án */
.project {
    padding-left: 30px;
    border-left: 3px solid #4CAF50;
}

.project .web {
    color: #2980b9;
    font-weight: bold;
}

.project .location {
    font-weight: 600;
    padding-bottom: 10px;
}

.project .item {
    margin-bottom: 20px;
}

.project .item::before {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #4CAF50;
    content: '';
    border-radius: 50%;
    left: -30px;
    top: 10px;
}

/* Điều chỉnh cho mobile */
@media (max-width: 768px) {
    .container1 {
        grid-template-columns: 1fr;
        padding: 20px;
    }

    .avatar-wrapper {
        width: 150px;
        height: 150px;
    }

    .name h1 {
        font-size: 28px;
    }

    .name .specialize {
        font-size: 18px;
    }

    .contact span {
        font-size: 10px;
    }
}
</style>