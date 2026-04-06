// KEY
const USER_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const POST_KEY = "posts";
const CATEGORIES_KEY = "categories";

// GET DATA
export function getData(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

// SAVE DATA
export function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// USER
export function getUser() {
  return getData(USER_KEY);
}

export function saveUser(users) {
  return saveData(USER_KEY, users);
}

// POST
export function getPost() {
  return getData(POST_KEY);
}

export function savePost(posts) {
  return saveData(POST_KEY, posts);
}

// CATEGORIES
export function getCategories() {
  return getData(CATEGORIES_KEY);
}

export function saveCategories(categories) {
  return saveData(CATEGORIES_KEY, categories);
}

// CHECK LOGIN //
export function setCurrentUser(user) {
  user.loginTime = new Date().getTime();
  saveData(CURRENT_USER_KEY, user);
}

export function getCurrentUser() {
  let user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function removeCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function checkLogin() {
  let user = getCurrentUser();
  if (!user) return false;

  let now = new Date().getTime();
  let FIVE_HOURS = 5 * 60 * 60 * 1000;

  return now - user.loginTime <= FIVE_HOURS;
}

