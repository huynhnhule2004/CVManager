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
    name: 'Nguyễn Văn A',
    specialize: 'Logistics Manager',
    phone: '+84123456789',
    email: 'nguyenvana@gmail.com',
    website: 'logisticspro.com',
    location: 'Hanoi - Vietnam',
    birthday: '01/01/1990',
    university: 'National University of Vietnam',
    introduction: 'With over 5 years of experience in logistics and supply chain management, I have worked with various global companies to optimize their operations and improve efficiency.',
    experiences: [
        {
            title: 'Logistics Manager',
            year: '2021 - Present',
            company: 'XYZ Logistics',
            description: 'Managing logistics operations, including inventory management, transportation coordination, and supply chain optimization for a global network.',
        },
        {
            title: 'Logistics Coordinator',
            year: '2018 - 2021',
            company: 'ABC Shipping',
            description: 'Coordinated shipments, handled customer inquiries, and worked with suppliers to ensure timely delivery of goods.',
        },
    ],
    skills: ['Supply Chain Management', 'Inventory Control', 'Warehouse Management', 'Transportation Coordination', 'Data Analysis', 'ERP Systems'],
    projects: [
        {
            title: 'Global Supply Chain Optimization',
            year: '2022',
            website: 'www.logisticspro.com',
            role: 'Project Manager',
            description: 'Led a project to optimize the global supply chain for a multinational company, reducing transportation costs by 15%.',
            tasks: [
                'Analyzed current logistics processes and identified areas for improvement.',
                'Implemented new software to track shipments in real-time.',
                'Coordinated with international teams to streamline operations.',
            ],
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
        cvName: cv.value.cvName || "Mẫu CV Chi tiết 02", // Tên CV mặc định nếu không nhập
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

        pdf.save('CV Chi tiết 02.pdf');
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
            <!-- Avatar Section -->
            <div class="avatar-section">
                <img v-if="previewImage" :src="previewImage" alt="Avatar" class="avatar-img" />
                <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture" />
            </div>

            <!-- CV Details -->
            <div class="cv-details">
                <div class="personal-info">
                    <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
                    <h2 contenteditable="true" @input="updateField('specialize', $event)">{{ cv.specialize }}</h2>
                    <div class="contact-info">
                        <p contenteditable="true" @input="updateField('phone', $event)">{{ cv.phone }}</p>
                        <p contenteditable="true" @input="updateField('email', $event)">{{ cv.email }}</p>
                        <p contenteditable="true" @input="updateField('website', $event)">{{ cv.website }}</p>
                    </div>
                    <div class="personal-info">
                        <p contenteditable="true" @input="updateField('location', $event)">{{ cv.location }}</p>
                        <p contenteditable="true" @input="updateField('birthday', $event)">{{ cv.birthday }}</p>
                        <p contenteditable="true" @input="updateField('university', $event)">{{ cv.university }}</p>
                    </div>
                </div>

                <!-- Introduction Section -->
                <div class="introduction">
                    <h3>Introducct</h3>
                    <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
                </div>

                <!-- Experience Section -->
                <div class="experience">
                    <h3>Experience</h3>
                    <div v-for="(exp, index) in cv.experiences" :key="index">
                        <h4 contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">
                            {{ exp.title }}
                        </h4>
                        <p contenteditable="true" @input="updateField('experiences[' + index + '].company', $event)">
                            {{ exp.company }}
                        </p>
                        <p contenteditable="true" @input="updateField('experiences[' + index + '].year', $event)">
                            {{ exp.year }}
                        </p>
                        <p contenteditable="true"
                            @input="updateField('experiences[' + index + '].description', $event)">
                            {{ exp.description }}
                        </p>
                    </div>
                </div>

                <!-- Skills Section -->
                <div class="skills">
                    <h3>Skills</h3>
                    <ul>
                        <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                            @input="updateField('skills[' + index + ']', $event)">
                            {{ skill }}
                        </li>
                    </ul>
                </div>

                <!-- Projects Section -->
                <div class="projects">
                    <h3>Projects</h3>
                    <div v-for="(project, index) in cv.projects" :key="index">
                        <h4 contenteditable="true" @input="updateField('projects[' + index + '].title', $event)">
                            {{ project.title }}
                        </h4>
                        <p contenteditable="true" @input="updateField('projects[' + index + '].year', $event)">
                            {{ project.year }}
                        </p>
                        <p contenteditable="true" @input="updateField('projects[' + index + '].role', $event)">
                            {{ project.role }}
                        </p>
                        <p contenteditable="true" @input="updateField('projects[' + index + '].description', $event)">
                            {{ project.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="d-flex justify-content-center align-items-center my-5">
                <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
            </div>
</template>

<style scoped>
.cv-container {
  display: flex;
  justify-content: center;
  padding: 50px 20px;
  background-color: #f4f7fc;
}

.cv-template {
  background: #ffffff;
  padding: 40px;
  border-radius: 15px;
  width: 850px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  font-family: 'Roboto', sans-serif;
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 30px;
  transition: all 0.3s ease-in-out;
}

.cv-template:hover {
  transform: translateY(-5px);
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  margin-left: 100px;
  border-radius: 50%;
  border: 5px solid #4e73df;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cv-details h1,
.cv-details h2,
.cv-details h3 {
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
  font-size: 52px;
}

.cv-details p {
  margin: 5px 0;
  font-size: 16px;
  color: #666;
}

.cv-details .contact-info,
.cv-details .personal-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.cv-details .contact-info p,
.cv-details .personal-info p {
  flex: 1 1 45%;
  font-size: 16px;
  color: #333;
}

.cv-details .contact-info p {
  font-weight: 500;
}

.cv-details .personal-info p {
  font-weight: 400;
}

.cv-details .skills ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.cv-details .skills li {
  margin: 8px 0;
  font-size: 16px;
  color: #333;
  position: relative;
  padding-left: 20px;
}

.cv-details .skills li::before {
  content: "•";
  position: absolute;
  left: 0;
  top: 0;
  font-size: 20px;
  color: #4e73df;
}

.cv-details .experience,
.cv-details .projects {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-details .experience h3,
.cv-details .projects h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.cv-details .experience div,
.cv-details .projects div {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cv-details .experience h4,
.cv-details .projects h4 {
  font-size: 16px;
  font-weight: 500;
  color: #444;
}

.cv-details .experience p,
.cv-details .projects p {
  font-size: 14px;
  color: #666;
}

.cv-details .projects div {
  background-color: #f8f9fc;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cv-details .experience div,
.cv-details .projects div {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.btn-info {
  background-color: #4e73df;
  color: #fff;
  border: none;
  padding: 12px 25px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}


.btn-info:active {
  transform: translateY(1px);
}

.cv-template h1 {
  font-size: 26px;
  font-weight: bold;
}

.cv-template h2 {
  font-size: 20px;
  font-weight: normal;
  color: #4e73df;
}

.cv-template h3 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.cv-template p {
  font-size: 16px;
  color: #666;
}

.cv-template .contact-info p,
.cv-template .personal-info p {
  font-size: 14px;
  color: #333;
}

.cv-template .experience h3,
.cv-template .projects h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.cv-template .experience div,
.cv-template .projects div {
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.cv-template .experience h4,
.cv-template .projects h4 {
  font-size: 16px;
  font-weight: 500;
  color: #444;
}

.cv-template .experience p,
.cv-template .projects p {
  font-size: 14px;
  color: #666;
}

</style>