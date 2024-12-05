import { createRouter, createMemoryHistory, createWebHistory } from "vue-router";
import Dashboard from "./components/Dashboard.vue";
import CV1 from "./components/pages/CV1.vue";

const routes = [
    {
        path: '/',
        component: Dashboard,
    },
    {
        path: '/cv1',
        component: CV1,
    }
    // {
    //     path: '/categories/add',
    //     component: AddCategory,
    // },
    // {
    //     path: '/categories/edit/:id', 
    //     component: EditCategory, 
    // },
    // {
    //     path: '/products',
    //     component: ListProducts,
    // },
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