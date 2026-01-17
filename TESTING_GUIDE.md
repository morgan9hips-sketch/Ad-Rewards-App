# Testing Guide: Profile Setup & Leaderboard System

## Quick Start

### Prerequisites

1. **Database Setup**
   ```bash
   # Run migration
   cd backend
   npx prisma db push
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   # Backend runs on http://localhost:4000
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

## Test Scenarios

### Scenario 1: New User Profile Setup

**Objective:** Test first-time user experience

**Steps:**
1. Create a new account (sign up)
2. After login, verify profile setup modal appears
3. **Step 1 - Display Name:**
   - See default name from email
   - Try invalid names (too short, special characters)
   - Enter valid name (e.g., "test_user_123")
   - Click "Next"
4. **Step 2 - Avatar:**
   - See 15 emoji options
   - Select one (e.g., 🦁)
   - Click "Next"
5. **Step 3 - Country & Privacy:**
   - Verify country is auto-detected
   - Try changing country
   - Toggle "Hide my country"
   - Toggle "Show on leaderboard"
   - Click "Save Profile"
6. Verify modal closes and dashboard loads
7. Check welcome message: "Welcome, test_user_123! Let's get started 🎉"

**Expected Results:**
- ✅ Profile setup modal appears only once
- ✅ Validation works correctly
- ✅ Country auto-detected
- ✅ Profile saved successfully
- ✅ Welcome message personalized

### Scenario 2: Display Name Validation

**Objective:** Test display name constraints

**Test Cases:**

| Input | Expected Result | Pass/Fail |
|-------|----------------|-----------|
| "ab" | Error: "Must be at least 3 characters" | |
| "a_very_long_username_12345" | Error: "Must be at most 20 characters" | |
| "test@user" | Error: "Only letters, numbers, underscore" | |
| "test user" | Error: "Only letters, numbers, underscore" | |
| "test_user" | Success ✓ | |
| "TestUser123" | Success ✓ | |

**Duplicate Test:**
1. Create user1 with display name "unique_name"
2. Create user2 and try "unique_name"
3. Verify error: "Display name is already taken"

### Scenario 3: Skip Profile Setup

**Objective:** Verify users can skip and complete later

**Steps:**
1. Create new account
2. Click "Skip for now" on profile setup
3. Verify dashboard loads
4. Check welcome uses email username (fallback)
5. Go to Settings
6. Verify profile fields are empty/default
7. Complete profile in Settings
8. Verify changes saved

**Expected Results:**
- ✅ Skip works at any step
- ✅ Dashboard accessible without profile
- ✅ Can complete profile later
- ✅ Settings page has same fields

### Scenario 4: Leaderboard Display

**Objective:** Test leaderboard with real data

**Setup:**
1. Create 3+ test users
2. Give each user different coin amounts:
   ```sql
   UPDATE user_profiles 
   SET total_coins_earned = 10000 
   WHERE email = 'user1@test.com';
   
   UPDATE user_profiles 
   SET total_coins_earned = 5000 
   WHERE email = 'user2@test.com';
   
   UPDATE user_profiles 
   SET total_coins_earned = 2500 
   WHERE email = 'user3@test.com';
   ```

**Steps:**
1. Navigate to Leaderboard page
2. Verify users ranked by coins (highest first)
3. Check display format:
   - Rank: 🥇 🥈 🥉 for top 3
   - Avatar emoji displayed
   - Country flag displayed
   - Coins displayed (e.g., "10,000 coins")

**Expected Results:**
- ✅ Users sorted correctly
- ✅ No fake/demo data
- ✅ Medals for top 3
- ✅ Avatar emojis visible
- ✅ Country flags visible
- ✅ Coins formatted with commas

### Scenario 5: Current User Rank

**Objective:** Test user's rank display on leaderboard

**Test Cases:**

1. **User in Top 100:**
   - Login as user with coins
   - Check leaderboard
   - Verify user highlighted in list
   - Verify "Your Rank" card shows correct position

2. **User outside Top 100:**
   - Login as user with low coins
   - Check leaderboard
   - Verify "Your Rank" card shows (e.g., "#234")
   - Verify encouragement message

3. **User with 0 coins:**
   - Login as new user
   - Check leaderboard
   - Verify rank shown correctly

### Scenario 6: Privacy Settings

**Objective:** Test privacy controls

**Hide Country Test:**
1. Set `hideCountry = true` in profile
2. View leaderboard
3. Verify 🌍 globe shown instead of flag

**Leaderboard Opt-Out Test:**
1. Set `showOnLeaderboard = false` in Settings
2. View leaderboard
3. Verify user NOT in list
4. Verify "Your Rank" card NOT shown
5. Set back to `true`
6. Verify user reappears

### Scenario 7: Settings Page

**Objective:** Test profile editing

**Steps:**
1. Login and go to Settings
2. **Change Display Name:**
   - Try invalid name → Error shown
   - Try duplicate name → Error shown
   - Enter valid unique name → Success
3. **Change Avatar:**
   - Select different emoji
   - Save → Success
4. **Change Country:**
   - Select different country
   - Save → Success
   - Check leaderboard → Flag updated
5. **Toggle Privacy:**
   - Toggle "Hide country" → Globe shown
   - Toggle "Show on leaderboard" → Removed from list

**Expected Results:**
- ✅ All fields editable
- ✅ Validation works
- ✅ Changes saved
- ✅ Success message shown
- ✅ Changes reflected immediately

### Scenario 8: Welcome Messages

**Objective:** Test personalized greetings

**Test Cases:**

1. **New User (< 7 days old):**
   - Expected: "Welcome, [name]! Let's get started 🎉"

2. **Returning User (> 7 days old):**
   - Expected: "Welcome back, [name]! 👋"

3. **User without Display Name:**
   - Expected: Uses email username (before @)

**Test Script:**
```sql
-- Make user appear new
UPDATE user_profiles 
SET created_at = NOW() 
WHERE email = 'test@example.com';

