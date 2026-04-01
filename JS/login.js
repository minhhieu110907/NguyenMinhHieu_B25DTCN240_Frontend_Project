const form = document.querySelector("#loginForm");
const loginBtn = document.querySelector("#loginBtn");
const email = document.querySelector("#email");
const password = document.querySelector("#password");

import { users } from "./data_sample.js";
import { setCurrentUser } from "./storage.js";

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!email.value || !password.value) {
    alert("Email và mật khẩu không được để trống");
    return;
    // toast làm sau
  }
  let user = users.find(
    (u) => u.password === password.value.trim() && u.email === email.value.trim(),
  );
  if (!user) {
    alert("Sai mật khẩu hoặc email");
    return;
  }

  // LOGIN SUCCESS
  localStorage.setItem("rememberEmail", email.value);
  localStorage.setItem("rememberPassword", password.value);
  setCurrentUser(user);

  if (user.role === "user") {
    window.location.href = "../index.html";
  } else if (user.role === "admin") {
    window.location.href = "./user_manager.html";
  }
});

// FILL AFTER LOGIN SUCCESS

window.onload = function () {
  let checkEmail = localStorage.getItem("rememberEmail");
  let checkPassword = localStorage.getItem("rememberPassword");

  if (checkEmail && checkPassword) {
    email.value = checkEmail;
    password.value = checkPassword;
  }
};
