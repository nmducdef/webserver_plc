// Hàm cập nhật giá trị từ server
function fn_Tagshow() {
    fetch("/api/tags_show")
        .then((response) => response.json())
        .then((data) => {

            // 1. Hiển thị giá trị tag lên io filed (chỉ hiển thị)
            document.getElementById("iofield_Act_Weight_1").value = data.Act_Weight_1.toFixed(2); 
            document.getElementById("iofield_Act_Weight_2").value = data.Act_Weight_2.toFixed(2); 
            document.getElementById("iofield_Act_Time_Tron").value = data.Act_Time_Tron;


            
            // 3. Hiển thị symbol --- Van
            Symbol(data.status_Valve_1, "sym_valve1", "Valve", ".svg");
            Symbol(data.status_Valve_2, "sym_valve2", "Valve", ".svg");
            Symbol(data.status_Valve_3, "sym_valve3", "Valve", ".svg");

            Symbol(data.status_DC_Tron, "sym_motor_tron", "Motor", ".svg");
            Symbol(data.CB_Can, "sym_sensor", "Sensor", ".svg");

            Symbol(data.Q_Lamp_Auto, "sym_lamp_auto", "Lamp_Auto", ".png");
            Symbol(data.Q_Lamp_Manu, "sym_lamp_manu", "Lamp_Manu", ".png");



            
        })
        .catch((error) => console.error("Lỗi khi lấy dữ liệu tags:", error));


        
}


// Cập nhật giá trị mỗi giây
setInterval(fn_Tagshow, 1000);



// ############################################################################################
//                                  NÚT NHẤN ĐIỀU KHIỂN
// ############################################################################################
// Hàm dùng chung để xử lý nút nhấn
const handleButtonClick = (api, method = 'POST') => {
    const sendRequest = async (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5 giây

        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            console.log(`Request to ${url} succeeded.`);
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`Request to ${url} timed out.`);
            } else {
                console.error(`Error with request to ${url}:`, error);
            }
        } finally {
            clearTimeout(timeoutId);
        }
    };

    return async () => {
        try {
            // Gửi yêu cầu
            await sendRequest(api, { method });
        } catch (error) {
            console.error('Error handling button click:', error);
        }
    };
};

// ỨNG DỤNG HÀM TRÊN CHO NÚT NHẤN
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
// Sử dụng cho nút nhấn chế độ auto
const AutoButton = document.getElementById('btt_Auto');
AutoButton.addEventListener('click', handleButtonClick('/api/btt_Auto_On'));

// Sử dụng cho nút nhấn chế độ Manu
const ManuButton = document.getElementById('btt_Manu');
ManuButton.addEventListener('click', handleButtonClick('/api/btt_Manu_On'));


// Sử dụng cho nút nhấn - Mở van 1
const Valve1_Open = document.getElementById('btt_V1_Open');
Valve1_Open.addEventListener('click', handleButtonClick('/api/btt_V1_Open'));
// Sử dụng cho nút nhấn - Đóng van 1
const Valve1_Close = document.getElementById('btt_V1_Close');
Valve1_Close.addEventListener('click', handleButtonClick('/api/btt_V1_Close'));


// Sử dụng cho nút nhấn - Mở van 2
const Valve2_Open = document.getElementById('btt_V2_Open');
Valve2_Open.addEventListener('click', handleButtonClick('/api/btt_V2_Open'));
// Sử dụng cho nút nhấn - Đóng van 2
const Valve2_Close = document.getElementById('btt_V2_Close');
Valve2_Close.addEventListener('click', handleButtonClick('/api/btt_V2_Close'));

// Sử dụng cho nút nhấn - Mở van 3
const Valve3_Open = document.getElementById('btt_V3_Open');
Valve3_Open.addEventListener('click', handleButtonClick('/api/btt_V3_Open'));
// Sử dụng cho nút nhấn - Đóng van 3
const Valve3_Close = document.getElementById('btt_V3_Close');
Valve3_Close.addEventListener('click', handleButtonClick('/api/btt_V3_Close'));


// Sử dụng cho nút nhấn - CHạy động cơ trộn
const Motor_Tron_Run = document.getElementById('btt_DC_Tron_Run');
Motor_Tron_Run.addEventListener('click', handleButtonClick('/api/btt_DC_Tron_Run'));
// Sử dụng cho nút nhấn - Dừng động cơ trộn
const Motor_Tron_Stop = document.getElementById('btt_DC_Tron_Stop');
Motor_Tron_Stop.addEventListener('click', handleButtonClick('/api/btt_DC_Tron_Stop'));









// ############################################################################################
//                                  SYMBOLS FACTORY
// ############################################################################################
// Hàm dùng chung cho symbol
function Symbol(tag, imageId, imagePrefix, imageExtension) {
    // Chuẩn hóa giá trị tag:
    // - Nếu tag là false, "false", "FALSE", hoặc undefined -> tag = 0 (hình ảnh _0)
    // - Nếu tag là true, "true", "TRUE" -> tag = 1 (hình ảnh _1)
    // - Nếu tag có giá trị lớn hơn 1 thì sử dụng giá trị đó cho hình ảnh (ví dụ: _2, _3, ...)
    var normalizedTag = (tag === true || tag === "true" || tag === "TRUE") ? 1 : 
                        (tag === false || tag === "false" || tag === "FALSE" || tag === undefined) ? 0 : 
                        parseInt(tag) || 0;

    // Tạo tên hình ảnh theo định dạng "imagePrefix_tag.imageExtension"
    var imageName = imagePrefix + "_" + normalizedTag + imageExtension;
    
    // Lấy phần tử img theo id
    var imageElement = document.getElementById(imageId);
    
    // Thay đổi thuộc tính src của phần tử img
    imageElement.src = "\\images\\symbols\\" + imageName;
}