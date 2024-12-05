<script setup>
import { ref, onMounted } from 'vue';
import { database } from './firebase'; // Firebase config file
import { ref as dbRef, set, onValue } from 'firebase/database';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CV1 from './components/pages/CV1.vue';

// // Dữ liệu CV
// const cv = ref({
//   name: 'Họ Tên',
//   position: 'Vị trí công việc bạn muốn ứng tuyển',
//   gender: 'Nữ',
//   birthday: '01/01/2000',
//   hometown: 'Thạch Thất, Hà Tây',
//   objectives: 'Mục tiêu ngắn hạn và dài hạn...',
//   skills: ['Tin học văn phòng', 'Tiếng Anh giao tiếp', 'Chỉnh sửa video, Photoshop'],
//   awards: ['Thành viên ưu tú...', 'Giải nhất cuộc thi...'],
//   education: {
//     school: 'Học viện Báo chí và Tuyên truyền',
//     major: 'Báo chí truyền thông',
//     rank: 'Khá',
//   },
//   experience: 'Biên tập viên tại Ban Văn Hóa...',
//   activities: 'Tham gia tình nguyện...',
//   profilePicture: '',
// });

// // Biến lưu ảnh preview
// const previewImage = ref(null);

// // Cập nhật trường nội dung
// const updateField = (field, event) => {
//   cv.value[field] = event.target.innerText;
// };

// // Upload ảnh đại diện
// const uploadProfilePicture = (event) => {
//   const file = event.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = (e) => {
//     previewImage.value = e.target.result;
//     cv.value.profilePicture = e.target.result;
//     saveCV();
//   };
//   reader.readAsDataURL(file);
// };

// // Lưu CV vào Firebase
// const saveCV = () => {
//   const cvRef = dbRef(database, 'cv/user1');
//   set(cvRef, { ...cv.value });
// };

// // Tải xuống PDF
// // Tải xuống PDF
// const downloadPDF = async () => {
//   const element = document.querySelector('.cv-template');

//   if (!element) {
//     console.error('Không tìm thấy phần tử CV để xuất PDF.');
//     return;
//   }

//   try {
//     // Lấy dữ liệu hình ảnh từ previewImage
//     const imgData = previewImage.value;

//     // Kiểm tra nếu ảnh tồn tại
//     if (!imgData) {
//       console.error('Không có ảnh đại diện để chèn vào PDF.');
//       return;
//     }

//     // Lấy canvas từ toàn bộ phần tử CV
//     const canvas = await html2canvas(element, {
//       scale: 2,
//       useCORS: true,
//       backgroundColor: null, // Loại bỏ nền gốc
//     });

//     const ctx = canvas.getContext('2d');
//     ctx.globalCompositeOperation = 'destination-over';
//     ctx.fillStyle = '#ffffff'; // Màu nền trắng
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     // Lấy dữ liệu ảnh từ canvas
//     const imgDataCanvas = canvas.toDataURL('image/png');

//     // Tạo PDF và thêm hình ảnh đã render từ canvas
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const pdfWidth = 190; // Chiều rộng PDF
//     const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Tỉ lệ dựa trên chiều cao canvas

//     // Thêm hình ảnh vào PDF
//     pdf.addImage(imgDataCanvas, 'PNG', 10, 10, pdfWidth, pdfHeight);

//     // Lưu PDF
//     pdf.save('CV.pdf');
//   } catch (error) {
//     console.error('Lỗi khi tạo PDF:', error);
//   }
// };


// // Load dữ liệu từ Firebase khi khởi động
// onMounted(() => {
//   const cvRef = dbRef(database, 'cv/user1');
//   onValue(cvRef, (snapshot) => {
//     const data = snapshot.val();
//     if (data) {
//       cv.value = data;
//       if (data.profilePicture) {
//         previewImage.value = data.profilePicture;
//       }
//     }
//   });
// });
</script>

<template>
  <CV1></CV1>
  <!-- <div>
    <h1>Chỉnh sửa CV</h1>
    <div class="cv-template">
      <div class="cv-left">
        <div class="profile-pic">
          <img v-if="previewImage" :src="previewImage" alt="Ảnh đại diện" class="preview-img" />
          <p v-else>Click để đăng ảnh</p>
          <input type="file" accept="image/*" @change="uploadProfilePicture" />
        </div>
        <div class="section">
          <h3>Mục tiêu nghề nghiệp</h3>
          <p contenteditable="true" @input="updateField('objectives', $event)">{{ cv.objectives }}</p>
        </div>
        <div class="section">
          <h3>Kỹ năng</h3>
          <ul>
            <li v-for="(skill, index) in cv.skills" :key="index" contenteditable="true" 
                @input="updateField(`skills[${index}]`, $event)">{{ skill }}</li>
          </ul>
        </div>
      </div>
      <div class="cv-right">
        <h2 contenteditable="true" @input="updateField('name', $event)">{{ cv.name }}</h2>
        <h4 contenteditable="true" @input="updateField('position', $event)">{{ cv.position }}</h4>
        <div class="info">
          <p>Giới tính: <span contenteditable="true" @input="updateField('gender', $event)">{{ cv.gender }}</span></p>
          <p>Sinh nhật: <span contenteditable="true" @input="updateField('birthday', $event)">{{ cv.birthday }}</span></p>
          <p>Quê quán: <span contenteditable="true" @input="updateField('hometown', $event)">{{ cv.hometown }}</span></p>
        </div>
      </div>
    </div>
    <div>
      <button @click="saveCV" class="me-3">Lưu CV</button>
      <button @click="downloadPDF">Tải CV về</button>
    </div>
  </div> -->
</template>


.cv-template {
  display: flex;
  border: 1px solid #ccc;
  padding: 20px;
  max-width: 900px;
  margin: 20px auto;
  font-family: Arial, sans-serif;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.cv-left {
  width: 35%;
  background-color: #f9f9f9;
  border-right: 1px solid #ddd;
  padding: 15px;
}

.cv-right {
  flex-grow: 1;
  padding: 15px;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #0056b3;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #004494;
}

.preview-img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
</style> -->
