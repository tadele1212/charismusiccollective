/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Student Dashboard & Status Tracker Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async function() {
  const student = checkStudentAuth();
  if (!student) return;

  renderStudentProfileHeader(student);
  await renderStudentRegistrations(student);

  const logoutBtn = document.getElementById('student-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      window.CMC_API.logoutStudentUser();
      window.showToast('Logged out successfully.', 'info');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    });
  }
});

function checkStudentAuth() {
  const user = window.CMC_API.getCurrentStudentUser();
  if (!user) {
    window.location.href = 'student-auth.html?redirect=dashboard';
    return null;
  }
  return user;
}

function renderStudentProfileHeader(user) {
  const nameEl = document.getElementById('student-display-name');
  const emailEl = document.getElementById('student-display-email');
  const verifyBanner = document.getElementById('email-verification-banner');

  if (nameEl) nameEl.textContent = user.fullName || 'Student';
  if (emailEl) emailEl.textContent = user.email;

  if (verifyBanner && user.emailVerified === false) {
    verifyBanner.style.display = 'block';
    verifyBanner.innerHTML = `
      <div style="background: rgba(245,166,35,0.12); border: 1px solid var(--orange-border); padding: 1rem 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="color: var(--bright-orange);"><i class="fas fa-envelope-open-text"></i> Email Verification Pending</strong>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">We have sent a verification link to <strong>${user.email}</strong>. You can continue using the portal!</p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="window.showToast('Verification email resent!', 'success')">Resend Email</button>
      </div>
    `;
  }
}

async function renderStudentRegistrations(user) {
  const container = document.getElementById('student-registrations-container');
  if (!container) return;

  const regs = await window.CMC_API.getStudentRegistrations(user.email);

  if (regs.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 3.5rem 2rem; border-color: var(--orange-border);">
        <div style="font-size: 3rem; color: var(--primary-orange); margin-bottom: 1rem;"><i class="fas fa-music"></i></div>
        <h3>No Class Registrations Yet</h3>
        <p style="color: var(--text-secondary); margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto;">
          You haven't submitted any class registrations yet. Choose your preferred instrument and get started today!
        </p>
        <a href="register.html" class="btn btn-primary"><i class="fas fa-plus-circle"></i> REGISTER FOR A CLASS</a>
      </div>
    `;
    return;
  }

  let html = '';
  regs.forEach(reg => {
    // Determine progress timeline step
    let step1Class = 'completed', step2Class = '', step3Class = '', step4Class = '';
    let statusBadgeText = 'Registration Received';
    let statusBadgeClass = 'badge-pending';

    if (reg.registrationStatus === 'pending_payment' || reg.paymentStatus === 'pending') {
      step2Class = 'current';
      statusBadgeText = 'Pending Payment Transfer';
      statusBadgeClass = 'badge-pending';
    } else if (reg.registrationStatus === 'payment_review' || reg.paymentStatus === 'receipt_submitted') {
      step2Class = 'completed';
      step3Class = 'current';
      statusBadgeText = 'Payment Under Admin Review';
      statusBadgeClass = 'badge-payment_review';
    } else if (reg.registrationStatus === 'approved' || reg.paymentStatus === 'verified') {
      step2Class = 'completed';
      step3Class = 'completed';
      step4Class = 'completed';
      statusBadgeText = 'Approved & Officially Enrolled';
      statusBadgeClass = 'badge-approved';
    } else if (reg.registrationStatus === 'rejected' || reg.registrationStatus === 'cancelled') {
      statusBadgeText = 'Registration Cancelled';
      statusBadgeClass = 'badge-rejected';
    }

    html += `
      <div class="card" style="margin-bottom: 2rem; border-color: var(--orange-border);">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <span class="reg-id-badge" style="margin: 0; font-size: 1.1rem;">${reg.registrationId}</span>
            <h3 style="font-size: 1.5rem; margin-top: 0.4rem;">${reg.programName} Class</h3>
          </div>
          <span class="badge ${statusBadgeClass}" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
            ${statusBadgeText}
          </span>
        </div>

        <!-- Timeline Stepper -->
        <div class="status-timeline">
          <div class="timeline-step ${step1Class}">
            <div class="timeline-circle"><i class="fas fa-check"></i></div>
            <span class="timeline-title">Submitted</span>
          </div>

          <div class="timeline-step ${step2Class}">
            <div class="timeline-circle">${step2Class === 'completed' ? '<i class="fas fa-check"></i>' : '2'}</div>
            <span class="timeline-title">Payment Pending</span>
          </div>

          <div class="timeline-step ${step3Class}">
            <div class="timeline-circle">${step3Class === 'completed' ? '<i class="fas fa-check"></i>' : '3'}</div>
            <span class="timeline-title">Admin Review</span>
          </div>

          <div class="timeline-step ${step4Class}">
            <div class="timeline-circle">${step4Class === 'completed' ? '<i class="fas fa-check"></i>' : '4'}</div>
            <span class="timeline-title">Approved</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1.8rem 0; background: var(--bg-primary); padding: 1.2rem; border-radius: var(--radius-sm);">
          <div>
            <p><strong>Format:</strong> ${reg.learningFormat}</p>
            <p><strong>Level:</strong> ${reg.experienceLevel}</p>
            <p><strong>Schedule:</strong> ${(reg.preferredDays || []).join(', ')} (${reg.preferredTime})</p>
          </div>
          <div>
            <p><strong>Phone:</strong> ${reg.phone}</p>
            <p><strong>Telegram:</strong> ${reg.telegramUsername}</p>
            <p><strong>Date:</strong> ${new Date(reg.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        ${reg.registrationStatus !== 'approved' ? `
          <div style="background: rgba(0, 136, 204, 0.12); border: 1px solid rgba(0, 136, 204, 0.3); padding: 1.5rem; border-radius: var(--radius-md); text-align: center;">
            <h4 style="color: #0088cc; margin-bottom: 0.4rem;"><i class="fab fa-telegram-plane"></i> Next Step: Telegram Payment Verification</h4>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.2rem;">
              Send your payment receipt screenshot with Registration ID <strong>${reg.registrationId}</strong> to Telegram handle <strong>@IyasuMarkos</strong>.
            </p>
            <a href="https://t.me/IyasuMarkos?text=${encodeURIComponent('Hello Charis Music Collective, here is my payment receipt for ' + reg.registrationId)}" target="_blank" class="btn btn-primary" style="background: linear-gradient(135deg, #0088cc 0%, #00aaff 100%); color: white;">
              <i class="fab fa-telegram-plane"></i> SEND RECEIPT ON TELEGRAM NOW
            </a>
          </div>
        ` : `
          <div style="background: rgba(39,174,96,0.12); border: 1px solid rgba(39,174,96,0.4); padding: 1.5rem; border-radius: var(--radius-md); text-align: center;">
            <h4 style="color: #27AE60; margin-bottom: 0.4rem;"><i class="fas fa-user-check"></i> Enrollment Confirmed!</h4>
            <p style="font-size: 0.95rem; color: var(--text-white);">Your payment has been verified. Instructor Iyasu Markos will contact you with live session details.</p>
          </div>
        `}

      </div>
    `;
  });

  container.innerHTML = html;
}
