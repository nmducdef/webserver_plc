////////////////////////////// HỆ THỐNG //////////////////////////////
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http'); 
const cookieParser = require('cookie-parser');

// Server HTTP cho Express
const appExpress = express();
const serverExpress = http.createServer(appExpress);

// Cấu hình ứng dụng Express
appExpress.use(express.static(path.join(__dirname, 'public')));
appExpress.use(bodyParser.urlencoded({ extended: true }));
appExpress.use(cookieParser());

// Kiểm tra đăng nhập cookies
function checkAuth(req, res, next) {
    if (req.cookies.loggedIn === 'true') {
        next();
    } else {
        res.redirect('/');
    }
}

// Định tuyến Express
const loginRoutes = require('./public/js/login');
appExpress.use('/', loginRoutes);

// Gọi trang home
appExpress.get(['/home', '/home.html'], checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Gọi trang chế độ bằng tay
appExpress.get(['/manu', '/manu.html'], checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'manu.html'));
});



////////////////////////////// CỔNG KẾT NỐI //////////////////////////////
// Lắng nghe cổng Express (3000)
serverExpress.listen(3000, () => {
    console.log('Express server chạy tại http://localhost:3000');
});




////////////////////////////// CỔNG KẾT NỐI //////////////////////////////
// Server HTTP cho Socket.IO
const socketIO = require('socket.io');
const appSocket = express();
const serverSocket = http.createServer(appSocket);
const io = socketIO(serverSocket); // Socket.IO server
// Lắng nghe cổng Socket.IO (5000)
serverSocket.listen(4000, () => {
    console.log('Socket.IO server chạy tại http://localhost:4000');
});


// Nhận các bức điện được gửi từ trình duyệt
io.on("connection", (socket) => {
    console.log(`Kết nối mới từ local: ${socket.id}`);

    socket.on("Client-send-data", (data) => {
        console.log("Dữ liệu nhận từ local:", data); //
        Local_PLCtags_Readed = data;
    });
});



// API hiển thị giá trị tag đọc được lên trình duyệt
var Local_PLCtags_Readed;
appExpress.get('/api/tags_show', (req, res) => {
    res.json(Local_PLCtags_Readed);
});






// ############################################################################################
//                                  GHI DỮ LIỆU IO FILED
// ############################################################################################
// 🛠 Hàm dùng chung để xử lý API và phát tín hiệu tới local
const IOFiledAPI = (api) => {
    appExpress.post(api, express.json(), (req, res) => {
        const receivedData = req.body;
        console.log(`📌 API: ${api}, Dữ liệu nhận được:`, receivedData);

        // Phát tín hiệu tới local thông qua WebSocket
        io.sockets.emit(api, receivedData);

        // Trả về phản hồi cho client
        res.status(200).json({
            success: true,
            message: `Dữ liệu đã được cập nhật thành công tại ${api}!`,
            data: receivedData
        });
    });
};


///////////////////////////////////////////////////////////////////////////////////////////////
// 🛠 Ghi dữ liệu xuống PLC - cho io filed
IOFiledAPI("/api/cai_dat_thong_so");




// ############################################################################################
//                                  NÚT NHẤN ĐIỀU KHIỂN
// ############################################################################################
// Hàm dùng chung để xử lý nút nhấn
const ButtonAPI = (api, value) => {
    appExpress.post(api, (req, res) => {
        try {
            console.log(`API: ${api}, Giá trị: ${value}`);
            res.status(200).send({ message: `Nút nhấn tại ${api} đã được xử lý thành công.` });
            io.sockets.emit(api, value); // Phát tín hiệu tới local
        } catch (error) {
            console.error(`Lỗi khi xử lý API ${api}:`, error.message);
            res.status(500).send({ message: `Đã xảy ra lỗi khi xử lý API ${api}` });
        }
    });
};


///////////////////////////////////////////////////////////////////////////////////////////////
// Sử dụng cho nút nhấn - Màn chế độ tự động
ButtonAPI('/api/btt_Auto_On', true);
ButtonAPI('/api/btt_Manu_On', true);
ButtonAPI('/api/btt_Auto_Confirm_On', true);


// Sử dụng cho nút nhấn - màn hình chế độ bằng tay
ButtonAPI('/api/btt_V1_Open', true);
ButtonAPI('/api/btt_V2_Open', true);
ButtonAPI('/api/btt_V3_Open', true);

ButtonAPI('/api/btt_V1_Close', true);
ButtonAPI('/api/btt_V2_Close', true);
ButtonAPI('/api/btt_V3_Close', true);

ButtonAPI('/api/btt_DC_Tron_Run', true);
ButtonAPI('/api/btt_DC_Tron_Stop', true);
