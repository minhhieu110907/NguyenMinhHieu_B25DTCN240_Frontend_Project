// --- Nút "Đăng bài" của User (Nếu có trên Header/Giao diện) ---
const userPostBtn = document.querySelector("#userAddPost"); 
if (userPostBtn) {
    userPostBtn.onclick = () => {
        localStorage.removeItem("editingPostId");
        window.location.href = "./form_post.html";
    };
}

// --- Nút "Edit your post" trên từng thẻ bài viết ---
// Giả sử bạn render các bài viết vào một container tên là #postContainer
const postContainer = document.querySelector("#postContainer");
if (postContainer) {
    postContainer.addEventListener("click", (e) => {
        const editLink = e.target.closest(".edit-post-link"); // Class của chữ "Edit your post"
        if (editLink) {
            e.preventDefault(); // Ngăn link nhảy mặc định
            const id = Number(editLink.dataset.id);
            localStorage.setItem("editingPostId", id);
            window.location.href = "./form_post.html";
        }
    });
}

import { getPost, getCurrentUser } from "../JS/storage.js";

const currentUser = getCurrentUser();
let allPosts = getPost();

// CHỈ HIỂN THỊ BÀI CỦA CHÍNH USER ĐANG ĐĂNG NHẬP
let myPosts = allPosts.filter(p => p.author === currentUser.lastname); 

// Sau đó mới render myPosts ra giao diện
renderMyArticles(myPosts);