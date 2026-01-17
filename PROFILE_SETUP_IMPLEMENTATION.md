# Profile Setup Flow and Leaderboard System Implementation

## Overview

This implementation adds a comprehensive profile setup flow for new users and completely overhauls the leaderboard system to be fair, coins-based, and feature-rich with avatars and country badges.

## Key Features Implemented

### 1. User Profile Setup Flow

**First-Time User Experience:**
- New users are automatically prompted with a profile setup wizard on first login
- 3-step guided process:
  - **Step 1:** Display name (with validation)
  - **Step 2:** Avatar selection (15 emoji options)
  - **Step 3:** Country badge and privacy settings

**Features:**
- Skip option available (can complete later in Settings)
- Auto-detection of country from IP address using geoip-lite
- Display name validation:
  - 3-20 characters
  - Alphanumeric + underscores only
  - Unique across all users
- Default display name from email username

### 2. Avatar System

**15 Preset Avatars:**
- 🦁 Lion, 🐯 Tiger, 🦊 Fox, 🐻 Bear, 🐼 Panda
- 🐨 Koala, 🐸 Frog, 🦉 Owl, 🦄 Unicorn, 🐉 Dragon
- 🤖 Robot, 👾 Alien, 🎮 Gamer, 🎯 Target, ⚡ Lightning

**Default:** 👤 (if no avatar selected)

### 3. Country Badge System

**Features:**
- Auto-detected from IP address
- 45+ country flags supported
- Privacy option: "Hide my country" (shows 🌍 globe instead)
- User can manually change if auto-detection is wrong

**Supported Countries:**
- Major regions: US, GB, CA, AU, ZA, NG, IN, BR, MX, DE, FR, ES, IT, JP, KR, CN
- And many more...

### 4. Leaderboard System Overhaul

**CRITICAL CHANGES:**

#### Removed Fake/Demo Data
- ✅ No more hardcoded fake users
- ✅ Shows only real authenticated users
- ✅ Empty state: "🏆 Be the first to earn coins!"

#### Coins-Based Ranking (Fair Across Regions)
- **OLD:** Ranked by cash earnings (unfair - different currencies)
- **NEW:** Ranked by `totalCoinsEarned` (fair - same metric globally)
- Display format: "125,450 coins" (not currency)

#### Visual Enhancements
- Rank medals: 🥇 (1st), 🥈 (2nd), 🥉 (3rd)
- Avatar emojis displayed before username
- Country flags/badges next to username
- Example: "🦁 prodek100 🇿🇦 - 125,450 coins"

#### Current User's Rank
- Highlighted in separate card with blue border
- Shows rank even if outside top 100
- Encouragement message: "Keep going! 💪"

### 5. Dashboard Improvements

**Personalized Greetings:**
- New users (< 7 days): "Welcome, [name]! Let's get started 🎉"
- Returning users: "Welcome back, [name]! 👋"
- Uses `displayName` instead of email

**Profile Setup Integration:**
- Modal appears automatically for users who haven't completed setup
- Non-blocking (can skip and access dashboard)
- Stores `profileSetupCompleted` flag in database

### 6. Settings Page Enhancement

**New Profile Management Section:**
- Edit display name (with validation)
- Change avatar
- Update country badge
- Toggle "Hide my country"
- Toggle "Show on leaderboard" (opt-out option)

## Database Schema Changes

### New Fields in `UserProfile` Table

```prisma
displayName           String?  @unique @map("display_name")
avatarUrl             String?  @map("avatar_url")
avatarEmoji           String?  @map("avatar_emoji")
showOnLeaderboard     Boolean  @default(true) @map("show_on_leaderboard")
profileSetupCompleted Boolean  @default(false) @map("profile_setup_completed")
countryBadge          String?  @map("country_badge")  // ISO country code (ZA, US, GB)
hideCountry           Boolean  @default(false) @map("hide_country")
```

### Index for Performance

```prisma
@@index([totalCoinsEarned(sort: Desc), showOnLeaderboard])
```

This index optimizes leaderboard queries.

## API Endpoints

### New Endpoints

#### `POST /api/user/setup-profile`
Complete profile setup (first-time users)

