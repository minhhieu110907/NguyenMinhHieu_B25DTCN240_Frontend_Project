// CHECK LOGIN WHEN LOAD WEB

window.onload = function () {
  if (checkLogin()) {
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    removeCurrentUser();
    window.location.href = "login.html";
  }
};
