import { checkLogin, getCurrentUser, getPost, getCategories } from "./storage.js";
import { initMenuDropdownActions } from "./menu-dropdown_action.js";
import { initAuthGuard } from "./auth_guard.js";

const searchInput = document.querySelector("#searchInput");
const voiceSearchBtn = document.querySelector("#voiceSearchBtn");
const paginationNumber = document.querySelector("#blogPaginationNumbers");
const preBtn = document.querySelector("#blogPrevBtn");
const nextBtn = document.querySelector("#blogNextBtn");
const categoryContainer = document.querySelector("#categoryContainer");

let currentPage = 1;
let pageSize = 6;
let currentList = []; 

function handlePostClick(e) {
    const card = e.target.closest(".post-card");
    if (card) {
        const id = card.dataset.id;
        localStorage.setItem("viewPostId", id);
        localStorage.setItem("postSource", "index.html");
        window.location.href = "./PAGE/details_post.html";
    }
}

function updateAuthUI(user) {
    const buttons = document.querySelector("#headerAuthButtons");
    const dropdown = document.querySelector("#headerUserDropdown");
    const avatarImg = document.querySelector("#headerUserAvatar");
    const nameEl = document.querySelector("#headerUserName");
    const emailEl = document.querySelector("#headerUserEmail");

    if (user && checkLogin()) {
        if (buttons) buttons.style.display = "none";
        if (dropdown) dropdown.style.display = "block";
        if (avatarImg) avatarImg.src = user.avatar || "./ASSET/icon/default-avatar.png";
        if (nameEl) nameEl.textContent = `${user.firstname} ${user.lastname}`.trim();
        if (emailEl) emailEl.textContent = user.email;
        initMenuDropdownActions(document);
    } else {
        if (buttons) buttons.style.display = "block";
        if (dropdown) dropdown.style.display = "none";
    }
}

function renderCategoryFilter() {
    if (!categoryContainer) return;
    const categories = getCategories(); 
    let html = `<a href="#" class="active" data-category="All">All posts</a>`;
    categories.forEach(cat => {
        html += `<a href="#" data-category="${cat.categoryName}">${cat.categoryName}</a>`;
    });
    categoryContainer.innerHTML = html;
}

function renderRecentPosts(posts) {
    const container = document.querySelector("#recentPostsContainer");
    if (!container || !posts || posts.length === 0) return;
    const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = sorted.slice(0, 3);
    const date0 = (recent[0].date || "0000-00-00").split(" ")[0];

    let html = `
      <div class="recent-large">
        <div class="post-card large" data-id="${recent[0].id}" style="cursor: pointer;">
          <img src="${recent[0].image}" alt="${recent[0].title}">
          <div class="post-info">
            <span class="date">Date: ${date0}</span>
            <h3>${recent[0].title}</h3>
            <p>${(recent[0].content || "").substring(0, 120)}...</p>
            <span class="category">${recent[0].entries}</span>
          </div>
        </div>
      </div>`;

    if (recent.length > 1) {
        html += `<div class="recent-small">`;
        for (let i = 1; i < recent.length; i++) {
            const d = (recent[i].date || "0000-00-00").split(" ")[0];
            html += `
              <div class="post-card small" data-id="${recent[i].id}" style="cursor: pointer;">
                <img src="${recent[i].image}" alt="${recent[i].title}">
                <div class="post-info">
                  <span class="date">Date: ${d}</span>
                  <h3>${recent[i].title}</h3>
                  <p>${(recent[i].content || "").substring(0, 80)}...</p>
                  <span class="category">${recent[i].entries}</span>
                </div>
              </div>`;
        }
        html += `</div>`;
    }
    container.innerHTML = html;
    container.addEventListener("click", handlePostClick);
}

function renderAllPosts(posts) {
    const container = document.querySelector("#allPostsContainer");
    if (!container) return;
    if (posts.length === 0) {
        container.innerHTML = "<p class='no-post'>Không tìm thấy bài viết nào.</p>";
        return;
    }
    container.innerHTML = posts.map(post => {
        const displayDate = (post.date || "0000-00-00").split(" ")[0];
        return `
            <div class="post-card" data-id="${post.id}" style="cursor: pointer;">
                <img src="${post.image}" alt="${post.title}">
                <div class="post-info">
                    <span class="date">Date: ${displayDate}</span>
                    <div class="article-title-row">
                        <h3 class="article-title">${post.title}</h3>
                    </div>
                    <span class="category">${post.entries}</span>
                </div>
            </div>
        `;
    }).join("");
    container.addEventListener("click", handlePostClick);
}

