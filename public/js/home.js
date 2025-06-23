// Hàm cập nhật giá trị từ server
function fn_Tagshow() {
  fetch("/api/tags_show")
    .then((response) => response.json())
    .then((data) => {
      // 1. Hiển thị giá trị tag lên io filed (chỉ hiển thị)
      document.getElementById("iofield_Act_Weight_1").value =
        data.Act_Weight_1.toFixed(2);
      document.getElementById("iofield_Act_Weight_2").value =
        data.Act_Weight_2.toFixed(2);
      document.getElementById("iofield_Act_Time_Tron").value =
        data.Act_Time_Tron;

      // 2. Hiển thị lên iofiled vừa đọc vừa ghi dữ liệu
      if (Editing_state.isEditing == false) {
        document.getElementById("iofield_Setting_Weight_1").value =
          data.Setting_Weight_1.toFixed(2);
        document.getElementById("iofield_Setting_Weight_2").value =
          data.Setting_Weight_2.toFixed(2);
        document.getElementById("iofield_Setting_Time_Tron").value =
          data.Setting_Time_Tron;
      }

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
const handleButtonClick = (api, method = "POST") => {
  const sendRequest = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5 giây

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log(`Request to ${url} succeeded.`);
    } catch (error) {
      if (error.name === "AbortError") {
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
      console.error("Error handling button click:", error);
    }
  };
};

// ỨNG DỤNG HÀM TRÊN CHO NÚT NHẤN
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
// Sử dụng cho nút nhấn chế độ auto
const AutoButton = document.getElementById("btt_Auto");
AutoButton.addEventListener("click", handleButtonClick("/api/btt_Auto_On"));

// Sử dụng cho nút nhấn chế độ Manu
const ManuButton = document.getElementById("btt_Manu");
ManuButton.addEventListener("click", handleButtonClick("/api/btt_Manu_On"));

// Sử dụng cho nút nhấn xác nhận vận hành
const ConfirmButton = document.getElementById("btt_Auto_Confirm");
ConfirmButton.addEventListener(
  "click",
  handleButtonClick("/api/btt_Auto_Confirm_On")
);

// ############################################################################################
//                                  GHI DỮ LIỆU IO FILED
// ############################################################################################
// 1. Hàm dùng chung
// 1.1. Hàm gửi request API
const sendRequest = async (url, data, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5 giây

  try {
    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log(`Request to ${url} succeeded.`);
  } catch (error) {
    if (error.name === "AbortError") {
      console.error(`Request to ${url} timed out.`);
    } else {
      console.error(`Error with request to ${url}:`, error);
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

// 1.2. Hàm xử lý form
const setupFormHandler = (api, editButtonId, saveButtonId, formId, state) => {
  const editButton = document.getElementById(editButtonId);
  const saveButton = document.getElementById(saveButtonId);
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll("input");

  let initialData = {}; // Lưu dữ liệu ban đầu để kiểm tra thay đổi
  let isSetup = false; // Đánh dấu xem sự kiện đã được gán chưa

  const enableEditing = () => {
    state.isEditing = true; // Dừng cập nhật từ server
    console.log("isEditing = ", state.isEditing); // Kiểm tra giá trị

    inputs.forEach((input) => {
      input.removeAttribute("disabled");
      initialData[input.id] = input.value; // Lưu giá trị ban đầu
    });

    saveButton.removeAttribute("disabled");
    editButton.setAttribute("disabled", "true");

    if (!isSetup) {
      saveButton.addEventListener("click", saveData);
      isSetup = true;
    }
  };

  const saveData = () => {
    const data = {};
    let isChanged = false;

    inputs.forEach((input) => {
      data[input.id] = input.value;
      if (input.value !== initialData[input.id]) {
        isChanged = true; // Kiểm tra nếu dữ liệu thay đổi
      }
    });

    if (isChanged) {
      sendRequest(api, data);
      console.log("Dữ liệu đã được cập nhật thành công!", data);
    } else {
      console.log("Không có thay đổi, không gửi request.");
    }

    // Khóa lại input sau khi lưu
    inputs.forEach((input) => input.setAttribute("disabled", "true"));
    saveButton.setAttribute("disabled", "true");
    editButton.removeAttribute("disabled");

    state.isEditing = false; // Cho phép cập nhật lại từ server
    console.log("isEditing = ", state.isEditing); // Kiểm tra giá trị
  };

  editButton.addEventListener("click", enableEditing);
};

// SỬ DỤNG HÀM VỪA TẠO
/////////////////////////////////////////////////////////////////////////////
// Gán sự kiện khi bấm nút "Sửa" hoặc "Lưu"
const Editing_state = { isEditing: false }; // Biến báo đang sửa dữ liệu

document.addEventListener("DOMContentLoaded", function () {
  setupFormHandler(
    "/api/cai_dat_thong_so",
    "edit_button",
    "save_button",
    "tags_write",
    Editing_state
  );
});

// ############################################################################################
//                                  SYMBOLS FACTORY
// ############################################################################################
// Hàm dùng chung cho symbol
function Symbol(tag, imageId, imagePrefix, imageExtension) {
  // Chuẩn hóa giá trị tag:
  // - Nếu tag là false, "false", "FALSE", hoặc undefined -> tag = 0 (hình ảnh _0)
  // - Nếu tag là true, "true", "TRUE" -> tag = 1 (hình ảnh _1)
  // - Nếu tag có giá trị lớn hơn 1 thì sử dụng giá trị đó cho hình ảnh (ví dụ: _2, _3, ...)
  var normalizedTag =
    tag === true || tag === "true" || tag === "TRUE"
      ? 1
      : tag === false || tag === "false" || tag === "FALSE" || tag === undefined
      ? 0
      : parseInt(tag) || 0;

  // Tạo tên hình ảnh theo định dạng "imagePrefix_tag.imageExtension"
  var imageName = imagePrefix + "_" + normalizedTag + imageExtension;

  // Lấy phần tử img theo id
  var imageElement = document.getElementById(imageId);

  // Thay đổi thuộc tính src của phần tử img
  imageElement.src = "\\images\\symbols\\" + imageName;
}
