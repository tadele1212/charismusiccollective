/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Public Registration Lookup Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('status-lookup-form');
  if (!form) return;

  const resultContainer = document.getElementById('status-result-container');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const regId = document.getElementById('lookupId').value.trim();
    const phone = document.getElementById('lookupPhone').value.trim();

    if (!regId || !phone) {
      window.showToast('Please provide both Registration ID and Phone number.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Searching...`;

    try {
      const record = await window.CMC_API.queryRegistration(regId, phone);

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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <span class="reg-id-badge" style="margin: 0; font-size: 1.1rem;">${record.registrationId}</span>
              <span class="badge ${statusBadgeClass}">${statusText}</span>
            </div>
            <h3 style="margin-bottom: 0.5rem;">${record.fullName}</h3>
            <p><strong>Selected Program:</strong> ${record.programName} (${record.learningFormat})</p>
            <p style="margin-top: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: var(--radius-sm); color: var(--text-white);">
              ${statusDetail}
            </p>
            ${record.registrationStatus !== 'approved' ? `
              <div style="margin-top: 1.5rem;">
                <a href="registration-success.html?id=${record.registrationId}" class="btn btn-primary btn-sm">
                  View Payment Instructions & Send Receipt
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
            <p>Please double-check your Registration ID (e.g. CMC-2026-00001) and the phone number provided during registration.</p>
          </div>
        `;
      }
    } catch (err) {
      console.error(err);
      window.showToast('Error searching registration.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Check Status <i class="fas fa-search"></i>`;
    }
  });
});
