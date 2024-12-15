import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
} from "vue-router";
import { toast } from "vue3-toastify";
import CV1 from "./components/client/pages/cv/CV1.vue";
import AddTemplate from "./components/pages/template/AddTemplate.vue";
import ListTemplate from "./components/pages/template/ListTemplate.vue";
import Detail from "./components/pages/template/Detail.vue";
import CV2 from "./components/client/pages/cv/CV2.vue";
import HomePage from "./components/client/HomePage.vue";
import Register from "./components/client/pages/Register.vue";
import Login from "./components/client/pages/Login.vue";

const routes = [
  {
    path: "/",
    component: () => import("./components/client/layout/IndexClient.vue"),
    children: [
      {
        path: "",
        component: () => import("./components/client/HomePage.vue"),
        name: "home",
      },
      {
        path: "register",
        component: () => import("./components/client/pages/Register.vue"),
        name: "register",
      },
      {
        path: "login",
        component: () => import("./components/client/pages/Login.vue"),
        name: "login",
      },
      {
        path: "cv1",
        component: () => import("./components/client/pages/cv/CV1.vue"),
        name: "cv1",
      },
      {
        path: "cv2",
        component: () => import("./components/client/pages/cv/CV2.vue"),
        name: "cv2",
      },
      {
        path: "cv3",
        component: () => import("./components/client/pages/cv/CV3.vue"),
        name: "cv3",
      },
      {
        path: "cv4",
        component: () => import("./components/client/pages/cv/CV4.vue"),
        name: "cv4",
      },
      {
        path: "cv5",
        component: () => import("./components/client/pages/cv/CV5.vue"),
        name: "cv5",
      },
      {
        path: "cv6",
        component: () => import("./components/client/pages/cv/CV6.vue"),
        name: "cv6",
      },
      {
        path: "cv7",
        component: () => import("./components/client/pages/cv/CV7.vue"),
        name: "cv7",
      },
      {
        path: "cv8",
        component: () => import("./components/client/pages/cv/CV8.vue"),
        name: "cv8",
      },
      {
        path: "cv9",
        component: () => import("./components/client/pages/cv/CV9.vue"),
        name: "cv9",
      },
      {
        path: "cv10",
        component: () => import("./components/client/pages/cv/CV10.vue"),
        name: "cv10",
      },
      {
        path: "cv11",
        component: () => import("./components/client/pages/cv/CV11.vue"),
        name: "cv11",
      },
      {
        path: "cv12",
        component: () => import("./components/client/pages/cv/CV12.vue"),
        name: "cv12",
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("./components/admin/layout/Index.vue"),
    children: [
      {
        path: "",
        component: () => import("./components/admin/Dashboard.vue"),
        name: "adminHome",
      },
      {
        path: "users",
        component: () => import("./components/admin/pages/user/ListUsers.vue"),
        name: "ListUser",
      },
      {
        path: "add",
        component: () => import("./components/admin/pages/user/AddUser.vue"),
        name: "AddUser",
      },
      {
        path: "edit/:id",
        component: () => import("./components/admin/pages/user/EditUser.vue"),
        name: "EditUser",
      },
      {
        path: "cv",
        component: () => import("./components/admin/pages/cv/ListCV.vue"),
        name: "ListCV",
      },
      {
        path: "cv/:cvId",
        component: () => import("./components/admin/pages/cv/Detail.vue"),
        name: "CVDetail",
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
// Navigation Guard
router.beforeEach((to, from, next) => {
  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Kiểm tra quyền truy cập vào route `/admin`
  if (to.path.startsWith("/admin")) {
    if (user && user.role === "admin") {
      next(); // Cho phép tiếp tục nếu là admin
    } else {
      toast.error("Bạn không có quyền truy cập!");
      next("/login"); // Chuyển hướng về trang chủ
    }
  } else {
    next(); // Cho phép các route khác
  }
});

export default router;
