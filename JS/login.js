const form = document.querySelector("#loginForm");
const email = document.querySelector("#email");
const password = document.querySelector("#password");

import { getUser, setCurrentUser, checkLogin } from "./storage.js";



form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!email.value.trim() || !password.value.trim()) {
    alert("Email và mật khẩu không được để trống");
    return;
    // toast làm sau
  }
  let users = getUser();
  let user = users.find(
    (u) => u.password === password.value.trim() && u.email === email.value.trim()
  );
  if (!user) {
    alert("Sai mật khẩu hoặc email");
    return;
  }

  // LOGIN SUCCESS
  setCurrentUser(user);
  localStorage.setItem("rememberEmail", email.value);
  localStorage.setItem("rememberPassword", password.value);

  if (user.role === "user") {
    window.location.href = "../index.html";
  }
  else {
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
