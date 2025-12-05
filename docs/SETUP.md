# FlightSlot Setup Guide

Complete setup instructions for FlightSlot scheduling system.

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
cd flightslot
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth Secret
AUTH_SECRET="change-this-to-random-string-in-production"

# Default Instructor PIN (change after first login!)
INSTRUCTOR_PIN="0000"

# Optional: Email notifications (Resend)
RESEND_API_KEY=""

# Optional: SMS notifications (Twilio)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
```

### 3. Initialize Database

```bash
# Push schema to database
npm run db:push

# Seed with default data
npm run db:seed
```

You should see output like:
```
✅ Created default instructor account
   PIN: 0000
   ⚠️  IMPORTANT: Change this PIN in the settings after first login!

✅ Created default time blocks:
   - Morning (8:00 AM - 12:00 PM)
   - Early Afternoon (12:00 PM - 3:00 PM)
   - Late Afternoon (3:00 PM - 6:00 PM)
   - Evening (6:00 PM - 9:00 PM)

🎉 Database seeded successfully!
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. First Login

- Click to go to login page
- Enter PIN: `0000`
- You'll be logged in as the instructor

### 6. Change Default PIN

**IMPORTANT**: Immediately change your PIN!

1. Go to **Settings** page
2. Enter a new 4-digit PIN in both fields
3. Click **Update PIN**

## Setting Up Notifications

### Email Notifications (Resend)

1. **Sign up for Resend**
   - Go to [resend.com](https://resend.com)
   - Create a free account

2. **Get API Key**
   - Go to API Keys in dashboard
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Add to Environment**
   ```env
   RESEND_API_KEY="re_your_api_key_here"
   ```

4. **Configure Domain (Production)**
   - In Resend dashboard, add your domain (`bprime.net`)
   - Add DNS records as shown
   - Verify domain
   - Update the "from" address in `lib/notifications/email.ts`:
     ```typescript
     from: 'FlightSlot <noreply@yourdomain.com>',
     ```

5. **Test**
   - Add a student with an email address
   - Check if they receive the welcome email with PIN

### SMS Notifications (Twilio)

1. **Sign up for Twilio**
   - Go to [twilio.com](https://twilio.com)
   - Create account (requires credit card but has $15 trial credit)

2. **Get Phone Number**
   - Buy a phone number (~$1/month)
   - Copy the phone number (e.g., `+12345678900`)

3. **Get Credentials**
   - Go to Console Dashboard
   - Copy **Account SID** (starts with `AC`)
   - Copy **Auth Token**

4. **Add to Environment**
   ```env
   TWILIO_ACCOUNT_SID="AC..."
   TWILIO_AUTH_TOKEN="your_auth_token"
   TWILIO_PHONE_NUMBER="+12345678900"
   ```

5. **Test**
   - Add a student with a phone number
   - Check if they receive the SMS with PIN

### Restart After Configuration

After adding API keys, restart the dev server:
```bash
# Press Ctrl+C to stop
npm run dev
```

## Database Management

### View/Edit Data (Prisma Studio)

```bash
npm run db:studio
```

Opens a GUI at [http://localhost:5555](http://localhost:5555)

### Reset Database

**Warning**: This deletes all data!

```bash
# Delete the database file
rm prisma/dev.db

# Recreate and seed
npm run db:push
npm run db:seed
```

### Backup Database

```bash
# Copy the SQLite file
cp prisma/dev.db prisma/dev.db.backup
```

## Common Issues

### Port 3000 Already in Use

```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or use a different port:
PORT=3001 npm run dev
```

### Database Locked Error

Close Prisma Studio if running:
- Check [http://localhost:5555](http://localhost:5555)
- Stop the process

### Prisma Client Not Generated

```bash
npm run db:generate
```

### Environment Variables Not Loading

1. Make sure file is named `.env.local` (not `.env.local.txt`)
2. Restart the dev server
3. Check for typos in variable names

## Next Steps

1. ✅ Test adding a student
2. ✅ Test assigning a schedule
3. ✅ Login as student (use their PIN)
4. ✅ Test requesting a time slot
5. ✅ Approve the request as instructor
6. ✅ Configure email/SMS notifications
7. ✅ Customize time blocks in Settings

## Production Setup

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.
