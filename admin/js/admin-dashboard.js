/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Admin Dashboard Manager Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async function() {
  await initAdminDashboard();
});

let currentRegistrations = [];

async function initAdminDashboard() {
  // Load stats if elements exist
  if (document.getElementById('kpi-total')) {
    await refreshKPIStats();
  }

  // Load registration table if element exists
  if (document.getElementById('registrations-tbody')) {
    await renderRegistrationsTable();
    initFilterChips();
    initSearchInput();
  }

  // Load verified students table if on students.html
  if (document.getElementById('students-tbody')) {
    await renderApprovedStudentsTable();
  }

  // Load payment settings form if on payments.html or settings.html
  if (document.getElementById('payment-settings-form')) {
    await loadAdminPaymentSettings();
  }

  // Load site settings form if on settings.html
  if (document.getElementById('general-settings-form')) {
    await loadAdminGeneralSettings();
  }

  // Load Firebase settings if on settings.html
  if (document.getElementById('firebase-settings-form')) {
    await loadAdminFirebaseSettings();
  }

  // Load messages if on messages.html
  if (document.getElementById('messages-container')) {
    await renderAdminMessages();
  }
}

// Refresh KPI metrics cards
async function refreshKPIStats() {
  const regs = await window.CMC_API.getAllRegistrations();
  currentRegistrations = regs;

  const totalCount = regs.length;
  const pendingCount = regs.filter(r => r.registrationStatus === 'pending_payment' || r.paymentStatus === 'pending').length;
  const reviewCount = regs.filter(r => r.registrationStatus === 'payment_review' || r.paymentStatus === 'receipt_submitted').length;
  const approvedCount = regs.filter(r => r.registrationStatus === 'approved' || r.paymentStatus === 'verified').length;
  const rejectedCount = regs.filter(r => r.registrationStatus === 'rejected' || r.registrationStatus === 'cancelled').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = regs.filter(r => r.createdAt && r.createdAt.startsWith(todayStr)).length;

  if (document.getElementById('kpi-total')) document.getElementById('kpi-total').textContent = totalCount;
  if (document.getElementById('kpi-pending')) document.getElementById('kpi-pending').textContent = pendingCount;
  if (document.getElementById('kpi-review')) document.getElementById('kpi-review').textContent = reviewCount;
  if (document.getElementById('kpi-approved')) document.getElementById('kpi-approved').textContent = approvedCount;
  if (document.getElementById('kpi-rejected')) document.getElementById('kpi-rejected').textContent = rejectedCount;
  if (document.getElementById('kpi-today')) document.getElementById('kpi-today').textContent = todayCount;
}

