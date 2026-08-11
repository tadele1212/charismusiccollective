/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Firebase Configuration & Storage/Mock Adapter
   ========================================================================== */

// Live Firebase project configuration
let firebaseConfig = {
  apiKey: "AIzaSyAd_lgNLLeaIfCFadyIt1LZZ42rU7DEn_w",
  authDomain: "charis-music-collective.firebaseapp.com",
  databaseURL: "https://charis-music-collective-default-rtdb.firebaseio.com",
  projectId: "charis-music-collective",
  storageBucket: "charis-music-collective.firebasestorage.app",
  messagingSenderId: "910442600269",
  appId: "1:910442600269:web:712694d4865f99eaeb8904",
  measurementId: "G-VX7ZGS1GZQ"
};

// Check for dynamic Firebase config stored in localStorage (set via Admin Settings UI)
const savedConfig = localStorage.getItem('cmc_custom_firebase_config');
if (savedConfig) {
  try {
    const parsed = JSON.parse(savedConfig);
    if (parsed && parsed.apiKey && parsed.apiKey !== "YOUR_FIREBASE_API_KEY") {
      firebaseConfig = { ...firebaseConfig, ...parsed };
    }
  } catch (e) {
    console.error("Error parsing saved Firebase config:", e);
  }
}

// Auto-initialize Firebase App if SDK is present and valid key is provided
let isFirebaseInitialized = false;
if (typeof firebase !== 'undefined') {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      isFirebaseInitialized = true;
      console.log("🔥 Firebase initialized successfully for project:", firebaseConfig.projectId);
    } catch (e) {
      console.warn("🔥 Firebase initialization warning:", e.message);
    }
  }
}

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
    localStorage.setItem(MOCK_STORAGE_KEY_REGISTRATIONS, JSON.stringify([]));
  }
}

// Auto init mock settings
initMockSettings();

// Unified Data Adapter Wrapper Functions
window.CMC_API = {
  // Check if Firebase is initialized and active
  isFirebaseActive: function() {
    return typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
  },

  // Save Registration Document
  createRegistration: async function(regData) {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.database();
        await Promise.race([
          db.ref('registrations/' + regData.registrationId).set(regData),
          new Promise((_, reject) => setTimeout(() => reject(new Error("RTDB write timeout - check Firebase connection")), 5000))
        ]);
        return { success: true, data: regData };
      } catch (err) {
        console.error("Firebase Realtime DB Registration Error:", err);
        return { success: false, error: 'Database write failed: ' + err.message };
      }
    }
    // LocalStorage Fallback (only when offline/no Firebase)
    const existing = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_REGISTRATIONS) || '[]');
    existing.unshift(regData);
    localStorage.setItem(MOCK_STORAGE_KEY_REGISTRATIONS, JSON.stringify(existing));
    return { success: true, data: regData };
  },

  // Get Registration by ID
  getRegistrationById: async function(regId) {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.database();
        const snap = await Promise.race([
          db.ref('registrations/' + regId).once('value'),
          new Promise((_, reject) => setTimeout(() => reject(new Error("RTDB get timeout")), 3000))
        ]);
        if (snap && snap.exists()) return snap.val();
      } catch (err) {
        console.warn("Firebase Realtime DB get error, falling back to LocalStorage:", err.message);
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
        const db = firebase.database();
        const snap = await Promise.race([
          db.ref('registrations').once('value'),
          new Promise((_, reject) => setTimeout(() => reject(new Error("RTDB list timeout")), 3000))
        ]);
        if (snap && snap.exists()) {
          const val = snap.val();
          const list = Object.keys(val).map(k => val[k]);
          return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
      } catch (err) {
        console.warn("Firebase Realtime DB list error, falling back to LocalStorage:", err.message);
      }
    }
    return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_REGISTRATIONS) || '[]');
  },

  // Update Registration Status (Admin)
  updateRegistrationStatus: async function(regId, regStatus, payStatus) {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.database();
        await Promise.race([
          db.ref('registrations/' + regId).update({
            registrationStatus: regStatus,
            paymentStatus: payStatus,
            updatedAt: new Date().toISOString()
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("RTDB update timeout")), 3500))
        ]);
        return true;
      } catch (err) {
        console.warn("Firebase Realtime DB update error, falling back to LocalStorage:", err.message);
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
        const db = firebase.database();
        const snap = await Promise.race([
          db.ref('settings').once('value'),
          new Promise((_, reject) => setTimeout(() => reject(new Error("RTDB settings timeout")), 3000))
        ]);
        if (snap && snap.exists()) {
          const data = snap.val();
          return { general: data.general || {}, payment: data.payment || {} };
        }
      } catch (err) {
        console.warn("Firebase Realtime DB settings error, falling back to LocalStorage:", err.message);
      }
    }
    return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_SETTINGS));
  },

  // Save Settings (Admin)
  saveSettings: async function(settingsData) {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.database();
        await Promise.race([
          db.ref('settings').set(settingsData),
          new Promise((_, reject) => setTimeout(() => reject(new Error("RTDB settings save timeout")), 3500))
        ]);
        return true;
      } catch (err) {
        console.warn("Firebase Realtime DB save settings error:", err.message);
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
        const db = firebase.database();
        await Promise.race([
          db.ref('messages/' + msgData.id).set(msgData),
          new Promise((_, reject) => setTimeout(() => reject(new Error("RTDB message write timeout")), 5000))
        ]);
        return { success: true };
      } catch (err) {
        console.error("Firebase Realtime DB Message Error:", err);
        return { success: false, error: 'Failed to send message: ' + err.message };
      }
    }
    const msgs = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_MESSAGES) || '[]');
    msgs.unshift(msgData);
    localStorage.setItem(MOCK_STORAGE_KEY_MESSAGES, JSON.stringify(msgs));
    return { success: true };
  },

  // Get All Messages (Admin)
  getMessages: async function() {
    if (this.isFirebaseActive()) {
      try {
        const db = firebase.database();
        const snap = await Promise.race([
          db.ref('messages').once('value'),
          new Promise((_, reject) => setTimeout(() => reject(new Error("RTDB messages timeout")), 3000))
        ]);
        if (snap && snap.exists()) {
          const val = snap.val();
          const list = Object.keys(val).map(k => val[k]);
          return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
      } catch (err) {
        console.warn("Firebase RTDB list error:", err.message);
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
        await authRes.user.updateProfile({ displayName: fullName }).catch(() => {});
        await authRes.user.sendEmailVerification().catch(() => {});
        studentUser.uid = authRes.user.uid;

        // Try RTDB user sync with timeout; don't block account creation if RTDB is not created yet
        try {
          const db = firebase.database();
          await Promise.race([
            db.ref('users/' + studentUser.uid).set(studentUser),
            new Promise((_, reject) => setTimeout(() => reject(new Error("RTDB user sync timeout")), 3000))
          ]);
        } catch (dbErr) {
          console.warn("RTDB user profile sync warning (non-fatal):", dbErr.message);
        }

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
        if (err.code === 'auth/popup-closed-by-user') {
          return { success: false, error: 'Google sign-in popup was closed before completing.' };
        }
        if (err.code === 'auth/unauthorized-domain') {
          return { success: false, error: 'This domain (127.0.0.1) is not authorized in your new Firebase Console. Please browse using http://localhost:8080 or add 127.0.0.1 to Authorized Domains in Firebase.' };
        }
        return { success: false, error: err.message };
      }
    }

    return { success: false, error: 'Firebase is not initialized. Please refresh the page.' };
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
