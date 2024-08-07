import { createRouter, createWebHistory } from 'vue-router';
import { store } from './main.js'
import Welcome from './components/Welcome.vue';
import RegLogin from './components/RegLogin.vue';
import ControlPanel from './components/ControlPanel.vue';
import ReaderPage from './components/ReaderPage.vue';
import ReadersManagment from './components/ReadersManagment.vue';
import AddBooks from './components/AddBooks.vue';
import DeleteBooks from './components/DeleteBooks.vue';
import Deactivated from './components/Deactivated.vue';
import Forbidden from './components/Forbidden.vue';


const router = createRouter({
    // История переходов сохраняется
    history: createWebHistory(),

    // Роуты и компоненты
    routes: [
        {
            name: 'default',
            path: '/',
            component: Welcome
        },
        {
            name: 'reg-login',
            path: '/reg-login',
            component: RegLogin
        },
        {
            name: 'control-panel',
            path: '/control-panel',
            component: ControlPanel
        },
        {
            name: 'reader-page',
            path: '/reader-page',
            component: ReaderPage
        },
        {
            name: 'readers-managment',
            path: '/readers-managment',
            component: ReadersManagment
        }, 
        {
            name: 'add-books',
            path: '/add-books',
            component: AddBooks
        },
        {
            name: 'delete-books',
            path: '/delete-books',
            component: DeleteBooks
        },
        {
            name: "forbidden",
            path: "/forbidden",
            component: Forbidden
        },
        {
            name: "deactivated",
            path: "/deactivated",
            component: Deactivated
        },
        {
            name: "logout",
            path: "/logout"
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { x: 0, y: 0 }
        }
    }
});

router.beforeEach((to, from, next) => {
    const userRole = store.state.userRole;
    const userStatus = store.state.userStatus;
    const isAuthenticated = store.state.isAuthenticated;
    

    const guestPaths = ['/', '/reg-login', '/forbidden'];
    const librarianPaths = ['/', '/control-panel', '/readers-managment', '/add-books', '/delete-books', '/reader-page', '/forbidden'];
    const readerPaths = ['/', '/reader-page', '/forbidden'];
    const deactivatedPaths = ['/', '/deactivated'];

    // TODO: сделай перенаправление с forbidden на главную, если любой, кроме админа, захочет перейти по этому адресу
    if (!isAuthenticated && userRole === 'guest') {
        if (!guestPaths.includes(to.path) && !from.path.includes('/forbidden')) {
            next('/forbidden');
        } else if (guestPaths.includes(to.path)) {
            next();
        } else {
            return false
        }
    } else if (to.path === '/logout') {
        store.dispatch('setUserRole', 'guest');
        store.dispatch('setUserLogin', '');
        store.dispatch('setUserStatus', '');
        store.dispatch('setIsAuthenticated', false);
        next('/');
    } else if (userStatus === 'deactivated') {
        if (!deactivatedPaths.includes(to.path) && !from.path.includes('/deactivated')) {
            next('/deactivated');
        } else if (deactivatedPaths.includes(to.path)) {
            next();
        } else {
            return false
        }
    } else if (isAuthenticated && userRole === 'reader') {
        if (!readerPaths.includes(to.path) && !from.path.includes('/forbidden')) {
            next('/forbidden');
        } else if (readerPaths.includes(to.path)) {
            next();
        } else {
            return false
        }
    } else if (isAuthenticated && userRole === 'librarian') {
        if (!librarianPaths.includes(to.path) && !from.path.includes('/forbidden')) {
            next('/forbidden');
        } else if (librarianPaths.includes(to.path)) {
            next();
        } else {
            return false
        }
    } else if (isAuthenticated && userRole === 'admin') {
        next();
    } else {
        return false
    }
});

export default router