<script>
export default {
    data() {
        return {}
    },
    methods: {}
}
</script>

<template>
    <div class="container">
        <h1 class="mt-5 mb-5 text-center">Панель управления библиотекаря</h1>
        <div class="gap-2 d-flex justify-content-center flex-wrap">
            <button class="btn btn-primary btn-lg square-button" @click="$router.push('/add-books')">
                Добавить книги
            </button>
            <button class="btn btn-danger btn-lg square-button" @click="$router.push('/delete-books')">
                Удалить книги
            </button>
            <button class="btn btn-warning btn-lg square-button" @click="$router.push('/readers-managment')">
                Управление читателями
            </button>
        </div>
    </div>
</template>

<style>
.square-button {
    width: 200px;
    height: 200px;
    border-radius: 10px;
    padding: 0;
    font-size: 1.5rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (max-width: 768px) {
    .square-button {
        width: 100%;
        height: 100px;
    }
}
</style>