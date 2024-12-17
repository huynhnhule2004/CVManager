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
    name: 'NGUYEN THI C',
    specialize: 'Linguist & Language Researcher',
    phone: '+84123456789',
    email: 'nguyenthic.linguist@gmail.com',
    website: 'ngonnguhoc.com',
    location: 'Hanoi - VietNam',
    birthday: '01/01/1990',
    university: 'National University of Linguistics',
    introduction: 'I am passionate about linguistics and have extensive experience in researching and teaching languages. My goal is to promote language understanding and cultural diversity.',
    experiences: [
        {
            title: 'Language Researcher',
            year: '2020 - Present',
            company: 'Institute of Linguistics',
            description: 'Conducted research on Vietnamese dialects and compiled resources for endangered languages.',
        },
        {
            title: 'Language Instructor',
            year: '2015 - 2020',
            company: 'XYZ Language Center',
            description: 'Taught courses in English, Vietnamese, and cultural communication to students of various backgrounds.',
        },
    ],
    skills: [
        'Phonetics & Phonology',
        'Syntax & Semantics',
        'Language Teaching',
        'Bilingual Education',
        'Translation & Interpretation',
        'Corpus Linguistics',
        'Research Methodology',
    ],
    projects: [
        {
            title: 'Endangered Language Preservation',
            year: '2021',
            website: 'www.linguisticresearch.com',
            role: 'Project Coordinator',
            description: 'Led a project to document and preserve endangered languages in Southeast Asia.',
            tasks: [
                'Developed a digital archive for endangered languages.',
                'Collaborated with local communities for language documentation.',
                'Organized workshops on language preservation techniques.',
            ],
        },
        {
            title: 'Vietnamese Grammar Handbook',
            year: '2019',
            website: 'www.ngonnguhoc.com',
            role: 'Editor',
            description: 'Compiled a comprehensive Vietnamese grammar guide for educators and students.',
            tasks: [
                'Researched and compiled grammatical structures.',
                'Worked with a team of linguists for peer review.',
                'Published and distributed the handbook to universities.',
            ],
        },
    ],
});

const previewImage = ref('https://studiochupanhdep.com/Upload/Images/Album/hinh-anh-profile-01.jpg');
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
        cvName: cv.value.cvName || "Mẫu CV Ngôn ngữ học", // Tên CV mặc định nếu không nhập
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
            <div class="left-column">
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
                        <li><span>P</span>
                            <p contenteditable="true" @input="updateField('phone', $event)">{{ cv.phone }}</p>
                        </li>
                        <li><span>E</span>
                            <p contenteditable="true" @input="updateField('email', $event)">{{ cv.email }}</p>
                        </li>
                        <li><span>W</span>
                            <p contenteditable="true" @input="updateField('website', $event)">{{ cv.website }}</p>
                        </li>
                    </ul>
                </div>
                <!-- </div> -->
                <!-- Mục tiêu nghề nghiệp -->
                <div class="intro">
                    <h2>Career Objective</h2>
                    <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
                </div>
            </div>

            <!-- Cột phải -->
            <div class="right-column">
                <!-- Kinh nghiệm làm việc -->
                <div class="experience">
                    <h2>Work Experience</h2>
                    <div v-for="(exp, index) in cv.experiences" :key="index" class="experience-item">
                        <h3 contenteditable="true" @input="updateField('experiences[' + index + '].title', $event)">{{
                            exp.title }}</h3>
                        <p class="company" contenteditable="true"
                            @input="updateField('experiences[' + index + '].company', $event)">{{ exp.company }}</p>
                        <p class="year" contenteditable="true"
                            @input="updateField('experiences[' + index + '].year', $event)">{{ exp.year }}</p>
                        <p class="description" contenteditable="true"
                            @input="updateField('experiences[' + index + '].description', $event)">{{ exp.description }}
                        </p>
                    </div>
                </div>

                <!-- Học vấn -->
                <div class="education">
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

                <!-- Kỹ năng -->
                <div class="skills">
                    <h2>Skills</h2>
                    <ul>
                        <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                            @input="updateField('skills[' + index + ']', $event)">
                            {{ skill }}
                        </li>
                    </ul>
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
    <!-- Nút tải xuống -->
    <div class="d-flex justify-content-center align-items-center my-5">
                <!-- <button @click="saveCV" class="me-3 btn btn-info">Lưu CV</button> -->
                <button @click="downloadPDF()" class="btn btn-info">Tải CV về</button>
            </div>
</template>

<style scoped>
body {
    background-color: #f4f4f9;
    font-family: 'Arial', sans-serif;
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
    line-height: 1.5;
    flex-grow: 1;

}

.left-column {
    width: 40%;
    padding-right: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.left-column img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    text-align: center;
    /* margin-bottom: 20px; */
}

.right-column {
    width: 55%;
}

.personal-info {
    display: flex;
    flex-direction: column;
    /* Sắp xếp theo cột */
    align-items: center;
    margin-bottom: 30px;
}

.personal-info {
    display: flex;
    flex-direction: column;
    /* Sắp xếp thông tin theo cột */
    align-items: center;
    /* Căn giữa phần tử */
    margin-bottom: 30px;
}

.avatar-wrapper {
    width: 150px;
    height: 150px;
    position: relative;
    display: inline-block;
    text-align: center;
    justify-content: center;
    margin: 0 auto;
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

.avatar-section {
    display: flex;
    align-items: center;
}


.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Đảm bảo ảnh được cắt và vừa vặn */
}


.info {
    text-align: center;
    margin-top: 10px;
    /* Khoảng cách giữa avatar và thông tin */
}

h1 {
    font-size: 2rem;
    color: #2b2b2b;
    margin-top: 20px;
}

.specialize {
    font-size: 1.2rem;
    color: #555;
    margin-top: 10px;
    /* Khoảng cách giữa tên và chuyên môn */
}

.contact-info {
    list-style: none;
    padding: 0;
    margin-top: 15px;
    /* Khoảng cách giữa chuyên môn và thông tin liên lạc */
}

.contact-info li {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.contact-info span {
    background-color: #4caf50;
    color: white;
    width: 24px;
    height: 24px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    margin-right: 12px;
    font-size: 14px;
}

h2 {
    font-size: 1.6rem;
    color: #2b2b2b;
    margin-bottom: 15px;
    font-weight: 600;
    border-bottom: 2px solid #ccc;
    padding-bottom: 10px;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    margin-bottom: 10px;
    font-size: 1rem;
    color: #555;
}

.experience-item,
.education-item,
.project-item {
    margin-bottom: 20px;
}

.year,
.company,
.description {
    margin: 5px 0;
    font-size: 1rem;
    color: #666;
}

.actions {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}
</style>
