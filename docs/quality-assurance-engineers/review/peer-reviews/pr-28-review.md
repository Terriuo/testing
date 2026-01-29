THIS IS AN EXAMPLE OF QA's current track for peer-review. To be deleted after closing github issues.

https://github.com/nnenu/nnenu-app/issues/28

[BUG] - (DeepLink) (iOS) navigating not found page after clicking the profile deeplink url #28  
Code-review/Testing by Joseph  
[THIS DOCUMENT WILL BE REMOVED ONCE COMPLETED]

---

## Peer Code Review & Testing Checklist

**Reviewer:** Joseph  
**Branch:** UAT-1.2.1  
**Files Updated:**  
- `_layout.tsx` (router)
- `post-2.1-structure.tsx`

**Bug Remarks:**  
- Deep-linking should auto jump to Nnenu application < fan profile  
- Current: “not found” page flashes before navigating to correct user page

---

### 1. Preparation
- [x] Read and understand [GitHub issue #28](https://github.com/nnenu/nnenu-app/issues/28)

---

### 2. Code Review
- [x] Review all files changed in the PR (`_layout.tsx`, `post-2.1-structure.tsx`)
- [x] Check code readability, maintainability, and adherence to conventions
- [x] Look for unnecessary complexity, commented-out code, or potential edge cases
- [x] Verify the code addresses the specific bug
- [x] Confirm the fix does not introduce new issues

---

### 3. Testing
#### Environment Setup
- [x] Pull the latest branch (`UAT-1.2.1`)
- [x] Pull Amplify environment (if necessary)

#### Build & Run
- [x] Run the application in **production**
- [ ] Run the application in **development** (Deep linking testing only performed on production build)

#### Test Scenarios
- [x] **Deep Linking:**  
  - [x] Test all deep link URLs (e.g., app < profile link)
  - [x] Observe if the “not found” page flashes before navigation
  - [x] Confirm correct navigation to the intended page
- [x] **Regression:**  
  - [x] Test related navigation flows to ensure no regressions
- [x] **Amplify Integration:**  
  - [x] Double check if this affects Amplify backend

---

## TESTING RESULT

**Production Build Testing:**
- ❌ **iOS:**  
  - Failed to launch hyperlink via WhatsApp: redirects user to personal profile (scenario: app closed, launched via iOS device)
  - Failed to launch hyperlink with Nnenu running in the background (app not closed)
- ✅ **Android:**  
  - Launch hyperlink via Android devices (Nnenu production app running in background)
  - Launch hyperlink via Android devices (boots from production build while Nnenu app is not launched)
  - Launch hyperlink via external link share (Discord, Android version)

**Notes:**  
- Deep linking testing in development mode was not performed (feature only testable in production build).
- Investigating if issues are related to localhost configuration or Amplify backend.

---

## Additional Bugs Discovered

- **iOS:**  
  - Build: Production build (UAT-1.2.1)
  - Backend: AWS Amplify
  - [Update Button]: 'Update map' fails to launch 'Upload image' (camera/select from album/cancel)

---

## Next Steps / Recommendations

- Further investigate iOS deep linking failures (consider device logs, URL schemes, and Amplify integration).
- Review and test the 'Update map' button functionality on iOS.
- Consider adding automated tests for deep linking if possible.
- Retest after any fixes and update this document accordingly.

---

**Status:**  
- Preparation: ✅ Done  
- Code Review: 🟡 In Progress  
- Production Build Testing: ✅ Done  
- Development Build Testing: ⚪ Not performed (deep linking not testable in dev)

---

*Please update or close this document once all review steps are complete and issues are resolved.*