import { getCurrentUser, getPost, getUser, removeCurrentUser, saveUser, setCurrentUser, checkLogin } from "./storage.js";
import { showConfirmModal, showToast, validatePasswordMinLength } from "./ui-manager.js";

function getLoginRedirectPath() {
  return window.location.pathname.toLowerCase().includes("/page/") ? "./login.html" : "PAGE/login.html";
}

function closeModalRoot(modalRoot) {
  if (!modalRoot) return;
  modalRoot.classList.remove("ui-modal-overlay--active");
  const modal = modalRoot.querySelector(".ui-modal");
  if (modal) modal.classList.remove("ui-modal--active");
  window.setTimeout(() => {
    try {
      modalRoot.remove();
    } catch (e) {
      // ignore
    }
  }, 180);
}

function getAccountStatusLabel(user) {
  const raw = (user?.accountStatus || user?.status || "").toString().toLowerCase();
  if (raw.includes("ban")) return { label: "Banned", className: "ui-pill ui-pill--danger" };
  return { label: "Active", className: "ui-pill ui-pill--success" };
}

function formatUserId(user) {
  const id = Number(user?.id ?? "");
  if (!id) return "N/A";
  return `A${String(id).padStart(4, "0")}`;
}

function syncUserDropdownUI(user) {
  // Sync avatar + basic identity for all dropdowns on the page.
  document.querySelectorAll(".user-profile").forEach((profileEl) => {
    const img = profileEl.querySelector("img");
    if (img && user?.avatar) img.src = user.avatar;

    const strong = profileEl.querySelector(".user-info strong");
    const small = profileEl.querySelector(".user-info small");
    if (strong) strong.textContent = `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() || "User";
    if (small) small.textContent = user?.email ?? "";
  });
}

function createOverlayShell(modalClassName) {
  const overlay = document.createElement("div");
  overlay.className = "ui-modal-overlay";
  overlay.setAttribute("role", "presentation");

  const modal = document.createElement("div");
  modal.className = `ui-modal ${modalClassName}`;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add("ui-modal-overlay--active");
    modal.classList.add("ui-modal--active");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModalRoot(overlay);
  });

  return { overlay, modal };
}

function getCurrentUserOrToast() {
  if (!checkLogin()) return null;
  return getCurrentUser();
}

export function openProfileModal() {
  const user = getCurrentUserOrToast();
  if (!user) {
    showToast("Bạn cần đăng nhập để xem hồ sơ.", "error");
    return;
  }

  syncUserDropdownUI(user);

  const { overlay, modal } = createOverlayShell("ui-modal--profile");
  const status = getAccountStatusLabel(user);

  const posts = getPost();
  const articlesPosted = posts?.length ? posts.length : user.articlesPosted ?? 1432;
  const roleLabel = user.role === "admin" ? "Admin" : "User";

  modal.innerHTML = `
    <div class="ui-modal__header">
      <div class="ui-modal__titlewrap">
        <span class="ui-modal__title">View Profile</span>
        <span class="${status.className}">${status.label}</span>
      </div>
      <button class="ui-modal-close" type="button" aria-label="Close">×</button>
    </div>

    <div class="ui-modal__body ui-modal__body--profile">
      <div class="ui-profile-card">
        <div class="ui-profile-card__top">
          <div class="ui-profile-avatar">
            <img src="${user.avatar || "https://i.pravatar.cc/150?img=12"}" alt="User avatar"/>
          </div>
          <div class="ui-profile-ident">
            <div class="ui-profile-name">${(`${user.firstname ?? ""} ${user.lastname ?? ""}`).trim() || "User"}</div>
            <div class="ui-profile-email">${user.email || ""}</div>
          </div>
        </div>

        <div class="ui-profile-grid">
          <div class="ui-profile-grid__item">
            <div class="ui-profile-grid__label">Articles Posted</div>
            <div class="ui-profile-grid__value">${articlesPosted}</div>
          </div>
          <div class="ui-profile-grid__item">
            <div class="ui-profile-grid__label">Role</div>
            <div class="ui-profile-grid__value">${roleLabel}</div>
          </div>
          <div class="ui-profile-grid__item">
            <div class="ui-profile-grid__label">User ID</div>
            <div class="ui-profile-grid__value">${formatUserId(user)}</div>
          </div>
        </div>

        <div class="ui-profile-actions">
          <button class="ui-btn ui-btn--primary" type="button" id="profileEditBtn">Edit Profile</button>
          <button class="ui-btn ui-btn--ghost" type="button">Close</button>
        </div>
      </div>
    </div>
  `;

  modal.querySelector(".ui-modal-close")?.addEventListener("click", () => closeModalRoot(overlay));
  modal.querySelector(".ui-btn--ghost")?.addEventListener("click", () => closeModalRoot(overlay));
  modal.querySelector("#profileEditBtn")?.addEventListener("click", () => {
    showToast("Demo: Edit Profile hiện chưa liên kết.", "success");
  });
}

export function openAvatarModal() {
  const user = getCurrentUserOrToast();
  if (!user) {
    showToast("Bạn cần đăng nhập để cập nhật ảnh.", "error");
    return;
  }

  syncUserDropdownUI(user);
  const { overlay, modal } = createOverlayShell("ui-modal--avatar");
  const status = getAccountStatusLabel(user);

  modal.innerHTML = `
    <div class="ui-modal__header">
      <div class="ui-modal__titlewrap">
        <span class="ui-modal__title">Update Profile Picture</span>
        <span class="${status.className}">${status.label}</span>
      </div>
      <button class="ui-modal-close" type="button" aria-label="Close">×</button>
    </div>

    <div class="ui-modal__body">
      <div class="ui-avatar-modal">
        <div class="ui-avatar-modal__left">
          <div class="ui-avatar-drop" id="avatarDropZone" tabindex="0" role="button" aria-label="Drag and drop upload">
            <div class="ui-avatar-drop__icon">⇪</div>
            <div class="ui-avatar-drop__text">
              <div>Drag a picture here</div>
              <div>or click to browse</div>
            </div>
            <input type="file" id="avatarFileInput" accept="image/*" hidden />
          </div>
        </div>

        <div class="ui-avatar-modal__right">
          <div class="ui-avatar-preview">
            <div class="ui-avatar-preview__label">Preview</div>
            <div class="ui-avatar-preview__circle">
              <img id="avatarPreviewImg" src="${user.avatar || "https://i.pravatar.cc/150?img=12"}" alt="Avatar preview"/>
            </div>
          </div>

          <div class="ui-avatar-modal__actions">
            <button class="ui-btn ui-btn--primary" type="button" id="avatarSaveBtn">Save New Picture</button>
            <button class="ui-btn ui-btn--ghost" type="button" id="avatarCancelBtn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.querySelector(".ui-modal-close")?.addEventListener("click", () => closeModalRoot(overlay));
  modal.querySelector("#avatarCancelBtn")?.addEventListener("click", () => closeModalRoot(overlay));

  const dropZone = modal.querySelector("#avatarDropZone");
  const fileInput = modal.querySelector("#avatarFileInput");
  const previewImg = modal.querySelector("#avatarPreviewImg");
  let selectedFile = null;

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn file ảnh hợp lệ.", "error");
      return;
    }
    selectedFile = file;
    const objectUrl = URL.createObjectURL(file);
    previewImg.src = objectUrl;
    previewImg.onload = () => URL.revokeObjectURL(objectUrl);
  }

  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  });

  ["dragenter", "dragover"].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.add("ui-avatar-drop--active");
    });
  });
  ["dragleave", "drop"].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.remove("ui-avatar-drop--active");
    });
  });
  dropZone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files?.[0] || null;
    handleFile(file);
  });

  modal.querySelector("#avatarSaveBtn")?.addEventListener("click", async () => {
    if (!selectedFile) {
      showToast("Chưa có ảnh để lưu. Hãy chọn ảnh trước.", "error");
      return;
    }

    // Convert to dataURL for persistence.
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(selectedFile);
    });

    const users = getUser();
    const idx = users.findIndex((u) => String(u.id) === String(user.id));
    if (idx === -1) {
      showToast("Không tìm thấy người dùng.", "error");
      return;
    }
    users[idx].avatar = dataUrl;
    saveUser(users);
    setCurrentUser(users[idx]);

    // Sync preview in dropdowns (so user sees change instantly)
    syncUserDropdownUI(users[idx]);
    showToast("Cập nhật ảnh đại diện thành công.", "success");
    closeModalRoot(overlay);
  });
}

