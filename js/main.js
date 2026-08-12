/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Main JavaScript (UI Interactivity)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  initStickyHeader();
  initMobileNav();
  highlightActiveNav();
  initFloatingWidgets();
  initToastSystem();
  initUserHeaderState();
  initRegistrationAuthGuard();
});

// Sticky header blur effect
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Mobile navigation drawer toggle
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', function() {
    navMenu.classList.toggle('open');
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      if (navMenu.classList.contains('open')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    }
  });

  // Close nav on click outside or item click
  document.addEventListener('click', function(e) {
    if (!toggleBtn.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('open');
      const icon = toggleBtn.querySelector('i');
      if (icon) icon.className = 'fas fa-bars';
    }
  });
}

// Highlight current page link in navbar
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Floating WhatsApp & Telegram buttons
function initFloatingWidgets() {
  if (document.querySelector('.floating-widgets')) return;

  const phone = "+251910070940";
  const message = encodeURIComponent("Hello Charis Music Collective, I would like to learn more about your music classes.");
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`;
  const telegramUrl = `https://t.me/Iyasu_Markos`;

  const widgetHtml = `
    <div class="floating-widgets">
      <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="float-btn float-whatsapp" title="Chat on WhatsApp" aria-label="WhatsApp">
        <i class="fab fa-whatsapp"></i>
      </a>
      <a href="${telegramUrl}" target="_blank" rel="noopener noreferrer" class="float-btn float-telegram" title="Contact on Telegram" aria-label="Telegram">
        <i class="fab fa-telegram-plane"></i>
      </a>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', widgetHtml);
}

// Toast notification engine
function initToastSystem() {
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

window.showToast = function(message, type = 'info') {
  const container = document.querySelector('.toast-container') || document.body;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-exclamation-circle';

  toast.innerHTML = `<i class="fas ${iconClass}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Header Student Authentication state sync
function initUserHeaderState() {
  const user = window.CMC_API && window.CMC_API.getCurrentStudentUser ? window.CMC_API.getCurrentStudentUser() : null;
  const navActions = document.querySelector('.nav-actions');

  if (user) {
    if (navActions) {
      const existingCta = navActions.querySelector('.btn-primary');
      if (existingCta) {
        const firstName = user.fullName ? user.fullName.split(' ')[0] : 'Student';
        const badgeHtml = `
          <a href="student-dashboard.html" class="user-badge-nav">
            <i class="fas fa-user-circle"></i> ${firstName} (Dashboard)
          </a>
        `;
        existingCta.outerHTML = badgeHtml;
      }
    }

    // Rewrite all student-auth links to direct register.html links for logged-in students
    document.querySelectorAll('a[href*="student-auth.html"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href.includes('redirect=register')) {
        let program = '', format = '';
        try {
          const url = new URL(href, window.location.origin);
          program = url.searchParams.get('program') || '';
          format = url.searchParams.get('format') || '';
        } catch (err) {}

        let regUrl = 'register.html';
        const params = [];
        if (program) params.push(`program=${encodeURIComponent(program)}`);
        if (format) params.push(`format=${encodeURIComponent(format)}`);
        if (params.length) regUrl += '?' + params.join('&');

        link.setAttribute('href', regUrl);
      }
    });
  }
}

// Registration Auth Guard Interceptor
function initRegistrationAuthGuard() {
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href*="student-auth.html"]');
    if (!link) return;

    const user = window.CMC_API && window.CMC_API.getCurrentStudentUser ? window.CMC_API.getCurrentStudentUser() : null;
    const href = link.getAttribute('href');
    
    // If student IS logged in and clicking a registration auth link, bypass auth and go straight to register.html!
    if (user && href.includes('redirect=register')) {
      e.preventDefault();
      let program = '', format = '';
      try {
        const url = new URL(href, window.location.origin);
        program = url.searchParams.get('program') || '';
        format = url.searchParams.get('format') || '';
      } catch (err) {}

      let regUrl = 'register.html';
      const params = [];
      if (program) params.push(`program=${encodeURIComponent(program)}`);
      if (format) params.push(`format=${encodeURIComponent(format)}`);
      if (params.length) regUrl += '?' + params.join('&');

      window.location.href = regUrl;
    }
  });
}


