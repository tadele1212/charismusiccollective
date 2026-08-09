/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Settings & Dynamic Copy Loader
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async function() {
  await loadGlobalSettings();
});

async function loadGlobalSettings() {
  try {
    const settings = await window.CMC_API.getSettings();
    if (!settings) return;

    // Populate phone numbers
    document.querySelectorAll('.setting-phone').forEach(el => {
      el.textContent = settings.general.phone || '+251 910 070 940';
      if (el.tagName === 'A') el.href = `tel:${(settings.general.phone || '').replace(/[^0-9+]/g, '')}`;
    });

    // Populate payment info on success page
    const payBankName = document.getElementById('pay-bank-name');
    const payAccountName = document.getElementById('pay-account-name');
    const payAccountNumber = document.getElementById('pay-account-number');
    const payTelebirrNumber = document.getElementById('pay-telebirr-number');
    const payAmount = document.getElementById('pay-amount');
    const payTelegramUsername = document.getElementById('pay-telegram-username');
    const telegramBtn = document.getElementById('telegram-receipt-btn');

    if (payBankName) payBankName.textContent = settings.payment.bankName || 'Commercial Bank of Ethiopia';
    if (payAccountName) payAccountName.textContent = settings.payment.accountName || 'Iyasu Markos';
    if (payAccountNumber) payAccountNumber.textContent = settings.payment.accountNumber || '1000123456789';
    if (payTelebirrNumber) payTelebirrNumber.textContent = settings.payment.telebirrNumber || '+251 910 070 940';
    if (payAmount) payAmount.textContent = `${settings.payment.amount || 3500} ${settings.payment.currency || 'ETB'}`;
    
    const tgUser = settings.payment.telegramReceiptUsername || settings.general.telegramUsername || 'IyasuMarkos';
    const cleanTgUser = tgUser.replace('@', '');

    if (payTelegramUsername) payTelegramUsername.textContent = `@${cleanTgUser}`;

    if (telegramBtn) {
      const urlParams = new URLSearchParams(window.location.search);
      const regId = urlParams.get('id') || '';
      const textMsg = encodeURIComponent(`Hello Charis Music Collective, here is my payment receipt for Registration ID: ${regId}`);
      telegramBtn.href = `https://t.me/${cleanTgUser}?text=${textMsg}`;
    }
  } catch (err) {
    console.error("Error loading global settings:", err);
  }
}
