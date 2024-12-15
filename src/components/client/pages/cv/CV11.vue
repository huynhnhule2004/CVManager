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

const cv = ref(    {
        avatarUrl: '',
        name: 'Isabella White',
        specialize: 'Financial Analyst',
        phone: '+84123456798',
        email: 'isabella.white@gmail.com',
        website: 'finwhite.com',
        location: 'Dubai, UAE',
        birthday: '1992-01-01',
        university: 'University of Dubai',
        introduction: 'Financial analyst skilled in investment research and financial modeling...',
        experiences: [
            {
                title: 'Senior Financial Analyst',
                year: '2020 - Present',
                company: 'Finance Pros LLC',
                description: 'Provided detailed financial analysis and forecasts...',
            },
        ],
        skills: ['Financial Modeling', 'Risk Assessment', 'Excel', 'Investment Research', 'Data Analysis'],
        projects: [
            {
                title: 'Investment Portfolio Optimization',
                year: '2021',
                website: 'financepros.com',
                role: 'Analyst',
                description: 'Developed strategies to optimize client portfolios...',
                tasks: ['Analyze market trends', 'Prepare financial reports', 'Advise clients on investments'],
            },
    ]
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
            <!-- Left Section -->
            <div class="left-section">
                <div class="avatar-wrapper">
                    <img v-if="previewImage" :src="previewImage" alt="Ảnh đại diện" class="preview-img" />
                    <input v-if="!isHidden" type="file" accept="image/*" @change="uploadProfilePicture" class="mt-2" />
                </div>
                <h2 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h2>
                <h4 contenteditable="true" @input="updateField('specialize', $event)">{{
                    cv.specialize }}</h4>

                <div>
                    <h3>About Me</h3>
                    <p contenteditable="true" @input="updateField('introduction', $event)">{{ cv.introduction }}</p>
                </div>

                <div>
                    <h3 class="section-title">Contact</h3>
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

                <div class="section">
                    <h3>Skill</h3>
                    <ul>
                        <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true"
                            @input="updateField('skills[' + index + ']', $event)">{{ skill }}</li>
                    </ul>
                </div>
            </div>

            <!-- Right Section -->
            <div class="right-section">
                <div class="section">
                    <h3>Projects</h3>
                    <div class="timeline">
                        <div class="timeline-item">
                            <div v-for="(exp, index) in cv.experiences" :key="index" class="experience-item">
                                <h4 contenteditable="true"
                                    @input="updateField('experiences[' + index + '].title', $event)">{{
                                    exp.title }}</h4>
                                <p><b>Năm:</b> <span contenteditable="true"
                                        @input="updateField('experiences[' + index + '].year', $event)">{{ exp.year
                                        }}</span></p>
                                <p><b>Công ty:</b> <span contenteditable="true"
                                        @input="updateField('experiences[' + index + '].company', $event)">{{
                                        exp.company }}</span>
                                </p>
                                <p contenteditable="true"
                                    @input="updateField('experiences[' + index + '].description', $event)">{{
                                        exp.description }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h3>Experience</h3>
                    <div class="timeline">
                        <div class="timeline-item">
                            <div v-for="(exp, index) in cv.experiences" :key="index" class="experience-item">
                                <h4 contenteditable="true"
                                    @input="updateField('experiences[' + index + '].title', $event)">{{
                                    exp.title }}</h4>
                                <p><b>Năm:</b> <span contenteditable="true"
                                        @input="updateField('experiences[' + index + '].year', $event)">{{ exp.year
                                        }}</span></p>
                                <p><b>Công ty:</b> <span contenteditable="true"
                                        @input="updateField('experiences[' + index + '].company', $event)">{{
                                        exp.company }}</span>
                                </p>
                                <p contenteditable="true"
                                    @input="updateField('experiences[' + index + '].description', $event)">{{
                                        exp.description }}</p>
                            </div>
                        </div>

                    </div>
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
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    display: flex;
    justify-content: center;
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
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    flex-grow: 1;
}

.left-section {
    width: 35%;
    background-color: #333;
    color: #fff;
    padding: 30px;

}

.left-section ul {
    list-style: none;
    margin: 0;
    padding: 0;
    text-align: left;
}

.left-section img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin-bottom: 20px;
}

.preview-img {
    width: 150px;
    height: 150px;
    object-fit: cover;

}

.left-section h2 {
    font-size: 22px;
    margin-bottom: 10px;
}

.left-section h4 {
    font-size: 16px;
    margin-bottom: 20px;
    font-weight: normal;
}

.left-section p {
    font-size: 14px;
    margin-bottom: 20px;
    line-height: 1.6;
}

.left-section ul {
    list-style: none;
    text-align: left;
    margin-top: 20px;
}

.left-section ul li {
    font-size: 14px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.left-section .section-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;

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
    margin-right: 5px;
}

.left-section ul li::before {
    content: "";
    color: #f4f4f4;
    font-size: 18px;
    margin-right: 10px;
}

.right-section {
    width: 65%;
    padding: 30px;
}

.right-section h2 {
    font-size: 24px;
    margin-bottom: 10px;
}

.right-section h4 {
    font-size: 18px;
    margin-bottom: 5px;
}

.section {
    margin-bottom: 30px;
}

.section h3 {
    font-size: 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
}

.section h3::before {
    content: "\1F4DA";
    font-size: 18px;
    margin-right: 10px;
}

.timeline {
    border-left: 2px solid #333;
    padding-left: 20px;
}

.timeline-item {
    margin-bottom: 20px;
}

.timeline-item h4 {
    font-size: 16px;
    margin-bottom: 5px;
}

.timeline-item p {
    font-size: 14px;
    color: #606060;
}

.timeline-item::before {
    content: "\2022";
    font-size: 18px;
    color: #333;
    position: absolute;
    margin-left: -30px;
}
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