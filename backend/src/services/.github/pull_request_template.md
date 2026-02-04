## 🚨 PR COMPLIANCE CHECK (MUST ALL BE ✅)

> This PR **must fail review** if any item below is unchecked or unverifiable.

---

## 1️⃣ Payments (MANDATORY)

- [ ] **PayPal completely removed** (frontend + backend + env + docs)
- [ ] **Wise is the ONLY payout method**
- [ ] Wise references verified in:
  - [ ] Frontend UI
  - [ ] Backend payout logic
  - [ ] Legal / withdrawal policy
- [ ] No dead code, flags, or env vars referencing PayPal remain

---

## 2️⃣ Signup & Bonus Logic (MANDATORY)

- [ ] Signup bonus **executes at runtime**, not just implemented
- [ ] Bonus creation is **idempotent** (no double grants)
- [ ] Wallet balance updates correctly after signup
- [ ] Verified via:
  - [ ] Logs
  - [ ] Database row creation
  - [ ] Mobile-wrapped frontend flow

---

## 3️⃣ Profile Save (CRITICAL BUG FIX)

- [ ] “Save profile” works end-to-end
- [ ] Frontend submits data
- [ ] Backend endpoint persists data
- [ ] Data reload confirms persistence
- [ ] No silent failures / swallowed errors

---

## 4️⃣ Legal Compliance (BLOCKER FOR GOOGLE PLAY)

All URLs below must be **public, reachable, and return content**:

- [ ] `/legal/terms`
- [ ] `/legal/privacy`
- [ ] `/legal/cookies`
- [ ] `/legal/admob`
- [ ] `/legal/subscription`
- [ ] `/legal/withdrawal`
- [ ] `/legal/delete-account`

Verified:

- [ ] Backend routes mounted
- [ ] Markdown files exist
- [ ] Frontend routes wired
- [ ] URLs usable in Google Play Console

❌ PR FAILS if Google Play links cannot be pasted directly.

---

## 5️⃣ Frontend ↔ Backend Wiring

- [ ] No feature implemented without:
  - [ ] API endpoint
  - [ ] Frontend call
  - [ ] Error handling
- [ ] Mobile wrapper tested (Expo / WebView / Capacitor)
- [ ] Env vars resolved at runtime (not build-only)

---

## 6️⃣ Database & Migrations

- [ ] All schema changes via migrations
- [ ] Migrations are reversible
- [ ] No manual DB edits required
- [ ] RLS policies verified (user isolation enforced)

---

## 7️⃣ Production Readiness

- [ ] No TODOs / stubs / mocks
- [ ] No console.logs left behind
- [ ] No commented-out logic
- [ ] Secrets stored correctly (not committed)

---

## 8️⃣ Reviewer Declaration

By submitting this PR, I confirm:

- [ ] I ran the app and verified behavior (not just code)
- [ ] This PR is safe for production deployment
- [ ] This PR will not block Google Play approval

---

### 🔥 If any box above is unchecked, this PR must NOT be merged.
