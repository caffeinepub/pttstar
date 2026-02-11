# Publish Preview to Production - Runbook

## Overview
This document describes the process for promoting the current preview deployment to production without modifying application code or configuration.

**CRITICAL**: This runbook is for deployment promotion only. No code changes, configuration updates, or feature additions should be made during this process.

## Prerequisites
- Preview build has been tested and verified
- All key flows are working as expected in preview
- No outstanding critical issues
- This promotion must not introduce any code or configuration changes

## Pre-Publish Verification Checklist

### Current Preview Build Verification
Before promoting the current preview build to production, verify the following flows in the preview environment.

**IMPORTANT**: Document all verification results in the version-specific promotion record document (e.g., `frontend/docs/promotions/version-30-preview-to-production.md`). Each checklist section below must be completed and documented with:
- Completion status (PASS / PASS WITH NOTES / FAIL)
- Any observations or issues found
- Critical vs non-critical issue classification

#### 1. Authentication & Authorization
- [ ] **Internet Identity Login**
  - Login flow completes successfully
  - User profile loads correctly after login
  - First-time users see profile setup dialog
  - Logout clears session and cached data properly
  - Remember login preference is respected

**Document results in promotion record under "Authentication & Authorization" section.**

#### 2. Connect Page
- [ ] **IAX/DVSwitch Tab**
  - Configuration form displays correctly
  - Fields accept and validate input
  - "Save" button persists configuration
  - "Save and Go to PTT" navigates correctly
  - Saved configuration displays in read-only tab
  - Edit action returns to form with prefilled values

- [ ] **Digital Voice Tab**
  - Mode tabs (DMR, NXDN, P25, D-Star, YSF, M17) display
  - Reflector selection works
  - BrandMeister credentials fields work
  - DMR ID and SSID display from profile
  - Configuration saves and persists
  - Saved configuration displays correctly

**Document results in promotion record under "Connect Page" sections.**

#### 3. PTT Page
- [ ] **Connection Display**
  - Connection info displays correctly
  - User callsign shows when available
  - Network and talkgroup information accurate
  - Real-time status badges display and update
  - Status descriptions ("what is happening now") update correctly

- [ ] **PTT Functionality**
  - PTT button responds to press/hold
  - Visual feedback during transmission
  - Audio level meter shows microphone activity
  - WebRTC connection establishes successfully
  - Remote audio plays when receiving
  - Activity recording includes all required parameters

**Document results in promotion record under "PTT Page" sections.**

#### 4. Activity Page
- [ ] **Transmission Feed**
  - Transmission list loads and displays
  - Auto-refresh works (3-second polling)
  - "Live" badges appear on recent transmissions
  - Timestamps display correctly
  - DMR metadata (ID, operator name, location) displays when present
  - List scrolls and updates smoothly

**Document results in promotion record under "Activity Page" section.**

#### 5. Settings Page
- [ ] **Profile Information**
  - Callsign field displays and updates
  - Name field displays and updates
  - DMR ID field displays and updates
  - SSID field displays and updates
  - License acknowledgement checkbox works
  - Remember login preference persists

- [ ] **Data Persistence**
  - Changes save to backend successfully
  - Saved data persists across sessions
  - Profile updates reflect immediately

**Document results in promotion record under "Settings Page" section.**

#### 6. About/Compliance Page
- [ ] **Content Display**
  - Page content displays correctly
  - Licensing information is accurate
  - DMR ID/SSID registration process explained
  - Regulatory compliance information present
  - Links work correctly

**Document results in promotion record under "About/Compliance Page" section.**

#### 7. PWA Functionality
- [ ] **Installation**
  - Install prompt appears on Android/desktop
  - iOS add-to-home-screen instructions display
  - App installs successfully
  - Installed app launches correctly

- [ ] **Offline Behavior**
  - Service worker registers successfully
  - Offline fallback page displays when network unavailable
  - Core assets cache correctly
  - App recovers when network restored

**Document results in promotion record under "PWA Functionality" section.**

#### 8. Navigation & Layout
- [ ] **Header/Footer**
  - Navigation links work
  - Login/logout button functions
  - Install app button appears when appropriate
  - Footer attribution displays correctly
  - Mobile navigation works

- [ ] **Routing**
  - All routes navigate correctly
  - No blank screens or 404s
  - Back/forward navigation works
  - Deep links work

**Document results in promotion record under "Navigation & Layout" section.**

#### 9. Directory Page
- [ ] **Directory Browser**
  - Network directory displays
  - Mode filtering works
  - Search functionality works
  - Favorite toggling works
  - Network and talkgroup selection works
  - Personal directory entries can be added/deleted
  - "Go to PTT" action works

**Document results in promotion record under "Directory Page" section.**

### Verification Summary Requirements
After completing all checklist items, document in the promotion record:
- **Overall Status**: PASS / PASS WITH NOTES / FAIL
- **Critical Issues Found**: List any issues that must be resolved before promotion
- **Non-Critical Issues Found**: List any issues to track for future releases
- **Recommendation**: PROCEED WITH PROMOTION / DO NOT PROMOTE

**CRITICAL**: Do not proceed with promotion if critical issues are found. Resolve all critical issues and re-verify before continuing.

## Publish Process

### Step 1: Complete Pre-Publish Verification
- Run through the complete verification checklist above
- Document all results in the version-specific promotion record
- Classify issues as critical or non-critical
- Resolve critical issues before proceeding
- Minor issues can be tracked for future releases

### Step 2: Identify Current Preview Build
- Confirm the preview build identifier (e.g., "Draft Version 30")
- Note the preview deployment timestamp
- Verify this is the correct build to promote
- Document the build identifier in the promotion record

### Step 3: Attest No Code/Configuration Changes
Before executing the promotion, explicitly attest in the promotion record that:
- **No application code changes** are being introduced
- **No configuration changes** are being introduced
- This is a **deployment-only operation**

### Step 4: Promote to Production
Execute the deployment promotion command:

