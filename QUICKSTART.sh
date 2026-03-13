#!/usr/bin/env bash
# FIREBASE QUICK START CHECKLIST
# Follow these steps in order

echo "=============================================================
      CAFFERNAUM FIREBASE DATABASE - QUICK START
============================================================="

# Step 1
echo ""
echo "STEP 1: READ THE GUIDE (5 minutes)"
echo "────────────────────────────────────"
echo "Read: README_FIREBASE.md"
echo "  ✓ Understand what Firebase is"
echo "  ✓ Understand localStorage vs Firebase"
echo "  ✓ See the Quick Start 5 steps"
echo "  ☐ DONE? Press Enter to continue..."
read

# Step 2
echo ""
echo "STEP 2: CREATE FIREBASE PROJECT (10 minutes)"
echo "──────────────────────────────────────────────"
echo "1. Go to: https://console.firebase.google.com/"
echo "2. Click '+ Add Project'"
echo "3. Project name: 'caffernaum'"
echo "4. Uncheck Google Analytics (optional)"
echo "5. Click 'Create project'"
echo "6. Wait for project to be created"
echo ""
echo "☐ DONE? Press Enter when you see 'Your project is ready'"
read

# Step 3
echo ""
echo "STEP 3: GET FIREBASE CONFIG (5 minutes)"
echo "────────────────────────────────────────"
echo "1. In Firebase Console, click gear icon (⚙️)"
echo "2. Go to 'Project Settings'"
echo "3. Scroll to 'Your Apps' section"
echo "4. Click Web icon (</>)"
echo "5. Copy the 'firebaseConfig' object"
echo "6. Paste into firebase-config.js (lines 14-20)"
echo ""
echo "Replace:"
echo "  apiKey: 'YOUR_API_KEY_HERE'"
echo "  authDomain: 'your-project.firebaseapp.com'"
echo "  projectId: 'your-project-id'"
echo "  storageBucket: 'your-project.appspot.com'"
echo "  messagingSenderId: '123456789'"
echo "  appId: '1:123456789:web:abcdef123456'"
echo ""
echo "With YOUR ACTUAL values from Firebase Console!"
echo ""
echo "☐ DONE? Press Enter when firebase-config.js is updated..."
read

# Step 4
echo ""
echo "STEP 4: CREATE FIRESTORE DATABASE (5 minutes)"
echo "──────────────────────────────────────────────"
echo "1. In Firebase Console, go to 'Firestore Database'"
echo "2. Click 'Create Database'"
echo "3. Select region closest to you"
echo "4. Choose 'Start in test mode'"
echo "5. Click 'Create'"
echo ""
echo "☐ DONE? Press Enter when Firestore is created..."
read

# Step 5
echo ""
echo "STEP 5: SET SECURITY RULES (3 minutes)"
echo "──────────────────────────────────────"
echo "1. In Firestore, go to 'Rules' tab"
echo "2. Replace ALL content with:"
echo ""
echo "---BEGIN RULES---"
echo "rules_version = '2';"
echo "service cloud.firestore {"
echo "  match /databases/{database}/documents {"
echo "    match /{document=**} {"
echo "      allow read, write: if true;"
echo "    }"
echo "  }"
echo "}"
echo "---END RULES---"
echo ""
echo "3. Click 'Publish'"
echo ""
echo "☐ DONE? Press Enter when rules are published..."
read

# Step 6
echo ""
echo "STEP 6: VERIFY YOUR SETUP (2 minutes)"
echo "────────────────────────────────────"
echo "1. Check firebase-config.js has YOUR config (not placeholders)"
echo "2. Check Firestore Database exists in Firebase Console"
echo "3. Check Rules are published (no blue button)"
echo "4. Try viewing Firestore collections"
echo ""
echo "☐ Everything looks good?"
echo ""
echo "═══════════════════════════════════════════════════════════"

echo ""
echo "NEXT: Read MIGRATION_GUIDE.md to update your HTML files"
echo ""
echo "Questions? See:"
echo "  • README_FIREBASE.md (overview)"
echo "  • FILES_CREATED.md (what was created)"
echo "  • FIREBASE_GUIDE.md (complete documentation)"
echo "  • ARCHITECTURE.md (how it works)"
echo ""
echo "═══════════════════════════════════════════════════════════"
