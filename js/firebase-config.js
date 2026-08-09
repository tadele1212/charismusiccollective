/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Firebase Configuration & Storage/Mock Adapter
   ========================================================================== */

// Default configuration template (Replace with your actual Firebase Console keys)
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "charis-music-collective.firebaseapp.com",
  projectId: "charis-music-collective",
  storageBucket: "charis-music-collective.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Global Store State for Local Fallback Engine
const MOCK_STORAGE_KEY_REGISTRATIONS = 'cmc_mock_registrations';
const MOCK_STORAGE_KEY_SETTINGS = 'cmc_mock_settings';
const MOCK_STORAGE_KEY_MESSAGES = 'cmc_mock_messages';
const MOCK_STORAGE_KEY_PROGRAMS = 'cmc_mock_programs';
const MOCK_STORAGE_KEY_INSTRUMENTS = 'cmc_mock_instruments';
const MOCK_STORAGE_KEY_ADMIN = 'cmc_mock_admin_session';

// Initialize default mock settings if empty
function initMockSettings() {
  if (!localStorage.getItem(MOCK_STORAGE_KEY_SETTINGS)) {
    const defaultSettings = {
      general: {
        schoolName: "Charis Music Collective",
        logoUrl: "assets/images/logo.png",
        phone: "+251 910 070 940",
        email: "contact@charismusiccollective.com",
        whatsapp: "+251910070940",
        telegramUsername: "IyasuMarkos",
        heroTitle: "LEARN MUSIC. CREATE YOUR SOUND.",
        heroSubtitle: "ONLINE & IN-PERSON MUSIC CLASSES",
        instructorName: "Iyasu Markos",
        tagline: "YOUR PASSION. MY GUIDANCE. YOUR SOUND."
      },
      payment: {
        enabled: true,
        amount: 3500,
        currency: "ETB",
        paymentMethod: "Bank Transfer & Telebirr",
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountName: "Iyasu Markos",
        accountNumber: "1000123456789",
        telebirrNumber: "+251 910 070 940",
        instructions: "Please make payment using your Registration ID as the reference/memo, then send your receipt via Telegram.",
        telegramReceiptUsername: "IyasuMarkos"
      }
    };
    localStorage.setItem(MOCK_STORAGE_KEY_SETTINGS, JSON.stringify(defaultSettings));
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEY_PROGRAMS)) {
    const defaultPrograms = [
      { id: "prog_piano", name: "Piano", icon: "fas fa-keyboard", levels: "Beginner → Advanced", format: "Online & In-Person", desc: "Master keyboard chords, scales, gospel rhythm, ear training, and classic/modern arrangements.", image: "assets/images/piano.png", available: true },
      { id: "prog_guitar", name: "Guitar", icon: "fas fa-guitar", levels: "Beginner → Advanced", format: "Online & In-Person", desc: "Acoustic and electric guitar techniques, chords, lead improvisation, rhythm, and stage performance.", image: "assets/images/guitar.png", available: true },
      { id: "prog_bass", name: "Bass", icon: "fas fa-music", levels: "Beginner → Advanced", format: "Online & In-Person", desc: "Groove building, finger technique, walking basslines, worship bass, and tight rhythm section timing.", image: "assets/images/bass.png", available: true },
      { id: "prog_tutorial", name: "Music Tutorial", icon: "fas fa-graduation-cap", levels: "All Levels", format: "Online & In-Person", desc: "Comprehensive music theory, sight reading, ear development, and customized song learning.", image: "assets/images/piano.png", available: true },
      { id: "prog_arrangement", name: "Music Arrangement", icon: "fas fa-sliders-h", levels: "Intermediate → Advanced", format: "Online & In-Person", desc: "Learn how to structure songs, arrange harmonies, write instrumentation, and shape full musical tracks.", image: "assets/images/studio.png", available: true },
      { id: "prog_mixing", name: "Mixing & Mastering", icon: "fas fa-compact-disc", levels: "Intermediate → Advanced", format: "Online & In-Person", desc: "EQ, compression, spatial audio, vocal tuning, loudness mastering, and achieving radio-ready tracks.", image: "assets/images/studio.png", available: true },
      { id: "prog_production", name: "Music Production", icon: "fas fa-laptop-house", levels: "Beginner → Advanced", format: "Online & In-Person", desc: "DAW workflow, beat making, sample manipulation, synth sound design, and full track engineering.", image: "assets/images/studio.png", available: true }
    ];
    localStorage.setItem(MOCK_STORAGE_KEY_PROGRAMS, JSON.stringify(defaultPrograms));
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEY_REGISTRATIONS)) {
    // Demo registrations for initial view
    const demoRegs = [
      {
        registrationId: "CMC-2026-00001",
        fullName: "Abebe Kebede",
        phone: "+251911223344",
        email: "abebe@example.com",
        telegramUsername: "@abebe_k",
        age: 24,
        city: "Addis Ababa",
        country: "Ethiopia",
        instrumentName: "Guitar",
        programName: "Guitar",
        experienceLevel: "Beginner",
        previousExperience: "No",
        learningFormat: "In-Person",
        preferredDays: ["Saturday", "Sunday"],
        preferredTime: "Afternoon",
        goals: "Learn acoustic guitar for worship team at church.",
        paymentStatus: "pending",
        registrationStatus: "pending_payment",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        registrationId: "CMC-2026-00002",
        fullName: "Bethlehem Tadesse",
        phone: "+251922334455",
        email: "bethlehem@example.com",
        telegramUsername: "@betty_t",
        age: 21,
        city: "Addis Ababa",
        country: "Ethiopia",
        instrumentName: "Piano",
        programName: "Piano",
        experienceLevel: "Intermediate",
        previousExperience: "Yes",
        learningFormat: "Online",
        preferredDays: ["Monday", "Wednesday"],
        preferredTime: "Evening",
        goals: "Wants to improve gospel piano arrangements and key modulation.",
        paymentStatus: "verified",
        registrationStatus: "approved",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ];
    localStorage.setItem(MOCK_STORAGE_KEY_REGISTRATIONS, JSON.stringify(demoRegs));
  }
}

