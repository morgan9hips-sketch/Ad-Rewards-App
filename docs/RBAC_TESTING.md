# RBAC Testing Guide

This document provides comprehensive test cases to validate the role-based access control implementation.

## Prerequisites

1. Database with migration applied
2. Backend server running
3. Frontend application running
4. At least two test user accounts:
   - One regular user (USER role)
   - One admin user (ADMIN role)

## Test Cases

### 1. Database Schema Tests

**Test 1.1: Verify UserRole enum exists**
```sql
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole');
```
Expected: Returns USER, ADMIN, SUPER_ADMIN

**Test 1.2: Verify role column exists**
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'role';
```
Expected: Column exists with default 'USER'

**Test 1.3: Verify AdminAction table structure**
```sql
\d admin_actions
```
Expected: Table has columns: id, admin_id, action, target_type, target_id, metadata, ip_address, created_at

### 2. Backend API Tests

**Test 2.1: Unauthenticated access to admin routes**
```bash
curl -X GET http://localhost:4000/api/admin/stats
```
Expected: 401 Unauthorized error

**Test 2.2: Regular user access to admin routes**
```bash
# Get token for regular user (USER role)
TOKEN="<regular_user_token>"

curl -X GET http://localhost:4000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```
Expected: 403 Forbidden error with message "Admin access required"

**Test 2.3: Admin user access to admin routes**
```bash
# Get token for admin user (ADMIN role)
TOKEN="<admin_user_token>"

curl -X GET http://localhost:4000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```
Expected: 200 OK with stats data

**Test 2.4: Admin action logging**
```bash
# Perform an admin action (as admin)
TOKEN="<admin_user_token>"

curl -X GET http://localhost:4000/api/admin/conversions \
  -H "Authorization: Bearer $TOKEN"

# Check logs
curl -X GET http://localhost:4000/api/admin/logs \
  -H "Authorization: Bearer $TOKEN"
```
Expected: 
- Conversion request succeeds
- Log entry appears with action "VIEW_CONVERSION_HISTORY"

**Test 2.5: Sensitive data sanitization**
```bash
# Create a request with sensitive data
TOKEN="<admin_user_token>"

curl -X POST http://localhost:4000/api/admin/process-conversion \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"admobRevenue": 100, "password": "secret123", "notes": "test"}'

# Check logs to ensure password is redacted
curl -X GET http://localhost:4000/api/admin/logs \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Log entry shows password as "[REDACTED]"

### 3. Frontend Tests

**Test 3.1: Regular user cannot access admin routes**

1. Log in as regular user (USER role)
2. Navigate to `/admin`
3. Expected: Access Denied page with message
4. Check that user is redirected or shown error

**Test 3.2: Admin user can access admin routes**

1. Log in as admin user (ADMIN role)
2. Navigate to `/admin`
3. Expected: Admin panel loads successfully
4. Navigate to `/admin/conversions`
5. Expected: Conversions page loads successfully
6. Navigate to `/admin/logs`
7. Expected: Logs page loads successfully

**Test 3.3: Role is fetched on login**

1. Open browser DevTools Network tab
2. Log in as admin user
3. Check for request to `/api/user/profile`
4. Expected: Response includes `role: "ADMIN"`
5. Verify AuthContext stores the role

**Test 3.4: Access denied screen appearance**

1. Log in as regular user
2. Manually navigate to `/admin/conversions`
3. Expected: 
   - Red "Access Denied" header
   - Explanation message about admin privileges
   - "Go Back" button

### 4. Admin Logs Page Tests

**Test 4.1: View admin logs**

1. Log in as admin user
2. Navigate to `/admin/logs`
3. Expected: 
   - Table showing admin actions
   - Columns: Date & Time, Admin, Action, Target, IP Address
   - Pagination controls if more than 50 logs

**Test 4.2: Pagination**

1. If more than 50 logs exist:
2. Click "Next" button
3. Expected: Page 2 loads with next set of logs
4. Click "Previous" button
5. Expected: Returns to page 1

**Test 4.3: Refresh logs**

1. On admin logs page
2. Click "Refresh" button
3. Expected: Logs reload with latest data

### 5. Integration Tests

**Test 5.1: Complete admin workflow**

1. Log in as admin user
2. Navigate to `/admin/conversions`
3. Process a conversion
4. Navigate to `/admin/logs`
5. Expected: Log entry for "PROCESS_CONVERSION" appears
6. Verify log includes:
   - Admin email
   - Action type
   - Timestamp
   - IP address

**Test 5.2: Session persistence**

1. Log in as admin user
2. Access admin panel
3. Refresh page
4. Expected: Still have admin access (role persisted)

**Test 5.3: Logout and re-access**

1. Log in as admin user
2. Access admin panel (verify it works)
3. Log out
4. Try to access `/admin` without logging in
5. Expected: Redirected to login page

### 6. Security Tests

**Test 6.1: Token without role**

Manually test with an old token that doesn't include role:
```bash
# Use an expired or invalid token
curl -X GET http://localhost:4000/api/admin/stats \
  -H "Authorization: Bearer invalid_token"