**Request Body:**
```json
{
  "displayName": "string (3-20 chars)",
  "avatarEmoji": "string (emoji)",
  "countryBadge": "string (ISO code)",
  "hideCountry": "boolean",
  "showOnLeaderboard": "boolean"
}
```

**Response:** Updated user profile

#### `GET /api/user/detect-country`
Auto-detect country from IP address

**Response:**
```json
{
  "countryCode": "ZA",
  "ipAddress": "1.2.3.4"
}
```

### Updated Endpoints

#### `PUT /api/user/profile` (Enhanced)
Now supports additional fields:
- `displayName`
- `avatarEmoji`
- `avatarUrl`
- `countryBadge`
- `hideCountry`
- `showOnLeaderboard`

#### `GET /api/leaderboard` (Completely Rewritten)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "displayName": "prodek100",
      "avatarEmoji": "🦁",
      "countryBadge": "ZA",
      "coins": "125450"
    }
  ],
  "currentUser": {
    "rank": 12,
    "coins": "45600"
  }
}
```

**Changes:**
- Filters by `showOnLeaderboard: true`
- Orders by `totalCoinsEarned DESC`
- Returns top 100 users
- Includes current user's rank

## Frontend Components

### New Components Created

1. **`ProfileSetup.tsx`**
   - 3-step wizard modal
   - Form validation
   - Auto-country detection
   - Skip functionality

2. **`AvatarSelector.tsx`**
   - Grid of 15 emoji avatars
   - Visual selection with hover states
   - Reusable component

3. **`CountrySelector.tsx`**
   - Dropdown of 45+ countries
   - Flag preview
   - Shows auto-detected country

### Utilities

4. **`utils/countryFlags.ts`**
   - Country code to flag emoji mapping
   - Helper functions: `getCountryFlag()`, `getCountryName()`
   - Supports 45+ countries

### Updated Components

- **`Dashboard.tsx`**: Profile setup modal, personalized greeting
- **`Leaderboard.tsx`**: Real data, coins-based, avatars, flags
- **`Settings.tsx`**: Profile management section

## Validation Rules

### Display Name
- **Length:** 3-20 characters
- **Characters:** Letters, numbers, underscores only (`/^[a-zA-Z0-9_]+$/`)
- **Uniqueness:** Must be unique across all users
- **Default:** Username from email (before @)

### Backend Validation
- Display name uniqueness checked in database
- Returns 400 error if validation fails
- Clear error messages returned to frontend

## Privacy Features

1. **Hide Country Option**
   - Shows 🌍 globe instead of flag
   - User can toggle in profile setup or settings

2. **Leaderboard Opt-Out**
   - "Show on leaderboard" checkbox
   - Default: checked (opt-in)
   - Can toggle anytime in settings
   - Hidden users don't appear in leaderboard queries

## User Experience Flow

### New User Journey

1. **First Login:**
   - User signs up/logs in via Supabase
   - Dashboard detects `profileSetupCompleted: false`
   - Profile setup modal appears

2. **Profile Setup:**
   - Step 1: Enter display name (validates in real-time)
   - Step 2: Choose avatar from 15 options
   - Step 3: Confirm country (auto-detected), set privacy

3. **Completion:**
   - Profile saved to database
   - `profileSetupCompleted` set to `true`
   - User proceeds to dashboard

4. **Skip Option:**
   - User can skip at any step
   - Can complete later in Settings
   - Still sees personalized greeting (uses email as fallback)

### Returning User Journey

1. **Login:**
   - Sees personalized greeting with display name
   - No profile setup modal (already completed)

2. **Dashboard:**
   - Shows "Welcome back, [displayName]! 👋"
   - For users < 7 days old: "Welcome, [displayName]! Let's get started 🎉"

## Testing Checklist

### Profile Setup
- [x] New users see profile setup modal
- [x] Display name validation works (3-20 chars, alphanumeric + underscore)
- [x] Unique display name enforced (error if taken)
- [x] Avatar selection works
- [x] Country auto-detected
- [x] User can manually change country
- [x] "Hide country" option works
- [x] "Show on leaderboard" toggle works
- [x] Skip option works
- [x] Profile saved to database
- [x] Modal doesn't reappear after completion

### Dashboard
- [x] New users: "Welcome, [name]! Let's get started 🎉"
- [x] Returning users: "Welcome back, [name]! 👋"
- [x] Display name shown correctly
- [x] Falls back to email username if no display name

### Leaderboard
- [x] No fake/demo users displayed
- [x] Shows only users with `showOnLeaderboard: true`
- [x] Ranked by coins (not cash)
- [x] Country flags display correctly
- [x] Hidden countries show 🌍
- [x] Avatar emojis display correctly
- [x] Current user's rank shown (even if outside top 100)
- [x] Empty state when no users

### Settings
- [x] Can edit display name (with validation)
- [x] Can change avatar
- [x] Can change country badge
- [x] Can toggle "Hide country"
- [x] Can toggle "Show on leaderboard"
- [x] Changes saved successfully
- [x] Success message appears

## Migration Guide

### For Existing Users

**Database Migration:**
```sql
-- Add new columns (handled by Prisma migration)
ALTER TABLE user_profiles ADD COLUMN display_name VARCHAR(20) UNIQUE;
ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN avatar_emoji VARCHAR(10);
ALTER TABLE user_profiles ADD COLUMN show_on_leaderboard BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN profile_setup_completed BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN country_badge VARCHAR(2);
ALTER TABLE user_profiles ADD COLUMN hide_country BOOLEAN DEFAULT false;

