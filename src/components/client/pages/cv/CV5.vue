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
    name: 'Your Name',
    specialize: 'Marketing Specialist',
    phone: '+84123456789',
    email: 'example@gmail.com',
    website: 'www.example.com',
    introduction: 'A passionate marketing specialist with over 5 years of experience...',
    experiences: [
        {
            title: 'Marketing Manager',
            year: '2020 - Present',
            company: 'XYZ Company',
            description: 'Leading marketing strategies to drive brand awareness and sales.',

        },
        {
            
            title: 'Social Media Specialist',
            year: '2017 - 2020',
            company: 'ABC Agency',
            description: 'Managed and grew social media platforms, increasing engagement by 35%.',

        },
    ],
    skills: ['SEO', 'Content Marketing', 'Social Media Management', 'Analytics', 'Adobe Creative Suite'],
    projects: [
        {
            title: 'Product Launch Campaign',
            year: '2022',
            role: 'Campaign Lead',
            description: 'Developed and executed a product launch strategy, achieving $1M in sales.',
            tasks: ['Market research', 'Content creation', 'Performance tracking'],
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
        cvName: cv.value.cvName || "Mẫu CV Marketing", // Tên CV mặc định nếu không nhập
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
        <!-- Cột trái -->
        <div class="left-column">
          <!-- Thông tin cá nhân -->
          <div class="avatar-wrapper">
            <img v-if="previewImage" :src="previewImage" alt="Ảnh đại diện" class="preview-img" />
            <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture" class="mt-2" />
          </div>
          <div class="info">
            <h1 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h1>
            <div class="specialize" contenteditable="true" @input="updateField('specialize', $event)">
              {{ cv.specialize }}
            </div>
            <ul class="contact-info">
              <li>
                <span>P</span>
                <p contenteditable="true" @input="updateField('phone', $event)">{{ cv.phone }}</p>
              </li>
              <li>
                <span>E</span>
                <p contenteditable="true" @input="updateField('email', $event)">{{ cv.email }}</p>
              </li>
              <li>
                <span>W</span>
                <p contenteditable="true" @input="updateField('website', $event)">{{ cv.website }}</p>
              </li>
            </ul>
          </div>
          <!-- Mục tiêu nghề nghiệp -->
          <div class="intro">
            <h2>Career Objective</h2>
            <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
          </div>
          <!-- Thông tin bổ sung -->
          <div class="additional-info">
            <h2>Additional Information</h2>
            <ul>
              <li>
                <strong>Awards:</strong>
                <span contenteditable="true" @input="updateField('awards', $event)">{{ cv.awards }}</span>
              </li>
              <li>
                <strong>Languages:</strong>
                <span contenteditable="true" @input="updateField('languages', $event)">{{ cv.languages }}</span>
              </li>
              <li>
                <strong>Hobbies:</strong>
                <span contenteditable="true" @input="updateField('hobbies', $event)">{{ cv.hobbies }}</span>
              </li>
            </ul>
          </div>
        </div>
  
        <!-- Cột phải -->
        <div class="right-column">
          <!-- Kinh nghiệm làm việc -->
          <div class="experience">
            <h2>Work Experience</h2>
            <div v-for="(exp, index) in cv.experiences" :key="index" class="experience-item">
              <h3 contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">{{ exp.title }}</h3>
              <p class="company" contenteditable="true" @input="updateField('experiences[' + index + '].company', $event)">
                {{ exp.company }}
              </p>
              <p class="year" contenteditable="true" @input="updateField('experiences[' + index + '].year', $event)">{{ exp.year }}</p>
              <p class="description" contenteditable="true" @input="updateField('experiences[' + index + '].description', $event)">
                {{ exp.description }}
              </p>
            </div>
          </div>
  
          <!-- Học vấn -->
          <div class="education">
            <h2>Education</h2>
            <div v-for="(edu, index) in cv.education" :key="index" class="education-item">
              <h3 contenteditable="true" @input="updateField('education[' + index + '].degree', $event)">{{ edu.degree }}</h3>
              <p class="school" contenteditable="true" @input="updateField('education[' + index + '].school', $event)">{{ edu.school }}</p>
              <p class="year" contenteditable="true" @input="updateField('education[' + index + '].year', $event)">{{ edu.year }}</p>
            </div>
          </div>
  
          <!-- Kỹ năng -->
          <div class="skills">
            <h2>Skills</h2>
            <ul>
              <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true" @input="updateField('skills[' + index + ']', $event)">
                {{ skill }}
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
          <!-- Nút tải xuống -->
          <div class="actions">
        <button @click="downloadPDF()" class="btn-download">Tải CV về</button>
      </div>
  </template>
  

<style scoped>
body {
    font-family: 'Poppins', sans-serif;
    margin: 0;
    padding: 0;
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

.cv-template {
    display: flex;
    justify-content: space-between;
    width: 100%;
    background-color: #ffffff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    flex-grow: 1;
}

.left-column, .right-column {
    padding-right: 20px;
    flex: 1;
    margin-right: 15px;
}

.left-column img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    text-align: center;
    /* margin-bottom: 20px; */
}
.avatar-wrapper {

    position: relative;
    display: inline-block;
    text-align: center;
    justify-content: center;

}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info h1 {
    font-size: 2.4rem;
    color: #333;
    margin-top: 10px;
    font-weight: 600;
}

.specialize {
    font-size: 1.1rem;
    color: #666;
    margin-top: 10px;
}

.contact-info li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.contact-info span {
    background-color: #4CAF50;
    color: #fff;
    width: 25px;
    height: 25px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    margin-right: 15px;
    font-size: 14px;
    transition: transform 0.3s;
}

.contact-info span:hover {
    transform: scale(1.1); /* Nhấn mạnh khi hover */
}

h2 {
    font-size: 1.7rem;
    color: #2b2b2b;
    margin-bottom: 15px;
    font-weight: 700;
    border-bottom: 2px solid #4caf50;
    padding-bottom: 10px;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    margin-bottom: 15px;
    font-size: 1.1rem;
    color: #555;
}

button {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 12px 30px;
    font-size: 1.1rem;
    cursor: pointer;
    border-radius: 50px;
    transition: background-color 0.3s ease, transform 0.3s;
    display: block;
    margin: 20px auto;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

button:hover {
    background-color: #388e3c;
    transform: scale(1.05);
}

.experience-item, .education-item, .project-item {
    margin-bottom: 25px;
}

.year, .company, .description {
    font-size: 1.1rem;
    color: #666;
    margin: 5px 0;
}

.actions {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.actions button {
    width: 200px;
    font-size: 1.2rem;
}

</style>
