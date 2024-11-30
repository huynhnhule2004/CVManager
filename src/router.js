import { createRouter, createMemoryHistory } from "vue-router";
import Dashboard from "./components/Dashboard.vue";

const routes = [
    {
        path: '/',
        component: Dashboard,
    }
    // {
    //     path: '/categories',
    //     component: Categories,
    // },
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
    history: createMemoryHistory(),
    routes,
})

export default router;