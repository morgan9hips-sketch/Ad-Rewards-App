# Admin Setup Guide

## Overview

This guide explains how to set up and manage admin users in the Ad Rewards App. The system uses role-based access control (RBAC) to protect sensitive admin functionality.

## Initial Admin User Setup

### Step 1: Create a User Account

First, create a regular user account through the application:

1. Navigate to the login page
2. Sign up with your email address
3. Complete the registration process

### Step 2: Promote User to Admin

After creating your user account, promote it to admin role using one of these methods:

#### Method A: Using the Seed Script

1. Set your email in the environment variables:
   ```bash
   cd backend
   echo "ADMIN_EMAIL=your-email@example.com" >> .env
   ```

2. Run the seed script:
   ```bash
   npm run prisma:seed
   ```

3. The script will upgrade your existing user account to admin role

#### Method B: Direct Database Update

If you have direct database access, run this SQL command:

```sql
UPDATE "user_profiles" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

#### Method C: Using Prisma Studio

```bash
cd backend
npx prisma studio
```

1. Navigate to the UserProfile table
2. Find your user record
3. Change the `role` field to `ADMIN`
4. Save changes

### Step 3: Verify Admin Access

1. Log out and log back in
2. Navigate to `/admin` to verify you can access the admin panel
3. Test accessing admin routes like `/admin/conversions` and `/admin/logs`

## User Roles

The system supports three role levels:

- **USER** (default): Regular user with access to standard features
- **ADMIN**: Can access admin panel and perform admin operations
- **SUPER_ADMIN**: Reserved for future use with elevated privileges

## Creating Additional Admin Users

### Option 1: Promote Existing User

Use the same methods described in Step 2 above to promote any existing user to admin.

### Option 2: Update Environment Variable and Run Seed

```bash
# In backend/.env
ADMIN_EMAIL=new-admin@example.com

# Run seed script
npm run prisma:seed
```

## Admin Features

Admin users have access to:

### 1. Admin Panel (`/admin`)
- Platform statistics overview
- Quick access to admin functions

### 2. Coin Conversions (`/admin/conversions`)
- Process monthly coin-to-cash conversions
- View conversion history
- Platform revenue statistics

### 3. Admin Logs (`/admin/logs`)
- View audit trail of all admin actions
- Filter logs by action type or admin user
- Track IP addresses and timestamps

## Admin Action Logging

All admin actions are automatically logged with the following information:

- **Admin ID**: User who performed the action
- **Action**: Type of action performed (e.g., `PROCESS_CONVERSION`, `VIEW_STATS`)
- **Target**: What the action was performed on (if applicable)
- **Metadata**: Additional context (request body, query params)
- **IP Address**: Source IP of the request
- **Timestamp**: When the action occurred

## Security Best Practices

### 1. Strong Authentication
- Use strong, unique passwords for admin accounts
- Change default admin passwords immediately after setup
- Consider implementing 2FA for admin accounts (future enhancement)

### 2. Access Control
- Limit the number of admin users to only those who need access
- Regularly review the list of admin users
- Remove admin privileges when no longer needed

### 3. Monitoring
- Regularly review admin action logs at `/admin/logs`
- Look for suspicious or unauthorized activities
- Set up alerts for critical admin actions (future enhancement)

### 4. Environment Security
- Keep `JWT_SECRET` and other sensitive environment variables secure
- Use strong, randomly generated secrets
- Never commit `.env` files to version control
- Use HTTPS in production environments

### 5. Password Management
- Rotate admin passwords every 90 days
- Use a password manager to generate and store strong passwords
- Never share admin credentials

### 6. Database Access
- Restrict direct database access to authorized personnel only
- Use read-only database users for reporting/analytics
- Enable database audit logging

## API Endpoints

Admin endpoints require:
1. Valid authentication token (Bearer token in Authorization header)
2. User role of ADMIN or SUPER_ADMIN

### Protected Admin Routes

All routes under `/api/admin/*` require admin privileges:

- `POST /api/admin/process-conversion` - Process monthly conversion
- `GET /api/admin/conversions` - View conversion history
- `GET /api/admin/conversions/:id` - View specific conversion details
- `GET /api/admin/stats` - View platform statistics
- `POST /api/admin/update-exchange-rates` - Update currency exchange rates
- `GET /api/admin/exchange-rates/:currency` - Get exchange rate for currency
- `GET /api/admin/logs` - View admin action logs

### Response Codes

- `200`: Success
- `401`: Authentication required (no token or invalid token)
- `403`: Forbidden (authenticated but not admin)
- `500`: Server error

## Troubleshooting

### "Access Denied" Error

If you get an "Access Denied" error when accessing admin routes:

1. Verify your user account has admin role:
   ```sql
   SELECT email, role FROM "user_profiles" WHERE email = 'your-email@example.com';
   ```

2. Check that you're logged in with the correct account

3. Try logging out and logging back in to refresh your session

4. Verify the role is being fetched correctly by checking browser console for errors

### Logs Not Appearing

If admin actions aren't being logged:

1. Check that the database migration was applied:
   ```bash
   cd backend
   npx prisma migrate status
   ```

2. Verify the AdminAction table exists in your database

3. Check server logs for any errors during action logging

### Cannot Access Admin Panel

If you can't access `/admin` routes:

1. Verify you're authenticated (logged in)
2. Check your user role in the database
3. Open browser DevTools and check for 403 errors in Network tab
4. Verify the backend server is running

## Migration Notes

When deploying the RBAC system to an existing production database:

1. **Backup your database** before running migrations
2. Run the migration: `npx prisma migrate deploy`
3. All existing users will default to `USER` role
4. Promote admin users as needed using the methods above
5. Test admin access before announcing the change

## Future Enhancements

Consider implementing these additional security features:

- Two-factor authentication (2FA) for admin accounts
- Rate limiting on admin endpoints
- Email notifications for critical admin actions
- Scheduled security audits
- Session management with forced logout
- IP whitelisting for admin access
- Admin user expiration/rotation policies

## Support

For issues or questions about admin setup:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Consult the main README.md for general setup
4. Contact the development team for assistance