// Render Registration Management Table
async function renderRegistrationsTable(filterStatus = 'all', searchQuery = '') {
  const tbody = document.getElementById('registrations-tbody');
  if (!tbody) return;

  const regs = await window.CMC_API.getAllRegistrations();
  currentRegistrations = regs;

  let filtered = regs.filter(r => {
    if (filterStatus !== 'all' && r.registrationStatus !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (r.fullName || '').toLowerCase().includes(q);
      const matchId = (r.registrationId || '').toLowerCase().includes(q);
      const matchPhone = (r.phone || '').toLowerCase().includes(q);
      const matchProg = (r.programName || '').toLowerCase().includes(q);
      return matchName || matchId || matchPhone || matchProg;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
          No registration records found.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  filtered.forEach(reg => {
    const formattedDate = new Date(reg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    html += `
      <tr>
        <td><strong style="color: var(--bright-orange);">${reg.registrationId}</strong></td>
        <td>
          <div style="font-weight: 600; color: var(--text-white);">${reg.fullName}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${reg.email}</div>
        </td>
        <td><a href="https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #25D366;"><i class="fab fa-whatsapp"></i> ${reg.phone}</a></td>
        <td>${reg.programName}</td>
        <td><span class="badge" style="background: rgba(255,255,255,0.05);">${reg.learningFormat}</span></td>
        <td><span class="badge badge-${reg.paymentStatus}">${reg.paymentStatus.replace('_', ' ')}</span></td>
        <td><span class="badge badge-${reg.registrationStatus}">${reg.registrationStatus.replace('_', ' ')}</span></td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${formattedDate}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openStudentModal('${reg.registrationId}')">
            <i class="fas fa-eye"></i> View & Approve
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Student Modal Details View
window.openStudentModal = function(regId) {
  const reg = currentRegistrations.find(r => r.registrationId === regId);
  if (!reg) return;

  const modalHtml = `
    <div class="modal-overlay active" id="student-detail-modal">
      <div class="modal-card">
        <button class="modal-close" onclick="closeStudentModal()"><i class="fas fa-times"></i></button>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem;">
          <div>
            <span class="reg-id-badge" style="margin: 0; font-size: 1.1rem;">${reg.registrationId}</span>
            <h2 style="font-size: 1.6rem; margin-top: 0.4rem;">${reg.fullName}</h2>
          </div>
          <span class="badge badge-${reg.registrationStatus}" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
            Status: ${reg.registrationStatus.replace('_', ' ')}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div style="background: var(--bg-primary); padding: 1.2rem; border-radius: var(--radius-sm);">
            <h4 style="color: var(--bright-orange); margin-bottom: 0.8rem;">Contact Info</h4>
            <p><strong>Phone:</strong> ${reg.phone}</p>
            <p><strong>Email:</strong> ${reg.email}</p>
            <p><strong>Telegram:</strong> <a href="https://t.me/${reg.telegramUsername.replace('@', '')}" target="_blank" style="color: #0088cc;">${reg.telegramUsername}</a></p>
            <p><strong>Age:</strong> ${reg.age} years</p>
            <p><strong>Location:</strong> ${reg.city}, ${reg.country}</p>
          </div>

          <div style="background: var(--bg-primary); padding: 1.2rem; border-radius: var(--radius-sm);">
            <h4 style="color: var(--bright-orange); margin-bottom: 0.8rem;">Class & Schedule</h4>
            <p><strong>Selected Program:</strong> ${reg.programName}</p>
            <p><strong>Skill Level:</strong> ${reg.experienceLevel} (Studied before: ${reg.previousExperience})</p>
            <p><strong>Format:</strong> ${reg.learningFormat}</p>
            <p><strong>Preferred Days:</strong> ${(reg.preferredDays || []).join(', ')}</p>
            <p><strong>Preferred Time:</strong> ${reg.preferredTime}</p>
          </div>
        </div>

        <div style="background: var(--bg-primary); padding: 1.2rem; border-radius: var(--radius-sm); margin-bottom: 1.8rem;">
          <h4 style="color: var(--bright-orange); margin-bottom: 0.4rem;">Learning Goals / Message</h4>
          <p style="font-style: italic; color: var(--text-white);">${reg.goals || 'No specific goals written.'}</p>
        </div>

        <div style="background: rgba(244,123,32,0.1); border: 1px solid var(--orange-border); padding: 1.2rem; border-radius: var(--radius-sm); margin-bottom: 2rem;">
          <h4 style="color: var(--bright-orange); margin-bottom: 0.6rem;"><i class="fas fa-credit-card"></i> Payment Status Control</h4>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <span>Current Payment State: <strong class="badge badge-${reg.paymentStatus}">${reg.paymentStatus}</strong></span>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: flex-end; border-top: 1px solid var(--border-subtle); padding-top: 1.5rem;">
          <button class="btn btn-primary" style="background: linear-gradient(135deg, #27AE60 0%, #2ECC71 100%); color: white;" onclick="updateStatusAction('${reg.registrationId}', 'approved', 'verified')">
            <i class="fas fa-check-circle"></i> APPROVE STUDENT
          </button>
          <button class="btn btn-secondary" onclick="updateStatusAction('${reg.registrationId}', 'payment_review', 'receipt_submitted')">
            <i class="fas fa-search-dollar"></i> MARK PAYMENT REVIEW
          </button>
          <button class="btn btn-secondary" style="border-color: #EB5757; color: #EB5757;" onclick="updateStatusAction('${reg.registrationId}', 'rejected', 'rejected')">
            <i class="fas fa-times-circle"></i> REJECT / CANCEL
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.closeStudentModal = function() {
  const modal = document.getElementById('student-detail-modal');
  if (modal) modal.remove();
};

window.updateStatusAction = async function(regId, regStatus, payStatus) {
  const success = await window.CMC_API.updateRegistrationStatus(regId, regStatus, payStatus);
  if (success) {
    window.showToast(`Registration ${regId} updated to ${regStatus}!`, 'success');
    closeStudentModal();
    if (document.getElementById('registrations-tbody')) {
      await renderRegistrationsTable();
      await refreshKPIStats();
    }
    if (document.getElementById('students-tbody')) {
      await renderApprovedStudentsTable();
    }
  }
};

// Filter Chips Setup
function initFilterChips() {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const filter = this.getAttribute('data-filter');
      renderRegistrationsTable(filter);
    });
  });
}

// Search Input Setup
function initSearchInput() {
  const input = document.getElementById('table-search-input');
  if (input) {
    input.addEventListener('input', function() {
      const activeFilter = document.querySelector('.filter-chip.active')?.getAttribute('data-filter') || 'all';
      renderRegistrationsTable(activeFilter, this.value);
    });
  }
}

// Render Approved Students Page
async function renderApprovedStudentsTable() {
  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;

  const regs = await window.CMC_API.getAllRegistrations();
  const approved = regs.filter(r => r.registrationStatus === 'approved');

  if (approved.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          No officially approved students yet.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  approved.forEach((s, idx) => {
    html += `
      <tr>
        <td>#${idx + 1}</td>
        <td><strong>${s.fullName}</strong></td>
        <td>${s.phone}</td>
        <td>${s.email}</td>
        <td><span class="badge" style="background: rgba(244,123,32,0.15); color: var(--bright-orange);">${s.programName}</span></td>
        <td>${s.learningFormat}</td>
        <td>
          <a href="https://wa.me/${s.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-secondary btn-sm" style="color: #25D366;">
            <i class="fab fa-whatsapp"></i> Contact
          </a>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Admin Payment Settings Manager
async function loadAdminPaymentSettings() {
  const form = document.getElementById('payment-settings-form');
  if (!form) return;

  const settings = await window.CMC_API.getSettings();
  const p = settings.payment || {};

  document.getElementById('bankName').value = p.bankName || '';
  document.getElementById('accountName').value = p.accountName || '';
  document.getElementById('accountNumber').value = p.accountNumber || '';
  document.getElementById('telebirrNumber').value = p.telebirrNumber || '';
  document.getElementById('paymentAmount').value = p.amount || 3500;
  document.getElementById('currency').value = p.currency || 'ETB';
  document.getElementById('telegramReceiptUsername').value = p.telegramReceiptUsername || 'IyasuMarkos';
  document.getElementById('paymentInstructions').value = p.instructions || '';

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const updatedPayment = {
      bankName: document.getElementById('bankName').value.trim(),
      accountName: document.getElementById('accountName').value.trim(),
      accountNumber: document.getElementById('accountNumber').value.trim(),
      telebirrNumber: document.getElementById('telebirrNumber').value.trim(),
      amount: parseFloat(document.getElementById('paymentAmount').value),
      currency: document.getElementById('currency').value.trim(),
      telegramReceiptUsername: document.getElementById('telegramReceiptUsername').value.trim(),
      instructions: document.getElementById('paymentInstructions').value.trim()
    };

    settings.payment = updatedPayment;
    await window.CMC_API.saveSettings(settings);
    window.showToast('Payment settings updated successfully!', 'success');
  });
}

// Admin General Settings Manager
async function loadAdminGeneralSettings() {
  const form = document.getElementById('general-settings-form');
  if (!form) return;

  const settings = await window.CMC_API.getSettings();
  const g = settings.general || {};

  document.getElementById('schoolName').value = g.schoolName || '';
  document.getElementById('phone').value = g.phone || '';
  document.getElementById('email').value = g.email || '';
  document.getElementById('whatsapp').value = g.whatsapp || '';
  document.getElementById('telegramUsername').value = g.telegramUsername || '';
  document.getElementById('heroTitle').value = g.heroTitle || '';
  document.getElementById('heroSubtitle').value = g.heroSubtitle || '';

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    settings.general = {
      ...g,
      schoolName: document.getElementById('schoolName').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      whatsapp: document.getElementById('whatsapp').value.trim(),
      telegramUsername: document.getElementById('telegramUsername').value.trim(),
      heroTitle: document.getElementById('heroTitle').value.trim(),
      heroSubtitle: document.getElementById('heroSubtitle').value.trim()
    };

    await window.CMC_API.saveSettings(settings);
    window.showToast('Website settings updated successfully!', 'success');
  });
}

// Admin Firebase Integration Settings Manager
async function loadAdminFirebaseSettings() {
  const form = document.getElementById('firebase-settings-form');
  if (!form) return;

  const badge = document.getElementById('firebase-status-badge');
  if (badge) {
    if (window.CMC_API.isFirebaseActive()) {
      badge.style.background = 'rgba(16, 185, 129, 0.15)';
      badge.style.color = '#10b981';
      badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      badge.innerHTML = `<i class="fas fa-check-circle"></i> Firebase Cloud Connected`;
    } else {
      badge.style.background = 'rgba(255, 107, 0, 0.15)';
      badge.style.color = 'var(--accent-orange)';
      badge.style.borderColor = 'rgba(255, 107, 0, 0.3)';
      badge.innerHTML = `<i class="fas fa-database"></i> LocalStorage Fallback Active`;
    }
  }

  // Load stored dynamic config if available
  const saved = localStorage.getItem('cmc_custom_firebase_config');
  let currentCfg = {};
  if (saved) {
    try { currentCfg = JSON.parse(saved); } catch(e){}
  }

  if (document.getElementById('fb-apiKey')) document.getElementById('fb-apiKey').value = currentCfg.apiKey || '';
  if (document.getElementById('fb-projectId')) document.getElementById('fb-projectId').value = currentCfg.projectId || '';
  if (document.getElementById('fb-authDomain')) document.getElementById('fb-authDomain').value = currentCfg.authDomain || '';
  if (document.getElementById('fb-storageBucket')) document.getElementById('fb-storageBucket').value = currentCfg.storageBucket || '';
  if (document.getElementById('fb-messagingSenderId')) document.getElementById('fb-messagingSenderId').value = currentCfg.messagingSenderId || '';
  if (document.getElementById('fb-appId')) document.getElementById('fb-appId').value = currentCfg.appId || '';

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const newConfig = {
      apiKey: document.getElementById('fb-apiKey').value.trim(),
      projectId: document.getElementById('fb-projectId').value.trim(),
      authDomain: document.getElementById('fb-authDomain').value.trim() || `${document.getElementById('fb-projectId').value.trim()}.firebaseapp.com`,
      storageBucket: document.getElementById('fb-storageBucket').value.trim() || `${document.getElementById('fb-projectId').value.trim()}.appspot.com`,
      messagingSenderId: document.getElementById('fb-messagingSenderId').value.trim(),
      appId: document.getElementById('fb-appId').value.trim()
    };

    localStorage.setItem('cmc_custom_firebase_config', JSON.stringify(newConfig));
    window.showToast('Firebase credentials saved successfully! Reloading page...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  });

  const resetBtn = document.getElementById('btn-reset-firebase');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      localStorage.removeItem('cmc_custom_firebase_config');
      window.showToast('Reset Firebase config to default LocalStorage mode. Reloading...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    });
  }
}

// Render Messages Inbox
async function renderAdminMessages() {
  const container = document.getElementById('messages-container');
  if (!container) return;

  const msgs = await window.CMC_API.getMessages();
  if (msgs.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 3rem;">No contact messages received yet.</p>`;
    return;
  }

  let html = '';
  msgs.forEach(m => {
    html += `
      <div class="card" style="margin-bottom: 1rem; border-color: var(--border-subtle);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <h4 style="color: var(--bright-orange);">${m.name} (${m.email})</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${new Date(m.createdAt).toLocaleString()}</span>
        </div>
        <p><strong>Subject:</strong> ${m.subject || 'General Inquiry'}</p>
        <p style="margin-top: 0.5rem; color: var(--text-white);">${m.message}</p>
      </div>
    `;
  });
  container.innerHTML = html;
}
