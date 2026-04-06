import {
  bindAdminSidebarLogout,
  initMenuDropdownActions,
} from "./menu-dropdown_action.js";
import { getPost, savePost } from "./storage.js";
import { showConfirmModal, showToast } from "./ui-manager.js";
import { initAuthGuard } from "./auth_guard.js";

const articleTableBody = document.querySelector("#articleTableBody");
const paginationNumber = document.querySelector(".admin-pagination__numbers");
const preBtn = document.querySelector("#articlePaginationPrevious");
const nextBtn = document.querySelector("#articlePaginationNext");

// DATA
let posts = getPost();
let currentPage = 1;
let pageSize = 5;

initMenuDropdownActions(document);
bindAdminSidebarLogout(document);

// RENDER
function renderArticles(list = [...posts]) {
  if (list.length === 0) {
    articleTableBody.innerHTML = `<tr><td colspan="7">Không có dữ liệu</td></tr>`;
    return;
  }

  let html = "";
  list.forEach((article) => {
    // Trạng thái nhãn và class
    const statusLabel = article.status === "private" ? "Private" : "Public";
    const statusClass =
      article.status === "private"
        ? "article-status--private"
        : "article-status--public";

    html += `
      <tr>
        <td>
          <img class="article-image" src="${(article.image || "").trim()}" alt="${article.title || ""}">
        </td>
        <td>${article.title}</td>
        <td>${article.entries}</td>
        <td>${article.content}</td>
        <td>
          <span class="article-status ${statusClass}">${statusLabel}</span>
        </td>
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
      </tr>
    `;
  });
  articleTableBody.innerHTML = html;
}

// PAGINATION
function paginate(arr) {
  let totalPage = Math.ceil(arr.length / pageSize);
  let startIndex = (currentPage - 1) * pageSize;
  let endIndex = startIndex + pageSize;

  return {
    totalPage,
    currentItems: arr.slice(startIndex, endIndex),
  };
}

function applyPagination(list = [...posts]) {
  let { totalPage, currentItems } = paginate(list);

  if (currentPage > totalPage) {
    currentPage = totalPage || 1;
    const result = paginate(list);
    currentItems = result.currentItems;
  }

  renderArticles(currentItems);
  paginationRender(totalPage, list);
}

function paginationRender(totalPage, list) {
  let html = "";

  if (totalPage <= 6) {
    for (let i = 1; i <= totalPage; i++) {
      html += `<button class="admin-pagination__number ${
        i === currentPage ? "admin-pagination__number--active" : ""
      }" data-page="${i}" type="button">${i}</button>`;
    }
  } else {
    for (let i = 1; i <= 3; i++) {
      html += `<button class="admin-pagination__number ${
        i === currentPage ? "admin-pagination__number--active" : ""
      }" data-page="${i}" type="button">${i}</button>`;
    }

    html += `<span class="admin-pagination__dots">...</span>`;

    for (let i = totalPage - 2; i <= totalPage; i++) {
      html += `<button class="admin-pagination__number ${
        i === currentPage ? "admin-pagination__number--active" : ""
      }" data-page="${i}" type="button">${i}</button>`;
    }
  }

  paginationNumber.innerHTML = html;

  // DISABLE PRE / NEXT
  preBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPage || totalPage === 0;

  // PAGE BUTTON CLICK
  document.querySelectorAll(".admin-pagination__number").forEach((btn) => {
    btn.addEventListener("click", function () {
      currentPage = Number(btn.dataset.page);
      applyPagination(list);
    });
  });
}

// PRE / NEXT
preBtn.addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    applyPagination();
  }
});

nextBtn.addEventListener("click", function () {
  const totalPage = Math.ceil(posts.length / pageSize);

  if (currentPage < totalPage) {
    currentPage++;
    applyPagination();
  }
});

// EDIT / DELETE / STATUS UPDATE
if (articleTableBody) {
  articleTableBody.addEventListener("click", function (e) {
    const editBtn = e.target.closest(".article-action--edit");
    const deleteBtn = e.target.closest(".article-action--delete");

    if (deleteBtn) {
      const id = Number(deleteBtn.dataset.id);
      showConfirmModal("Xác nhận", "Bạn muốn xóa bài này?", (ok) => {
        if (ok) {
          posts = posts.filter((p) => p.id !== id);
          savePost(posts);
          showToast("Đã xóa.", "success");
          applyPagination();
        }
      });
    }

    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      // Lưu ID vào localStorage để trang form_post biết là đang sửa bài nào
      localStorage.setItem("editingPostId", id);
      window.location.href = "./form_post.html";
    }
  });

  articleTableBody.addEventListener("change", function (e) {
    const select = e.target.closest(".article-status-select");
    if (select) {
      const id = Number(select.dataset.id);
      const article = posts.find((p) => p.id === id);
      if (article) {
        article.status = select.value;
        savePost(posts);
        showToast("Cập nhật trạng thái xong.", "success");
        applyPagination();
      }
    }
  });
}

const addBtnHeader = document.querySelector(".add-new-article-btn");
if (addBtnHeader) {
  addBtnHeader.onclick = () => {
    localStorage.removeItem("editingPostId");
    window.location.href = "./form_post.html";
  };
}

//  Nút Sửa
articleTableBody.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".article-action--edit");
  if (editBtn) {
    const id = Number(editBtn.dataset.id);
    localStorage.setItem("editingPostId", id);
    window.location.href = "./form_post.html";
  }
});

initAuthGuard();
applyPagination();
