import { getPost, getCurrentUser } from "./storage.js";
import { initAuthGuard } from "./auth_guard.js";

const articleList = document.querySelector("#articleList");
const paginationNumbers = document.querySelector("#paginationNumbers");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const searchInput = document.querySelector(".search-container input");

let currentPage = 1;
const pageSize = 6;
let myOriginPosts = [];
let displayList = [];

// RENDER ARTICLES 
function renderMyArticles(list) {
  if (!articleList) return;

  if (list.length === 0) {
    articleList.innerHTML = `<div class="no-data">NO ARTICLES FOUND.</div>`;
    return;
  }

  articleList.innerHTML = list
    .map((post) => {
      const displayDate = (post.date || "0000-00-00").split(" ")[0];

      const tagClass =
        post.entries === "Daily Journal"
          ? "tag-purple"
          : post.entries === "Work & Career"
            ? "tag-blue"
            : "tag-green";

      return `
        <div class="article-card post-item-link" data-id="${post.id}" style="cursor: pointer;">
            <img src="${post.image}" class="article-img" alt="${post.title}">
            <div class="article-content">
                <p class="article-date">DATE: ${displayDate}</p>
                <div class="article-title-row">
                    <h3 class="article-title">${post.title}</h3>
                    <span class="external-icon">↗</span>
                </div>
                <p class="article-desc">${(post.content || "").substring(0, 150)}...</p>
                <div class="article-footer">
                    <span class="category ${tagClass}">${post.entries}</span>
                    <button class="edit-btn" data-id="${post.id}">EDIT YOUR POST</button>
                </div>
            </div>
        </div>
        `;
    })
    .join("");
}

// CHI TIẾT & CHỈNH SỬA
if (articleList) {
  articleList.addEventListener("click", (e) => {
    const card = e.target.closest(".post-item-link");
    const editBtn = e.target.closest(".edit-btn");

    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      localStorage.setItem("editingPostId", id);
      window.location.href = "./form_post.html";
      return;
    }

    if (card) {
      const postId = card.dataset.id;
      localStorage.setItem("viewPostId", postId);
      localStorage.setItem("postSource", window.location.pathname);
      window.location.href = "./details_post.html";
    }
  });
}

// PAGINATION
function paginate(arr) {
  const totalPage = Math.ceil(arr.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  return { totalPage, currentItems: arr.slice(startIndex, startIndex + pageSize) };
}

function applyPagination(list = displayList) {
  displayList = list;
  const { totalPage, currentItems } = paginate(list);

  if (currentPage > totalPage && totalPage > 0) {
    currentPage = totalPage;
    return applyPagination(list);
  }

  renderMyArticles(currentItems);
  paginationRender(totalPage);
}

function paginationRender(totalPage) {
  if (totalPage <= 1) {
    paginationNumbers.innerHTML = "";
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
    return;
  }
  prevBtn.style.display = "flex";
  nextBtn.style.display = "flex";

  let html = "";
  for (let i = 1; i <= totalPage; i++) {
    html += `<button class="admin-pagination__number ${i === currentPage ? "admin-pagination__number--active" : ""}" data-page="${i}">${i}</button>`;
  }
  paginationNumbers.innerHTML = html;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPage;
}

// SEARCH & EVENTS (ADDEVENTLISTENER)
function initSearch() {
  if (!searchInput) return;
  searchInput.addEventListener("input", function () {
    const keyword = searchInput.value.toLowerCase().trim();
    currentPage = 1;
    const filtered = myOriginPosts.filter((post) =>
      post.title.toLowerCase().includes(keyword)
    );
    applyPagination(filtered);
  });
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    applyPagination();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

nextBtn.addEventListener("click", () => {
  const totalPage = Math.ceil(displayList.length / pageSize);
  if (currentPage < totalPage) {
    currentPage++;
    applyPagination();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

paginationNumbers.addEventListener("click", (e) => {
  const btn = e.target.closest(".admin-pagination__number");
  if (btn) {
    currentPage = Number(btn.dataset.page);
    applyPagination();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  initAuthGuard();
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const allPosts = getPost();
  myOriginPosts = allPosts
    .filter((p) => p.authorId === currentUser.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  applyPagination(myOriginPosts);
  initSearch();
});