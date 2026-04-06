const form = document.querySelector("#loginForm");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const toggleBtn = document.querySelector("#toggleIcon");
import { getUser, setCurrentUser } from "./storage.js";
import { showToast, validatePasswordMinLength } from "./ui-manager.js";

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!email.value.trim() || !password.value.trim()) {
    showToast("Email và mật khẩu không được để trống", "error");
    return;
  }
  if (!validatePasswordMinLength(password.value, 6)) {
    showToast("Mật khẩu phải có ít nhất 6 ký tự", "error");
    return;
  }
  let users = getUser();
  let user = users.find(
    (u) =>
      u.password === password.value.trim() && u.email === email.value.trim(),
  );
  if (!user) {
    showToast("Sai mật khẩu hoặc email", "error");
    return;
  }

  // LOGIN SUCCESS
  setCurrentUser(user);
  localStorage.setItem("rememberEmail", email.value);
  localStorage.setItem("rememberPassword", password.value);
  showToast("Đăng nhập thành công", "success");

  if (user.role === "user") {
    window.location.href = "../index.html";
  } else {
    window.location.href = "./user_manager.html";
  }
});

// FILL AFTER LOGIN SUCCESS
window.onload = function () {
  let savedEmail = localStorage.getItem("rememberEmail");
  let savedPassword = localStorage.getItem("rememberPassword");

  if (savedEmail && savedPassword) {
    email.value = savedEmail;
    password.value = savedPassword;
  }
};

//Toggle button
toggleBtn.addEventListener("click",function togglePassword() {
  if (password.type === "password") {
    password.type = "text";
    toggleBtn.classList.remove("fa-eye");
    toggleBtn.classList.add("fa-eye-slash");
  } else {
    password.type = "password";
    toggleBtn.classList.remove("fa-eye-slash");
    toggleBtn.classList.add("fa-eye");
  }
});