function paginate(arr) {
    let totalPage = Math.ceil(arr.length / pageSize);
    let startIndex = (currentPage - 1) * pageSize;
    return { totalPage, currentItems: arr.slice(startIndex, startIndex + pageSize) };
}

function applyPagination(list = currentList) {
    currentList = list;
    let { totalPage, currentItems } = paginate(list);
    if (currentPage > totalPage) currentPage = totalPage || 1;
    renderAllPosts(currentItems);
    paginationRender(totalPage, list);
}

function paginationRender(totalPage, list) {
    let html = "";
    if (totalPage <= 1) {
        paginationNumber.innerHTML = "";
        preBtn.style.visibility = "hidden";
        nextBtn.style.visibility = "hidden";
        return;
    }
    preBtn.style.visibility = "visible";
    nextBtn.style.visibility = "visible";
    for (let i = 1; i <= totalPage; i++) {
        html += `<button class="admin-pagination__number ${i === currentPage ? "admin-pagination__number--active" : ""}" data-page="${i}">${i}</button>`;
    }
    paginationNumber.innerHTML = html;
    preBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPage;
    document.querySelectorAll(".admin-pagination__number").forEach((btn) => {
        btn.addEventListener("click", () => {
            currentPage = Number(btn.dataset.page);
            applyPagination(list);
            window.scrollTo({ top: 800, behavior: "smooth" });
        });
    });
}

preBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        applyPagination();
    }
});

nextBtn.addEventListener("click", () => {
    const totalPage = Math.ceil(currentList.length / pageSize);
    if (currentPage < totalPage) {
        currentPage++;
        applyPagination();
    }
});

function initCategoryFilter() {
    if (!categoryContainer) return;
    categoryContainer.addEventListener("click", (e) => {
        const target = e.target.closest("a");
        if (!target) return;
        e.preventDefault();
        document.querySelectorAll("#categoryContainer a").forEach((link) => link.classList.remove("active"));
        target.classList.add("active");
        const selectedCategory = target.dataset.category;
        const allPosts = getPost();
        currentPage = 1;
        const filtered = selectedCategory === "All" ? allPosts : allPosts.filter((post) => post.entries === selectedCategory);
        applyPagination(filtered);
    });
}

function initSearch() {
    if (!searchInput) return;
    searchInput.addEventListener("input", function () {
        const keyword = searchInput.value.toLowerCase().trim();
        const allPosts = getPost();
        currentPage = 1;
        const filtered = allPosts.filter((p) => p.title.toLowerCase().includes(keyword));
        applyPagination(filtered);
    });
}

// CHỨC NĂNG VOICE SEARCH
function initVoiceSearch() {
    if (!voiceSearchBtn || !searchInput) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        voiceSearchBtn.style.display = "none";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.continuous = false;

    voiceSearchBtn.addEventListener("click", () => {
        recognition.start();
        voiceSearchBtn.classList.add("is-listening");
    });

    recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        searchInput.value = result;
        voiceSearchBtn.classList.remove("is-listening");
        
        // Tự động tìm kiếm ngay lập tức
        const allPosts = getPost();
        currentPage = 1;
        const filtered = allPosts.filter((p) => p.title.toLowerCase().includes(result.toLowerCase().trim()));
        applyPagination(filtered);
    };

    recognition.onerror = () => voiceSearchBtn.classList.remove("is-listening");
    recognition.onend = () => voiceSearchBtn.classList.remove("is-listening");
}

document.addEventListener("DOMContentLoaded", function () {
    initAuthGuard();
    const user = getCurrentUser();
    const allPosts = getPost();
    updateAuthUI(user);
    renderCategoryFilter(); 
    renderRecentPosts(allPosts);
    applyPagination(allPosts);
    initCategoryFilter();
    initSearch();
    initVoiceSearch();
});