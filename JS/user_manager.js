import "./init_data.js";
import { getUser, saveUser } from "./storage.js";
import { showConfirmModal, showToast } from "./ui-manager.js";
import {
  bindAdminSidebarLogout,
  initMenuDropdownActions,
} from "./menu-dropdown_action.js";

const userCount = document.querySelector("#userCountBadge");
const searchInput = document.querySelector("#userSearchInput");
const userList = document.querySelector("#userTableBody");

const sortName = document.querySelector("#sortName");
const sortIcon = document.querySelector("#sortIcon");

const paginationNumber = document.querySelector(".admin-pagination__numbers");
const preBtn = document.querySelector("#userPaginationPrevious");
const nextBtn = document.querySelector("#userPaginationNext");
import { initAuthGuard } from "./auth_guard.js";

let currentPage = 1;
let pageSize = 5;
let sortOrder = "default";

let originalUsers = getUser().filter((u) => u.role !== "admin");
let users = [...originalUsers];

// RENDER
function renderUsers(list = [...users]) {
  userCount.textContent = `${list.length} users`;

  if (list.length === 0) {
    userList.innerHTML = `Không có dữ liệu người dùng nào`;
  } else {
    let html = "";

    list.forEach((u) => {
      html += `
        <tr data-id="${u.id}">
          <td>
            <div class="user-cell">
              <img class="user-cell__avatar" 
                src="${u.avatar || `https://i.pravatar.cc/150?img=${(u.id % 70) + 1}`}"
              >
              <div>
                <p class="user-cell__name">${u.firstname} ${u.lastname}</p>
                <p class="user-cell__username">@${u.lastname}</p>
              </div>
            </div>
          </td>

          <td>
            <span class="user-status">
              ${u.status === "banned" ? "bị khóa" : "hoạt động"}
            </span>
          </td>

          <td>${u.email}</td>

          <td>
            <button 
              class="user-action user-action--block"
              ${u.status === "banned" ? "disabled" : ""}
            >
              block
            </button>

            <button 
              class="user-action user-action--unblock"
              ${u.status === "active" ? "disabled" : ""}
            >
              unblock
            </button>
          </td>
        </tr>
      `;
    });

    userList.innerHTML = html;
  }
}

// BLOCK / UNBLOCK
userList.addEventListener("click", (e) => {
  const blockBtn = e.target.closest(".user-action--block");
  const unblockBtn = e.target.closest(".user-action--unblock");

  if (!blockBtn && !unblockBtn) return;

  const row = e.target.closest("tr");
  const id = Number(row.dataset.id);

  const user = users.find((u) => u.id === id);
  if (!user) return;

  const isBlock = !!blockBtn;
  const actionText = isBlock ? "block" : "unblock";

  showConfirmModal(
    "Xác nhận hành động",
    `Bạn có chắc muốn ${actionText} người dùng này?`,
    (ok) => {
      if (!ok) return;
      user.status = isBlock ? "banned" : "active";

      // sync lại originalUsers để search không bị sai
      const originalUser = originalUsers.find((u) => u.id === id);
      if (originalUser) {
        originalUser.status = user.status;
      }

      const allUsers = getUser(); 
    const userToUpdate = allUsers.find(u => u.id === id);
    if (userToUpdate) {
        userToUpdate.status = user.status;
        saveUser(allUsers); 
    }

      applySort();

      showToast(`Đã ${actionText} người dùng thành công.`, "success");
    },
  );
});

// SEARCH
searchInput.addEventListener("input", function () {
  let keyword = searchInput.value.toLowerCase();

  currentPage = 1;

  if (!keyword) {
    users = [...originalUsers];
    applySort();
    return;
  }

  users = originalUsers.filter((u) => {
    return (
      u.firstname.toLowerCase().includes(keyword) ||
      u.lastname.toLowerCase().includes(keyword)
    );
  });

  applySort();
});

// SORT
function applySort() {
  let sorted = [...users];

  sorted.sort((a, b) => {
    let nameA = a.firstname + " " + a.lastname;
    let nameB = b.firstname + " " + b.lastname;

    if (sortOrder === "asc") {
      return nameA.localeCompare(nameB);
    } else if (sortOrder === "desc") {
      return nameB.localeCompare(nameA);
    } else {
      return 0;
    }
  });

  let result = paginate(sorted);
  let totalPage = result.totalPage;
  let currentItems = result.currentItems;

  if (currentPage > totalPage) {
    currentPage = totalPage || 1;
    result = paginate(sorted);
    currentItems = result.currentItems;
  }

  renderUsers(currentItems);
  paginationRender(totalPage);
}

sortName.addEventListener("click", function () {
  if (sortOrder === "default") {
    sortOrder = "asc";
    sortIcon.className = "fa fa-sort-up";
  } else if (sortOrder === "asc") {
    sortOrder = "desc";
    sortIcon.className = "fa fa-sort-down";
  } else {
    sortOrder = "default";
    sortIcon.className = "fa fa-sort";
  }

  applySort();
});

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

function paginationRender(totalPage) {
  let html = "";

  if (totalPage <= 6) {
    for (let i = 1; i <= totalPage; i++) {
      html += `<button class="admin-pagination__number ${
        i === currentPage ? "admin-pagination__number--active" : ""
      }" data-page="${i}">${i}</button>`;
    }
  } else {
    for (let i = 1; i <= 3; i++) {
      html += `<button class="admin-pagination__number ${
        i === currentPage ? "admin-pagination__number--active" : ""
      }" data-page="${i}">${i}</button>`;
    }

    html += `<span class="admin-pagination__dots">...</span>`;

    for (let i = totalPage - 2; i <= totalPage; i++) {
      html += `<button class="admin-pagination__number ${
        i === currentPage ? "admin-pagination__number--active" : ""
      }" data-page="${i}">${i}</button>`;
    }
  }

  paginationNumber.innerHTML = html;

  preBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPage;

  paginationNumber.addEventListener("click", function (e) {
    const btn = e.target.closest(".admin-pagination__number");
    if (!btn) return;

    currentPage = Number(btn.dataset.page);
    applySort();
  });
}

// INIT
initAuthGuard();
applySort();
initMenuDropdownActions(document);
bindAdminSidebarLogout(document);
