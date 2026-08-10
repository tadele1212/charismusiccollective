# Charis Music Collective — Firebase Configuration & Deployment Guide

This document provides complete instructions for connecting **Charis Music Collective** to your real Firebase project, creating administrator accounts, and deploying to Firebase Hosting.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and enter `charis-music-collective`.
3. Enable or disable Google Analytics as desired, then click **Create project**.
4. Click on the **Web** icon (`</>`) to add a Web App to your project.
5. Register app as `Charis Music Collective Web`.
6. Copy your web configuration snippet (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).

---

## 2. Update Web Configuration

Open `js/firebase-config.js` and replace the placeholder keys with your actual Firebase project keys:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBdB-X40cZBIbgwH_rWS27NAnZ8jGe8gVg",
  authDomain: "charismusiccollective.firebaseapp.com",
  projectId: "charismusiccollective",
  storageBucket: "charismusiccollective.firebasestorage.app",
  messagingSenderId: "624025410838",
  appId: "1:624025410838:web:d46b3b403df084c1f7c437",
  measurementId: "G-1VVJHVX54W"
};
```

*(Note: The website features an automatic LocalStorage fallback mode, so all pages, registration forms, and admin status approvals work seamlessly even before valid keys are pasted).*

---

## 3. Enable Firebase Services

### A. Firebase Authentication
1. In Firebase Console, go to **Build** → **Authentication** → **Get Started**.
2. Under **Sign-in method**, select **Email/Password**.
3. Enable **Email/Password** and click **Save**.

### B. Cloud Firestore Database
1. Go to **Build** → **Firestore Database** → **Create database**.
2. Select your location (e.g. `eur3` or `us-central`).
3. Start in **Production mode**.
4. Copy the rules from `firebase/firestore.rules` into the **Rules** tab in the console and click **Publish**.

### C. Firebase Storage
1. Go to **Build** → **Storage** → **Get Started**.
2. Accept default security rules and location.
3. Copy the rules from `firebase/storage.rules` into the Storage **Rules** tab and click **Publish**.

---

## 4. How to Create the First Admin Account

1. Go to **Authentication** → **Users** tab in Firebase Console.
2. Click **Add user**.
3. Enter admin email: `iyasu@charismusic.com` (or `admin@charis.com`).
4. Set a strong password (e.g., `CharisMusic2026!`).
5. Click **Add user**.
6. You can now log into your web admin portal at `/admin/login.html` using this account!

---

## 5. Deploying to Firebase Hosting

1. Install Firebase CLI globally (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```
2. Log into your Firebase account:
   ```bash
   firebase login
   ```
3. Initialize Firebase Hosting in the project root directory:
   ```bash
   firebase init
   ```
   - Select **Hosting: Configure files for Firebase Hosting**.
   - Choose **Use an existing project** and select `charis-music-collective`.
   - Set public directory to: `.` (current directory).
   - Configure as a single-page app? Select **N** (No, this is a multi-page app).
   - Set up automatic builds? Select **N**.
4. Deploy the application to live Firebase Hosting URL:
   ```bash
   firebase deploy
   ```
5. Your website is now live globally at `https://charis-music-collective.web.app`!
