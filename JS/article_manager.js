import { bindAdminSidebarLogout, initMenuDropdownActions } from "./menu-dropdown_action.js";
import "./init_data.js";
import { getPost, savePost } from "./storage.js";
import { showConfirmModal, showToast } from "./ui-manager.js";
import { initAuthGuard } from "./auth_guard.js"; 

const articleTableBody = document.querySelector("#articleTableBody");
const paginationNumber = document.querySelector(".admin-pagination__numbers");
const preBtn = document.querySelector("#articlePaginationPrevious");
const nextBtn = document.querySelector("#articlePaginationNext");
const adminSearchInput = document.querySelector("#adminSearchInput");
const adminVoiceSearchBtn = document.querySelector("#adminVoiceSearchBtn");

let posts = getPost();
let displayPosts = [...posts]; // Danh sách dùng để hiển thị (sau khi search)
let currentPage = 1;
let pageSize = 5;

function renderArticles(list = []) {
    if (list.length === 0) {
        articleTableBody.innerHTML = `<tr><td colspan="7">Không có dữ liệu bài viết</td></tr>`;
        return;
    }
    let html = "";
    list.forEach((article) => {
        const statusLabel = article.status === "private" ? "Private" : "Public";
        const statusClass = article.status === "private" ? "article-status--private" : "article-status--public";
        html += `
          <tr>
            <td><img class="article-image" src="${(article.image || "").trim()}" alt=""></td>
            <td>${article.title}</td>
            <td>${article.entries}</td>
            <td>${article.content.substring(0, 50)}...</td>
            <td><span class="article-status ${statusClass}">${statusLabel}</span></td>
            <td>
              <select class="article-status-select" data-id="${article.id}">
                <option value="public" ${article.status === "public" ? "selected" : ""}>Public</option>
                <option value="private" ${article.status === "private" ? "selected" : ""}>Private</option>
              </select>
            </td>
            <td>
              <button class="article-action article-action--edit" type="button" data-id="${article.id}">Sửa</button>
              <button class="article-action article-action--delete" type="button" data-id="${article.id}">Xóa</button>
            </td>
          </tr>`;
    });
    articleTableBody.innerHTML = html;
}

function applyPagination(list = displayPosts) {
    displayPosts = list;
    let totalPage = Math.ceil(list.length / pageSize);
    if (currentPage > totalPage) currentPage = totalPage || 1;
    let startIndex = (currentPage - 1) * pageSize;
    renderArticles(list.slice(startIndex, startIndex + pageSize));
    paginationRender(totalPage);
}

function paginationRender(totalPage) {
    let html = "";
    for (let i = 1; i <= totalPage; i++) {
        html += `<button class="admin-pagination__number ${i === currentPage ? "admin-pagination__number--active" : ""}" data-page="${i}">${i}</button>`;
    }
    paginationNumber.innerHTML = html;
    preBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPage || totalPage === 0;

    document.querySelectorAll(".admin-pagination__number").forEach(btn => {
        btn.onclick = () => {
            currentPage = Number(btn.dataset.page);
            applyPagination();
        };
    });
}

// LOGIC TÌM KIẾM
function initAdminSearch() {
    if (!adminSearchInput) return;
    adminSearchInput.addEventListener("input", () => {
        const keyword = adminSearchInput.value.toLowerCase().trim();
        currentPage = 1;
        const filtered = posts.filter(p => p.title.toLowerCase().includes(keyword));
        applyPagination(filtered);
    });
}

// VOICE SEARCH ADMIN
function initAdminVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !adminVoiceSearchBtn) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";

    adminVoiceSearchBtn.onclick = () => {
        recognition.start();
        adminVoiceSearchBtn.classList.add("is-listening");
    };

    recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        adminSearchInput.value = result;
        adminVoiceSearchBtn.classList.remove("is-listening");
        
        currentPage = 1;
        const filtered = posts.filter(p => p.title.toLowerCase().includes(result.toLowerCase().trim()));
        applyPagination(filtered);
    };
    recognition.onend = () => adminVoiceSearchBtn.classList.remove("is-listening");
}

articleTableBody.onclick = (e) => {
    const editBtn = e.target.closest(".article-action--edit");
    const deleteBtn = e.target.closest(".article-action--delete");

    if (editBtn) {
        localStorage.setItem("editingPostId", editBtn.dataset.id);
        window.location.href = "./form_post.html";
    }
    if (deleteBtn) {
        showConfirmModal("Xóa bài viết", "Bạn có chắc chắn?", (ok) => {
            if (ok) {
                posts = posts.filter(p => p.id != deleteBtn.dataset.id);
                savePost(posts);
                applyPagination(posts);
                showToast("Đã xóa!", "success");
            }
        });
    }
};

preBtn.onclick = () => { if (currentPage > 1) { currentPage--; applyPagination(); }};
nextBtn.onclick = () => { if (currentPage < Math.ceil(displayPosts.length / pageSize)) { currentPage++; applyPagination(); }};

document.addEventListener("DOMContentLoaded", () => {
    initAuthGuard();
    initMenuDropdownActions(document);
    bindAdminSidebarLogout(document);
    applyPagination();
    initAdminSearch();
    initAdminVoiceSearch();
});