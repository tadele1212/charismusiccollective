/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Multi-step Registration Wizard Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
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

  // Pre-fill logged in student information
  const nameField = document.getElementById('fullName');
  const emailField = document.getElementById('email');
  if (nameField && currentStudent.fullName) nameField.value = currentStudent.fullName;
  if (emailField && currentStudent.email) emailField.value = currentStudent.email;

  // Auto-preselect program from URL query string if present
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedProg = urlParams.get('program');
  if (preselectedProg) {
    const radio = document.querySelector(`input[name="program"][value="${decodeURIComponent(preselectedProg)}"]`);
    if (radio) {
      radio.checked = true;
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
      const age = document.getElementById('age').value;

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
      } else if (!age || age < 5 || age > 100) {
        isValid = false;
        errorMsg = 'Please enter a valid age.';
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

      const age = parseInt(document.getElementById('age').value);
      const city = document.getElementById('city').value.trim() || 'Addis Ababa';
      const country = document.getElementById('country').value.trim() || 'Ethiopia';

      const programVal = document.querySelector('input[name="program"]:checked').value;
      const experienceLevel = document.querySelector('input[name="experienceLevel"]:checked').value;
      const previousExperience = document.querySelector('input[name="previousExperience"]:checked')?.value || 'No';
      const learningFormat = document.querySelector('input[name="learningFormat"]:checked').value;

      const preferredDays = Array.from(document.querySelectorAll('input[name="preferredDays"]:checked')).map(cb => cb.value);
      const preferredTime = document.querySelector('input[name="preferredTime"]:checked')?.value || 'Afternoon';
      const goals = document.getElementById('goals').value.trim() || 'No specific goals provided.';

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
        age: age,
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

      if (res.success) {
        window.showToast('Registration submitted successfully!', 'success');
        setTimeout(() => {
          window.location.href = `registration-success.html?id=${encodeURIComponent(registrationId)}`;
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      window.showToast('Failed to submit registration. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  });
});
