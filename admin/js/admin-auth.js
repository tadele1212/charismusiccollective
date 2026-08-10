/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Admin Authentication Guard & Handler
   ========================================================================== */

const ADMIN_SESSION_KEY = 'cmc_admin_auth_active';

document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname.toLowerCase();
  
  if (path === '/admin' || path === '/admin/') {
    window.location.href = '/admin/index.html';
    return;
  }

  const isLoginPage = path.endsWith('/login') || path.endsWith('/login/') || path.includes('login.html');

  if (!isLoginPage) {
    checkAdminAuth();
  } else {
    // If user is already logged in, redirect straight to admin dashboard
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (session) {
      window.location.href = '/admin/index.html';
      return;
    }
    initLoginForm();
  }
});

function checkAdminAuth() {
  const session = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!session) {
    window.location.href = '/admin/login.html';
  }
}

function initLoginForm() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Authenticating...`;

    // Support default admin credentials or Firebase auth if configured
    if ((email === 'admin@charis.com' || email === 'iyasu@charismusic.com') && password === 'admin123') {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        email: email,
        loginAt: new Date().toISOString(),
        role: 'superadmin'
      }));

      window.showToast('Login successful!', 'success');
      setTimeout(() => {
        window.location.href = '/admin/index.html';
      }, 800);
    } else if (window.CMC_API.isFirebaseActive()) {
      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ email: email, role: 'firebase_admin' }));
        window.location.href = '/admin/index.html';
      } catch (err) {
        window.showToast('Invalid Firebase admin credentials.', 'error');
        btn.disabled = false;
        btn.innerHTML = `Login to Dashboard`;
      }
    } else {
      window.showToast('Invalid admin email or password.', 'error');
      btn.disabled = false;
      btn.innerHTML = `Login to Dashboard`;
    }
  });
}

window.adminLogout = function() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signOut().catch(() => {});
  }
  window.location.href = '/admin/login.html';
};