-- Create index for leaderboard performance
CREATE INDEX idx_leaderboard ON user_profiles(total_coins_earned DESC, show_on_leaderboard);
```

**Existing users will:**
- See profile setup modal on next login (since `profileSetupCompleted` defaults to `false`)
- Have display name default to email username
- Be shown on leaderboard by default (`showOnLeaderboard: true`)
- Have no country badge initially (will be auto-detected or can set in profile setup)

### Deployment Steps

1. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma db push  # or npx prisma migrate deploy
   npm run build
   npm start
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Environment Variables:**
   - Ensure `DATABASE_URL` is set
   - No new environment variables required

## Performance Considerations

### Database Queries

**Leaderboard Query:**
- Indexed on `totalCoinsEarned DESC, showOnLeaderboard`
- Limits to top 100 results
- Efficient even with millions of users

**Display Name Uniqueness:**
- Unique constraint at database level
- Fast lookup via index

### Frontend

**Profile Setup:**
- Modal rendered conditionally (only when needed)
- Lazy loading not required (small component)

**Leaderboard:**
- Fetches max 100 entries
- Avatar emojis are lightweight (Unicode)
- Country flags are Unicode (no image requests)

## Security Considerations

1. **Display Name Validation:**
   - Backend validates all constraints
   - Prevents SQL injection (Prisma parameterization)
   - XSS protection (React escapes by default)

2. **Country Detection:**
   - Uses IP address (can't be easily spoofed for IP-based ads)
   - User can change if wrong (flexibility)
   - Privacy option available

3. **Leaderboard Privacy:**
   - Users can opt-out completely
   - Users can hide country
   - No sensitive data exposed (email hidden)

## Future Enhancements

### Possible Features

1. **Custom Avatar Upload:**
   - Allow users to upload profile pictures
   - Image validation (size, format)
   - CDN storage (Cloudinary, S3)

2. **Profile Badge System:**
   - "Early Adopter" badge
   - "Top Earner" badge
   - "Consistent Watcher" badge

3. **Leaderboard Filters:**
   - Filter by country
   - Filter by time period (week, month, all-time)
   - Friends-only leaderboard

4. **Social Features:**
   - Follow other users
   - Send challenges
   - Profile pages

## Troubleshooting

### Common Issues

**Profile Setup Modal Not Appearing:**
- Check `profileSetupCompleted` field in database
- Verify user is authenticated
- Check browser console for errors

**Display Name Already Taken:**
- This is expected behavior (uniqueness constraint)
- User should try a different name
- Consider adding suffix suggestion (e.g., "username_123")

**Country Not Auto-Detected:**
- Check geoip-lite database is up to date
- IP might be internal (localhost, private network)
- User can manually select country

**Leaderboard Empty:**
- Verify users have `totalCoinsEarned > 0`
- Check `showOnLeaderboard: true`
- Confirm API endpoint is working

## Support

For issues or questions:
1. Check error logs (browser console, backend logs)
2. Verify database schema is up to date
3. Ensure all dependencies are installed
4. Review this documentation

## License

This implementation is part of the Ad Rewards App project.