-- Make user appear old
UPDATE user_profiles 
SET created_at = NOW() - INTERVAL '30 days' 
WHERE email = 'test@example.com';
```

### Scenario 9: Empty Leaderboard

**Objective:** Test empty state

**Steps:**
1. Set all users to `showOnLeaderboard = false`
   ```sql
   UPDATE user_profiles SET show_on_leaderboard = false;
   ```
2. View leaderboard
3. Verify empty state:
   - "🏆 Be the first to earn coins!"
   - No user list shown

### Scenario 10: Country Auto-Detection

**Objective:** Test IP-based country detection

**Test with Different IPs:**

```bash
# Test with curl (simulating different IPs)
curl -H "X-Forwarded-For: 8.8.8.8" http://localhost:4000/api/user/detect-country

# Expected: US (8.8.8.8 is Google DNS)
```

**Manual Test:**
1. Create new account
2. Open DevTools → Network tab
3. Start profile setup
4. Check API call to `/api/user/detect-country`
5. Verify correct country returned

## Performance Tests

### Leaderboard Query Performance

**Test with Large Dataset:**

```sql
-- Create 100k test users
INSERT INTO user_profiles (user_id, email, total_coins_earned, show_on_leaderboard)
SELECT 
  gen_random_uuid(),
  'user' || generate_series || '@test.com',
  (random() * 100000)::bigint,
  true
FROM generate_series(1, 100000);

-- Test query performance
EXPLAIN ANALYZE
SELECT * FROM user_profiles
WHERE show_on_leaderboard = true
ORDER BY total_coins_earned DESC
LIMIT 100;
```

**Expected:**
- Query time: < 50ms
- Uses index: `idx_leaderboard`
- Returns top 100 instantly

### Display Name Uniqueness Check

```sql
-- Should be fast (indexed)
EXPLAIN ANALYZE
SELECT * FROM user_profiles
WHERE display_name = 'test_user';
```

**Expected:**
- Query time: < 5ms
- Uses unique index

## API Testing (Postman/curl)

### Setup Profile

```bash
curl -X POST http://localhost:4000/api/user/setup-profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "test_user",
    "avatarEmoji": "🦁",
    "countryBadge": "ZA",
    "hideCountry": false,
    "showOnLeaderboard": true
  }'
```

### Get Leaderboard

```bash
curl http://localhost:4000/api/leaderboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Profile

```bash
curl -X PUT http://localhost:4000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "new_name",
    "hideCountry": true
  }'
```

## Browser Testing

### Browsers to Test
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Visual Checks
- [ ] Profile setup modal renders correctly
- [ ] Avatar grid layout works on mobile
- [ ] Leaderboard scrolls properly
- [ ] Emojis display correctly (flags, avatars)
- [ ] Success/error messages visible

## Bug Report Template

When reporting issues, include:

```markdown
**Bug Title:** [Brief description]

**Environment:**
- OS: [Windows/Mac/Linux]
- Browser: [Chrome 120]
- Screen size: [1920x1080]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach if relevant]

**Console Errors:**
[Copy from browser console]

**API Response:**
[Copy from Network tab if relevant]
```

## Test Coverage Summary

Check these features are working:

### Profile Setup (7 tests)
- [ ] Modal appears for new users
- [ ] Display name validation
- [ ] Avatar selection
- [ ] Country auto-detection
- [ ] Privacy toggles
- [ ] Skip functionality
- [ ] Completion saves to database

### Leaderboard (6 tests)
- [ ] Shows real users only
- [ ] Ranked by coins
- [ ] Displays avatars
- [ ] Displays country flags
- [ ] Current user rank
- [ ] Empty state

### Settings (5 tests)
- [ ] Edit display name
- [ ] Change avatar
- [ ] Change country
- [ ] Privacy toggles
- [ ] Changes persist

### Dashboard (3 tests)
- [ ] Profile setup modal integration
- [ ] Personalized greeting
- [ ] Display name usage

## Automation (Optional)

Example test with Playwright:

```typescript
test('new user completes profile setup', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  // Profile setup should appear
  await expect(page.locator('text=Create Your Profile')).toBeVisible()
  
  // Complete setup
  await page.fill('input[type="text"]', 'test_user')
  await page.click('button:has-text("Next")')
  
  await page.click('[title="Lion"]')
  await page.click('button:has-text("Next")')
  
  await page.click('button:has-text("Save Profile")')
  
  // Should see dashboard
  await expect(page.locator('text=Welcome, test_user!')).toBeVisible()
})
```

## Done!

When all tests pass, the implementation is ready for production! 🎉
