<script setup>
import { ref, computed, onMounted } from "vue";
import { toast } from "vue3-toastify";
import { inject } from 'vue';

const authState = inject('authState');

const cvItems = [
    { image: "/src/assets/img/CV1.png", title: "Mẫu CV IT 01", link: "/cv1" },
    {
        image: "/src/assets/img/CV2.png",
        title: "Mẫu CV Designer 01",
        link: "/cv2",
    },
    { image: "/src/assets/img/CV3.png", title: "Mẫu CV IT 02", link: "/cv3" },
    {
        image: "/src/assets/img/CV4.png",
        title: "Mẫu CV Ngôn ngữ học",
        link: "/cv4",
    },
    { image: "/src/assets/img/CV5.png", title: "Mẫu CV Marketing", link: "/cv5" },
    {
        image: "/src/assets/img/CV6.png",
        title: "Mẫu CV Data Scientist",
        link: "/cv6",
    },
    {
        image: "/src/assets/img/CV7.png",
        title: "Mẫu CV Content Writer",
        link: "/cv7",
    },
    {
        image: "/src/assets/img/CV8.png",
        title: "Mẫu CV Cybersecurity",
        link: "/cv8",
    },
    {
        image: "/src/assets/img/CV9.png",
        title: "Mẫu CV Project Manager",
        link: "/cv9",
    },
    {
        image: "/src/assets/img/CV10.png",
        title: "Mẫu CV Engineer",
        link: "/cv10",
    },
    { image: "/src/assets/img/CV11.png", title: "Mẫu CV Analyst", link: "/cv11" },
    {
        image: "/src/assets/img/CV12.png",
        title: "Mẫu CV Data Scientist",
        link: "/cv12",
    },
    { image: '/src/assets/img/2.png', title: 'Mẫu CV Simple 01', link: '/cv13' },
    { image: '/src/assets/img/cv14.png', title: 'Mẫu CV Simple 02', link: '/cv14' },
    { image: '/src/assets/img/13.png', title: 'Mẫu CV Marketing 01', link: '/cv15' },
    { image: '/src/assets/img/cv16.png', title: 'Mẫu CV Chi tiết', link: '/cv16' },
    { image: '/src/assets/img/cv17.png', title: 'Mẫu CV Designer 02', link: '/cv17' },
    { image: '/src/assets/img/18.png', title: 'Mẫu CV Designer 03', link: '/cv18' },
    { image: '/src/assets/img/19.png', title: 'Mẫu CV Chi tiết 02', link: '/cv19' },
    { image: '/src/assets/img/cv20.png', title: 'Mẫu CV Kế toán', link: '/cv20' },
    { image: '/src/assets/img/cv21.png', title: 'Mẫu CV Ngân hàng', link: '/cv21' },
    { image: '/src/assets/img/cv22.png', title: 'Mẫu CV Bác sĩ', link: '/cv22' },
];

const currentPage = ref(1);
const itemsPerPage = 6;

const totalPages = computed(() => {
    return Math.ceil(cvItems.length / itemsPerPage);
});

const paginatedCVs = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return cvItems.slice(start, end);
});

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};
onMounted(() => {
    
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "admin") {
        authState.isAdmin = true;
    }
    const toastMessage = localStorage.getItem("loginSuccess");
    if (toastMessage) {
        toast.success(toastMessage); // Hiển thị thông báo
        localStorage.removeItem("loginSuccess"); // Xóa sau khi hiển thị
    }
    const auth = localStorage.getItem("auth");
    if (auth) {
        toast.error(auth); // Hiển thị thông báo
        localStorage.removeItem("auth"); // Xóa sau khi hiển thị
    }
});
</script>
<template>
    <div class="container">
        <div class="page-inner w-75 m-auto">
            <nav style="--bs-breadcrumb-divider: '>'" aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#">Trang chủ</a></li>
                    <li class="breadcrumb-item active" aria-current="page">
                        CV xin việc
                    </li>
                </ol>
            </nav>
            <h3 class="text-center text-uppercase">
                Mẫu CV Xin Việc online đẹp, tạo cv online và tải cv miễn phí ngay
            </h3>
            <div class="ribbon">
                <span>DANH SÁCH CV MẪU MỚI NHẤT</span>
            </div>

            <!-- Hiển thị các mẫu CV -->
            <div class="row">
                <div class="col-md-4" v-for="(cv, index) in paginatedCVs" :key="index">
                    <div class="card mb-4">
                        <img :src="cv.image" class="" alt="CV" style="width: 100%; display: block" />
                        <div class="card-body" style="background-color: #f7f7f7; padding: 20px">
                            <h5 class="card-title mb-3" style="font-family: 'Roboto', sans-serif; font-weight: bold">
                                {{ cv.title }}
                            </h5>
                            <router-link :to="cv.link" class="btn btn-primary w-100" style="
                  background-color: #007bff;
                  color: white;
                  font-weight: bold;
                ">
                                Sử dụng mẫu này
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Điều khiển phân trang sử dụng Bootstrap -->
            <nav v-if="cvItems.length > itemsPerPage" aria-label="Page navigation">
                <ul class="pagination justify-content-center">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                            Trước
                        </button>
                    </li>
                    <li class="page-item" v-for="page in totalPages" :key="page"
                        :class="{ active: page === currentPage }">
                        <button class="page-link" @click="changePage(page)">
                            {{ page }}
                        </button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <button class="page-link" @click="changePage(currentPage + 1)"
                            :disabled="currentPage === totalPages">
                            Tiếp
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<style scoped>
.ribbon {
    margin: 30px 0;
    display: inline-block;
    background-color: #2d4b8b;
    /* Màu xanh đậm */
    color: #fff;
    /* Màu chữ trắng */
    font-size: 14px;
    font-weight: bold;
    padding: 8px 16px;
    position: relative;
    text-transform: uppercase;
}

.ribbon span {
    display: inline-block;
}

.pagination .page-item.active .page-link {
    background-color: #007bff;
    /* Màu nền khi trang hiện tại */
    border-color: #007bff;
    /* Đổi màu border khi trang hiện tại */
}
</style>
