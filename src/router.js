import { createRouter, createMemoryHistory, createWebHistory } from "vue-router";
import Dashboard from "./components/Dashboard.vue";
import CV1 from "./components/pages/cv/CV1.vue";
import AddTemplate from "./components/pages/template/AddTemplate.vue";
import ListTemplate from "./components/pages/template/ListTemplate.vue";
import Detail from "./components/pages/template/Detail.vue";
import CV2 from "./components/pages/cv/CV2.vue";
import HomePage from "./components/client/HomePage.vue";
import Register from "./components/client/pages/Register.vue";
import Login from "./components/client/pages/Login.vue";

const routes = [
    {
        path: '/',
        // component: Dashboard,
        component: HomePage,

    },
    {
        path: '/register',
        // component: Dashboard,
        component: Register,

    },
    {
        path: '/login',
        // component: Dashboard,
        component: Login,

    },
    {
        path: '/cv1',
        component: CV1,
    },
    {
        path: '/cv2',
        component: CV2,
    },
    {
        path: '/templates',
        component: ListTemplate,
    },
    {
        path: '/templates/add',
        component: AddTemplate,
    },
    {
        path: '/templates/:id',
        component: Detail,
    },
    // {
    //     path: '/products/add',
    //     component: AddProduct,
    // },
    // {
    //     path: '/products/edit/:id', 
    //     component: EditProducts, 
    // },
    // {
    //     path: '/orders',
    //     component: ListOrders,
    // },
    // {
    //     path: '/orders/add',
    //     component: AddOrder,
    // },
    // {
    //     path: '/orders/edit/:id',
    //     component: EditOrder,
    // },
    // {
    //     path: '/users',
    //     component: ListUsers,
    // },
    // {
    //     path: '/users/add',
    //     component: AddUser,
    // },
    // {
    //     path: '/users/edit/:id',
    //     component: EditUser,
    // },
    // {
    //     path: '/login',
    //     component: Login,
    // },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;