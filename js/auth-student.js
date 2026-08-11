/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Student Auth Engine (Sign In, Sign Up, Google, Reset)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  initAuthTabs();
  initPasswordConfirmValidation();
  initSignUpForm();
  initSignInForm();
  initGoogleAuth();
  initForgotPasswordModal();
});

// Tab Switching
function initAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.style.display = 'none');

      this.classList.add('active');
      const targetForm = document.getElementById(target);
      if (targetForm) targetForm.style.display = 'block';
    });
  });

  // Check URL hash or query param (e.g. ?mode=signup)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'signup') {
    const signupTab = document.querySelector('.auth-tab[data-target="signup-panel"]');
    if (signupTab) signupTab.click();
  }

  if (urlParams.get('redirect') === 'register') {
    const banner = document.getElementById('auth-notice-banner');
    if (banner) {
      banner.style.display = 'block';
      const prog = urlParams.get('program');
      banner.innerHTML = `<i class="fas fa-lock text-orange"></i> Please create your student account to register for ${prog ? 'the <strong>' + prog + '</strong>' : 'class'}.`;
    }
  }
}

// Real-Time Re-enter Password Match Validation
function initPasswordConfirmValidation() {
  const passwordInput = document.getElementById('reg-password');
  const confirmInput = document.getElementById('reg-confirm-password');
  const matchStatus = document.getElementById('password-match-status');
  if (!passwordInput || !confirmInput || !matchStatus) return;

  function validatePasswords() {
    const pass = passwordInput.value;
    const confirm = confirmInput.value;

    if (!pass && !confirm) {
      matchStatus.innerHTML = '';
      return false;
    }

    if (pass.length < 8) {
      matchStatus.className = 'password-match-status invalid';
      matchStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> Password must be at least 8 characters long.`;
      return false;
    }

    if (pass !== confirm) {
      matchStatus.className = 'password-match-status invalid';
      matchStatus.innerHTML = `<i class="fas fa-times-circle"></i> Passwords do not match.`;
      return false;
    }

    matchStatus.className = 'password-match-status valid';
    matchStatus.innerHTML = `<i class="fas fa-check-circle"></i> Passwords match!`;
    return true;
  }

  passwordInput.addEventListener('input', validatePasswords);
  confirmInput.addEventListener('input', validatePasswords);
}

// Sign Up Handler
function initSignUpForm() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const fullName = document.getElementById('reg-fullname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone') ? document.getElementById('reg-phone').value.trim() : '';
    const password = document.getElementById('reg-password').value;
    const confirmPass = document.getElementById('reg-confirm-password').value;
    const terms = document.getElementById('reg-terms').checked;

    if (!phone || phone.length < 8) {
      window.showToast('Please enter a valid phone number for follow-up.', 'error');
      return;
    }

    if (!terms) {
      window.showToast('Please accept the terms and conditions.', 'error');
      return;
    }

    if (password !== confirmPass) {
      window.showToast('Passwords do not match. Please re-enter your password correctly.', 'error');
      return;
    }

    if (password.length < 8) {
      window.showToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Creating Account...`;

    try {
      const res = await window.CMC_API.registerStudent(fullName, email, password, phone);

      if (res.success) {
        window.showToast('Account created successfully! Verification email sent.', 'success');
        redirectPostAuth();
      } else {
        window.showToast(res.error || 'Failed to create account.', 'error');
        btn.disabled = false;
        btn.innerHTML = `CREATE ACCOUNT <i class="fas fa-arrow-right"></i>`;
      }
    } catch (err) {
      console.error(err);
      window.showToast('An error occurred during account creation.', 'error');
      btn.disabled = false;
      btn.innerHTML = `CREATE ACCOUNT <i class="fas fa-arrow-right"></i>`;
    }
  });
}

// Sign In Handler
function initSignInForm() {
  const form = document.getElementById('signin-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Signing In...`;

    try {
      const res = await window.CMC_API.loginStudent(email, password);

      if (res.success) {
        window.showToast('Signed in successfully!', 'success');
        redirectPostAuth();
      } else {
        window.showToast(res.error || 'Invalid credentials.', 'error');
        btn.disabled = false;
        btn.innerHTML = `SIGN IN <i class="fas fa-sign-in-alt"></i>`;
      }
    } catch (err) {
      window.showToast('Sign in failed.', 'error');
      btn.disabled = false;
      btn.innerHTML = `SIGN IN <i class="fas fa-sign-in-alt"></i>`;
    }
  });
}

// Google Authentication Button
function initGoogleAuth() {
  document.querySelectorAll('.btn-google').forEach(btn => {
    btn.addEventListener('click', async function() {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Connecting Google...`;

      try {
        const res = await window.CMC_API.loginStudentWithGoogle();
        if (res.success) {
          window.showToast('Google Sign-In successful!', 'success');
          redirectPostAuth();
        } else {
          window.showToast(res.error || 'Google authentication failed.', 'error');
          btn.disabled = false;
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg> Continue with Google`;
        }
      } catch (err) {
        window.showToast('Google login error.', 'error');
        btn.disabled = false;
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg> Continue with Google`;
      }
    });
  });
}

// Forgot Password Modal
function initForgotPasswordModal() {
  const trigger = document.getElementById('forgot-password-link');
  if (!trigger) return;

  trigger.addEventListener('click', function(e) {
    e.preventDefault();
    if (document.getElementById('forgot-password-modal')) return;

    const modalHtml = `
      <div class="modal-overlay active" id="forgot-password-modal">
        <div class="modal-card" style="max-width: 440px;">
          <button type="button" class="modal-close" onclick="document.getElementById('forgot-password-modal').remove()"><i class="fas fa-times"></i></button>
          <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--bright-orange);"><i class="fas fa-key"></i> Reset Password</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Enter your account email address below and we will send you an instant link to reset your password.</p>
          
          <form id="reset-password-form">
            <div class="form-group">
              <label class="form-label">Account Email Address</label>
              <input type="email" id="reset-email" class="form-control" placeholder="name@example.com" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">SEND RESET LINK <i class="fas fa-paper-plane"></i></button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('reset-password-form').addEventListener('submit', async function(ev) {
      ev.preventDefault();
      const btn = this.querySelector('button[type="submit"]');
      const origText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending Link...`;

      try {
        const resetEmail = document.getElementById('reset-email').value.trim();
        const res = await window.CMC_API.sendStudentPasswordReset(resetEmail);
        if (res.success) {
          window.showToast('Password reset link sent! Please check your email inbox.', 'success');
          document.getElementById('forgot-password-modal').remove();
        } else {
          window.showToast(res.error || 'Failed to send password reset email.', 'error');
          btn.disabled = false;
          btn.innerHTML = origText;
        }
      } catch (err) {
        window.showToast('An error occurred. Please try again.', 'error');
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    });
  });
}

// Post Auth Redirection Router
function redirectPostAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTarget = urlParams.get('redirect') || urlParams.get('program');
  
  setTimeout(() => {
    if (redirectTarget === 'register' || urlParams.get('program')) {
      const prog = urlParams.get('program') ? `?program=${urlParams.get('program')}` : '';
      window.location.href = `register.html${prog}`;
    } else {
      window.location.href = 'student-dashboard.html';
    }
  }, 1000);
}
