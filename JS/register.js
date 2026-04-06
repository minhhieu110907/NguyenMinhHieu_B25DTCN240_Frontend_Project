import { getUser, saveUser } from "./storage.js";
import { showToast, validatePasswordMinLength } from "./ui-manager.js";

const form = document.querySelector(".form-box");
const firstname = document.querySelector("#first-name");
const lastname = document.querySelector("#last-name");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const rePassword = document.querySelector("#rePassword");
const toggleBtn = document.querySelectorAll(".toggleIcon");
let currentId = 4;

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validate()) return;

  let users = getUser();
  let id = currentId++;
  let newUser = {
    id: id,
    firstname: firstname.value.trim(),
    lastname: lastname.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
    role: "user",
    avatar: generateAvatar(currentId),
    status: "active"
  };

  users.push(newUser);
  saveUser(users);
  showToast("Đăng kí tài khoản thành công", "success");
  form.reset();
  window.location.href = "./login.html";
});

function validate() {
  if (
    !email.value.trim() ||
    !firstname.value.trim() ||
    !lastname.value.trim() ||
    !password.value ||
    !rePassword.value
  ) {
    showToast("Không được để trống thông tin", "error");
    return false;
  }

  if (!validatePasswordMinLength(password.value, 6)) {
    showToast("Mật khẩu phải có ít nhất 6 ký tự.", "error");
    return false;
  }

  if (password.value !== rePassword.value) {
    showToast("Vui lòng nhập mật khẩu trùng nhau", "error");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    showToast("Email không đúng định dạng (Ví dụ: example@gmail.com).", "error");
    return false;
  }

  if (firstname.value.trim().length < 2 || lastname.value.trim().length < 2) {
    showToast("Họ và tên phải có ít nhất 2 ký tự.", "error");
    return false;
  }

  let users = getUser();
  let existEmail = users.find((user) => {
    return user.email === email.value.trim();
  });

  if (existEmail) {
    showToast("Email đã tồn tại!", "error");
    return false;
  }

  return true;
}

// Toggle Button
toggleBtn.forEach((btn) => {
  btn.addEventListener("click", function () {
    const input = btn.previousElementSibling;

    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";

    btn.classList.toggle("fa-eye", !isHidden);
    btn.classList.toggle("fa-eye-slash", isHidden);
  });
});

// Creat avatar
function generateAvatar(id) {
  const imgId = (id % 70) + 1
  return `https://i.pravatar.cc/150?img=${imgId}`;
}
