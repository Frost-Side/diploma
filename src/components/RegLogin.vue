<script>
import axios from 'axios';
import { mapState, mapMutations } from 'vuex';
export default {
    data() {
        return {
            login: '',
            password: '',
            name: '',
            lastName: '',
            telegram: '',
            confirmPassword: '',
            state: 'вход', // Начальное состояние формы
            // Ниже свойства для валидации формы входа:
            formLoginLoginError: '',
            formLoginPasswordError: ''
        };
    },
    computed: {
        ...mapState(['userRole', 'userLogin', 'userStatus', 'isAuthenticated'])
    },
    methods: {
        ...mapMutations([
            'SET_USER_ROLE',
            'SET_USER_LOGIN',
            'SET_USER_STATUS',
            'SET_IS_AUTHENTICATED'
        ]),
        handleLogin() {
            const login = this.login;
            const password = this.password;

            this.formLoginLoginError = '';
            this.formLoginPasswordError = '';

            axios.post(`/api/users/login`, {
                login,
                password
            })
                .then(response => {
                if (response.data.success) {
                    // Успешный вход, перенаправление или другое действие
                    console.log('Успешный вход');
                    this.clearForm();

                    // Сохраняем данные пользователя в Vuex
                    this.$store.dispatch('setUserRole', response.data.role);
                    this.$store.dispatch('setUserLogin', response.data.login);
                    this.$store.dispatch('setUserStatus', response.data.status);
                    this.$store.dispatch('setIsAuthenticated', true);

                    // В зависимости от роли перенапрвляем пользователя на нужный роут
                    if (this.$store.state.userRole === 'reader') {
                        this.$router.push('/reader-page');
                    } else if (this.$store.state.userRole === 'librarian' || this.$store.state.userRole === 'admin') {
                        this.$router.push('/control-panel');
                    }
                } else {
                    // Ошибка входа, показать сообщение об ошибке
                    console.error('Ошибка входа');
                }
                })
                .catch(error => {
                    console.error('Произошла ошибка при входе:', error.response.data);
                    if (error.response.data === 'Такого логина нет') {
                        this.formLoginLoginError = error.response.data;
                    } else {
                        this.formLoginPasswordError = error.response.data;
                    }
                    
                });
        },

        handleRegister() {
            const name = this.name;
            const lastName = this.lastName;
            const telegram = this.telegram;
            const login = this.login;
            const password = this.password;
            const confirmPassword = this.confirmPassword;

            axios.post(`/api/users/register`, {
                name,
                lastName,
                telegram,
                login,
                password,
                confirmPassword
            })
                .then(response => {
                    if (response.data.success) {
                        // Успешная регистрация, перенаправление или другое действие
                        console.log('Успешная регистрация');
                        this.clearForm();

                        // Сохраняем данные пользователя в Vuex
                        this.$store.dispatch('setUserRole', 'reader');
                        this.$store.dispatch('setUserLogin', login);
                        this.$store.dispatch('setUserStatus', 'active');
                        this.$store.dispatch('setIsAuthenticated', true);

                        this.$router.push('/reader-page');
                    } else {
                        // Ошибка регистрации, показать сообщение об ошибке
                        console.error('Ошибка регистрации');
                    }
                })
                .catch(error => {
                    console.error('Произошла ошибка при регистрации:', error.response.data.message);
                });
        },
        toggleState() {
            this.state = this.state === 'вход' ? 'регистрация' : 'вход';
            this.clearForm();
        },
        clearForm() {
            this.login = "";
            this.name = "";
            this.lastName = "";
            this.telegram = "";
            this.password = "";
            this.confirmPassword = "";
            this.formLoginLoginError = "";
            this.formLoginPasswordError = "";
        }
    }
};
</script>

<template>
    <div class="container">
        <h1 class="text-center mt-5 mb-5">Регистрация / Вход</h1>
        <div class="d-flex justify-content-center">
            <button @click="toggleState" class="btn btn-outline-primary">{{ state === 'вход' ? 'Переключиться на регистрацию' : 'Переключиться на вход'}}</button>
        </div>
        <div class="d-flex justify-content-center">
            <!-- Форма входа -->
            <form v-if="state === 'вход'" class="w-50 mt-5 mb-5" @submit.prevent="handleLogin">
                <div class="mb-3">
                    <label for="login" class="form-label">Логин</label>
                    <input type="text" id="login" class="form-control" :class="formLoginLoginError ? 'is-invalid' : ''"  placeholder="Введите Ваш логин..." v-model="login" required autocomplete="on">
                    <div class="invalid-feedback" v-if="formLoginLoginError != ''">
                        {{ formLoginLoginError }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Пароль</label>
                    <input type="password" id="password" class="form-control" :class="formLoginPasswordError ? 'is-invalid' : ''" placeholder="Введите Ваш пароль..." v-model="password" required autocomplete="on">
                    <div class="invalid-feedback" v-if="formLoginPasswordError != ''">
                        {{ formLoginPasswordError }}
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Войти</button>
                <button class="btn btn-secondary ms-2" disabled>Забыли пароль?</button>
            </form>

            <!-- Форма регистрации -->
            <form v-else-if="state === 'регистрация'" class="w-50 mt-5 mb-5" @submit.prevent="handleRegister">
                <div class="mb-3">
                    <label for="name" class="form-label">Имя</label>
                    <input type="text" id="name" class="form-control" placeholder="Введите Ваше имя..." v-model="name" required autocomplete="off">
                </div>
                <div class="mb-3">
                    <label for="lastName" class="form-label">Фамилия</label>
                    <input type="text" id="lastName" class="form-control" placeholder="Введите Вашу фамилию..." v-model="lastName" required autocomplete="off">
                </div>
                <div class="mb-3">
                    <label for="nickname" class="form-label">Никнейм в telegram</label>
                    <div class="input-group">
                        <span class="input-group-text" id="inputGroupPrepend3">@</span>
                        <input type="text" id="nickname" class="form-control" placeholder="Введите Ваш ник в Telegram без @..." v-model="telegram" required autocomplete="off">
                    </div>
                </div>
                <div class="mb-3">
                    <label for="login" class="form-label">Логин</label>
                    <input type="text" id="login" class="form-control" placeholder="Придумайте Ваш логин..." v-model="login" required autocomplete="off">
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Пароль</label>
                    <input type="password" id="password" class="form-control" placeholder="Придумайте Ваш пароль..." v-model="password" required autocomplete="off">
                </div>
                <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Подтверждение пароля</label>
                    <input type="password" id="confirmPassword" class="form-control" placeholder="Повторите Ваш пароль..." v-model="confirmPassword" required autocomplete="off">
                </div>
                <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
            </form>
        </div>
    </div>
</template>

<style></style>