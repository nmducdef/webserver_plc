// login.js
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const path = require('path');

// Sử dụng cookie-parser middleware
router.use(cookieParser());

// Hiển thị trang login hoặc chuyển đến trang home nếu đã đăng nhập
router.get('/', (req, res) => {
    if (req.cookies.loggedIn === 'true') {
        res.redirect('/home'); // Chuyển đến home nếu đã đăng nhập
    } else {
      // Hiển thị trang login nếu chưa đăng nhập
      res.sendFile(path.join(__dirname, '..', '..', 'views', 'login.html'));

    }
});

// Xử lý đăng nhập
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin' && password === '123') {
        // Lưu trạng thái đăng nhập vào cookie
        res.cookie('loggedIn', 'true', { httpOnly: true, maxAge: 3600000 }); // cookie kéo dài 1 giờ
        res.redirect('/home');
    } else {
        res.send('Sai tên đăng nhập hoặc mật khẩu! <a href="/">Quay lại</a>');
    }
});

// Xử lý đăng xuất
router.get('/logout', (req, res) => {
    res.clearCookie('loggedIn'); // Xóa cookie đăng nhập
    res.redirect('/'); // Chuyển về trang login
});

module.exports = router;