export function openPasswordModal() {
  const user = getCurrentUserOrToast();
  if (!user) {
    showToast("Bạn cần đăng nhập để đổi mật khẩu.", "error");
    return;
  }

  syncUserDropdownUI(user);
  const { overlay, modal } = createOverlayShell("ui-modal--password");
  const status = getAccountStatusLabel(user);

  modal.innerHTML = `
    <div class="ui-modal__header">
      <div class="ui-modal__titlewrap">
        <span class="ui-modal__title">Security & Password</span>
        <span class="${status.className}">${status.label}</span>
      </div>
      <button class="ui-modal-close" type="button" aria-label="Close">×</button>
    </div>

    <div class="ui-modal__body">
      <div class="ui-password-modal">
        <div class="ui-password-modal__section">
          <div class="ui-password-modal__label">Current Password</div>
          <input class="ui-input" id="currentPasswordInput" type="password" placeholder="Current Password" />
          <div class="ui-password-modal__hint">Show/hide password</div>
        </div>

        <div class="ui-password-modal__section">
          <div class="ui-password-modal__label">New Password</div>
          <input class="ui-input" id="newPasswordInput" type="password" placeholder="New Password" />
          <div class="ui-password-modal__def">Requires: At least 6 characters</div>
        </div>

        <div class="ui-password-modal__section">
          <div class="ui-password-modal__label">Confirm New Password</div>
          <input class="ui-input" id="confirmPasswordInput" type="password" placeholder="Confirm New Password" />
        </div>

        <div class="ui-password-modal__actions">
          <button class="ui-btn ui-btn--ghost" type="button" id="passwordCancelBtn">Cancel</button>
          <button class="ui-btn ui-btn--primary" type="button" id="passwordSaveBtn">Update Password</button>
        </div>
      </div>
    </div>
  `;

  modal.querySelector(".ui-modal-close")?.addEventListener("click", () => closeModalRoot(overlay));
  modal.querySelector("#passwordCancelBtn")?.addEventListener("click", () => closeModalRoot(overlay));

  // Simple show/hide with single icon (minimal requirement)
  const inputs = [
    modal.querySelector("#currentPasswordInput"),
    modal.querySelector("#newPasswordInput"),
    modal.querySelector("#confirmPasswordInput"),
  ];

  inputs.forEach((input) => {
    if (!input) return;
    input.addEventListener("focus", () => {
      // no-op (UI placeholder)
    });
  });

  modal.querySelector("#passwordSaveBtn")?.addEventListener("click", () => {
    const current = modal.querySelector("#currentPasswordInput")?.value ?? "";
    const next = modal.querySelector("#newPasswordInput")?.value ?? "";
    const confirm = modal.querySelector("#confirmPasswordInput")?.value ?? "";

    if (!current.trim() || !next.trim() || !confirm.trim()) {
      showToast("Vui lòng nhập đầy đủ thông tin.", "error");
      return;
    }
    if (!validatePasswordMinLength(next, 6)) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự.", "error");
      return;
    }
    if (next !== confirm) {
      showToast("Mật khẩu xác nhận không khớp.", "error");
      return;
    }
    if (current !== user.password) {
      showToast("Mật khẩu hiện tại không đúng.", "error");
      return;
    }

    const users = getUser();
    const idx = users.findIndex((u) => String(u.id) === String(user.id));
    if (idx === -1) {
      showToast("Không tìm thấy người dùng.", "error");
      return;
    }

    users[idx].password = next;
    saveUser(users);
    setCurrentUser(users[idx]);
    showToast("Đổi mật khẩu thành công.", "success");
    closeModalRoot(overlay);
  });
}

export function initMenuDropdownActions(root = document) {
  const user = getCurrentUserOrToast();
  if (!user) return;

  syncUserDropdownUI(user);

  root.querySelectorAll('[data-menu-action="view-profile"]').forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openProfileModal();
    }),
  );

  root.querySelectorAll('[data-menu-action="update-avatar"]').forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openAvatarModal();
    }),
  );

  root.querySelectorAll('[data-menu-action="change-password"]').forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openPasswordModal();
    }),
  );

  root.querySelectorAll('[data-menu-action="logout"]').forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showConfirmModal("Log out", "Bạn có chắc chắn muốn thoát?", (ok) => {
        if (!ok) return;
        removeCurrentUser();
        showToast("Đã đăng xuất.", "success");
        window.location.href = getLoginRedirectPath();
      });
    }),
  );
}

export function bindAdminSidebarLogout(root = document) {
  const logoutLink = root.querySelector("#menuLogoutLink");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    showConfirmModal("Xác nhận đăng xuất", "Thoát khỏi trang quản trị ngay bây giờ?", (ok) => {
      if (!ok) return;
      removeCurrentUser();
      showToast("Bạn đã đăng xuất khỏi hệ thống.", "success");
      window.location.href = "./login.html";
    });
  });
}

