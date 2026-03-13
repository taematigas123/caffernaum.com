#!/usr/bin/env python3
"""
Firebase Setup Helper for Caffernaum
This script validates your Firebase setup
"""

import os
import json
import re

def check_firebase_config():
    """Check if firebase-config.js has been properly configured"""
    config_path = "firebase-config.js"
    
    if not os.path.exists(config_path):
        print("❌ firebase-config.js not found!")
        return False
    
    with open(config_path, 'r') as f:
        content = f.read()
    
    # Check for placeholder values
    if "YOUR_API_KEY_HERE" in content or "your-project" in content:
        print("⚠️  firebase-config.js still contains placeholders!")
        print("   Please replace with your actual Firebase config.")
        return False
    
    print("✅ firebase-config.js looks good!")
    return True

def main():
    print("""
╔════════════════════════════════════════════════════════╗
║     CAFFERNAUM FIREBASE SETUP CHECKLIST                ║
╚════════════════════════════════════════════════════════╝

STEP 1: Create Firebase Project
[ ] Go to https://console.firebase.google.com/
[ ] Click "+ Add Project"
[ ] Name: "caffernaum"
[ ] Create project

STEP 2: Get Firebase Configuration
[ ] In Firebase Console, go to Project Settings (gear icon)
[ ] Scroll to "Your Apps" section
[ ] Click Web icon (</>)
[ ] Copy the firebaseConfig object
[ ] Paste into firebase-config.js (lines 24-31)

STEP 3: Create Firestore Database
[ ] In Firebase Console, click "Firestore Database"
[ ] Click "Create Database"
[ ] Select region closest to you
[ ] Choose "Start in test mode"
[ ] Click "Create"

STEP 4: Set Security Rules
[ ] In Firestore, go to "Rules" tab
[ ] Copy-paste the rules from FIREBASE_GUIDE.md (lines 145-160)
[ ] Click "Publish"

STEP 5: Verify Setup
""")
    
    if check_firebase_config():
        print("[ ] firebase-config.js is properly configured")
        print("\n✅ Setup complete! Your database is ready to use.")
    else:
        print("[ ] ❌ firebase-config.js needs configuration")
        print("\n⚠️  Please complete Step 2 before proceeding.")

if __name__ == "__main__":
    main()
