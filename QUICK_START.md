# PopCloset - Quick Start Guide

## ✅ All Issues Fixed!

Your signup "Failed to fetch" error has been resolved. Here's what was wrong and how to run it now.

## What Was Wrong?

1. ❌ Backend endpoints were `/api/collect-email` but frontend called `/collect-email`
2. ❌ Backend tried to insert into `emails` table, but Supabase had `email_signups` table
3. ❌ Supabase credentials were hardcoded in code (security risk)
4. ❌ No environment variables configured

## What Was Fixed?

✅ Updated backend endpoints to `/collect-email` (no `/api` prefix)
✅ Changed all database queries to use correct `email_signups` table
✅ Moved credentials to environment variables in `.env` file
✅ Added `.env.local` for frontend API URL configuration
✅ Added better logging to help with debugging

## How to Run

### Quick Start (Windows)
Double-click this file in the explorer:
```
start-servers.bat
```

### Manual Start (Two Terminal Windows)

**Terminal 1 - Backend:**
```powershell
cd c:\Users\welcome\Desktop\popclozet-landing-page-main\backend
node index.js
```

Expected output:
```
🚀 Starting backend...
📍 SUPABASE_URL: https://hdxmwhnadifrhjgpauzm.supabase.co...
✅ Supabase client initialized successfully
✨ Backend running on port 5000
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\welcome\Desktop\popclozet-landing-page-main
npm run dev
```

Expected output:
```
VITE v6.4.1  ready in xxx ms
➜  Local:   http://localhost:5173/
```

## Test the Signup

1. Open http://localhost:5173 in your browser
2. Find any signup form (hero section, footer, etc.)
3. Enter your email: `test@example.com`
4. Click submit
5. You should see: **"Thanks - you're on the list!"**
6. View saved emails at: http://localhost:5000/debug

## Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/collect-email` | POST | Save email from signup form |
| `/emails` | GET | Get all emails as JSON |
| `/debug` | GET | View emails in HTML table |
| `/health` | GET | Check if backend is running |

## Files Modified

- ✅ `backend/index.js` - Fixed endpoints and table names
- ✅ `backend/package.json` - Added dotenv
- ✅ `backend/.env` - Environment configuration
- ✅ `.env.local` - Frontend API URL

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to fetch" | Make sure backend is running on port 5000 |
| "Cannot connect" | Check `.env` has correct Supabase credentials |
| "Database error" | Verify `email_signups` table exists in Supabase |
| "Email not saving" | Check Supabase console for errors |

## Need Help?

Check the detailed summary: [SIGNUP_FIX_SUMMARY.md](SIGNUP_FIX_SUMMARY.md)

---

**Status:** ✅ READY TO USE
**Last Updated:** December 13, 2025
