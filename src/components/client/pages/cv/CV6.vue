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
    <div class="cv-wrapper">
        <div class="cv-template">

        <div class="header-section">
            <div class="header-left">
                <img v-if="previewImage" :src="previewImage" alt="Profile Picture" class="profile-img" />
                <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture" />
            </div>
            <div class="header-right">
                <h1 contenteditable="true" @input="updateField('name', $event)" class="name">{{ cv.name }}</h1>
                <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
            </div>
        </div>

        <div class="body-section">
            <div class="left-column">
                <div class="section">
                    <h2>Contact</h2>
                    <ul>
                        <li><strong>Phone:</strong> <span contenteditable="true" @input="updateField('phone', $event)">{{ cv.phone }}</span></li>
                        <li><strong>Email:</strong> <span contenteditable="true" @input="updateField('email', $event)">{{ cv.email }}</span></li>
                        <li><strong>Website:</strong> <span contenteditable="true" @input="updateField('website', $event)">{{ cv.website }}</span></li>
                    </ul>
                </div>
                <div class="section">
                    <h2>Skills</h2>
                    <ul>
                        <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                            @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
                    </ul>
                </div>
            </div>

            <div class="right-column">
                <div class="section">
                    <h2>Work Experience</h2>
                    <div v-for="(exp, index) in cv.experiences" :key="index" class="item">
                        <h3 contenteditable="true" @input="updateField('experiences[' + index + '].position', $event)" class="position">{{ exp.position }}</h3>
                        <p contenteditable="true" @input="updateField('experiences[' + index + '].company', $event)" class="company">{{ exp.company }}</p>
                        <p contenteditable="true" @input="updateField('experiences[' + index + '].duration', $event)" class="duration">{{ exp.duration }}</p>
                        <p contenteditable="true" @input="updateField('experiences[' + index + '].details', $event)" class="details">{{ exp.details }}</p>
                    </div>
                </div>

                <div class="section">
                    <h2>Projects</h2>
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
                  <!-- Thông tin bổ sung -->
                  <div class="additional-info">
                    <h2>Additional Information</h2>
                    <ul>
                        <li><strong>Awards:</strong> <span contenteditable="true"
                                @input="updateField('awards', $event)">{{ cv.awards }}</span></li>
                        <li><strong>Languages:</strong> <span contenteditable="true"
                                @input="updateField('languages', $event)">{{ cv.languages }}</span></li>
                        <li><strong>Hobbies:</strong> <span contenteditable="true"
                                @input="updateField('hobbies', $event)">{{ cv.hobbies }}</span></li>
                    </ul>
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
.cv-wrapper {
    max-width: 800px;
    margin: 30px auto;
    padding: 20px;
    border-radius: 12px;
    font-family: 'Roboto', sans-serif;
    color: #2b2b2b;
}

.header-section {
    display: flex;
    align-items: center;
    background: #4caf50;
    color: white;
    padding: 20px;
    border-radius: 8px 8px 0 0;
}

.header-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.profile-img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 10px;
}

.header-right {
    flex: 2;
    padding-left: 20px;
}

.header-right .name {
    font-size: 1.8rem;
    margin-bottom: 5px;
    font-weight: bold;
}

.header-right .title {
    font-size: 1.2rem;
    color: #d4e157;
    margin-bottom: 10px;
}

.header-right .summary {
    font-size: 1rem;
    font-style: italic;
    color: #c8e6c9;
}

.body-section {
    display: flex;
    background: #fff;
    padding: 20px;
    border-radius: 0 0 8px 8px;
}

.left-column {
    flex: 1;
    padding-right: 20px;
    border-right: 2px solid #e0e0e0;
}

.right-column {
    flex: 2;
    padding-left: 20px;
}

.section {
    margin-bottom: 20px;
}

.section h2 {
    font-size: 1.4rem;
    color: #4caf50;
    margin-bottom: 10px;
    border-bottom: 2px solid #a5d6a7;
    padding-bottom: 5px;
}

.section ul {
    list-style: none;
    padding: 0;
}

.section li {
    margin-bottom: 8px;
    font-size: 1rem;
}

.item h3 {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 5px;
}

.item p {
    margin: 3px 0;
    font-size: 0.95rem;
    color: #555;
}

</style>
