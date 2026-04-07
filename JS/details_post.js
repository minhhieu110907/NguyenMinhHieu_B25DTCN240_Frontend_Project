import { getPost, savePost, getCurrentUser, getUser } from "./storage.js";
import { showConfirmModal } from "./ui-manager.js";
// DOM ELEMENTS
const postHeaderContainer = document.querySelector("#postHeaderContainer");
const commentsList = document.querySelector("#commentsList");
const commentInput = document.querySelector("#commentInput");
const sendCommentBtn = document.querySelector("#sendCommentBtn");
const toggleComments = document.querySelector("#toggleComments");
const backBtn = document.querySelector("#backBtn");

// STATE
const viewPostId = Number(localStorage.getItem("viewPostId"));
const postSource = localStorage.getItem("postSource") || "index.html";
const currentUser = getCurrentUser();
const allUsers = getUser();
let posts = getPost();
const currentPost = posts.find(p => p.id === viewPostId);

// RENDER NỘI DUNG BÀI VIẾT
function renderPost() {
    if (!currentPost) return;

    const author = allUsers.find(u => u.id === currentPost.authorId);
    const isLiked = currentPost.likes?.includes(currentUser?.id);

    postHeaderContainer.innerHTML = `
        <div class="post-section">
            <div class="left-avatar">
                <img src="${author?.avatar || 'https://i.pravatar.cc/40'}" alt="Avatar">
            </div>
            <div class="post-box">
                <h2>${currentPost.title}</h2>
                <p>${currentPost.content}</p>
                <div class="comment-actions">
                    <button class="post-action-btn btn-like-main ${isLiked ? 'liked' : ''}">
                        <span>${currentPost.likes?.length || 0} Like <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up"></i></span>
                    </button>
                    <button class="post-action-btn">
                        <span>${currentPost.comments?.length || 0} Replies <i class="fa-regular fa-comment"></i></span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Cập nhật avatar người dùng hiện tại ở ô nhập liệu
    document.querySelector("#currentUserAvatar").src = currentUser?.avatar || "https://i.pravatar.cc/40";
    // Cập nhật số lượng bình luận ở nút View all
    toggleComments.querySelector("span").textContent = `View all ${currentPost.comments?.length || 0} comments`;
    
    renderComments();
}

// RENDER DANH SÁCH BÌNH LUẬN 
function renderComments() {
    const isFromAllMyPost = postSource.includes("allmypost.html");
     // CHECK AUTHOR
    const isPostOwner = currentUser && currentUser.id === currentPost.authorId;
    const comments = currentPost.comments || [];
    commentsList.innerHTML = comments.map((cmt, index) => {
        // CHECK INFOMATION USER COMMENTS
        const cmtUser = allUsers.find(u => u.id === cmt.userId); 
        // CHECK LIKE COMMENT?
        const isLikedCmt = cmt.likes?.includes(currentUser?.id);

        return `
            <div class="comment-box">
                <img src="${cmtUser?.avatar || 'https://i.pravatar.cc/35'}" alt="Avatar">
                <div class="comment-content">
                    <p><strong>${cmtUser ? cmtUser.lastname : 'Ẩn danh'}</strong>: ${cmt.content}</p>
                    <div class="comment-actions">
                        <button class="post-action-btn btn-like-cmt ${isLikedCmt ? 'liked' : ''}" data-index="${index}">
                            <span>${cmt.likes?.length || 0} Like <i class="${isLikedCmt ? 'fa-solid' : 'fa-regular'} fa-thumbs-up"></i></span>
                        </button>

                        ${(isFromAllMyPost || isPostOwner) ? `
                            <button class="post-action-btn btn-delete-cmt" data-index="${index}">
                                <span>Delete <i class="fa-regular fa-trash-can"></i></span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}


// XỬ LÝ LIKE BÀI VIẾT CHÍNH
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-like-main");
    if (!btn || !currentUser) return;

    if (!currentPost.likes) currentPost.likes = [];
    const idx = currentPost.likes.indexOf(currentUser.id);

    if (idx === -1) currentPost.likes.push(currentUser.id);
    else currentPost.likes.splice(idx, 1);

    savePost(posts);
    renderPost();
});

// XỬ LÝ THÊM BÌNH LUẬN
sendCommentBtn.addEventListener("click", () => {
    const text = commentInput.value.trim();
    if (!text || !currentUser) return;

    const newComment = {
        userId: currentUser.id,
        content: text,
        likes: [],
        date: new Date().toISOString()
    };

    if (!currentPost.comments) currentPost.comments = [];
    currentPost.comments.push(newComment);

    savePost(posts);
    commentInput.value = "";
    renderPost();
});

// XỬ LÝ LIKE & XÓA BÌNH LUẬN 
commentsList.addEventListener("click", (e) => {
    const likeCmtBtn = e.target.closest(".post-action-btn.btn-like-cmt");
    const deleteCmtBtn = e.target.closest(".post-action-btn.btn-delete-cmt");

    // CHỨC NĂNG LIKE BÌNH LUẬN
    if (likeCmtBtn && currentUser) {
        const idx = likeCmtBtn.dataset.index;
        const comment = currentPost.comments[idx];
        // Khởi tạo mảng likes nếu chưa có
        if (!comment.likes) comment.likes = [];
        const userIdx = comment.likes.indexOf(currentUser.id);
        // Toggle Like (Thêm nếu chưa có, xóa nếu đã tồn tại)
        if (userIdx === -1) {
            comment.likes.push(currentUser.id);
        } else {
            comment.likes.splice(userIdx, 1);
        }
        savePost(posts);
        renderComments();
    }

    // CHỨC NĂNG XÓA BÌNH LUẬN (DÙNG MODAL)
    if (deleteCmtBtn) {
        const idx = deleteCmtBtn.dataset.index;
        showConfirmModal(
            "Xác nhận xóa", 
            "Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.", 
            (ok) => {
                if (ok) {
                    currentPost.comments.splice(idx, 1);
                    savePost(posts);
                    renderPost();
                }
            }
        );
    }
});


// ĐIỀU HƯỚNG & UI
backBtn.addEventListener("click", () => {
    // Nếu source là index.html thì lùi 1 cấp, nếu là allmypost thì cũng lùi 1 cấp
    window.location.href = postSource.includes("PAGE") ? `./${postSource.split('/').pop()}` : `../${postSource}`;
});

toggleComments.addEventListener("click", () => {
    const isHidden = commentsList.style.display === "none";
    commentsList.style.display = isHidden ? "block" : "none";
    toggleComments.querySelector("i").style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
    toggleComments.classList.toggle("active-gray");
});

// KHỞI CHẠY
renderPost();