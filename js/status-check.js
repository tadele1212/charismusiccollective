/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Public & Student Registration Status Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async function() {
  await initAutomaticStudentStatus();
  initManualStatusForm();
});

// Auto-Load Registration Status for Logged-In Students
async function initAutomaticStudentStatus() {
  const loggedInContainer = document.getElementById('logged-in-status-container');
  const manualCard = document.getElementById('manual-lookup-card');
  const subtitleEl = document.getElementById('check-status-subtitle');
  if (!loggedInContainer) return;

  const user = window.CMC_API && window.CMC_API.getCurrentStudentUser ? window.CMC_API.getCurrentStudentUser() : null;

  if (user) {
    if (subtitleEl) {
      subtitleEl.innerHTML = `Signed in as <strong style="color: var(--primary-orange);">${user.fullName || user.email}</strong>. Here is your current registration status.`;
    }

    try {
      const regs = await window.CMC_API.getStudentRegistrations(user.email);

      if (regs && regs.length > 0) {
        let html = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 0.8rem;">
            <h2 style="font-size: 1.5rem; margin: 0;"><i class="fas fa-clipboard-check text-orange"></i> Your Registration Status</h2>
            <a href="student-dashboard.html" class="btn btn-secondary btn-sm"><i class="fas fa-user-graduate"></i> Open Student Dashboard</a>
          </div>
        `;

        regs.forEach(record => {
          let statusBadgeClass = 'badge-pending';
          let statusText = 'Registration Received (Pending Payment)';
          let statusDetail = 'Your registration has been saved. Please complete your payment and send your receipt via Telegram to get verified.';

          if (record.registrationStatus === 'approved') {
            statusBadgeClass = 'badge-approved';
            statusText = 'Approved & Officially Enrolled!';
            statusDetail = 'Congratulations! Your payment has been verified and your place in the class is confirmed. Our instructor will reach out to you with schedule details.';
          } else if (record.registrationStatus === 'payment_review') {
            statusBadgeClass = 'badge-payment_review';
            statusText = 'Payment Under Admin Review';
            statusDetail = 'We have received your payment notice. Our administrator is currently verifying the transaction with our records.';
          } else if (record.registrationStatus === 'rejected') {
            statusBadgeClass = 'badge-rejected';
            statusText = 'Registration Cancelled / Rejected';
            statusDetail = 'Your registration could not be confirmed. Please contact our support for further assistance.';
          }

          html += `
            <div class="card" style="border-color: var(--orange-border); margin-bottom: 1.5rem; padding: 2rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.8rem;">
                <span class="reg-id-badge" style="margin: 0; font-size: 1.1rem;">${record.registrationId}</span>
                <span class="badge ${statusBadgeClass}">${statusText}</span>
              </div>
              
              <h3 style="margin-bottom: 0.4rem; font-size: 1.4rem;">${record.programName} Class</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Format: <strong>${record.learningFormat}</strong> | Level: <strong>${record.experienceLevel}</strong></p>

              <div style="padding: 1rem 1.2rem; background: var(--bg-primary); border-radius: var(--radius-sm); border-left: 3px solid var(--primary-orange); margin-bottom: 1.2rem;">
                <p style="margin: 0; color: var(--text-white); font-size: 0.95rem;">${statusDetail}</p>
              </div>

              ${record.registrationStatus !== 'approved' ? `
                <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center; margin-top: 1rem;">
                  <a href="https://t.me/Iyasu_Markos?text=${encodeURIComponent('Hello Charis Music Collective, here is my receipt for ' + record.registrationId)}" target="_blank" class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, #0088cc 0%, #00aaff 100%); color: white;">
                    <i class="fab fa-telegram-plane"></i> Send Receipt via Telegram
                  </a>
                  <a href="registration-success.html?id=${record.registrationId}" class="btn btn-secondary btn-sm">
                    View Payment Instructions
                  </a>
                </div>
              ` : ''}
            </div>
          `;
        });

        html += `
          <div style="text-align: center; margin: 1.5rem 0 2rem 0;">
            <button type="button" id="toggle-manual-search-btn" class="btn btn-secondary btn-sm" style="font-size: 0.85rem; padding: 0.4rem 1rem;">
              <i class="fas fa-search"></i> Need to look up a different Registration ID?
            </button>
          </div>
        `;

        loggedInContainer.innerHTML = html;

        // Hide manual lookup card by default when logged-in user has registrations
        if (manualCard) manualCard.style.display = 'none';

        const toggleBtn = document.getElementById('toggle-manual-search-btn');
        if (toggleBtn && manualCard) {
          toggleBtn.addEventListener('click', function() {
            if (manualCard.style.display === 'none') {
              manualCard.style.display = 'block';
              toggleBtn.innerHTML = `<i class="fas fa-chevron-up"></i> Hide Manual Search Form`;
            } else {
              manualCard.style.display = 'none';
              toggleBtn.innerHTML = `<i class="fas fa-search"></i> Need to look up a different Registration ID?`;
            }
          });
        }
      } else {
        // Logged in but no registrations yet
        loggedInContainer.innerHTML = `
          <div class="card" style="border-color: var(--orange-border); text-align: center; padding: 2.5rem; margin-bottom: 2rem;">
            <i class="fas fa-info-circle text-orange" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 0.5rem;">No Registrations Found</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
              You are signed in as <strong>${user.email}</strong>, but you haven't submitted any class registrations yet.
            </p>
            <a href="register.html" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Register for a Class Now</a>
          </div>
        `;
        if (manualCard) manualCard.style.display = 'block';
      }
    } catch (err) {
      console.error("Error auto-loading status:", err);
      if (manualCard) manualCard.style.display = 'block';
    }
  } else {
    // Visitor is NOT logged in - show sign-in tip banner
    loggedInContainer.innerHTML = `
      <div class="card" style="margin-bottom: 2rem; background: rgba(244, 123, 32, 0.08); border-color: var(--orange-border); padding: 1.2rem 1.5rem; text-align: center;">
        <p style="margin: 0; color: var(--text-white); font-size: 0.95rem;">
          <i class="fas fa-user-circle text-orange"></i> Have a student account? 
          <a href="student-auth.html?redirect=check-status" style="color: var(--bright-orange); font-weight: 600; text-decoration: underline; margin-left: 0.3rem;">
            Sign In
          </a> to view your registration status instantly without typing an ID.
        </p>
      </div>
    `;
    if (manualCard) manualCard.style.display = 'block';
  }
}

// Manual Form Lookup Handler
function initManualStatusForm() {
  const form = document.getElementById('status-lookup-form');
  if (!form) return;

  const resultContainer = document.getElementById('status-result-container');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const regId = document.getElementById('lookupId').value.trim();

    if (!regId) {
      window.showToast('Please enter your Registration ID.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Searching...`;

    try {
      const record = await window.CMC_API.queryRegistration(regId);

      if (record) {
        let statusBadgeClass = 'badge-pending';
        let statusText = 'Registration Received (Pending Payment)';
        let statusDetail = 'Your registration has been saved. Please complete your payment and send your receipt via Telegram to get verified.';

        if (record.registrationStatus === 'approved') {
          statusBadgeClass = 'badge-approved';
          statusText = 'Registration Approved & Enrolled!';
          statusDetail = 'Congratulations! Your payment has been verified and your place in the class is confirmed. Our instructor will reach out to you with schedule details.';
        } else if (record.registrationStatus === 'payment_review') {
          statusBadgeClass = 'badge-payment_review';
          statusText = 'Payment Under Review';
          statusDetail = 'We have received your payment notice. Our administrator is currently verifying the transaction with our bank records.';
        } else if (record.registrationStatus === 'rejected') {
          statusBadgeClass = 'badge-rejected';
          statusText = 'Registration Cancelled / Rejected';
          statusDetail = 'Your registration could not be confirmed. Please contact our school support for further assistance.';
        }

        resultContainer.innerHTML = `
          <div class="card" style="border-color: var(--orange-border); margin-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.8rem;">
              <span class="reg-id-badge" style="margin: 0; font-size: 1.1rem;">${record.registrationId}</span>
              <span class="badge ${statusBadgeClass}">${statusText}</span>
            </div>
            <h3 style="margin-bottom: 0.5rem;">${record.fullName}</h3>
            <p><strong>Selected Program:</strong> ${record.programName} (${record.learningFormat})</p>
            <p style="margin-top: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: var(--radius-sm); color: var(--text-white);">
              ${statusDetail}
            </p>
            ${record.registrationStatus !== 'approved' ? `
              <div style="margin-top: 1.5rem; display: flex; gap: 0.8rem; flex-wrap: wrap;">
                <a href="https://t.me/Iyasu_Markos?text=${encodeURIComponent('Hello Charis Music Collective, here is my payment receipt for ' + record.registrationId)}" target="_blank" class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, #0088cc 0%, #00aaff 100%); color: white;">
                  <i class="fab fa-telegram-plane"></i> Send Receipt via Telegram
                </a>
                <a href="registration-success.html?id=${record.registrationId}" class="btn btn-secondary btn-sm">
                  View Payment Instructions
                </a>
              </div>
            ` : ''}
          </div>
        `;
      } else {
        resultContainer.innerHTML = `
          <div class="card" style="margin-top: 2rem; border-color: rgba(235, 87, 87, 0.4); text-align: center;">
            <i class="fas fa-exclamation-triangle text-orange" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
            <h3>No Matching Registration Found</h3>
            <p>Please double-check your Registration ID (e.g. <strong>CMC-2026-00001</strong>). If you registered recently, ensure the ID is typed correctly.</p>
          </div>
        `;
      }
      if (resultContainer) {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err) {
      console.error(err);
      window.showToast('Error searching registration.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Check Status <i class="fas fa-search"></i>`;
    }
  });
}
