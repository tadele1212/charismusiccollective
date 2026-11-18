/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Multi-step Registration Wizard Engine
   ========================================================================== */

// Schedule Preference Dataset (Dynamic 1 Day vs 2 Days, In-Person Studio vs Online 24/7)
const SCHEDULE_DATA = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  
  // In-Person Studio Slots (Addis Ababa Operating Hours: 9:00 AM – 7:00 PM)
  inPerson: {
    '1_day': {
      Morning: ['9:00 AM – 11:00 AM', '11:00 AM – 1:00 PM'],
      Afternoon: ['2:00 PM – 4:00 PM', '4:00 PM – 6:00 PM'],
      Evening: ['5:00 PM – 7:00 PM']
    },
    '2_days': {
      Morning: ['9:00 AM – 10:00 AM', '10:00 AM – 11:00 AM', '11:00 AM – 12:00 PM', '12:00 PM – 1:00 PM'],
      Afternoon: ['2:00 PM – 3:00 PM', '3:00 PM – 4:00 PM', '4:00 PM – 5:00 PM', '5:00 PM – 6:00 PM'],
      Evening: ['6:00 PM – 7:00 PM']
    }
  },

  // Online 24/7 Round-the-Clock Slots (In Student Local Timezone)
  online: {
    '1_day': {
      Morning: ['6:00 AM – 8:00 AM', '8:00 AM – 10:00 AM', '10:00 AM – 12:00 PM'],
      Afternoon: ['12:00 PM – 2:00 PM', '2:00 PM – 4:00 PM', '4:00 PM – 6:00 PM'],
      Evening: ['6:00 PM – 8:00 PM', '7:00 PM – 9:00 PM', '9:00 PM – 11:00 PM'],
      Night: ['11:00 PM – 1:00 AM', '1:00 AM – 3:00 AM', '3:00 AM – 5:00 AM', '4:00 AM – 6:00 AM']
    },
    '2_days': {
      Morning: ['6:00 AM – 7:00 AM', '7:00 AM – 8:00 AM', '8:00 AM – 9:00 AM', '9:00 AM – 10:00 AM', '10:00 AM – 11:00 AM', '11:00 AM – 12:00 PM'],
      Afternoon: ['12:00 PM – 1:00 PM', '1:00 PM – 2:00 PM', '2:00 PM – 3:00 PM', '3:00 PM – 4:00 PM', '4:00 PM – 5:00 PM', '5:00 PM – 6:00 PM'],
      Evening: ['6:00 PM – 7:00 PM', '7:00 PM – 8:00 PM', '8:00 PM – 9:00 PM', '9:00 PM – 10:00 PM', '10:00 PM – 11:00 PM'],
      Night: ['11:00 PM – 12:00 AM', '12:00 AM – 1:00 AM', '1:00 AM – 2:00 AM', '2:00 AM – 3:00 AM', '3:00 AM – 4:00 AM', '4:00 AM – 5:00 AM', '5:00 AM – 6:00 AM']
    }
  }
};

