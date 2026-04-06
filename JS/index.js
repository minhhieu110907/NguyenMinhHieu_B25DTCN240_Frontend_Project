import {
  checkLogin,
  getCurrentUser,
  removeCurrentUser,
  getPost,
} from "./storage.js";
import { showToast } from "./ui-manager.js";
import { initMenuDropdownActions } from "./menu-dropdown_action.js";
import { initAuthGuard } from "./auth_guard.js";

// QUẢN LÝ GIAO DIỆN AUTH
function syncHeaderDropdown(user) {
  const avatarImg = document.querySelector("#headerUserAvatar");
  const nameEl = document.querySelector("#headerUserName");
  const emailEl = document.querySelector("#headerUserEmail");
  if (avatarImg)
    avatarImg.src = user?.avatar || "../ASSET/icon/default-avatar.png";
  if (nameEl)
    nameEl.textContent =
      `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() || "User";
  if (emailEl) emailEl.textContent = user?.email || "";
}

function setAuthUI(isLoggedIn) {
  const buttons = document.querySelector("#headerAuthButtons");
  const dropdown = document.querySelector("#headerUserDropdown");
  if (buttons) buttons.style.display = isLoggedIn ? "none" : "block";
  if (dropdown) dropdown.style.display = isLoggedIn ? "block" : "none";
}

// LOGIC RENDER BÀI VIẾT

// 1. Render Recent Posts
function renderRecentPosts(posts) {
  const container = document.querySelector("#recentPostsContainer");
  if (!container || posts.length === 0 || !posts) return;

  // Sắp xếp bài mới nhất dựa trên trường 'date'
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 3);

  let html = "";

  // Bài đầu tiên (Large)
  if (recent[0]) {
    html += `
            <div class="recent-large">
                <div class="post-card large">
                    <img src="../ASSET/images/${recent[0].image}" alt="${recent[0].title}">
                    <div class="post-info">
                        <span class="date">Date: ${recent[0].date.split(" ")[0]}</span>
                        <h3>${recent[0].title}</h3>
                        <p> ${(recent[0].content || "").substring(0, 120)}...</p>
                        <span class="category">${recent[0].entries}</span>
                    </div>
                </div>
            </div>
        `;
  }

  // Hai bài tiếp theo (Small)
  if (recent.length > 1) {
    html += `<div class="recent-small">`;
    for (let i = 1; i < recent.length; i++) {
      html += `
                <div class="post-card small">
                    <img src="../ASSET/images/${recent[i].image}" alt="${recent[i].title}">
                    <div class="post-info">
                        <span class="date">Date: ${recent[i].date.split(" ")[0]}</span>
                        <h3>${recent[i].title}</h3>
                        <p>${recent[i].content.substring(0, 80)}...</p>
                        <span class="category">${recent[i].entries}</span>
                    </div>
                </div>
            `;
    }
    html += `</div>`;
  }

  container.innerHTML = html;
}

// 2. Render All Posts Grid
function renderAllPosts(posts) {
  const container = document.querySelector("#allPostsContainer");
  if (!container) return;

  if (posts.length === 0) {
    container.innerHTML = "<p>No posts found.</p>";
    return;
  }

  container.innerHTML = posts
    .map(
      (post) => `
        <div class="post-card">
            <img src="../ASSET/images/${post.image}" alt="${post.title}">
            <div class="post-info">
                <span class="date">Date: ${post.date.split(" ")[0]}</span>
                <h3>${post.title}</h3>
                <span class="category">${post.entries}</span>
            </div>
        </div>
    `,
    )
    .join("");
}

// INIT 
window.addEventListener("DOMContentLoaded", function () {
  initAuthGuard();
  const user = getCurrentUser();
  const sessionOk = checkLogin();
  const allPosts = getPost();

  // CHECK LOGIN
  if (user && !sessionOk) {
    showToast("Phiên đăng nhập đã hết hạn.", "error");
    removeCurrentUser();
    window.location.href = "../PAGE/login.html";
    return;
  }

  // CHECK BANNED
    if (user && user.status === "banned") {
    removeCurrentUser();
    window.location.href = "../PAGE/login.html";
    return;
  }

  if (sessionOk && user) {
    setAuthUI(true);
    syncHeaderDropdown(user);
    initMenuDropdownActions(document);
  } else {
    setAuthUI(false);
  }
  // RENDER POST
  renderRecentPosts(allPosts);  
  renderAllPosts(allPosts);

});
