<script></script>

<template>
    <div class="container">
        <h1 class="text-center mt-5">Увы, Вы не можете попасть на данную страницу.</h1>
        <p class="text-center">Но Вы можете вернуться на главную страницу по кнопке ниже</p>
        <div class="d-grid gap-2 mt-5 mb-5">
            <button class="btn btn-primary btn-lg" @click="$router.push('/')">Вернуться на главную</button>
        </div>
    </div>
</template>