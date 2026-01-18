# Database Migration Guide

## Overview

This guide explains how to apply the database schema changes for the Profile Setup and Leaderboard System.

## Schema Changes

### New Columns Added to `user_profiles` Table

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `display_name` | VARCHAR(20) | YES | NULL | User's display name (unique) |
| `avatar_url` | TEXT | YES | NULL | URL for custom avatar image |
| `avatar_emoji` | VARCHAR(10) | YES | NULL | Selected emoji avatar |
| `show_on_leaderboard` | BOOLEAN | NO | true | Leaderboard visibility preference |
| `profile_setup_completed` | BOOLEAN | NO | false | Whether profile setup was completed |
| `country_badge` | VARCHAR(2) | YES | NULL | ISO country code (ZA, US, GB, etc.) |
| `hide_country` | BOOLEAN | NO | false | Privacy setting for country display |

### New Index

```sql
CREATE INDEX idx_leaderboard ON user_profiles(total_coins_earned DESC, show_on_leaderboard);
```

**Purpose:** Optimize leaderboard queries that rank users by coins and filter by visibility preference.

## Migration Methods

### Option 1: Using Prisma Migrate (Recommended for Development)

```bash
cd backend
npx prisma migrate dev --name add_profile_setup_fields
```

This will:
1. Generate SQL migration files
2. Apply changes to development database
3. Update Prisma Client

### Option 2: Using Prisma DB Push (Quick Development)

```bash
cd backend
npx prisma db push
```

This will:
1. Apply schema changes directly to database
2. Skip migration file generation
3. Update Prisma Client

**Note:** Use this for rapid prototyping, but use migrate for production.

### Option 3: Manual SQL (Production Deployment)

```sql
-- Add new columns
ALTER TABLE user_profiles 
  ADD COLUMN display_name VARCHAR(20) UNIQUE,
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN avatar_emoji VARCHAR(10),
  ADD COLUMN show_on_leaderboard BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN profile_setup_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN country_badge VARCHAR(2),
  ADD COLUMN hide_country BOOLEAN NOT NULL DEFAULT false;

-- Add performance index
CREATE INDEX idx_leaderboard 
  ON user_profiles(total_coins_earned DESC, show_on_leaderboard);

-- Verify changes
\d user_profiles
```

## Rollback (If Needed)

### Using Prisma Migrate

```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

### Manual SQL

```sql
-- Remove index
DROP INDEX IF EXISTS idx_leaderboard;

-- Remove columns
ALTER TABLE user_profiles 
  DROP COLUMN IF EXISTS display_name,
  DROP COLUMN IF EXISTS avatar_url,
  DROP COLUMN IF EXISTS avatar_emoji,
  DROP COLUMN IF EXISTS show_on_leaderboard,
  DROP COLUMN IF EXISTS profile_setup_completed,
  DROP COLUMN IF EXISTS country_badge,
  DROP COLUMN IF EXISTS hide_country;
```

## Post-Migration Steps

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Rebuild Backend

```bash
npm run build
```

### 3. Restart Services

```bash
# Development
npm run dev

# Production
npm start
```

### 4. Verify Migration

```bash
# Check database schema
npx prisma studio
```

Or query directly:

```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN (
    'display_name', 'avatar_url', 'avatar_emoji', 
    'show_on_leaderboard', 'profile_setup_completed', 
    'country_badge', 'hide_country'
  );

-- Check if index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'user_profiles'
  AND indexname = 'idx_leaderboard';
```

## Data Migration (Optional)

### Populate Default Values for Existing Users

If you want to set default display names for existing users:

```sql
-- Set display name to username from email for users without one
UPDATE user_profiles
SET display_name = SPLIT_PART(email, '@', 1)
WHERE display_name IS NULL
  AND email IS NOT NULL;

-- Handle duplicates by appending user ID
UPDATE user_profiles u1
SET display_name = CONCAT(u1.display_name, '_', SUBSTRING(u1.user_id, 1, 4))
WHERE EXISTS (
  SELECT 1 FROM user_profiles u2
  WHERE u2.display_name = u1.display_name
    AND u2.user_id != u1.user_id
);
```

**Warning:** Review these queries carefully before running in production!

## Environment Variables

No new environment variables are required. Existing variables should work:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## Common Issues & Solutions

### Issue: "display_name must be unique" error during migration

**Cause:** Existing duplicate values in email usernames

**Solution:**
```sql
-- Find duplicates
SELECT SPLIT_PART(email, '@', 1) as username, COUNT(*)
FROM user_profiles
GROUP BY SPLIT_PART(email, '@', 1)
HAVING COUNT(*) > 1;

-- Add unique suffixes before migration
-- (See Data Migration section above)
```

### Issue: Migration fails with "column already exists"

**Cause:** Columns were added manually or migration ran partially

**Solution:**
```bash
# Reset migration status
npx prisma migrate resolve --applied <migration_name>

# Or drop and recreate
# (Be careful in production!)
```

### Issue: Index creation is slow

**Cause:** Large table with many users

**Solution:**
```sql
-- Create index concurrently (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_leaderboard 
  ON user_profiles(total_coins_earned DESC, show_on_leaderboard);
```

## Performance Impact

### Expected Query Performance

**Before Index:**
- Leaderboard query: ~500ms (100k users)
- Full table scan required

**After Index:**
- Leaderboard query: ~10ms (100k users)
- Index scan, returns top 100 instantly

### Storage Impact

- **New columns:** ~100 bytes per user
- **Index:** ~16 bytes per user
- **Total:** ~116 bytes per user

For 100,000 users: ~11.6 MB additional storage

## Testing Checklist

After migration, verify:

- [ ] Database schema matches Prisma schema
- [ ] Index exists and is being used (check EXPLAIN ANALYZE)
- [ ] Backend starts without errors
- [ ] API endpoints work correctly
- [ ] Existing users can log in
- [ ] New users see profile setup
- [ ] Leaderboard loads quickly
- [ ] Settings page saves changes

## Monitoring

### Queries to Monitor

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE indexname = 'idx_leaderboard';

-- Check display name uniqueness violations
SELECT display_name, COUNT(*)
FROM user_profiles
WHERE display_name IS NOT NULL
GROUP BY display_name
HAVING COUNT(*) > 1;

-- Check profile setup completion rate
SELECT 
  profile_setup_completed,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM user_profiles
GROUP BY profile_setup_completed;
```

## Support

For migration issues:
1. Check backend logs for Prisma errors
2. Verify DATABASE_URL is correct
3. Ensure database user has ALTER TABLE permissions
4. Review Prisma documentation: https://www.prisma.io/docs/guides/migrate

## Deployment Checklist

- [ ] Backup database before migration
- [ ] Test migration on staging environment
- [ ] Schedule maintenance window (if needed)
- [ ] Run migration scripts
- [ ] Verify data integrity
- [ ] Monitor application logs
- [ ] Test critical user flows
- [ ] Rollback plan ready (if needed)

## Next Steps

After successful migration:
1. Deploy updated backend code
2. Deploy updated frontend code
3. Monitor error logs for 24 hours
4. Run profile setup completion report
5. Check leaderboard query performance