// Auto init mock settings
initMockSettings();

// Unified Data Adapter Wrapper Functions
window.CMC_API = {
  // Check if Firebase keys are real
  isFirebaseActive: function() {
    return typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY";
  },

  // Save Registration Document
  createRegistration: async function(regData) {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.firestore();
        await db.collection('registrations').doc(regData.registrationId).set(regData);
        return { success: true, data: regData };
      } catch (err) {
        console.error("Firebase Storage Error:", err);
      }
    }
    // LocalStorage Fallback
    const existing = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_REGISTRATIONS) || '[]');
    existing.unshift(regData);
    localStorage.setItem(MOCK_STORAGE_KEY_REGISTRATIONS, JSON.stringify(existing));
    return { success: true, data: regData };
  },

  // Get Registration by ID
  getRegistrationById: async function(regId) {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.firestore();
        const doc = await db.collection('registrations').doc(regId).get();
        if (doc.exists) return doc.data();
      } catch (err) {
        console.error("Firebase get error:", err);
      }
    }
    const existing = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_REGISTRATIONS) || '[]');
    return existing.find(r => r.registrationId.toUpperCase() === regId.toUpperCase()) || null;
  },

  // Query Registration by ID and Phone
  queryRegistration: async function(regId, phone) {
    const record = await this.getRegistrationById(regId);
    if (record) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const recPhone = record.phone.replace(/[^0-9]/g, '');
      if (recPhone.includes(cleanPhone) || cleanPhone.includes(recPhone)) {
        return record;
      }
    }
    return null;
  },

  // Get All Registrations (Admin)
  getAllRegistrations: async function() {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.firestore();
        const snapshot = await db.collection('registrations').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => doc.data());
      } catch (err) {
        console.error("Firebase list error:", err);
      }
    }
    return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_REGISTRATIONS) || '[]');
  },

  // Update Registration Status (Admin)
  updateRegistrationStatus: async function(regId, regStatus, payStatus) {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.firestore();
        await db.collection('registrations').doc(regId).update({
          registrationStatus: regStatus,
          paymentStatus: payStatus,
          updatedAt: new Date().toISOString()
        });
        return true;
      } catch (err) {
        console.error("Firebase update error:", err);
      }
    }
    const existing = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_REGISTRATIONS) || '[]');
    const index = existing.findIndex(r => r.registrationId === regId);
    if (index !== -1) {
      existing[index].registrationStatus = regStatus;
      existing[index].paymentStatus = payStatus;
      existing[index].updatedAt = new Date().toISOString();
      localStorage.setItem(MOCK_STORAGE_KEY_REGISTRATIONS, JSON.stringify(existing));
      return true;
    }
    return false;
  },

  // Get Site & Payment Settings
  getSettings: async function() {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.firestore();
        const doc = await db.collection('settings').doc('general').get();
        const payDoc = await db.collection('settings').doc('payment').get();
        if (doc.exists) {
          return { general: doc.data(), payment: payDoc.exists ? payDoc.data() : {} };
        }
      } catch (err) {
        console.error("Firebase settings error:", err);
      }
    }
    return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_SETTINGS));
  },

  // Save Settings (Admin)
  saveSettings: async function(settingsData) {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.firestore();
        await db.collection('settings').doc('general').set(settingsData.general, { merge: true });
        await db.collection('settings').doc('payment').set(settingsData.payment, { merge: true });
        return true;
      } catch (err) {
        console.error("Firebase save settings error:", err);
      }
    }
    localStorage.setItem(MOCK_STORAGE_KEY_SETTINGS, JSON.stringify(settingsData));
    return true;
  },

  // Save Contact Form Message
  saveMessage: async function(msgData) {
    msgData.id = 'MSG-' + Date.now();
    msgData.createdAt = new Date().toISOString();
    msgData.read = false;

    if (this.isFirebaseActive()) {
      try {
        const db = firebase.firestore();
        await db.collection('messages').doc(msgData.id).set(msgData);
        return true;
      } catch (err) {
        console.error("Firebase message save error:", err);
      }
    }
    const msgs = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_MESSAGES) || '[]');
    msgs.unshift(msgData);
    localStorage.setItem(MOCK_STORAGE_KEY_MESSAGES, JSON.stringify(msgs));
    return true;
  },

  // Get All Messages (Admin)
  getMessages: async function() {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.firestore();
        const snap = await db.collection('messages').orderBy('createdAt', 'desc').get();
        return snap.docs.map(d => d.data());
      } catch (err) {
        console.error(err);
      }
    }
    return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_MESSAGES) || '[]');
  },

  // Student Authentication & User Store APIs
  MOCK_STORAGE_KEY_STUDENTS: 'cmc_mock_student_users',
  MOCK_STORAGE_KEY_STUDENT_SESSION: 'cmc_mock_current_student',

  registerStudent: async function(fullName, email, password) {
    const studentUser = {
      uid: 'user_' + Date.now(),
      fullName: fullName,
      email: email.toLowerCase().trim(),
      emailVerified: false,
      photoURL: null,
      providerId: 'password',
      createdAt: new Date().toISOString()
    };

    if (this.isFirebaseActive()) {
      try {
        const authRes = await firebase.auth().createUserWithEmailAndPassword(email, password);
        await authRes.user.updateProfile({ displayName: fullName });
        await authRes.user.sendEmailVerification();
        studentUser.uid = authRes.user.uid;

        const db = firebase.firestore();
        await db.collection('users').doc(studentUser.uid).set(studentUser);

        localStorage.setItem(this.MOCK_STORAGE_KEY_STUDENT_SESSION, JSON.stringify(studentUser));
        return { success: true, user: studentUser };
      } catch (err) {
        console.error("Firebase register error:", err);
        return { success: false, error: err.message };
      }
    }

    // Local Storage Mock Engine
    const users = JSON.parse(localStorage.getItem(this.MOCK_STORAGE_KEY_STUDENTS) || '[]');
    if (users.some(u => u.email === studentUser.email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    users.push({ ...studentUser, passwordHash: btoa(password) });
    localStorage.setItem(this.MOCK_STORAGE_KEY_STUDENTS, JSON.stringify(users));
    localStorage.setItem(this.MOCK_STORAGE_KEY_STUDENT_SESSION, JSON.stringify(studentUser));
    return { success: true, user: studentUser };
  },

  loginStudent: async function(email, password) {
    const cleanEmail = email.toLowerCase().trim();

    if (this.isFirebaseActive()) {
      try {
        const authRes = await firebase.auth().signInWithEmailAndPassword(email, password);
        const userObj = {
          uid: authRes.user.uid,
          fullName: authRes.user.displayName || email.split('@')[0],
          email: authRes.user.email,
          emailVerified: authRes.user.emailVerified,
          photoURL: authRes.user.photoURL,
          providerId: 'password'
        };
        localStorage.setItem(this.MOCK_STORAGE_KEY_STUDENT_SESSION, JSON.stringify(userObj));
        return { success: true, user: userObj };
      } catch (err) {
        console.error("Firebase login error:", err);
        return { success: false, error: err.message };
      }
    }

    // Mock Login
    const users = JSON.parse(localStorage.getItem(this.MOCK_STORAGE_KEY_STUDENTS) || '[]');
    const found = users.find(u => u.email === cleanEmail);
    if (!found || found.passwordHash !== btoa(password)) {
      return { success: false, error: 'Invalid email address or password.' };
    }

    const sessionUser = {
      uid: found.uid,
      fullName: found.fullName,
      email: found.email,
      emailVerified: found.emailVerified || true,
      providerId: 'password'
    };
    localStorage.setItem(this.MOCK_STORAGE_KEY_STUDENT_SESSION, JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  },

  loginStudentWithGoogle: async function() {
    if (this.isFirebaseActive()) {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const authRes = await firebase.auth().signInWithPopup(provider);
        const userObj = {
          uid: authRes.user.uid,
          fullName: authRes.user.displayName,
          email: authRes.user.email,
          emailVerified: true,
          photoURL: authRes.user.photoURL,
          providerId: 'google.com'
        };
        localStorage.setItem(this.MOCK_STORAGE_KEY_STUDENT_SESSION, JSON.stringify(userObj));
        return { success: true, user: userObj };
      } catch (err) {
        console.error("Google Auth error:", err);
        return { success: false, error: err.message };
      }
    }

    // Mock Google Login
    const mockGoogleUser = {
      uid: 'google_user_' + Date.now(),
      fullName: 'Google Student',
      email: 'student.google@example.com',
      emailVerified: true,
      providerId: 'google.com'
    };
    localStorage.setItem(this.MOCK_STORAGE_KEY_STUDENT_SESSION, JSON.stringify(mockGoogleUser));
    return { success: true, user: mockGoogleUser };
  },

  sendStudentPasswordReset: async function(email) {
    if (this.isFirebaseActive()) {
      try {
        await firebase.auth().sendPasswordResetEmail(email);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    return { success: true, message: 'Password reset link sent to ' + email };
  },

  getCurrentStudentUser: function() {
    const raw = localStorage.getItem(this.MOCK_STORAGE_KEY_STUDENT_SESSION);
    return raw ? JSON.parse(raw) : null;
  },

  logoutStudentUser: function() {
    localStorage.removeItem(this.MOCK_STORAGE_KEY_STUDENT_SESSION);
    if (this.isFirebaseActive()) {
      firebase.auth().signOut().catch(() => {});
    }
  },

  getStudentRegistrations: async function(email) {
    const allRegs = await this.getAllRegistrations();
    if (!email) return [];
    const cleanEmail = email.toLowerCase().trim();
    return allRegs.filter(r => (r.email || '').toLowerCase().trim() === cleanEmail);
  }
};
