# Version 30 Preview to Production Promotion Record

## Promotion Overview

**Build Identifier**: Draft Version 30  
**Promotion Type**: Preview to Production (Deployment Only)  
**Promotion Date**: [To be filled]  
**Promoted By**: [To be filled]  
**Approval**: [To be filled]

**CRITICAL CONSTRAINT**: This promotion must not introduce any code or configuration changes. This is a deployment-only operation.

## Code & Configuration Change Attestation

**Application Code Changes**: NONE - This is a deployment-only promotion  
**Configuration Changes**: NONE - This is a deployment-only promotion  
**Attestation By**: [To be filled]  
**Attestation Date**: [To be filled]

---

## Pre-Promotion Preview Verification

### Verification Date: [To be filled]
### Verification Environment: Preview
### Verified By: [To be filled]

#### 1. Authentication & Authorization
- [ ] Internet Identity login flow completes successfully
- [ ] User profile loads correctly after login
- [ ] First-time users see profile setup dialog (callsign, name, license acknowledgement)
- [ ] Logout clears session and cached data properly
- [ ] Remember login preference is respected (default: ON)
- [ ] Anonymous users are blocked from application data

**Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Notes**: _[Add any observations or issues]_

#### 2. Connect Page - IAX/DVSwitch Tab
- [ ] Configuration form displays correctly
- [ ] Fields accept and validate input (server, port, username, password, extension, context)
- [ ] "Save" button persists configuration to sessionStorage
- [ ] "Save and Go to PTT" navigates to PTT page
- [ ] Saved configuration displays in read-only tab
- [ ] Edit action returns to form with prefilled values
- [ ] User callsign field displays and saves

**Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Notes**: _[Add any observations or issues]_

#### 3. Connect Page - Digital Voice Tab
- [ ] Mode tabs display (DMR, NXDN, P25, D-Star, YSF, M17)
- [ ] Reflector selection works for each mode
- [ ] BrandMeister credentials fields work (username, password)
- [ ] DMR ID displays from user profile
- [ ] SSID displays from user profile
- [ ] Configuration saves to sessionStorage
- [ ] Saved configuration displays correctly in read-only tab
- [ ] Edit action works correctly

**Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Notes**: _[Add any observations or issues]_

#### 4. PTT Page - Display & Status
- [ ] Connection info displays correctly (network, talkgroup)
- [ ] User callsign shows when available (IAX/DVSwitch)
- [ ] Real-time status badges display (Idle, Connecting, Connected, Transmitting, Receiving, Error)
- [ ] Status badges have enhanced visual prominence (opacity, borders, shadows)
- [ ] Status descriptions update correctly ("what is happening now" text)
- [ ] Neutral dark-theme styling applied consistently

**Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Notes**: _[Add any observations or issues]_

#### 5. PTT Page - Functionality
- [ ] PTT button responds to press/hold interaction
- [ ] Visual feedback during transmission (button state changes)
- [ ] Audio level meter shows microphone activity
- [ ] WebRTC connection establishes successfully
- [ ] Remote audio plays when receiving transmissions
- [ ] Microphone permission prompt appears when needed
- [ ] Error handling works for permission denied/device not found
- [ ] Activity recording includes all required parameters (callsign, network, talkgroup, DMR metadata)

**Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Notes**: _[Add any observations or issues]_

#### 6. Activity Page
- [ ] Transmission list loads and displays
- [ ] Auto-refresh works (3-second polling)
- [ ] "Live" badges appear on recent transmissions
- [ ] Timestamps display correctly
- [ ] DMR metadata displays when present (DMR ID, operator name, location)
- [ ] List scrolls smoothly
- [ ] Neutral dark-theme styling applied
- [ ] Manual refresh button works

**Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Notes**: _[Add any observations or issues]_

#### 7. Settings Page
- [ ] Profile information displays correctly
- [ ] Callsign field displays and updates
- [ ] Name field displays and updates
- [ ] DMR ID field displays and updates
- [ ] SSID field displays and updates
- [ ] License acknowledgement checkbox works
- [ ] Remember login preference toggle works and persists
- [ ] Changes save to backend successfully
- [ ] Saved data persists across sessions
- [ ] Field-level help text displays correctly

**Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Notes**: _[Add any observations or issues]_

#### 8. About/Compliance Page
- [ ] Page content displays correctly
- [ ] Licensing requirements explained clearly
- [ ] DMR ID/SSID registration process documented
- [ ] Regulatory compliance information present
- [ ] Links work correctly (caffeine.ai with UTM params)
- [ ] Neutral dark-theme styling applied

**Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Notes**: _[Add any observations or issues]_

#### 9. PWA Functionality
- [ ] Install prompt appears on Android/desktop Chrome
- [ ] iOS add-to-home-screen instructions display correctly
- [ ] App installs successfully
- [ ] Installed app launches correctly
- [ ] Service worker registers successfully
- [ ] Offline fallback page displays when network unavailable
- [ ] Core assets cache correctly
- [ ] App recovers when network restored
- [ ] PWA manifest is valid

**Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Notes**: _[Add any observations or issues]_

#### 10. Navigation & Layout
- [ ] Header displays correctly with logo and navigation
- [ ] Login/logout button functions properly
- [ ] Install app button appears when appropriate
- [ ] Footer attribution displays correctly (Built with love using caffeine.ai)
- [ ] Mobile navigation works
- [ ] All routes navigate correctly (/, /connect, /ptt, /activity, /directory, /settings, /about)
- [ ] No blank screens or 404 errors
- [ ] Back/forward navigation works
- [ ] Deep links work

**Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Notes**: _[Add any observations or issues]_

#### 11. Directory Page
- [ ] Network directory browser displays
- [ ] Mode filtering works (All, DMR, D-Star, YSF, P25, NXDN, Others)
- [ ] Search functionality works
- [ ] Favorite toggling works
- [ ] Network selection works
- [ ] Talkgroup selection works
- [ ] Personal directory entries can be added/deleted
- [ ] "Go to PTT" action works with selected network/talkgroup

**Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Notes**: _[Add any observations or issues]_

### Preview Verification Summary
**Overall Status**: [ ] PASS / [ ] PASS WITH NOTES / [ ] FAIL  
**Critical Issues Found**: _[List any critical issues that must be resolved before promotion]_  
**Non-Critical Issues Found**: _[List any non-critical issues to track for future releases]_  
**Recommendation**: [ ] PROCEED WITH PROMOTION / [ ] DO NOT PROMOTE

**Verified By**: _[Name]_  
**Verification Date**: _[Date/Time]_

---

## Promotion Execution

### Deployment Command
