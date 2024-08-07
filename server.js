// Подключение необходимых пакетов
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
// const axios = require('axios');
const bcrypt = require('bcrypt');

const app = express();

// Настройка middleware для обработки запросов тела
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Настройка CORS
app.use(cors({ origin: ['http://localhost:5173', 'http://185.119.56.165', 'http://185.119.56.165:5173'] }));

// Подключение к базе данных MongoDB
try {
    mongoose.connect('mongodb://127.0.0.1:27017/MSHP_library');
    console.log('success connection');
}
catch (error) {
    console.log('Error connection: ' + error);
}

// Схема пользователя
const UserSchema = new mongoose.Schema({
    name: String,
    lastName: String,
    telegram: String,
    login: String,
    password: String,
    status: String,
    role: String,
    borrowedBooks: [{
        bookID: String,
        title: String,
        startDate: String,
        endDate: String
    }]
});

// Схема книги
const BookSchema = new mongoose.Schema({
    title: String,
    place: Object,
    status: String,
    userLogin: String
});

// Модели для БД
const User = mongoose.model('User', UserSchema); // модель пользователя
const Book = mongoose.model('Book', BookSchema); // модель книги

// Роутинг
// Роут входа в приложение
app.post('/api/users/login', async (req, res) => {
    try {
        console.info("Вызван роут обработки входа в приложение");
        const { login, password } = req.body;
        const user = await User.findOne({ login });
        if (!user) {
            return res.status(401).send('Такого логина нет');
        }

        // Сравнение введенного пароля с сохраненным хэшем
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send('Неправильный пароль');
        }

        // Здесь может быть логика для генерации токена доступа и отправки его клиенту
        res.status(200).send({ success: true, message: 'Успешный вход', role: user.role, login: user.login, status: user.status });
    } catch (error) {
        res.status(500).send('Произошла ошибка при входе');
    }
});

// Роут регистрации нового пользователя
app.post('/api/users/register', async (req, res) => {
    try {
        console.info("Вызван роут регистрации нового пользователя");
        const { name, lastName, telegram, login, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).send({ success: false, message: 'Пароли не совпадают' });
        }

        // Проверка, существует ли пользователь с таким логином
        const existingUser = await User.findOne({ login });
        if (existingUser) {
            // Пользователь с таким логином уже существует, возвращаем сообщение об ошибке
            return res.status(409).send({ success: false, message: 'Пользователь с таким логином уже существует' });
        }

        // Шифрование пароля с использованием bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            name,
            lastName,
            telegram,
            login,
            password: hashedPassword,
            status: "active", // новый пользователь сразу становится активным читателем
            role: "reader",
            borrowedBooks: []
        });
        await newUser.save();
        // Здесь может быть логика для генерации токена доступа и отправки его клиенту
        res.status(201).send({ success: true, message: 'Успешная регистрация' });
    } catch (error) {
        res.status(500).send({ success: false, message: 'Произошла ошибка при регистрации' });
    }
});

// Роут добавления книг в БД
app.post('/api/books/add', async (req, res) => {
    try {
        console.info("Вызван роут для добавления книг в БД");
        const booksObj = JSON.parse(req.body.books);
        for (book of booksObj) {
            console.log(book);
            const newBook = new Book(book);
            await newBook.save()
        }
        res.status(200).send({ success: true, message: "Данные были приняты и сохранены в БД"});
    } catch (error) {
        res.status(500).send({ success: false, message: 'Произошла ошибка на сервере, пожалуйста, сообщите разработчику о проблеме' });
    }
});

// Роут удаления книг из БД
app.delete('/api/book/delete/:bookId', async(req, res) => {
    try {
        console.info("Вызван роут для удаления книги из БД");
        const { bookId } = req.params; // Получаем данные из тела запроса
        await Book.findByIdAndDelete(bookId);
        res.status(200).send(
            {
                success: true, 
                message: "Книга успешно удалена из БД"
            }
        ); // Возвращаем обновленные данные книги и пользователя
    } catch (error) {
        res.status(500).send({success: false, message: error});
    }
})

// Роут получения свободных книг
app.get('/api/books/free', async (req, res) => {
    console.info("Вызван роут для отправки списка свободных книг");
    let data = [];
    data.push(
        await Book.find({
            status: {$eq: 'free'}
        })
    );

    res.status(200).send(data);
});

// Роут получения занятых книг
// К каждой занятой книге добавляется информация в виде полного имени пользователя и его телеграм
app.get('/api/books/not-free', async (req, res) => {
    console.info("Вызван роут для отправки списка книг, которые нельзя удалить, т.к. они заняты");
    let data = [];
    let notFreeBooks = await Book.find({
        status: {$eq: 'not-free'}
    });

    for (let i = 0; i < notFreeBooks.length; i++) {
        let user = await User.findOne({login: {$eq: notFreeBooks[i].userLogin}});
        notFreeBooks[i] = notFreeBooks[i].toObject();
        notFreeBooks[i].telegram = user.telegram;
        notFreeBooks[i].fullName = `${user.lastName} ${user.name}`;
    }
    data.push(notFreeBooks);
    res.status(200).send(data);
});

// Роут получения арендованных книг для страницы читателя
app.get('/api/user/borrowed-books', async (req, res) => {
    try {
        console.info("Вызван роут для отправки списка арендованных книг конкретным читателем");
        const userLogin = req.query.login;
        const borrowedBooks = [];
        const userOdj = await User.find({
            login: {$eq: userLogin}
        });
        borrowedBooks.push(userOdj[0].borrowedBooks);
        res.status(200).send(borrowedBooks);
    } catch (error) {
        res.status(500).send({message: "Ошибка на стороне сервера. Попробуйте ещё раз или сообщите разработчику!"})
    }
});

// Роут, обрабатывающий аренду книги пользователем
// Функция для обновления статуса книги и записи необходимой информации в документ конкретного пользователя
async function updateBookAndUser(bookId, userLogin) {
    try {
        // Обновление статуса книги
        const book = await Book.findByIdAndUpdate(bookId, { $set: { status: 'not-free', userLogin } }, { new: true });
        if (!book) {
            throw new Error('Книга не найдена');
        }
        // Обновление документа пользователя
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000); // Добавляем 14 дней
        
        // Форматируем дату и время
        const formattedStartDate = 
            startDate.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
            startDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });
        const formattedEndDate = 
            endDate.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
            endDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });
        const user = await User.findOneAndUpdate(
            { login: userLogin }, 
            { $push: { 
                borrowedBooks: { 
                    bookID: bookId, title: book.title, startDate: formattedStartDate, endDate: formattedEndDate 
                } 
            } }, 
            { new: true }
        );
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        return { book, user };
    } catch (error) {
        console.error(error);
        throw error;
    }
}
app.put('/api/user/borrow-book', async (req, res) => {
    try {
        console.info("Вызван роут аренды книги пользователем");
        const { bookId, login } = req.body.params; // Получаем данные из тела запроса
        await updateBookAndUser(bookId, login);
        res.status(200).send(
            {
                success: true, 
                message: "Книга успешно арендована пользователем на 2 недели"
            }
        ); // Возвращаем обновленные данные книги и пользователя
    } catch (error) {
        res.status(500).send({success: false, message: error});
    }
});

// Роут, обрабатывающий возврат книги пользователем из аренды
// Функция для обновления статуса книги и записи необходимой информации в документ конкретного пользователя
async function returnBook(bookId, userLogin) {
    try {
        // Обновление статуса книги
        const book = await Book.findByIdAndUpdate(bookId, { $set: { status: 'free', userLogin: "" } }, { new: true });
        if (!book) {
            throw new Error('Книга не найдена');
        }
        // Обновление документа пользователя
        const user = await User.findOneAndUpdate({ login: userLogin }, { $pull: { borrowedBooks: { bookID: bookId } } }, { new: true });
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        return { book, user };
    } catch (error) {
        console.error(error);
        throw error;
    }
}
app.put('/api/user/return-book', async (req, res) => {
    try {
        console.info("Вызван роут возврата арендованной книги пользователем");
        const { bookId, login } = req.body.params; // Получаем данные из тела запроса
        await returnBook(bookId, login);
        res.status(200).send({success: true, message: "Книга успешно вернулась в библиотеку"}); // Возвращаем обновленные данные книги и пользователя
    } catch (error) {
        res.status(500).send({success: false, message: error});
    }
});

// Роут получения читателей и необходимых данных для страницы "Управление читателями"
app.get('/api/users', async(req, res) => {
    try {
        console.info("Вызван роут выдачи списка пользователей");
        const users = await User.find({}, 'name lastName telegram status borrowedBooks role');
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({success: false, message: error});
    }
});

// Роут обработки возврата книги со страницы "Управление читателями"
async function returnUserBook(bookId, userId) {
    try {
        // Обновление статуса книги
        const book = await Book.findByIdAndUpdate(bookId, { $set: { status: 'free', userLogin: "" } }, { new: true });
        if (!book) {
            throw new Error('Книга не найдена');
        }
        // Обновление документа пользователя
        const user = await User.findOneAndUpdate({ _id: userId }, { $pull: { borrowedBooks: { bookID: bookId } } }, { new: true });
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        return { book, user };
    } catch (error) {
        console.error(error);
        throw error;
    }
}
app.put('/api/users/return-book', async (req, res) => {
    try {
        console.info("Вызван роут возврата арендованной книги пользователем из управления читателями");
        const { bookId, userId } = req.body.params; // Получаем данные из тела запроса
        await returnUserBook(bookId, userId);
        res.status(200).send({success: true, message: "Книга успешно вернулась в библиотеку"}); // Возвращаем обновленные данные книги и пользователя
    } catch (error) {
        res.status(500).send({success: false, message: error});
    }
});

// Роут деактивации пользователя со страницы "Управление читателями"
app.put('/api/user/deactivate', async (req, res) => {
    try {
        console.info("Вызван роут деактивации пользователя");
        const { userId } = req.body.params;
        await User.findByIdAndUpdate(userId, { $set: { status: 'deactivated' } }, { new: true });
        res.status(200).send({success: true, message: "Пользователь деактивирован"});
    } catch (error) {
        res.status(500).send({success: false, message: error});
    }
});

// Роут акктивации пользователя со страницы "Управление читателями"
app.put('/api/user/activate', async (req, res) => {
    try {
        console.info("Вызван роут активации пользователя");
        const { userId } = req.body.params;
        await User.findByIdAndUpdate(userId, { $set: { status: 'active' } }, { new: true });
        res.status(200).send({success: true, message: "Пользователь активирован"});
    } catch (error) {
        res.status(500).send({success: false, message: error});
    }
});

// Роут акктивации пользователя со страницы "Управление читателями"
app.delete('/api/user/delete/:userId', async (req, res) => {
    try {
        console.info("Вызван роут удаления пользователя");
        const { userId } = req.params;
        await User.findByIdAndDelete(userId);
        res.status(200).send({success: true, message: "Пользователь удалён"});
    } catch (error) {
        res.status(500).send({success: false, message: error});
    }
});

// Запуск сервера
app.listen(3000, () => console.log('Server started on port 3000'));