```
Expected: 401 Unauthorized

**Test 6.2: Modified role in frontend**

1. Log in as regular user
2. In browser DevTools console, try to modify user role:
   ```javascript
   // This should NOT grant access as backend validates
   ```
3. Try to access `/admin` routes
4. Expected: Backend still denies access with 403

**Test 6.3: SQL Injection in logs query**

```bash
TOKEN="<admin_user_token>"

curl -X GET "http://localhost:4000/api/admin/logs?adminId=1' OR '1'='1" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: No SQL injection, proper error handling

### 7. Error Handling Tests

**Test 7.1: Database connection error**

1. Stop database temporarily
2. Try to access admin endpoint
3. Expected: 500 error with appropriate message
4. Restart database

**Test 7.2: Invalid admin action**

1. Try to log an action with invalid data
2. Expected: Error logged but doesn't break the request

**Test 7.3: Missing token**

```bash
curl -X GET http://localhost:4000/api/admin/stats
```
Expected: 401 with "No token provided"

## Success Criteria

All tests should pass with expected results:

- ✅ Regular users get 403 on admin routes
- ✅ Unauthenticated users get 401 on admin routes  
- ✅ Admin users can access all admin routes
- ✅ All admin actions are logged to database
- ✅ Sensitive data is sanitized in logs
- ✅ Frontend properly displays access denied for non-admins
- ✅ Admin logs page displays correctly
- ✅ No security vulnerabilities detected
- ✅ No TypeScript compilation errors

## Automated Test Script

Here's a bash script to run some basic automated tests:

```bash
#!/bin/bash

API_URL="http://localhost:4000"
REGULAR_TOKEN="<insert_regular_user_token>"
ADMIN_TOKEN="<insert_admin_user_token>"

echo "Testing RBAC Implementation..."
echo ""

# Test 1: Unauthenticated access
echo "Test 1: Unauthenticated access to /api/admin/stats"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/admin/stats)
if [ "$RESPONSE" = "401" ]; then
  echo "✅ PASS: Got 401 for unauthenticated request"
else
  echo "❌ FAIL: Expected 401, got $RESPONSE"
fi
echo ""

# Test 2: Regular user access
echo "Test 2: Regular user access to /api/admin/stats"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $REGULAR_TOKEN" \
  $API_URL/api/admin/stats)
if [ "$RESPONSE" = "403" ]; then
  echo "✅ PASS: Got 403 for regular user"
else
  echo "❌ FAIL: Expected 403, got $RESPONSE"
fi
echo ""

# Test 3: Admin user access
echo "Test 3: Admin user access to /api/admin/stats"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  $API_URL/api/admin/stats)
if [ "$RESPONSE" = "200" ]; then
  echo "✅ PASS: Got 200 for admin user"
else
  echo "❌ FAIL: Expected 200, got $RESPONSE"
fi
echo ""

# Test 4: Admin logs endpoint
echo "Test 4: Admin logs endpoint"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  $API_URL/api/admin/logs)
if [ "$RESPONSE" = "200" ]; then
  echo "✅ PASS: Admin logs endpoint accessible"
else
  echo "❌ FAIL: Expected 200, got $RESPONSE"
fi
echo ""

echo "Testing complete!"
```

## Manual Testing Checklist

Use this checklist during manual testing:

- [ ] Database migration applied successfully
- [ ] Admin user created via seed script
- [ ] Regular user cannot access `/admin` routes (403)
- [ ] Admin user can access `/admin` routes (200)
- [ ] Unauthenticated requests get 401
- [ ] Admin panel loads for admin users
- [ ] Admin conversions page works
- [ ] Admin logs page displays correctly
- [ ] Pagination works on logs page
- [ ] Admin actions appear in logs
- [ ] Sensitive data is redacted in logs
- [ ] IP addresses are captured in logs
- [ ] Access denied page shows for regular users
- [ ] Frontend role is fetched from backend
- [ ] TypeScript compiles without errors
- [ ] No CodeQL security alerts
- [ ] Documentation is complete and accurate
