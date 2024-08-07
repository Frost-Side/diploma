<script>
import axios from "axios";
export default {
    data() {
        return {
            booksStillWithUsers: [], // книги, у которых в БД не пустое поле userID
            booksToRemove: [] // книги, у которых в БД пустое поле userID и значение "free" у поля status
        };
    },
    methods: {
        async getFreeBooks() {
            try {
                const response = await axios.get('/api/books/free');
                this.booksToRemove = response.data[0];
            } catch (error) {
                console.error(error.message);
            }
        },
        async getBorrowedBooks() {
            try {
                const response = await axios.get('/api/books/not-free');
                this.booksStillWithUsers = response.data[0];
            } catch (error) {
                console.error(error.message);
            }
        },
        async handleDeleteBook(bookId) {
            try {
                const response = await axios.delete(`/api/book/delete/${bookId}`);
                if (response.status === 200) {
                    this.getFreeBooks();
                    this.getBorrowedBooks();
                } else {
                    console.error('Ошибка при удалении книги: ', response.data.message)
                }
            } catch (error) {
                console.error(error.message);
            }
        }
    },
    created() {
        this.getFreeBooks();
        this.getBorrowedBooks();
    }
};
</script>

<template>
    <div class="container">
        <h1 class="mt-5 mb-5 text-center">Удаление книг из базы данных</h1>
        <h2 class="mb-3">Книги, которые ещё у пользователей</h2>
        <p class="mb-3" v-if="booksStillWithUsers.length < 1">Ни одной книги у читателей нет</p>
        <table class="table table-hover table-striped table-bordered" v-else>
            <thead>
                <tr>
                    <th scope="col" class="w-50">Название</th>
                    <th scope="col" class="text-center">Читатель</th>
                    <th scope="col" class="text-center">Телеграм читателя</th>
                </tr>
            </thead>
            <tbody>
                <!-- Данные для таблицы -->
                <tr v-for="book in booksStillWithUsers">
                    <td class="align-middle">{{ book.title }}</td>
                    <td class="text-center align-middle">{{ book.fullName }}</td>
                    <td class="text-center align-middle"><a :href="'https://t.me/' + book.telegram" target="_blank">@{{ book.telegram }}</a></td>
                </tr>
            </tbody>
        </table>
        <hr />
        <h2 class="mt-4 mb-3">Книги, которые можно удалить</h2>
        <p v-if="booksToRemove.length < 1">Нет книг, которые можно удалить из базы данных</p>
        <table class="table table-hover table-striped table-bordered" v-else>
            <thead>
                <tr>
                    <th scope="col" class="w-50">Название</th>
                    <th scope="col" class="text-center">Расположение</th>
                    <th scope="col" class="text-center">Действия</th>
                </tr>
            </thead>
            <tbody>
                <!-- Данные для таблицы -->
                <tr v-for="book in booksToRemove">
                    <td class="align-middle">{{ book.title }}</td>
                    <td class="text-center align-middle">Шкаф: {{ book.place.shelf }}, Ряд: {{ book.place.row }}, Полка: {{ book.place.position }}</td>
                    <td class="text-center align-middle">
                        <button class="btn btn-danger" @click="handleDeleteBook(book._id)">Удалить</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>