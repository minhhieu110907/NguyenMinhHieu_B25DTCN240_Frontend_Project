import { getPost, savePost, getCurrentUser } from "../JS/storage.js";
import { showToast } from "./ui-manager.js";
import { initAuthGuard } from "./auth_guard.js";

const titleInput = document.querySelector('.form-group input[type="text"]');
const categorySelect = document.querySelector('.form-group select'); 
const moodSelect = document.getElementById("mood");
const contentTextarea = document.querySelector('.form-group textarea');
const statusRadios = document.querySelectorAll('input[name="status"]');
const addBtn = document.querySelector(".add-btn");
const closeBtn = document.querySelector(".close-btn");
const headerTitle = document.querySelector(".header h1");

// DATA & STATE 
let posts = getPost();
const currentUser = getCurrentUser();
const editingId = localStorage.getItem("editingPostId");

// HÀM ĐIỀU HƯỚNG QUAY LẠI 
function goBack() {
    localStorage.removeItem("editingPostId"); 
    if (currentUser && currentUser.role === "admin") {
        window.location.href = "./article_manager.html"; 
    } else {
        window.location.href = "./allmypost.html"; 
    }
}

// KHI TRANG LOAD (CHẾ ĐỘ EDIT) 
document.addEventListener("DOMContentLoaded", () => {
    if (editingId) {
        const article = posts.find(p => p.id === Number(editingId));
        if (article) {
            headerTitle.textContent = "📝 Edit Article";
            addBtn.textContent = "Update";

            // Điền dữ liệu
            titleInput.value = article.title || "";
            categorySelect.value = article.entries || "";
            moodSelect.value = article.mood || ""; // Chạy mượt vì value đã khớp
            contentTextarea.value = article.content || "";

            // Chọn đúng trạng thái Public/Private
            statusRadios.forEach(radio => {
                const labelText = radio.nextElementSibling.textContent.trim().toLowerCase();
                if (labelText === (article.status || "public").toLowerCase()) {
                    radio.checked = true;
                }
            });
        }
    }
});

// SỰ KIỆN NÚT CLOSE 
closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    goBack();
});

// SỰ KIỆN NÚT ADD / UPDATE 
addBtn.addEventListener("click", function () {
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const content = contentTextarea.value.trim();
    const moodValue = moodSelect.value;
    const moodText = moodSelect.options[moodSelect.selectedIndex].text;
    
    let status = "public";
    statusRadios.forEach(r => { 
        if (r.checked) status = r.nextElementSibling.textContent.trim().toLowerCase(); 
    });

    // VALIDATION )
    if (!title || !content || !moodValue) {
        showToast("Vui lòng nhập đủ thông tin và chọn Mood!", "error");
        return;
    }

    if (editingId) {
        // CHẾ ĐỘ CẬP NHẬT 
        const index = posts.findIndex(p => p.id === Number(editingId));
        if (index !== -1) {
            posts[index] = {
                ...posts[index], 
                title: title,
                entries: category,
                content: content,
                mood: moodValue,
                moodDisplay: moodText,
                status: status,
                updatedAt: new Date().toLocaleDateString()
            };
            showToast("Đã cập nhật bài viết thành công!", "success");
        }
    } else {
        // CHẾ ĐỘ THÊM MỚI 
        const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
        posts.push({
            id: newId,
            author: currentUser ? currentUser.lastname : "User",
            title: title,
            entries: category,
            content: content,
            mood: moodValue,
            moodDisplay: moodText,
            status: status,
            createdAt: new Date().toLocaleDateString(),
            image: generateAvatar(newId) 
        });
        showToast("Đã đăng bài viết mới thành công!", "success");
    }

    
    savePost(posts);
    setTimeout(goBack, 1000); 
});

// Creat avatar
function generateAvatar(id) {
  const imgId = (id % 70) + 1
  return `https://i.pravatar.cc/150?img=${imgId}`;
}

initAuthGuard();