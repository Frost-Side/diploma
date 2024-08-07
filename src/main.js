import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import router from './router.js'

const store = createStore({
    state: {
        userRole: 'guest',
        userLogin: '',
        userStatus: '',
        isAuthenticated: false
    },
    mutations: {
        SET_USER_ROLE(state, role) {
            state.userRole = role;
        },
        SET_USER_LOGIN(state, login) {
            state.userLogin = login;
        },
        SET_USER_STATUS(state, status) {
            state.userStatus = status;
        },
        SET_IS_AUTHENTICATED(state, authenticated) {
            state.isAuthenticated = authenticated;
        },
        initialiseStore(state) {
            if (localStorage.getItem('store')) {
                this.replaceState(
					Object.assign(state, JSON.parse(localStorage.getItem('store')))
				);
            }
        }
    },
    getters: {
        userRole: state => state.userRole,
        userLogin: state => state.userLogin,
        userStatus: state => state.userStatus,
        isAuthenticated: state => state.isAuthenticated
    },
    actions: {
        setUserRole(context, role) {
            context.commit('SET_USER_ROLE', role);
        },
        setUserLogin(context, login) {
            context.commit('SET_USER_LOGIN', login);
        },
        setUserStatus(context, status) {
            context.commit('SET_USER_STATUS', status);
        },
        setIsAuthenticated(context, authenticated) {
            context.commit('SET_IS_AUTHENTICATED', authenticated);
        }
    }
});

store.subscribe((mutation, state) => {
    localStorage.setItem('store', JSON.stringify(state));
});

const app = createApp(App)
    .use(store)
    .use(router)
    .mount('#app')

export { app, store }