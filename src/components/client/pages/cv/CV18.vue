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
    name: 'Nguyen Thi Mai',
    specialize: 'Full-Stack Developer',
    phone: '+84987654321',
    email: 'mai.dev@gmail.com',
    website: 'www.maidev.com',
    linkedin: 'https://www.linkedin.com/in/maidev',
    github: 'https://github.com/maidev',
    portfolio: 'https://portfolio.maidev.com',
    location: 'Hanoi - VietNam',
    birthday: '15/05/1995',
    university: 'FPT University',
    introduction: 'Passionate developer with 5+ years of experience...',
    experiences: [
        {
            title: 'Full-Stack Developer',
            year: '2021 - Present',
            company: 'Tech Solutions',
            description: 'Developing scalable web applications...',
        },
        {
            title: 'Junior Developer',
            year: '2019 - 2021',
            company: 'Code Academy',
            description: 'Building front-end and back-end features...',
        },
    ],
    skills: ['JavaScript', 'Vue.js', 'Node.js', 'Express', 'MongoDB', 'HTML5', 'CSS3', 'Git'],
    projects: [
        {
            title: 'E-commerce Website',
            year: '2022',
            website: 'www.ecommerce.com',
            role: 'Lead Developer',
            description: 'Built an e-commerce platform...',
            tasks: ['Developed front-end using Vue.js', 'Integrated payment gateway', 'Managed database with MongoDB'],
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
        cvName: cv.value.cvName || "Mẫu CV Designer 03", // Tên CV mặc định nếu không nhập
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

        pdf.save('CV.Designer 03');
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
                <!-- Avatar Section -->
                <div class="avatar-wrapper">
                    <img v-if="previewImage" :src="previewImage" alt="Ảnh đại diện" class="preview-img" />
                    <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture" class="mt-2" />
                </div>

                <!-- CV Information -->
                <div class="name">
                    <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
                    <div class="specialize" contenteditable="true" @input="updateField('specialize', $event)">
                        {{ cv.specialize }}
                    </div>
                    <ul class="contact">
                        <li><span>Phone</span><p>{{ cv.phone }}</p></li>
                        <li><span>Email</span><p>{{ cv.email }}</p></li>
                        <li><span>Website</span><p>{{ cv.website }}</p></li>
                    </ul>
                </div>

                <!-- Contact Links -->
                <div class="contact-info">
                    <ul>
                        <li><span>LinkedIn:</span><a :href="cv.linkedin" target="_blank">{{ cv.linkedin }}</a></li>
                        <li><span>GitHub:</span><a :href="cv.github" target="_blank">{{ cv.github }}</a></li>
                        <li><span>Portfolio:</span><a :href="cv.portfolio" target="_blank">{{ cv.portfolio }}</a></li>
                    </ul>
                </div>

                <!-- Introduction -->
                <div class="intro">
                    <h2>INTRODUCE MYSELF</h2>
                    <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
                </div>

                <!-- Experience Section -->
                <div class="experience">
                    <h2>EXPERIENCE</h2>
                    <div v-for="(exp, index) in cv.experiences" :key="index" class="item">
                        <h4 contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">
                            {{ exp.title }}</h4>
                        <div class="time">
                            <span contenteditable="true" @input="updateField('experiences[' + index + '].year', $event)">
                                {{ exp.year }}</span>
                            <span contenteditable="true" @input="updateField('experiences[' + index + '].company', $event)">
                                {{ exp.company }}</span>
                        </div>
                        <div class="des" contenteditable="true" @input="updateField('experiences[' + index + '].description', $event)">
                            {{ exp.description }}
                        </div>
                    </div>
                </div>

                <!-- Skills Section -->
                <div class="skills">
                    <h2>SKILLS</h2>
                    <ul>
                        <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true" @input="updateField('skills[' + index + ']', $event)">
                            {{ skill }}
                        </li>
                    </ul>
                </div>

                <!-- Projects Section -->
                <div class="project">
                    <h2>PROJECTS</h2>
                    <div v-for="(project, index) in cv.projects" :key="index" class="item">
                        <h4 contenteditable="true" @input="updateField('projects[' + index + '].title', $event)">
                            {{ project.title }}</h4>
                        <div class="time">
                            <span contenteditable="true" @input="updateField('projects[' + index + '].year', $event)">
                                {{ project.year }}</span>
                        </div>
                        <div class="web" contenteditable="true" @input="updateField('projects[' + index + '].website', $event)">
                            {{ project.website }}
                        </div>
                        <div class="location" contenteditable="true" @input="updateField('projects[' + index + '].role', $event)">
                            {{ project.role }}
                        </div>
                        <div class="des" contenteditable="true" @input="updateField('projects[' + index + '].description', $event)">
                            {{ project.description }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-center align-items-center my-5">
                <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
            </div>
        </div>
    </div>
</template>


<style scoped>
body {
    background-color: #f4f4f9;
    font-family: 'Roboto', sans-serif;
}

.container1 {
    background-color: #fff;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 30px;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.container1:hover {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.avatar-wrapper {
    position: relative;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    margin-left: 50px
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.name h1 {
    font-size: 2.2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.name .specialize {
    font-size: 1.2rem;
    color: #007bff;
    margin-top: 10px;
}

.contact-info {
    background-color: #f7f7f7;
    padding: 20px;
    border-radius: 8px;
    margin-top: 10px;
}

.contact-info ul {
    list-style: none;
    padding: 0;
}

.contact-info li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.contact-info span {
    color: rgb(3, 1, 1);
    width: 124px;
    height: 24px;
    border-radius: 50%;
    text-align: center;
    margin-right: 15px;
}

.intro {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
}

.intro h2 {
    font-size: 1.6rem;
    margin-bottom: 15px;
}

.intro p {
    font-size: 1rem;
    color: #555;
    line-height: 1.5;
}

.experience, .project {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
}

.experience h2, .project h2 {
    font-size: 1.6rem;
    margin-bottom: 15px;
}

.experience .item, .project .item {
    background-color: #f9f9f9;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.experience .item:hover, .project .item:hover {
    background-color: #f1f1f1;
}

.project .item::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: #007bff;
    border-radius: 50%;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
}

.skills li {
    background-color: #f8f9fa;
    padding: 10px 15px;
    border-radius: 8px;
    margin-bottom: 8px;
    transition: background-color 0.3s ease;
}

.skills li:hover {
    background-color: #e9ecef;
}
</style>
