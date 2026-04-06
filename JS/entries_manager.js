const searchCategories = document.querySelector("#entriesCategorySearchInput");
const nameInput = document.querySelector("#categoryNameInput");
const categoryList = document.querySelector("#categoryTableBody");

const addBtn = document.querySelector("#addCategoryButton");

const paginationNumber = document.querySelector(".admin-pagination__numbers");
const preBtn = document.querySelector("#entriesPaginationPrevious");
const nextBtn = document.querySelector("#entriesPaginationNext");

import "./init_data.js";
import { getCategories, saveCategories, getPost } from "./storage.js";
import { showConfirmModal, showToast } from "./ui-manager.js";
import { bindAdminSidebarLogout, initMenuDropdownActions } from "./menu-dropdown_action.js";
import { initAuthGuard } from "./auth_guard.js";

// DATA
let categories = getCategories();
let editingId = null;
let currentId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;

// PAGINATION STATE
let currentPage = 1;
let pageSize = 5;


// RENDER
function renderCategories(list = [...categories]) {
  if (list.length === 0) {
    categoryList.innerHTML = `Không có dữ liệu`;
    return;
  }
  let html = "";
  list.forEach((category, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${category.categoryName}</td>
        <td>
          <button class="entries-action entries-action--edit" type="button" data-id="${category.id}">Edit</button>
          <button class="entries-action entries-action--delete" type="button" data-id="${category.id}">Delete</button>
        </td>
      </tr>`;
  });
  categoryList.innerHTML = html;
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

function applyPagination(list = [...categories]) {
  let { totalPage, currentItems } = paginate(list);

  if (currentPage > totalPage) {
    currentPage = totalPage || 1;
    const result = paginate(list);
    currentItems = result.currentItems;
  }

  renderCategories(currentItems);
  paginationRender(totalPage, list);
}

function paginationRender(totalPage, list) {
  let html = "";

  if (totalPage <= 6) {
    for (let i = 1; i <= totalPage; i++) {
      html += `<button class="admin-pagination__number ${i === currentPage ? "admin-pagination__number--active" : ""}" data-page="${i}">${i}</button>`;
    }
  } else {
    for (let i = 1; i <= 3; i++) {
      html += `<button class="admin-pagination__number ${i === currentPage ? "admin-pagination__number--active" : ""}" data-page="${i}">${i}</button>`;
    }
    html += `<span class="admin-pagination__dots">...</span>`;
    for (let i = totalPage - 2; i <= totalPage; i++) {
      html += `<button class="admin-pagination__number ${i === currentPage ? "admin-pagination__number--active" : ""}" data-page="${i}">${i}</button>`;
    }
  }

  paginationNumber.innerHTML = html;

  // DISABLE PRE / NEXT
  preBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPage;

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
  const totalPage = Math.ceil(categories.length / pageSize);
  if (currentPage < totalPage) {
    currentPage++;
    applyPagination();
  }
});


// ADD / UPDATE
addBtn.addEventListener("click", function () {
  const val = nameInput.value.trim();
  if (!val) {
    showToast("Vui lòng nhập tên thể loại!", "error");
    return;
  }

  let categoryData = { categoryName: val };

  if (editingId) {
    // UPDATE
    let category = categories.find((c) => c.id === editingId);
    Object.assign(category, categoryData);
    showToast("Cập nhật thành công", "success");
    saveCategories(categories);
    editingId = null;
    addBtn.textContent = "Add Category";
  } else {
    // ADD
    categoryData.id = currentId++;
    categories.push(categoryData);
    showToast("Thêm thành công thể loại bài viết!", "success");
    saveCategories(categories);
  }

  nameInput.value = "";
  applyPagination();
});


// EDIT / DELETE
categoryList.addEventListener("click", function (e) {
  const id = +e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("entries-action--delete")) {
    let index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      showToast("Không có thể loại cần tìm", "error");
      return;
    }

    let posts = getPost();
    let categoryNameTarget = categories[index].categoryName;
    let isDelete = posts.some((post) => post.entries === categoryNameTarget);

    showConfirmModal(
      "Xác nhận xoá thể loại",
      `Bạn có chắc chắn muốn xoá thể loại ${categoryNameTarget}?`,
      (ok) => {
        if (!ok) return;
        if (!isDelete) {
          categories.splice(index, 1);
          showToast("Đã xoá thành công", "success");
          saveCategories(categories);
          applyPagination();
        } else {
          showToast("Không thể xoá chủ đề khi vẫn còn bài viết thuộc chủ đề này!", "error");
        }
      },
    );
  }

  if (e.target.classList.contains("entries-action--edit")) {
    let category = categories.find((c) => c.id === id);
    if (!category) return;
    editingId = id;

    // FILL INPUT
    nameInput.value = category.categoryName;

    // CHANGE BUTTON
    addBtn.textContent = "Update Category";

    // SCROLL TO INPUT
    window.scrollTo({ top: 0, behavior: "smooth" });
    nameInput.focus();
    nameInput.select();
  }
});


// SEARCH
searchCategories.addEventListener("input", function () {
  let keyword = searchCategories.value.toLowerCase().trim();
  currentPage = 1;

  let list = [...categories];
  if (keyword) {
    list = list.filter((c) => c.categoryName.toLowerCase().includes(keyword));
  }

  editingId = null;
  addBtn.textContent = "Add Category";
  nameInput.value = "";

  applyPagination(list);
});

initAuthGuard();
applyPagination();
initMenuDropdownActions(document);
bindAdminSidebarLogout(document);