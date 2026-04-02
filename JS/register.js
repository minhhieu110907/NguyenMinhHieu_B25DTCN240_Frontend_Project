import { getUser, saveUser } from "./storage.js";

const form = document.querySelector(".form-box");
const firstName = document.querySelector("#first-name");
const lastName = document.querySelector("#last-name");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const rePassword = document.querySelector("#rePassword");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validate()) return;

  let users = getUser();
  let newUser = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
    role: "user"
  }
  
  users.push(newUser);
  saveUser(users);
  window.location.href = "./login.html";

});

function validate() {
  if (
    !email.value.trim() ||
    !firstName.value.trim() ||
    !lastName.value.trim() ||
    !password.value ||
    !rePassword.value
  ) {
    alert("Không được để trống thông tin");
    return false;
  }

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  if (!strongPasswordRegex.test(password.value)) {
    alert(
      "Mật khẩu yếu! Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
    );
    return false;
  }

  if (password.value !== rePassword.value) {
    alert("Vui lòng nhập mật khẩu trùng nhau");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    alert("Email không đúng định dạng (Ví dụ: example@gmail.com).");
    return false;
  }

  if (firstName.value.trim().length < 2 || lastName.value.trim().length < 2) {
    alert("Họ và tên phải có ít nhất 2 ký tự.");
    return false;
  }

  let users = getUser();
  let existEmail = users.find(user => {
        return user.email === email.value.trim();
    });

    if (existEmail) {
        alert("Email đã tồn tại!");
        return false;
    }
 
  return true;
}
