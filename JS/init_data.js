import {
  users as sampleUsers,
  articles as samplePosts,
  entries as sampleTopics,
} from "./data_sample.js";

import { saveUser, savePost, saveCategories } from "./storage.js";

// Khai báo tên khóa để đánh dấu trạng thái khởi tạo
const INIT_FLAG = "APP_INITIALIZED";

export function initData() {
  const isInitialized = localStorage.getItem(INIT_FLAG);
  // Nếu đã khởi tạo rồi thì thoát hàm ngay lập tức để giữ nguyên dữ liệu người dùng đã sửa xóa
  if (isInitialized === "true") {
    return;
  }

  saveUser(sampleUsers);
  savePost(samplePosts);
  saveCategories(sampleTopics);

  // Đặt trạng thái đã khởi tạo thành công 
  localStorage.setItem(INIT_FLAG, "true");
}

initData();
