<script>
import axios from 'axios';

export default {
    data() {
        return {
            users: [],
            openAccordionIndex: null, // Индекс открытого accordion'а
        };
    },
    methods: {
        async getUsers() {
            try {
                const response = await axios.get('/api/users');
                if (response.status === 200) {
                    this.users = response.data;
                } else {
                    console.error('Ошибка при получении списка пользователей: ', response.data.message);
                }
            } catch (error) {
                console.error('Ошибка при получении пользователей:', error);
            }
        },
        handleAccordionToggle(index) {
            // Если текущий accordion уже открыт, закрываем его
            if (this.openAccordionIndex === index) {
                this.openAccordionIndex = null;
            } else {
                // Открываем accordion и запоминаем его индекс
                this.openAccordionIndex = index;
            }
        },
        userHasActiveLoans(user) {
            return user.borrowedBooks.length > 0;
        },
        async deactivateUser(userId) {
            try {
                const response = await axios.put('/api/user/deactivate', {
                    params: {
                        userId: userId
                    }
                });
                if (response.status === 200) {
                    this.getUsers();
                }
            } catch (error) {
                console.error("Произошла ошибка на стороне сервера:", error.message);
            }
        },
        async activateUser(userId) {
            try {
                const response = await axios.put('/api/user/activate', {
                    params: {
                        userId: userId
                    }
                });
                if (response.status === 200) {
                    this.getUsers();
                }
            } catch (error) {
                console.error("Произошла ошибка на стороне сервера:", error.message);
            }
        },
        async deleteUser(userId) {
            try {
                const response = await axios.delete(`/api/user/delete/${userId}`);
                if (response.status === 200) {
                    this.getUsers();
                }
            } catch (error) {
                console.error("Произошла ошибка на стороне сервера:", error.message);
            }
        },
        async returnBook(bookId, userId) {
            try {
                const response = await axios.put('/api/users/return-book', {
                    params: {
                        bookId: bookId,
                        userId: userId
                    }
                });
                if (response.status === 200) {
                    this.getUsers();
                } else {
                    console.error("Произошла ошибка");
                } 
            } catch (error) {
                console.error("Произошла ошибка на стороне сервера:", error.message);
            }
        }
    },
    created() {
        this.getUsers();
    }
};
</script>

<template>
    <div class="container">
        <h1 class="mt-5 mb-5 text-center">Управление читателями</h1>
        <div class="card text-bg-info mb-3">
            <div class="card-header">Обратите внимание!</div>
            <div class="card-body">
                <h5 class="card-title">Информация про деактивацию или удаление пользователя</h5>
                <p class="card-text mb-0">Кнопка &laquo;Деактивировать&raquo; <b>не удаляет</b> читателя из базы данных, а лишь ограничает доступ к библиотеке</p>
                <p class="card-text mt-0">Кнопка &laquo;Удалить&raquo; <b>полностью удаляет</b> пользователя из базы данных</p>
            </div>
        </div>
        <p class="text-center" v-if="users.length < 1">Нет читателей, которыми можно управлять</p>
        <div class="accordion" id="accordionExample" v-else>
            <div v-for="(user, index) in users" class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" 
                            type="button" 
                            data-bs-toggle="collapse"
                            :data-bs-target="'#id' + index" 
                            aria-expanded="false" 
                            :aria-controls="'#id' + index" >
                        {{ user.name }} {{  user.lastName }}
                    </button>
                </h2>
                
                <div :id="'id' + index" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                    <div class="accordion-body">
                        <div class="card text-bg-danger mb-3" v-if="user.role === 'admin' || user.role === 'librarian'">
                            <div class="card-header">Обратите внимание!</div>
                            <div class="card-body">
                                <h5 class="card-title">Информация про деактивацию или удаление пользователя</h5>
                                <p class="card-text mb-0">Данный пользователь является библиотекарем или администратором</p>
                                <p class="card-text mt-0">Процесс деактивации или удаления такого пользователя полностью недоступен</p>
                            </div>
                        </div>
                        <div class="card text-bg-warning mb-3" v-if="user.borrowedBooks.length > 0 && user.role === 'reader'">
                            <div class="card-header">Обратите внимание!</div>
                            <div class="card-body">
                                <h5 class="card-title">Информация про деактивацию или удаление пользователя</h5>
                                <p class="card-text mb-0">На текущий момент у пользователя есть арендованные книги</p>
                                <p class="card-text mt-0">Процесс деактивации или удаления недоступен до момента, пока книги не будут возвращены</p>
                                <p class="card-text mt-0">Вы можете отметить ниже в таблице книги, которые возвращены</p>
                            </div>
                        </div>
                        <div class="d-flex justify-content-center gap-3" v-if="user.role === 'reader'">
                            <button v-if="user.status === 'active'" @click="deactivateUser(user._id)" :disabled="userHasActiveLoans(user)"
                                class="btn btn-warning">Деактивировать</button>
                            <button v-else @click="activateUser(user._id)" class="btn btn-success">Активировать</button>
                            <button @click="deleteUser(user._id)" :disabled="userHasActiveLoans(user)"
                                class="btn btn-danger">Удалить</button>
                        </div>
                        <div class="borrowed-books" v-if="user.borrowedBooks.length > 0">
                            <h3>Арендованные книги пользователем:</h3>
                            <table  class="table table-striped table-bordered mt-3">
                                <thead>
                                    <tr>
                                        <th class="">Название</th>
                                        <th class="text-center">Дата взятия</th>
                                        <th class="text-center">Дата возврата</th>
                                        <th class="text-center">Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="book in user.borrowedBooks">
                                        <td class="align-middle">{{ book.title }}</td>
                                        <td class="text-center align-middle">{{ book.startDate }}</td>
                                        <td class="text-center align-middle">{{ book.endDate }}</td>
                                        <td class="text-center align-middle"><button class="btn btn-primary" @click="returnBook(book.bookID, user._id)">Возвращено</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p v-else class="mt-3 text-center">У пользователя нет арендованных книг</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style></style>