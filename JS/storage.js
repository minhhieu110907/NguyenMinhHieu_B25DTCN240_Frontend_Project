// menu admin
async function loadMenu(activeId) {
    try {
        const response = await fetch('menu.html');
        const data = await response.text();
        document.getElementById('sidebar-container').innerHTML = data;
        
        // Active item hiện tại
        const activeItem = document.getElementById(activeId);
        if (activeItem) activeItem.classList.add('active');
    } catch (error) {
        console.error('Lỗi khi tải menu:', error);
    }
}

// KEY
const USER_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const POST_KEY = "posts";
const COMMENT_KEY = "comments";


// GET DATA
export function getData(key) {
   let data = localStorage.getItem(key) ;
   if ( data == null) {
    return [];
   }
   return JSON.parse(data);
}

// SAVE DATA
export function saveData(key,value) {
    localStorage.setItem(key, JSON.stringify(value));
}


// USER 
export function getUser () {
    return getData(USER_KEY);
}

export function saveUser (users) {
    return saveData(USER_KEY, users);
}

// CHECK LOGIN //
export function setCurrentUser (user) {
    user.loginTime = new Date().getTime();
    saveData(CURRENT_USER_KEY, user);
}

export function getCurrentUser () {
    let user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

export function removeCurrentUser () {
    localStorage.removeItem(CURRENT_USER_KEY);
}


export function checkLogin () {
    let user = getCurrentUser();
    if ( !user ) return false;

    let now = new Date(). getTime();
    let FIVE_HOURS = 5 * 60 * 60 * 1000;

    return now - user.loginTime <= FIVE_HOURS;
}