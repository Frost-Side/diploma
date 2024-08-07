<script>
import { store } from '../main.js'
import axios from 'axios';
export default {
    data() {
        return {
            borrowedBooks: [],
            availableBooks: [],
            overdueBooks: false,
            borrowedLimit: false
        };
    },
    methods: {
        async getAvailableBooks() {
            try {
                const response = await axios.get('/api/books/free');
                if (response.status === 200) {
                    this.availableBooks = response.data[0];
                } else {
                    console.error('Ошибка при получении списка свободных книг: ', response.data.message);
                }
            } catch (error) {
                console.error(error.message);
            }
        },
        async getBorrowedBooks() {
            try {
                const response = await axios.get('/api/user/borrowed-books', {
                    params: {
                        login: store.state.userLogin
                    }
                });
                if (response.status === 200) {
                    this.borrowedBooks = response.data[0];
                    if (this.borrowedBooks.length >= 5) {
                        this.borrowedLimit = true;
                    }
                } else {
                    console.error('Ошибка при получении списка арендованных книг: ', response.data.message);
                }
            } catch (error) {
                console.error(error.response.message);
            }
        },
        async returnBook(bookId) {
            try {
                const response = await axios.put('/api/user/return-book', {
                    params: {
                        login: store.state.userLogin,
                        bookId: bookId
                    }
                });
                if (response.status === 200) {
                    await this.getAvailableBooks();
                    await this.getBorrowedBooks();
                    if (this.borrowedBooks.length < 5) {
                        this.borrowedLimit = false;
                    }
                    this.overdueBooks = false;
                } else {
                    console.error('Ошибка при обновлении списков книг на странице: ', response.data.message);
                }
            } catch (error) {
                console.error(error.response.message);
            }
        },
        async rentBook(bookId) {
            try {
                const response = await axios.put('/api/user/borrow-book', {
                    params: {
                        login: store.state.userLogin,
                        bookId: bookId
                    }
                });
                if (response.status === 200) {
                    await this.getAvailableBooks();
                    await this.getBorrowedBooks();
                    if (this.borrowedBooks.length >= 5) {
                        this.borrowedLimit = true;
                    }
                    this.overdueBooks = false;
                } else {
                    console.error('Ошибка при обновлении списков книг на странице: ', response.data.message);
                }
            } catch (error) {
                console.error(error.response.message);
            }
        },
        overdueCheck(bookEndDate) {
            let nowDate = new Date();

            const formattedStartDate = 
            nowDate.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
            nowDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });

            let [date, time] = formattedStartDate.split(' ');
            let [day, month, year] = date.split('.');
            let [hours, minutes] = time.split(':');
            nowDate = new Date(year, month-1, day, hours, minutes);

            [date, time] = bookEndDate.split(' ');
            [day, month, year] = date.split('.');
            [hours, minutes] = time.split(':');
            const returnDate = new Date(year, month-1, day, hours, minutes);

            if (returnDate < nowDate) {
                this.overdueBooks = true;
                return true;
            }
        },
        borrowLimit() {

        }
    },
    created() {
        this.getAvailableBooks();
        this.getBorrowedBooks();
    }
};
</script>

<template>
    <div class="container">
        <h1 class="mt-5 mb-5 text-center">Страница читателя</h1>
        <hr>
        <div class="card text-bg-info mb-3">
            <div class="card-header">Обратите внимание!</div>
            <div class="card-body">
                <h5 class="card-title">Информация про аренду книг</h5>
                <p class="card-text mb-0">Одновременно можно взять <b>не более 5 книг</b>.</p>
            </div>
        </div>
        <hr>
        <h2 class="mt-5 mb-4">Ваши взятые книги</h2>
        <div class="card text-bg-danger mb-3" v-if="overdueBooks && borrowedBooks.length !== 0">
            <div class="card-header">Обратите внимание!</div>
            <div class="card-body">
                <h5 class="card-title">Информация про просроченные книги</h5>
                <p class="card-text mb-0">Просроченные книги вы сможете обнаружить по подсвеченным столбцам <b>Дата возврата</b>.</p>
                <p class="card-text mt-0">Если книгу не вернуть, то Ваша <b>учётная запись будет деактивирована</b> и <b>будет вынесено служебное предупреждение</b>.</p>
            </div>
        </div>
        <div class="table-responsive" v-if="borrowedBooks.length > 0">
            <table class="table table-hover table-bordered">
                <thead>
                    <tr>
                        <th scope="col">Название</th>
                        <th scope="col" class="text-center">Дата взятия</th>
                        <th scope="col" class="text-center">Дата возврата</th>
                        <th scope="col" class="text-center">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="book in borrowedBooks">
                        <td class="align-middle">{{ book.title }}</td>
                        <td class="text-center align-middle">{{ book.startDate }}</td>
                        <td class="text-center align-middle" :class="overdueCheck(book.endDate) ? 'table-danger' : ''">{{ book.endDate }}</td>
                        <td class="text-center align-middle">
                            <button class="btn btn-primary"
                                @click="returnBook(book.bookID)">Возвращено</button>
                            </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="mt-4" v-else>Взятых книг у Вас пока нет.</p>

        <h2 class="mt-5 mb-4">Доступные книги в библиотеке</h2>
        <div class="content" v-if="availableBooks.length > 0">
            <div class="card text-bg-warning mb-3">
                <div class="card-header">Обратите внимание!</div>
                <div class="card-body">
                    <h5 class="card-title">Информация про срок аренды книги</h5>
                    <p class="card-text mb-0">На текущий момент книга берётся строго на <b>2 недели</b>.</p>
                    <p class="card-text mt-0">В будущем срок аренды книги будет с выбором на определённый срок: от 1 до 8 недель.</p>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover table-bordered">
                    <thead>
                        <tr>
                            <th scope="col" class="w-50">Название</th>
                            <th scope="col" class="text-center">Расположение</th>
                            <th scope="col" class="text-center">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="book in availableBooks">
                            <td class="align-middle">{{ book.title }}</td>
                            <td class="text-center align-middle">Шкаф: {{ book.place.shelf }}, Ряд: {{ book.place.row }}, Полка: {{ book.place.position }}</td>
                            <td class="text-center align-middle">
                                <button class="btn btn-primary"
                                    :disabled="borrowedLimit"
                                    @click="rentBook(book._id)">Арендовать</button>
                                </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <p class="mt-4" v-else>Доступных книг для аренды нет.</p>
    </div>
</template>

<style></style>