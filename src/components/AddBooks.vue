<script>
import axios from "axios";
export default {
    data() {
        return {
            formButtonText: "+ Добавить",
            showAddBookForm: false,
            books: [{ title: '', place: { shelf: '', row: '', position: ''}, status: 'free', userLogin: ''}],
        };
    },
    methods: {
        toggleAddBookForm() {
            if (!this.showAddBookForm) {
                this.showAddBookForm = true;
                this.formButtonText = "Закрыть форму"
            } else {
                this.showAddBookForm = false;
                this.formButtonText = "+ Добавить";
                this.clearForm();
            }
        },
        clearForm() {
            this.books = [{ title: '', place: { shelf: '', row: '', position: ''}, status: 'free', userLogin: ''}];
        },
        addBookRow() {
            this.books.push({ title: '', place: { shelf: '', row: '', position: ''}, status: 'free', userLogin: ''});
        },
        removeBook(index) {
            this.books.splice(index, 1);
        },
        async onSubmit() {
            // Проверка заполненности полей
            for (let i = 0; i < this.books.length; i++) {
                let book = this.books[i];
                if (!book.title || !book.place.shelf || !book.place.row || !book.place.position) {
                    alert("У Вас есть незаполненные поля, отправка на сервер не будет осуществлена");
                } else {
                    const formData = new FormData();
                    formData.append('books', JSON.stringify(this.books));
                    try {
                        const response = await axios.post("/api/books/add", formData, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        console.log("Данные успешно отправлены на сервер");
                        console.log("Ответ от сервера:", response.data.message)
                        this.toggleAddBookForm();
                    } catch (error) {
                        alert("Ошибка на стороне сервера:", error.message)
                        console.error("Ошибка при отправке данных:", error.message);
                    }
                }
            }
        }
    }
};
</script>

<template>
    <div class="container">
        <h1 class="mt-5 mb-5 text-center">Добавление книг в базу данных</h1>
        <div class="d-flex justify-content-center">
            <button @click="toggleAddBookForm" class="btn" :class="showAddBookForm ? 'btn-danger' : 'btn-primary'">{{
                formButtonText }}</button>
        </div>
        <div v-if="showAddBookForm" class="mt-3">
            <form @submit.prevent="onSubmit" method="POST" enctype="multipart/form-data">
                <div class="table-responsive">
                    <table class="table table-hover table-bordered">
                        <thead>
                            <tr>
                                <th class="w-50" scope="col">Название</th>
                                <th class="text-center" scope="col">Номер шкафа</th>
                                <th class="text-center" scope="col">Номер ряда</th>
                                <th class="text-center" scope="col">Номер полки</th>
                                <th v-if="books.length > 1" scope="col">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(book, index) in books" :key="index">
                                <td><input name="book-name" type="text" v-model="book.title" class="form-control" /></td>
                                <td><input name="book-shelfNumber" type="number" v-model="book.place.shelf"
                                        class="form-control" /></td>
                                <td><input name="book-rowNumber" type="number" v-model="book.place.row"
                                        class="form-control" /></td>
                                <td><input name="book-shelfPosition" type="number" v-model="book.place.position"
                                        class="form-control" /></td>
                                <!-- Добавляем крестик для удаления строки -->
                                <td v-if="books.length > 1" class="text-center">
                                    <button @click="removeBook(index)" class="btn btn-danger" type="button">×</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="d-flex justify-content-end">
                    <!-- Кнопка "Добавить ещё книгу" с выравниванием справа -->
                    <button @click="addBookRow" class="btn btn-secondary ms-2" type="button">Добавить ещё книгу</button>
                    <!-- Кнопка "Сохранить" с выравниванием справа и отступом -->
                    <button type="submit" class="btn btn-primary ms-2">Сохранить</button>
                </div>
            </form>
        </div>
    </div>
</template>

<style></style>