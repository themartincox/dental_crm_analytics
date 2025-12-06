# Super Admin Access Setup

## Quick Login Credentials

**For Development/Testing:**

### Option 1: Use Existing Demo Account (Easiest)
If the seed data has been run, you can use:
- **Email**: `owner@democlinic.co.uk`
- **Password**: Check your Supabase Auth dashboard
- **Role**: `practice_admin` (has most permissions, but not super_admin)

### Option 2: Create Super Admin Account

#### Via Supabase Dashboard (Recommended):
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add User**
4. Enter:
   - Email: `admin@aescrm.local`
   - Password: `SuperAdmin123!` (change after first login)
   - Confirm password
5. Click **Create User**
6. Run the SQL script in `supabase/seeds/create_super_admin.sql` to set the role

#### Via SQL (Advanced):
Run the SQL file I created at:
```
supabase/seeds/create_super_admin.sql
```

## Super Admin Capabilities

With `super_admin` role, you get:
- ✅ Access to System Owner Admin Dashboard (`/admin`)
- ✅ Full CRUD on all client organizations
- ✅ Manage all user roles and permissions
- ✅ View system-wide analytics and KPIs
- ✅ Configure module permissions for clients
- ✅ Access all dashboards and features
- ✅ Bypass all role-based restrictions

## Access the Admin Dashboard

Once logged in with super admin credentials:
1. Navigate to: [http://localhost:4028/admin](http://localhost:4028/admin)
2. You'll see the System Owner Admin Dashboard with full god-mode access

## Security Note

**IMPORTANT**: The credentials provided are for development only. In production:
- Use strong, unique passwords
- Enable MFA
- Rotate credentials regularly
- Never commit credentials to git
