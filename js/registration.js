/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Multi-step Registration Wizard Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async function() {
  const form = document.getElementById('registration-form');
  if (!form) return;

  let currentStep = 1;
  const totalSteps = 7;

  // Check if student is logged in; if not, redirect to Account Creation
  const currentStudent = window.CMC_API && window.CMC_API.getCurrentStudentUser ? window.CMC_API.getCurrentStudentUser() : null;
  if (!currentStudent) {
    const search = window.location.search;
    let authUrl = 'student-auth.html?mode=signup&redirect=register';
    if (search) authUrl += '&' + search.replace('?', '');
    window.location.href = authUrl;
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  let editingRegistration = null;

  // Check if we are in Edit Mode
  if (editId) {
    try {
      editingRegistration = await window.CMC_API.getRegistrationById(editId);
      if (!editingRegistration) {
        window.showToast('Registration record not found.', 'error');
        setTimeout(() => { window.location.href = 'student-dashboard.html'; }, 1500);
        return;
      }

      // If already approved, lock editing
      if (editingRegistration.registrationStatus === 'approved' || editingRegistration.paymentStatus === 'verified') {
        window.showToast('This registration is already approved and cannot be modified.', 'warning');
        setTimeout(() => { window.location.href = 'student-dashboard.html'; }, 1800);
        return;
      }

      // Show Edit Mode Banner
      const editBanner = document.getElementById('edit-mode-banner');
      const editTitle = document.getElementById('edit-mode-title');
      if (editBanner) editBanner.style.display = 'flex';
      if (editTitle) editTitle.textContent = `${editingRegistration.registrationId} (${editingRegistration.programName || 'Class'})`;

      // Update submit button label
      const submitBtn = document.getElementById('submit-registration-btn') || form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = `UPDATE APPLICATION <i class="fas fa-save"></i>`;
      }

      // Pre-fill Step 1: Personal Information
      if (document.getElementById('fullName')) document.getElementById('fullName').value = editingRegistration.fullName || '';
      if (document.getElementById('phone')) document.getElementById('phone').value = editingRegistration.phone || '';
      if (document.getElementById('email')) document.getElementById('email').value = editingRegistration.email || '';
      if (document.getElementById('telegramUsername')) document.getElementById('telegramUsername').value = editingRegistration.telegramUsername || '';
      if (document.getElementById('city')) document.getElementById('city').value = editingRegistration.city || 'Addis Ababa';
      if (document.getElementById('country') && editingRegistration.country) {
        document.getElementById('country').value = editingRegistration.country;
      }

      // Pre-fill Step 2: Program
      if (editingRegistration.programName) {
        const progRadio = document.querySelector(`input[name="program"][value="${editingRegistration.programName}"]`);
        if (progRadio) progRadio.checked = true;
      }

      // Pre-fill Step 3: Experience
      if (editingRegistration.experienceLevel) {
        const expRadio = document.querySelector(`input[name="experienceLevel"][value="${editingRegistration.experienceLevel}"]`);
        if (expRadio) expRadio.checked = true;
      }
      if (editingRegistration.previousExperience) {
        const prevRadio = document.querySelector(`input[name="previousExperience"][value="${editingRegistration.previousExperience}"]`);
        if (prevRadio) prevRadio.checked = true;
      }

      // Pre-fill Step 4: Learning Format
      if (editingRegistration.learningFormat) {
        const formatRadio = document.querySelector(`input[name="learningFormat"][value="${editingRegistration.learningFormat}"]`);
        if (formatRadio) formatRadio.checked = true;
      }

      // Pre-fill Step 5: Schedule
      if (Array.isArray(editingRegistration.preferredDays)) {
        document.querySelectorAll('input[name="preferredDays"]').forEach(cb => {
          cb.checked = editingRegistration.preferredDays.includes(cb.value);
        });
      }
      if (editingRegistration.preferredTime) {
        const timeRadio = document.querySelector(`input[name="preferredTime"][value="${editingRegistration.preferredTime}"]`);
        if (timeRadio) timeRadio.checked = true;
      }

      // Pre-fill Step 6: Goals
      if (document.getElementById('goals') && editingRegistration.goals) {
        document.getElementById('goals').value = editingRegistration.goals;
      }

      // Step 7: Terms pre-checked for convenience
      if (document.getElementById('termsAgreement')) {
        document.getElementById('termsAgreement').checked = true;
      }

    } catch (err) {
      console.error("Error loading registration for editing:", err);
    }
  } else {
    // Normal New Registration: Pre-fill logged in student information
    const nameField = document.getElementById('fullName');
    const emailField = document.getElementById('email');
    if (nameField && currentStudent.fullName) nameField.value = currentStudent.fullName;
    if (emailField && currentStudent.email) emailField.value = currentStudent.email;

    // Auto-preselect program from URL query string if present
    const preselectedProg = urlParams.get('program');
    if (preselectedProg) {
      const radio = document.querySelector(`input[name="program"][value="${decodeURIComponent(preselectedProg)}"]`);
      if (radio) {
        radio.checked = true;
      }
    }
  }

  // Next Step Button Click Handler
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', function() {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          currentStep++;
          updateStepUI(currentStep);
        }
      }
    });
  });

  // Prev Step Button Click Handler
  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', function() {
      if (currentStep > 1) {
        currentStep--;
        updateStepUI(currentStep);
      }
    });
  });

  // Update UI indicator and step visibility
  function updateStepUI(step) {
    document.querySelectorAll('.form-step').forEach((el, idx) => {
      el.classList.toggle('active', (idx + 1) === step);
    });

    document.querySelectorAll('.step-item').forEach((el, idx) => {
      const stepNum = idx + 1;
      el.classList.remove('active', 'completed');
      if (stepNum === step) {
        el.classList.add('active');
      } else if (stepNum < step) {
        el.classList.add('completed');
      }
    });

    window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
  }

  // Validation function per step
  function validateStep(step) {
    let isValid = true;
    let errorMsg = '';

    if (step === 1) {
      const fullName = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const telegram = document.getElementById('telegramUsername').value.trim();
      const country = document.getElementById('country').value.trim();

      if (!fullName) {
        isValid = false;
        errorMsg = 'Please enter your full name.';
      } else if (!phone || phone.length < 9) {
        isValid = false;
        errorMsg = 'Please enter a valid phone number.';
      } else if (!email || !email.includes('@')) {
        isValid = false;
        errorMsg = 'Please enter a valid email address.';
      } else if (!telegram) {
        isValid = false;
        errorMsg = 'Please enter your Telegram username (e.g. @yourname).';
      } else if (!country) {
        isValid = false;
        errorMsg = 'Please select your country.';
      }
    }

    if (step === 2) {
      const selectedProg = document.querySelector('input[name="program"]:checked');
      if (!selectedProg) {
        isValid = false;
        errorMsg = 'Please select a preferred instrument or program.';
      }
    }

    if (step === 3) {
      const selectedLevel = document.querySelector('input[name="experienceLevel"]:checked');
      if (!selectedLevel) {
        isValid = false;
        errorMsg = 'Please select your current experience level.';
      }
    }

    if (step === 4) {
      const selectedFormat = document.querySelector('input[name="learningFormat"]:checked');
      if (!selectedFormat) {
        isValid = false;
        errorMsg = 'Please choose your preferred learning format.';
      }
    }

    if (step === 5) {
      const checkedDays = document.querySelectorAll('input[name="preferredDays"]:checked');
      if (checkedDays.length === 0) {
        isValid = false;
        errorMsg = 'Please select at least one preferred day.';
      }
    }

    if (step === 7) {
      const termsChecked = document.getElementById('termsAgreement').checked;
      if (!termsChecked) {
        isValid = false;
        errorMsg = 'You must confirm that your information is accurate.';
      }
    }

    if (!isValid && errorMsg) {
      window.showToast(errorMsg, 'error');
    }

    return isValid;
  }

  // Handle Form Submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateStep(7)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Registering...`;

    try {
      // Gather Form Fields
      const fullName = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      let telegram = document.getElementById('telegramUsername').value.trim();
      if (!telegram.startsWith('@')) telegram = '@' + telegram;

      const city = document.getElementById('city').value.trim() || 'Addis Ababa';
      const country = document.getElementById('country').value.trim() || 'Ethiopia';

      const programVal = document.querySelector('input[name="program"]:checked').value;
      const experienceLevel = document.querySelector('input[name="experienceLevel"]:checked').value;
      const previousExperience = document.querySelector('input[name="previousExperience"]:checked')?.value || 'No';
      const learningFormat = document.querySelector('input[name="learningFormat"]:checked').value;

      const preferredDays = Array.from(document.querySelectorAll('input[name="preferredDays"]:checked')).map(cb => cb.value);
      const preferredTime = document.querySelector('input[name="preferredTime"]:checked')?.value || 'Afternoon';
      const goals = document.getElementById('goals').value.trim() || 'No specific goals provided.';

      // Check if we are modifying an existing registration
      if (editingRegistration && editId) {
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Updating...`;

        const updatedFields = {
          fullName: fullName,
          phone: phone,
          email: email,
          telegramUsername: telegram,
          city: city,
          country: country,
          instrumentId: programVal.toLowerCase(),
          instrumentName: programVal,
          programId: programVal.toLowerCase(),
          programName: programVal,
          experienceLevel: experienceLevel,
          previousExperience: previousExperience,
          learningFormat: learningFormat,
          preferredDays: preferredDays,
          preferredTime: preferredTime,
          goals: goals
        };

        const res = await window.CMC_API.updateRegistration(editId, updatedFields);

        if (res && res.success) {
          // Update cached registration if it matches
          const cached = JSON.parse(localStorage.getItem('cmc_latest_registration') || 'null');
          if (cached && (cached.registrationId || '').toUpperCase() === editId.toUpperCase()) {
            const merged = { ...cached, ...updatedFields };
            localStorage.setItem('cmc_latest_registration', JSON.stringify(merged));
            sessionStorage.setItem('cmc_latest_registration', JSON.stringify(merged));
          }

          window.showToast('Application updated successfully!', 'success');
          setTimeout(() => {
            window.location.href = 'student-dashboard.html';
          }, 1200);
        } else {
          window.showToast(res.error || 'Failed to update application. Please try again.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
        }
        return;
      }

      // Generate Unique Registration ID: CMC-2026-XXXXX
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const registrationId = `CMC-2026-${randomNum}`;

      // Payload object
      const regPayload = {
        registrationId: registrationId,
        studentUid: currentStudent ? currentStudent.uid : null,
        fullName: fullName,
        phone: phone,
        email: email,
        telegramUsername: telegram,
        age: null,
        city: city,
        country: country,
        instrumentId: programVal.toLowerCase(),
        instrumentName: programVal,
        programId: programVal.toLowerCase(),
        programName: programVal,
        experienceLevel: experienceLevel,
        previousExperience: previousExperience,
        learningFormat: learningFormat,
        preferredDays: preferredDays,
        preferredTime: preferredTime,
        goals: goals,
        paymentStatus: 'pending',
        registrationStatus: 'pending_payment',
        receiptUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save payload locally for instant display on success page
      sessionStorage.setItem('cmc_latest_registration', JSON.stringify(regPayload));
      localStorage.setItem('cmc_latest_registration', JSON.stringify(regPayload));

      // Submit via API adapter
      const res = await window.CMC_API.createRegistration(regPayload);

      if (res && res.success) {
        window.showToast('Registration submitted successfully!', 'success');
        setTimeout(() => {
          window.location.href = `registration-success.html?id=${encodeURIComponent(registrationId)}`;
        }, 1200);
      } else {
        window.showToast(res.error || 'Failed to submit registration. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }
    } catch (err) {
      console.error(err);
      window.showToast('Failed to submit registration. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  });
});
