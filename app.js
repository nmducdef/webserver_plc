const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app); // ✅ Dùng 1 server chung
const io = socketIO(server); // ✅ Gắn socket lên server này

// Cấu hình Express
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Kiểm tra đăng nhập cookies
function checkAuth(req, res, next) {
  if (req.cookies.loggedIn === "true") next();
  else res.redirect("/");
}

// Route cho login và trang chính
const loginRoutes = require("./public/js/login");
app.use("/", loginRoutes);
app.get(["/home", "/home.html"], checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "views", "home.html"))
);
app.get(["/manu", "/manu.html"], checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "views", "manu.html"))
);

// ✅ Socket.IO xử lý kết nối
let Local_PLCtags_Readed;
io.on("connection", (socket) => {
  console.log(`📡 WebSocket client kết nối: ${socket.id}`);
  socket.on("Client-send-data", (data) => {
    console.log("📩 PLC gửi về:", data);
    Local_PLCtags_Readed = data;
  });
});

// ✅ API để frontend đọc tag PLC đã nhận
app.get("/api/tags_show", (req, res) => {
  res.json(Local_PLCtags_Readed);
});

// ✅ Hàm chung cho IO Field
const IOFiledAPI = (api) => {
  app.post(api, express.json(), (req, res) => {
    const receivedData = req.body;
    console.log(`📌 ${api} nhận:`, receivedData);
    io.sockets.emit(api, receivedData);
    res.status(200).json({
      success: true,
      message: `Gửi ${api} thành công`,
      data: receivedData,
    });
  });
};
IOFiledAPI("/api/cai_dat_thong_so");

// ✅ Hàm chung cho nút nhấn
const ButtonAPI = (api, value) => {
  app.post(api, (req, res) => {
    try {
      console.log(`🔘 Gửi nút nhấn ${api} = ${value}`);
      io.sockets.emit(api, value);
      res.status(200).send({ message: `Nút ${api} xử lý OK.` });
    } catch (err) {
      console.error(`❌ Lỗi nút ${api}:`, err.message);
      res.status(500).send({ message: `Lỗi xử lý ${api}` });
    }
  });
};

// Các nút điều khiển
ButtonAPI("/api/btt_Auto_On", true);
ButtonAPI("/api/btt_Manu_On", true);
ButtonAPI("/api/btt_Auto_Confirm_On", true);
ButtonAPI("/api/btt_V1_Open", true);
ButtonAPI("/api/btt_V2_Open", true);
ButtonAPI("/api/btt_V3_Open", true);
ButtonAPI("/api/btt_V1_Close", true);
ButtonAPI("/api/btt_V2_Close", true);
ButtonAPI("/api/btt_V3_Close", true);
ButtonAPI("/api/btt_DC_Tron_Run", true);
ButtonAPI("/api/btt_DC_Tron_Stop", true);

// ✅ Gộp lại 1 cổng duy nhất (dùng PORT do Render cấp hoặc mặc định 3000)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server + Socket.IO đang chạy tại http://localhost:${PORT}`);
});
