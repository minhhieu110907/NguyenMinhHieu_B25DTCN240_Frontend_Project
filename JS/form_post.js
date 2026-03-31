// =======================
// LẤY ELEMENT
// =======================
var titleInput = document.querySelector('input[type="text"]');
var categoryInput = document.querySelectorAll('input[type="text"]')[1];
var contentInput = document.querySelector("textarea");
var moodSelect = document.getElementById("mood");
var addBtn = document.querySelector(".add-btn");

// =======================
// DEBUG: xem user chọn mood
// =======================
moodSelect.addEventListener("change", function () {
    var value = moodSelect.value;
    var text = moodSelect.options[moodSelect.selectedIndex].text;

    console.log("Mood value:", value);
    console.log("Mood text:", text);
});

// =======================
// XỬ LÝ KHI BẤM ADD
// =======================
addBtn.addEventListener("click", function () {

    // Lấy dữ liệu
    var title = titleInput.value.trim();
    var category = categoryInput.value.trim();
    var content = contentInput.value.trim();
    var moodValue = moodSelect.value;
    var moodText = moodSelect.options[moodSelect.selectedIndex].text;

    // =======================
    // VALIDATE
    // =======================
    if (title === "" || content === "") {
        alert("Vui lòng nhập Title và Content!");
        return;
    }

    if (moodValue === "") {
        alert("Vui lòng chọn Mood!");
        return;
    }

    // =======================
    // TẠO OBJECT POST
    // =======================
    var post = {
        id: Date.now(),
        title: title,
        category: category,
        content: content,
        mood: moodValue,        // dùng cho logic
        moodDisplay: moodText,  // dùng để hiển thị
        createdAt: new Date().toLocaleDateString()
    };

    // =======================
    // LẤY DATA CŨ
    // =======================
    var posts = JSON.parse(localStorage.getItem("posts")) || [];

    // =======================
    // THÊM BÀI MỚI
    // =======================
    posts.push(post);

    // =======================
    // LƯU LẠI
    // =======================
    localStorage.setItem("posts", JSON.stringify(posts));

    console.log("Post saved:", post);

    // =======================
    // RESET FORM
    // =======================
    titleInput.value = "";
    categoryInput.value = "";
    contentInput.value = "";
    moodSelect.value = "";

    alert("Đăng bài thành công! 🎉");

    // (optional) chuyển trang
    // window.location.href = "after_login.html";
});