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
import CV13 from "./components/client/pages/cv/CV13.vue";
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
        path: "cv13",
        component: () => import("./components/client/pages/cv/CV13.vue"),
        name: "cv13",
      },
      {
        path: "cv14",
        component: () => import("./components/client/pages/cv/CV14.vue"),
        name: "cv14",
      },
      {
        path: "cv15",
        component: () => import("./components/client/pages/cv/CV15.vue"),
        name: "cv15",
      },
      {
        path: "cv16",
        component: () => import("./components/client/pages/cv/CV16.vue"),
        name: "cv16",
      },
      {
        path: "cv17",
        component: () => import("./components/client/pages/cv/CV17.vue"),
        name: "cv17",
      },
      {
        path: "cv18",
        component: () => import("./components/client/pages/cv/CV18.vue"),
        name: "cv18",
      },
      {
        path: "cv19",
        component: () => import("./components/client/pages/cv/CV19.vue"),
        name: "cv19",
      },
      {
        path: "cv20",
        component: () => import("./components/client/pages/cv/CV20.vue"),
        name: "cv20",
      },
      {
        path: "cv21",
        component: () => import("./components/client/pages/cv/CV21.vue"),
        name: "cv21",
      },
      {
        path: "cv22",
        component: () => import("./components/client/pages/cv/CV22.vue"),
        name: "cv22",
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
      next("/"); // Chuyển hướng về trang chủ
    }
  } else {
    next(); // Cho phép các route khác
  }
});

export default router;
