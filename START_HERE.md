# 🎬 GET STARTED NOW - Step by Step

## ⏱️ Time Required: 2 minutes

---

## OPTION 1: Windows One-Click Start ⚡

### Step 1: Open File Explorer
Navigate to:
```
C:\Users\welcome\Desktop\popclozet-landing-page-main
```

### Step 2: Double-Click
Find and double-click:
```
start-servers.bat
```

### Step 3: Wait
Two windows will open:
- ✅ Backend window will show: `✨ Backend running on port 5000`
- ✅ Frontend window will show: `➜  Local:   http://localhost:5173/`

### Step 4: Test
Open your browser and go to:
```
http://localhost:5173
```

Done! ✅

---

## OPTION 2: Manual Start (Two Terminal Windows) 🖥️

### Terminal 1 - Start Backend

```bash
cd c:\Users\welcome\Desktop\popclozet-landing-page-main\backend
node index.js
```

**Expected Output:**
```
🚀 Starting backend...
📍 SUPABASE_URL: https://hdxmwhnadifrhjgpauzm.supabase.co...
🔑 SUPABASE_SERVICE_KEY: sb_secret_qVWIu6pjdP...
✅ Supabase client initialized successfully

✨ Backend running on port 5000
📱 Local: http://localhost:5000
🔗 Endpoints:
   POST /collect-email - Save email
   GET  /emails - List all emails
   GET  /debug - View emails in browser
   GET  /health - Health check
```

### Terminal 2 - Start Frontend

```bash
cd c:\Users\welcome\Desktop\popclozet-landing-page-main
npm run dev
```

**Expected Output:**
```
VITE v6.4.1  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

---

## OPTION 3: Using VS Code Terminal 🆚

### In VS Code Terminal:

```bash
# Terminal 1 - Backend
cd backend && node index.js

# Terminal 2 - Frontend  
npm run dev
```

---

## ✅ Test the Signup

### Step 1: Open Browser
Go to: http://localhost:5173

### Step 2: Find Signup Form
Look for any signup form on the page:
- Hero section "Get Early Access"
- Footer email signup
- Modal popup
- CTA buttons

### Step 3: Enter Email
Type any email:
```
your.email@example.com
```

### Step 4: Click Submit
Click the submit/signup button

### Step 5: See Success!
You should see:
```
✅ "Thanks - you're on the list!"
```

---

## 🔍 Verify It Worked

### View All Emails (HTML Table)
Open: http://localhost:5000/debug

You should see an HTML table with your email

### Get JSON Data
```bash
curl http://localhost:5000/emails
```

Response:
```json
{
  "ok": true,
  "count": 1,
  "emails": [
    {
      "id": "...",
      "email": "your.email@example.com",
      "source": "landing-page",
      "created_at": "..."
    }
  ]
}
```

### Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "ok": true,
  "time": "2025-12-13T..."
}
```

---

## 🆘 Troubleshooting

### ❌ "Failed to fetch" on signup

**Check:**
1. Is backend running? (port 5000)
2. Try: http://localhost:5000/health
3. Check backend console for errors

**Fix:**
```bash
cd backend
node index.js
```

### ❌ "Address already in use"

**Change port:**
Edit `backend/.env`:
```env
PORT=5001  # Changed from 5000
```

Then update `.env.local`:
```env
VITE_API_URL=http://localhost:5001
```

### ❌ "VITE_API_URL is undefined"

**Create `.env.local`:**
File: `.env.local`
```env
VITE_API_URL=http://localhost:5000
```

### ❌ "Cannot find module 'dotenv'"

**Install it:**
```bash
cd backend
npm install dotenv
```

### ❌ "Email not saving"

**Check:**
1. Backend console for errors
2. Supabase credentials in `.env`
3. Table `email_signups` exists in Supabase

---

## 📱 What You Should See

### Frontend Success
```
[Hero Section with Email Input]
[User enters: test@example.com]
[User clicks: Sign Up]
     ↓
[Message appears: "Thanks - you're on the list!"]  ✅
[Email input clears]
```

### Backend Logs
```
New Email Collected: test@example.com
```

### Database
Email saved in Supabase table `email_signups`

---

## 📋 Configuration Files

### ✅ Already Created For You:

**backend/.env**
```
PORT=5000
SUPABASE_URL=https://hdxmwhnadifrhjgpauzm.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_qVWIu6pjdP0ij0sis1L5lg_le8oGRr_
```

**.env.local**
```
VITE_API_URL=http://localhost:5000
```

No manual setup needed! ✅

---

## 🚀 Next Steps

### Development
- Frontend: http://localhost:5173 (Auto-reloads on save)
- Backend: http://localhost:5000 (Restart if changes)

### Testing
- See: [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)

### Details
- See: [README_SIGNUP_FIX.md](README_SIGNUP_FIX.md)

### Production
- See: [SIGNUP_FIX_SUMMARY.md](SIGNUP_FIX_SUMMARY.md)

---

## ✨ You're All Set!

Everything is ready to go. Just:

1. ⚡ Run `start-servers.bat` (or manual start)
2. 🌐 Open http://localhost:5173
3. ✉️ Test the signup
4. ✅ See success message

**That's it!** 🎉

---

**Questions?** Check [FIX_COMPLETE.md](FIX_COMPLETE.md)
**Need details?** Check [QUICK_START.md](QUICK_START.md)
**Ready to dive in?** Start here: [README_SIGNUP_FIX.md](README_SIGNUP_FIX.md)