// Calculate Instructor's local time in Addis Ababa (EAT, UTC+3) based on student local time
function calculateInstructorEATTime(timeSlotStr, studentTz) {
  if (!timeSlotStr || !studentTz) return null;
  try {
    if (studentTz.includes('Addis_Ababa') || studentTz.includes('Nairobi')) {
      return `${timeSlotStr} (Addis Ababa EAT)`;
    }

    const parts = timeSlotStr.split(/[–\-]/).map(s => s.trim());
    if (parts.length < 2) return null;

    const parseToHour = (tStr) => {
      const match = tStr.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
      if (!match) return null;
      let [_, h, m = '00', meridiem] = match;
      let hour = parseInt(h);
      if (meridiem.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;
      return { hour, minute: m };
    };

    const start = parseToHour(parts[0]);
    const end = parseToHour(parts[1]);
    if (!start || !end) return null;

    const ref = new Date();
    const studentHourStr = new Intl.DateTimeFormat('en-US', { timeZone: studentTz, hour: 'numeric', hourCycle: 'h23' }).format(ref);
    const addisHourStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Addis_Ababa', hour: 'numeric', hourCycle: 'h23' }).format(ref);
    const diffHours = parseInt(addisHourStr) - parseInt(studentHourStr);

    const convertSlotHour = ({ hour, minute }) => {
      let hAddis = (hour + diffHours + 48) % 24;
      let meridiem = hAddis >= 12 ? 'PM' : 'AM';
      let h12 = hAddis % 12;
      if (h12 === 0) h12 = 12;
      return `${h12}:${minute} ${meridiem}`;
    };

    return `${convertSlotHour(start)} – ${convertSlotHour(end)} EAT`;
  } catch (err) {
    console.warn("Timezone calculation warning:", err);
    return null;
  }
}

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

  // Local Timezone Display
  const studentTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const tzLabel = document.getElementById('detected-tz-label');
  if (tzLabel) {
    tzLabel.textContent = studentTz.replace(/_/g, ' ');
  }

  // Schedule Engine State & Render Functions
  let currentFrequency = '1_day';
  let currentActivePeriod = 'Morning';

  function renderDaysSelector(frequency, preselectedDays = []) {
    const container = document.getElementById('days-selection-container');
    const label = document.getElementById('days-section-label');
    const hint = document.getElementById('days-section-hint');
    const counter = document.getElementById('days-counter-badge');
    if (!container) return;

    const isTwoDays = (frequency === '2_days');
    if (label) label.textContent = isTwoDays ? 'Choose Your 2 Preferred Days *' : 'Choose Your Preferred Day *';
    if (hint) hint.textContent = isTwoDays 
      ? 'Select exactly 2 days for your 1-hour sessions (2 hours total weekly instruction).' 
      : 'Select the single day for your 2-hour weekly class session.';
    if (counter) {
      counter.style.display = isTwoDays ? 'inline-block' : 'none';
    }

    let html = '';
    SCHEDULE_DATA.days.forEach(day => {
      const isChecked = preselectedDays.includes(day);
      if (isTwoDays) {
        html += `
          <label class="day-select-pill" style="cursor: pointer; background: var(--bg-primary); padding: 0.65rem 1.1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: inline-flex; align-items: center; gap: 0.5rem; transition: all var(--transition-fast);">
            <input type="checkbox" name="preferredDayCb" value="${day}" ${isChecked ? 'checked' : ''} style="accent-color: var(--primary-orange);">
            <strong>${day}</strong>
          </label>
        `;
      } else {
        html += `
          <label class="day-select-pill" style="cursor: pointer; background: var(--bg-primary); padding: 0.65rem 1.1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: inline-flex; align-items: center; gap: 0.5rem; transition: all var(--transition-fast);">
            <input type="radio" name="preferredDayRadio" value="${day}" ${isChecked ? 'checked' : ''} style="accent-color: var(--primary-orange);">
            <strong>${day}</strong>
          </label>
        `;
      }
    });

    container.innerHTML = html;

    if (isTwoDays) {
      updateDayCheckboxConstraints();
      container.querySelectorAll('input[name="preferredDayCb"]').forEach(cb => {
        cb.addEventListener('change', updateDayCheckboxConstraints);
      });
    } else {
      container.querySelectorAll('input[name="preferredDayRadio"]').forEach(r => {
        r.addEventListener('change', updateRadioPillStyles);
      });
      updateRadioPillStyles();
    }
  }

  function updateRadioPillStyles() {
    const container = document.getElementById('days-selection-container');
    if (!container) return;
    container.querySelectorAll('input[name="preferredDayRadio"]').forEach(radio => {
      const pill = radio.closest('.day-select-pill');
      if (pill) {
        if (radio.checked) {
          pill.style.borderColor = 'var(--primary-orange)';
          pill.style.background = 'rgba(244,123,32,0.12)';
        } else {
          pill.style.borderColor = 'var(--border-subtle)';
          pill.style.background = 'var(--bg-primary)';
        }
      }
    });
  }

  function updateDayCheckboxConstraints() {
    const container = document.getElementById('days-selection-container');
    const counter = document.getElementById('days-counter-badge');
    if (!container) return;

    const allCbs = container.querySelectorAll('input[name="preferredDayCb"]');
    const checked = Array.from(allCbs).filter(cb => cb.checked);

    if (counter) {
      counter.textContent = `${checked.length} of 2 selected`;
      counter.style.color = checked.length === 2 ? '#27AE60' : 'var(--bright-orange)';
      counter.style.background = checked.length === 2 ? 'rgba(39,174,96,0.15)' : 'rgba(244,123,32,0.15)';
    }

    allCbs.forEach(cb => {
      const pill = cb.closest('.day-select-pill');
      if (pill) {
        if (cb.checked) {
          pill.style.borderColor = 'var(--primary-orange)';
          pill.style.background = 'rgba(244,123,32,0.12)';
        } else {
          pill.style.borderColor = 'var(--border-subtle)';
          pill.style.background = 'var(--bg-primary)';
        }
      }
    });

    if (checked.length >= 2) {
      allCbs.forEach(cb => {
        if (!cb.checked) {
          cb.disabled = true;
          const pill = cb.closest('.day-select-pill');
          if (pill) {
            pill.style.opacity = '0.4';
            pill.style.cursor = 'not-allowed';
          }
        }
      });
    } else {
      allCbs.forEach(cb => {
        cb.disabled = false;
        const pill = cb.closest('.day-select-pill');
        if (pill) {
          pill.style.opacity = '1';
          pill.style.cursor = 'pointer';
        }
      });
    }
  }

  function renderTimeSlots(frequency, format, activePeriod = 'Morning', preselectedSlot = null) {
    const grid = document.getElementById('time-slots-grid');
    const nightBtn = document.getElementById('night-period-btn');
    const formatBadge = document.getElementById('format-hours-badge');
    if (!grid) return;

    const isOnline = (format === 'Online');
    if (nightBtn) {
      nightBtn.style.display = isOnline ? 'inline-flex' : 'none';
      if (!isOnline && activePeriod === 'Night') {
        activePeriod = 'Morning';
        currentActivePeriod = 'Morning';
        document.querySelectorAll('.period-chip').forEach(c => {
          c.classList.toggle('active', c.getAttribute('data-period') === 'Morning');
        });
      }
    }

    if (formatBadge) {
      if (isOnline) {
        formatBadge.innerHTML = `<i class="fas fa-globe"></i> 24/7 Round-the-Clock Online Access`;
        formatBadge.style.color = '#00aaff';
        formatBadge.style.background = 'rgba(0,170,255,0.12)';
      } else {
        formatBadge.innerHTML = `<i class="fas fa-store-alt"></i> Studio Hours: 9:00 AM – 7:00 PM`;
        formatBadge.style.color = 'var(--bright-orange)';
        formatBadge.style.background = 'rgba(244,123,32,0.15)';
      }
    }

    const dataset = isOnline ? SCHEDULE_DATA.online[frequency] : SCHEDULE_DATA.inPerson[frequency];
    const slots = dataset ? (dataset[activePeriod] || []) : [];

    if (slots.length === 0) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 1.5rem;">No slots in this period.</p>`;
      return;
    }

    let html = '';
    slots.forEach((slot, idx) => {
      const isChecked = preselectedSlot ? (preselectedSlot === slot) : (idx === 0);
      const durationLabel = frequency === '2_days' ? '1 Hour Session' : '2 Hours Session';
      html += `
        <label class="option-card-radio">
          <input type="radio" name="preferredTimeSlot" value="${slot}" ${isChecked ? 'checked' : ''}>
          <div class="option-card-content" style="padding: 1.1rem 0.8rem;">
            <strong style="font-size: 0.95rem; color: var(--text-white);">${slot}</strong>
            <span style="font-size: 0.78rem; color: var(--primary-orange);">${durationLabel}</span>
          </div>
        </label>
      `;
    });

    grid.innerHTML = html;
  }

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
      const initialFreq = editingRegistration.frequency || (editingRegistration.preferredDays && editingRegistration.preferredDays.length === 2 ? '2_days' : '1_day');
      currentFrequency = initialFreq;
      const freqRadio = document.querySelector(`input[name="classFrequency"][value="${initialFreq}"]`);
      if (freqRadio) freqRadio.checked = true;

      const preDays = editingRegistration.preferredDays || (editingRegistration.preferredDay ? editingRegistration.preferredDay.split(',').map(s => s.trim()) : ['Saturday']);
      renderDaysSelector(initialFreq, preDays);

      const currentFormat = editingRegistration.learningFormat || 'Online';
      const preSlot = editingRegistration.preferredTime;
      const prePeriod = editingRegistration.studentTimePeriod || 'Morning';
      currentActivePeriod = prePeriod;
      
      document.querySelectorAll('.period-chip').forEach(c => {
        c.classList.toggle('active', c.getAttribute('data-period') === prePeriod);
      });
      renderTimeSlots(initialFreq, currentFormat, prePeriod, preSlot);

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

    // Default schedule initialization
    renderDaysSelector('1_day', ['Saturday']);
    renderTimeSlots('1_day', 'Online', 'Morning');
  }

  // Frequency Radio Change Handler
  document.querySelectorAll('input[name="classFrequency"]').forEach(r => {
    r.addEventListener('change', function() {
      currentFrequency = this.value;
      const format = document.querySelector('input[name="learningFormat"]:checked')?.value || 'Online';
      renderDaysSelector(currentFrequency, currentFrequency === '2_days' ? ['Tuesday', 'Thursday'] : ['Saturday']);
      renderTimeSlots(currentFrequency, format, currentActivePeriod);
    });
  });

  // Period Chips Click Handler
  document.querySelectorAll('.period-chip').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.period-chip').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentActivePeriod = this.getAttribute('data-period');
      const format = document.querySelector('input[name="learningFormat"]:checked')?.value || 'Online';
      renderTimeSlots(currentFrequency, format, currentActivePeriod);
    });
  });

  // Step 4 Learning Format Change Handler
  document.querySelectorAll('input[name="learningFormat"]').forEach(r => {
    r.addEventListener('change', function() {
      renderTimeSlots(currentFrequency, this.value, currentActivePeriod);
    });
  });

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
      const freq = document.querySelector('input[name="classFrequency"]:checked')?.value || '1_day';
      if (freq === '1_day') {
        const selectedDay = document.querySelector('input[name="preferredDayRadio"]:checked');
        if (!selectedDay) {
          isValid = false;
          errorMsg = 'Please select your preferred class day.';
        }
      } else {
        const checkedDays = document.querySelectorAll('input[name="preferredDayCb"]:checked');
        if (checkedDays.length !== 2) {
          isValid = false;
          errorMsg = 'Please select exactly 2 days for your weekly classes.';
        }
      }

      if (isValid) {
        const selectedSlot = document.querySelector('input[name="preferredTimeSlot"]:checked');
        if (!selectedSlot) {
          isValid = false;
          errorMsg = 'Please choose a preferred time slot.';
        }
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

      const classFrequency = document.querySelector('input[name="classFrequency"]:checked')?.value || '1_day';
      let selectedDays = [];
      if (classFrequency === '1_day') {
        const d = document.querySelector('input[name="preferredDayRadio"]:checked')?.value || 'Saturday';
        selectedDays = [d];
      } else {
        selectedDays = Array.from(document.querySelectorAll('input[name="preferredDayCb"]:checked')).map(cb => cb.value);
        if (selectedDays.length === 0) selectedDays = ['Tuesday', 'Thursday'];
      }

      const selectedSlot = document.querySelector('input[name="preferredTimeSlot"]:checked')?.value || '2:00 PM – 4:00 PM';
      const studentTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const activePeriod = document.querySelector('.period-chip.active')?.getAttribute('data-period') || 'Afternoon';
      const instructorTime = calculateInstructorEATTime(selectedSlot, studentTz);
      const sessionDuration = classFrequency === '2_days' ? '1_hour' : '2_hours';
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
          frequency: classFrequency,
          sessionDuration: sessionDuration,
          preferredDay: selectedDays.join(', '),
          preferredDays: selectedDays,
          preferredTime: selectedSlot,
          studentTimeZone: studentTz,
          studentTimePeriod: activePeriod,
          instructorTimeEAT: instructorTime || '',
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
        frequency: classFrequency,
        sessionDuration: sessionDuration,
        preferredDay: selectedDays.join(', '),
        preferredDays: selectedDays,
        preferredTime: selectedSlot,
        studentTimeZone: studentTz,
        studentTimePeriod: activePeriod,
        instructorTimeEAT: instructorTime || '',
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
