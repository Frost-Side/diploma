<script>
import { store } from '../main.js'
export default {

}
</script>

<template>
    <div class="container">
        <h1 class="mt-5 mb-5 text-center">Добро пожаловать в библиотечную информационную систему МШП</h1>
        <hr>
        <p class="lead"><b>В роли читателя Вы сможете:</b></p>
        <ul class="lead">
            <li>арендовать свободные книги из нашей библиотеки</li>
            <li>отслеживать уже арендованные Вами книги, чтобы успеть вовремя их вернуть</li>
        </ul>
        <p class="lead"><b>В роли библиотекаря Вы сможете:</b></p>
        <ul class="lead">
            <li>вносить новые книги в базу данных</li>
            <li>удалять их, если книг больше нет</li>
            <li>управлять читателями</li>
        </ul>
        <hr>
        <figure>
            <blockquote class="blockquote">
                <p>Чтобы воспользоваться нашей системой нужно зарегистрироваться или войти с логином и паролем, если он
                    у Вас уже есть.</p>
            </blockquote>
            <figcaption class="blockquote-footer">
                Разработчик системы, probably :D
            </figcaption>
        </figure>
        <hr v-if="!$store.state.isAuthenticated">
        <div class="d-grid gap-2 mt-5 mb-5" v-if="!$store.state.isAuthenticated">
            <button class="btn btn-primary btn-lg" @click="$router.push('/reg-login')">Войти /
                Зарегистрироваться</button>
        </div>
    </div>
</template>