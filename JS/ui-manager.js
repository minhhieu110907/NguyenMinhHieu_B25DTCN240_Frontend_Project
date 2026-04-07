let toastTimer = null;

function ensureToastContainer() {
  let container = document.querySelector("#uiToastContainer");
  if (container) return container;

  container = document.createElement("div");
  container.id = "uiToastContainer";
  document.body.appendChild(container);
  return container;
}

function removeNodeSafe(node) {
  if (!node) return;
  try {
    node.remove();
  } catch (e) {
    // ignore
  }
}

export function showToast(message, type = "success") {
  const container = ensureToastContainer();

  // Chỉ allow hiển thị 1 toast tại 1 thời điểm
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
    container.innerHTML = "";
  } else {
    container.innerHTML = "";
  }

  const toast = document.createElement("div");
  toast.className = `ui-toast ui-toast--${type}`;
  toast.innerHTML = `
    <div class="ui-toast__content">
      <span class="ui-toast__dot" aria-hidden="true"></span>
      <span class="ui-toast__message"></span>
    </div>
  `;
  toast.querySelector(".ui-toast__message").textContent = message;
  container.appendChild(toast);

  // Transition: fade-in nhanh, fade-out theo timeout
  toast.classList.add("ui-toast--show");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("ui-toast--show");
    window.setTimeout(() => removeNodeSafe(toast), 200);
    toastTimer = null;
  }, 3000);
}

export function showConfirmModal(title, message, callback) {
  const overlay = document.createElement("div");
  overlay.className = "ui-modal-overlay";

  overlay.innerHTML = `
    <div class="ui-confirm-modal" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="ui-confirm-modal__header">
        <h3 class="ui-confirm-modal__title">${title}</h3>
        <button class="ui-modal-close" type="button" aria-label="Close">×</button>
      </div>
      <div class="ui-confirm-modal__body">
        <p class="ui-confirm-modal__message">${message}</p>
      </div>
      <div class="ui-confirm-modal__footer">
        <button class="ui-btn ui-btn--ghost" type="button" data-confirm="false">Cancel</button>
        <button class="ui-btn ui-btn--primary" type="button" data-confirm="true">Confirm</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger transition
  requestAnimationFrame(() => {
    overlay.classList.add("ui-modal-overlay--active");
    const modal = overlay.querySelector(".ui-confirm-modal");
    if (modal) modal.classList.add("ui-modal--active");
  });

  function close(result) {
    overlay.classList.remove("ui-modal-overlay--active");
    const modal = overlay.querySelector(".ui-confirm-modal");
    if (modal) modal.classList.remove("ui-modal--active");
    window.setTimeout(() => removeNodeSafe(overlay), 180);
    callback?.(result);
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close(false);
  });

  overlay.querySelector(".ui-modal-close")?.addEventListener("click", () => close(false));
  overlay
    .querySelectorAll("[data-confirm]")
    .forEach((btn) => btn.addEventListener("click", (e) => close(e.target.dataset.confirm === "true")));
}

export function validatePasswordMinLength(password, minLength = 6) {
  if (typeof password !== "string") return false;
  return password.trim().length >= minLength;
}

