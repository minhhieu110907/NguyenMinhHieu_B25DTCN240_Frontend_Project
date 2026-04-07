import { 
  getCurrentUser, 
  getUser, 
  removeCurrentUser, 
  setCurrentUser 
} from "./storage.js";
import { showConfirmModal } from "./ui-manager.js";

// CHECK STATUS USER WHEN ADMIN TAB CHANGES
export function checkUserStatus() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const users = getUser();
  // FIND LASTEST DATA
  const latestUser = users.find((u) => Number(u.id) === Number(currentUser.id));

  // CHECK STATUS
  if (!latestUser || latestUser.status === "banned") {

    removeCurrentUser();
    showConfirmModal(
      "Tài khoản bị khóa", 
      "Tài khoản của bạn đã bị khóa ", 
      () => {
        redirectToLogin();
      }
    );

    // Backup: When turn off Modal, auto back to login
    setTimeout(() => {
      redirectToLogin();
    }, 7000);
    
    return;
  }

 // Update current user
  setCurrentUser(latestUser);
}

// REDIRECT TO LOGIN
function redirectToLogin() {
  // CHECK POSITION
  const isAtPageFolder = window.location.pathname.includes("/PAGE/");
  
  if (isAtPageFolder) {
    // Nếu đang ở trong PAGE 
    window.location.href = "./login.html";
  } else {
    // Nếu đang ở Root (vd: index.html)
    window.location.href = "./PAGE/login.html";
  }
}


export function initAuthGuard() {
  requireAuth();
  // CHECK 5S
  setInterval(() => {
    checkUserStatus();
  }, 5000);

  // GET ACTIONS FROM OTHER TAB
  window.addEventListener("storage", (e) => {
    if (e.key === "users" || e.key === "currentUser") {
      checkUserStatus();
    }
  });
}

// REQUIRED LOGIN
export function requireAuth() {
  const user = getCurrentUser();
  
  if (!user) {
    redirectToLogin();
    return;
  }

  
  checkUserStatus();
}