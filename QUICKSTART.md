# FlightSlot - Quick Start Guide

Get FlightSlot running in 3 minutes!

## 1. Start the Development Server

```bash
cd flightslot
npm run dev
```

Wait for the message:
```
  ▲ Next.js 16.0.5
  - Local:        http://localhost:3000
```

## 2. Open in Your Browser

Visit: **http://localhost:3000**

## 3. Login as Instructor

- **Default PIN**: `0000`
- You'll be redirected to the instructor dashboard

## 4. First Steps

### A. Change Your PIN (IMPORTANT!)
1. Click **Settings** in the navigation
2. Scroll to **Change PIN**
3. Enter a new 4-digit PIN
4. Click **Update PIN**

### B. Add Your Contact Info
1. In **Settings**, add your email and phone (optional)
2. Click **Save Contact Info**
3. This enables notifications when students request slots

### C. Create a Test Student
1. Click **Students** in the navigation
2. Click **Add Student**
3. Fill in:
   - Name: "Test Student"
   - Email: your-email@example.com (optional)
   - Phone: +1234567890 (optional)
4. Click **Add Student**
5. **Important**: Copy the generated PIN shown in the alert!

### D. Assign a Schedule to the Student
1. In the Students list, click **Add Schedule** for your test student
2. Select a time block (e.g., "Morning")
3. Select today's date or a future date
4. Click **Add Schedule**

### E. Test the Student View
1. **Open a new incognito/private browser window**
2. Go to http://localhost:3000
3. Enter the student's PIN
4. You should see their assigned schedule!

## 5. Test the Request Feature

### As Student:
1. In the student view, click **Request** on any available day
2. Select a time block
3. Add an optional message
4. Click **Submit Request**

### As Instructor:
1. Go back to your instructor window
2. Click **Requests** in the navigation
3. You'll see the pending request
4. Click **Approve** or **Deny**

## Features to Explore

### Recurring Schedules
1. Go to **Students** → **Add Schedule**
2. Check **Recurring Schedule**
3. Select days of the week (Mon, Tue, Wed, etc.)
4. Set start and optional end date
5. Creates multiple schedules at once!

### Block Days
1. Go to **Calendar**
2. Click **Block** on any day
3. That day becomes unavailable for all students

### Time Block Configuration
1. Go to **Settings**
2. Scroll to **Time Blocks**
3. Click **Edit** on any time block
4. Change the name or times
5. Click **Save**

## Common Tasks

### Reset a Student's PIN
1. Go to **Students**
2. Click **Reset PIN** for the student
3. New PIN is generated and sent via SMS (if configured)

### Delete a Schedule
1. Go to **Calendar**
2. Click on any schedule entry (colored box)
3. Confirm deletion

### View All Requests
1. Go to **Requests**
2. See pending and processed requests
3. Filter and manage student time slot requests

## Troubleshooting

**Port 3000 already in use?**
```bash
# Use a different port
PORT=3001 npm run dev
```

**Can't login with 0000?**
- Make sure the database was seeded: `npm run db:seed`
- Check for errors in the terminal

**Changes not showing?**
- Refresh the browser (Ctrl+R or Cmd+R)
- Clear browser cache if needed

**Database errors?**
```bash
# Reset and reseed the database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

## Setting Up Notifications (Optional)

### Email (Resend)
1. Sign up at [resend.com](https://resend.com) - FREE
2. Get your API key
3. Add to `.env.local`:
   ```
   RESEND_API_KEY="re_your_key_here"
   ```
4. Restart dev server

### SMS (Twilio)
1. Sign up at [twilio.com](https://twilio.com) - $15 trial credit
2. Buy a phone number (~$1/month)
3. Get Account SID and Auth Token
4. Add to `.env.local`:
   ```
   TWILIO_ACCOUNT_SID="AC..."
   TWILIO_AUTH_TOKEN="your_token"
   TWILIO_PHONE_NUMBER="+1234567890"
   ```
5. Restart dev server

## Next Steps

- ✅ Read the full README.md for detailed documentation
- ✅ Check docs/SETUP.md for environment configuration
- ✅ Check docs/DEPLOYMENT.md for deploying to Vercel
- ✅ Check docs/API.md for API reference

## Need Help?

- Check the main README.md
- Review the docs/ folder
- Check browser console for errors (F12)
- Check terminal output for server errors

---

**Enjoy FlightSlot!** 🛩️

Your complete flight instructor scheduling system is ready to use.
