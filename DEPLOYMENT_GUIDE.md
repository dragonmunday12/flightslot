# FlightSlot Production Deployment Guide

Complete guide to deploy FlightSlot to **flightslot.bprime.net**

---

## Overview

We'll deploy your app to **Vercel** (best for Next.js) with:
- **Domain**: flightslot.bprime.net (GoDaddy DNS)
- **Database**: PostgreSQL on Railway
- **Email**: Resend (free tier: 3,000 emails/month)
- **SMS**: Twilio (pay-as-you-go)

**Total Cost**: ~$5-10/month (database) + SMS usage

---

## Step 1: Set Up PostgreSQL Database (Railway)

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway

### 1.2 Create PostgreSQL Database
1. Click "New Project"
2. Select "Provision PostgreSQL"
3. Wait for deployment (1-2 minutes)
4. Click on the PostgreSQL service
5. Go to "Variables" tab
6. Copy the **DATABASE_URL** (starts with `postgresql://`)
   - Example: `postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway`
7. Save this URL - you'll need it later

**Cost**: $5/month (500MB storage, plenty for this app)

---

## Step 2: Set Up Email Notifications (Resend)

### 2.1 Create Resend Account
1. Go to https://resend.com
2. Click "Start Building for Free"
3. Sign up with your email
4. Verify your email address

### 2.2 Get API Key
1. After login, go to **API Keys** (left sidebar)
2. Click "Create API Key"
3. Name it: "FlightSlot Production"
4. Permission: "Sending access"
5. Click "Add"
6. **COPY THE API KEY** (starts with `re_`)
   - Example: `re_123456789abcdefghijklmnop`
   - ⚠️ You can only see this once!
7. Save this key securely

### 2.3 Verify Your Domain (Optional but Recommended)
**Option A: Use resend.dev (No setup needed)**
- Emails will come from: `onboarding@resend.dev`
- Works immediately, no domain setup
- Skip to Step 3

**Option B: Use your domain (Professional)**
1. In Resend dashboard, go to **Domains**
2. Click "Add Domain"
3. Enter: `flightslot.bprime.net`
4. Copy the DNS records shown (3-4 records)
5. Go to GoDaddy DNS settings:
   - Login to GoDaddy
   - My Products → Domains → bprime.net → DNS
   - Add each record exactly as shown in Resend
6. Wait 10-60 minutes for DNS propagation
7. Return to Resend and click "Verify Records"
8. Once verified, emails will come from: `notifications@flightslot.bprime.net`

**Recommendation**: Start with Option A (resend.dev) to get running quickly. Add custom domain later if desired.

---

## Step 3: Set Up SMS Notifications (Twilio)

### 3.1 Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for free trial
3. Verify your phone number
4. Complete the questionnaire (select "Alerts & Notifications")

### 3.2 Get Trial Phone Number
1. After signup, Twilio will offer a free trial number
2. Click "Get a Trial Number"
3. Accept the number offered
4. Copy this number (format: +1234567890)

### 3.3 Get API Credentials
1. Go to Twilio Console: https://console.twilio.com
2. Find your **Account SID** (starts with `AC`)
3. Find your **Auth Token** (click "View" to reveal)
4. Copy both values

### 3.4 Verify Recipient Numbers (Trial Mode)
⚠️ **Important**: Twilio trial accounts can ONLY send to verified numbers.

1. Go to "Verified Caller IDs" in Twilio Console
2. Click "Add a new number"
3. Enter the instructor's phone number
4. Verify via code sent to phone
5. Repeat for any student phone numbers you want to test

### 3.5 Upgrade Account (When Ready)
- Trial gives you $15 credit
- SMS costs ~$0.0075 per message
- To send to ANY number (remove verified list restriction):
  1. Go to Billing
  2. Add payment method
  3. Upgrade to paid account
  - No monthly fee, pay only for usage

**Trial**: Free $15 credit, verified numbers only
**Paid**: ~$0.0075/SMS, send to any number

---

## Step 4: Deploy to Vercel

### 4.1 Prepare Your Code
1. Make sure all changes are committed:
```bash
cd /Users/brendenprime/ClaudeProjects/ATPCalendar/flightslot
git status
git add .
git commit -m "Ready for production deployment"
```

2. Push to GitHub (if not already):
```bash
# If you haven't initialized git yet:
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/flightslot.git
git branch -M main
git push -u origin main
```

### 4.2 Deploy to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Click "Import Project"
4. Import your flightslot repository
5. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - Click "Environment Variables" (expand)

### 4.3 Add Environment Variables
Add these environment variables in Vercel:

```
DATABASE_URL
[paste your Railway PostgreSQL URL from Step 1.2]

NODE_ENV
production

RESEND_API_KEY
[paste your Resend API key from Step 2.2]

FROM_EMAIL
onboarding@resend.dev
(or notifications@flightslot.bprime.net if you verified custom domain)

TWILIO_ACCOUNT_SID
[paste from Step 3.3]

TWILIO_AUTH_TOKEN
[paste from Step 3.3]

TWILIO_PHONE_NUMBER
[paste from Step 3.2, format: +1234567890]
```

6. Click "Deploy"
7. Wait 2-3 minutes for deployment
8. You'll get a temporary URL like: `flightslot-xyz.vercel.app`

### 4.4 Set Up Database Schema
1. After deployment completes, go to Vercel dashboard
2. Click on your project → "Settings" → "Functions"
3. Find "Serverless Function Timeout" - keep default (10s is fine)
4. Now run database migration:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run database migration
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db push
```

**Option B: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your database
railway link

# Run migration
DATABASE_URL="[your Railway URL]" npx prisma migrate deploy
DATABASE_URL="[your Railway URL]" npx prisma db push
```

---

## Step 5: Configure Custom Domain (GoDaddy → Vercel)

### 5.1 Add Domain in Vercel
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Enter: `flightslot.bprime.net`
4. Click "Add"
5. Vercel will show you DNS records to add

### 5.2 Configure DNS in GoDaddy
1. Login to GoDaddy: https://dcc.godaddy.com/
2. Go to "My Products" → "Domains"
3. Click on **bprime.net** → "DNS"
4. Add these records as shown by Vercel:

**Record to Add:**
- **Type**: CNAME
- **Name**: flightslot
- **Value**: cname.vercel-dns.com
- **TTL**: 1 hour (or 600 seconds)

5. Click "Save"

### 5.3 Wait for DNS Propagation
- DNS changes take 10 minutes to 24 hours
- Usually works in 10-30 minutes
- Check status in Vercel (it will show "Valid Configuration" when ready)

### 5.4 Test Your Domain
Once Vercel shows "Valid Configuration":
1. Visit: https://flightslot.bprime.net
2. You should see your login page!
3. SSL certificate is automatic (provided by Vercel)

---

## Step 6: Initialize Production Database

### 6.1 Create Initial Instructor Account
You need to create the instructor account manually in the database:

```bash
# Using the Railway CLI:
railway login
railway link  # Select your PostgreSQL database
railway run node scripts/create-instructor.js
```

Or create a temporary script:

```javascript
// scripts/create-instructor.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const pin = '1234'  // Change this to your desired PIN
  const hashedPin = await bcrypt.hash(pin, 10)

  const instructor = await prisma.instructor.create({
    data: {
      pin: hashedPin,
      email: 'your-email@example.com',  // Optional
      phone: '+1234567890',  // Optional
    },
  })

  console.log('Instructor created!')
  console.log('PIN:', pin)
  console.log('ID:', instructor.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run it:
```bash
DATABASE_URL="[your Railway URL]" node scripts/create-instructor.js
```

---

## Step 7: Testing & Verification

### 7.1 Test Authentication
1. Visit https://flightslot.bprime.net
2. Enter instructor PIN
3. Should redirect to instructor dashboard

### 7.2 Test Email Notifications
1. Create a student with an email address
2. Check if welcome email arrives
3. Approve a request and check if notification is sent

### 7.3 Test SMS Notifications
1. Create a student with a phone number (must be verified if using Twilio trial)
2. Check if welcome SMS arrives
3. Create a request and check if instructor gets notified

### 7.4 Test All Features
- [ ] Login works
- [ ] Create students
- [ ] Create schedules
- [ ] Block days
- [ ] Student requests
- [ ] Approve/deny requests
- [ ] Clear events
- [ ] Email notifications working
- [ ] SMS notifications working
- [ ] Mobile responsive
- [ ] Security features active (try accessing student page as instructor)

---

## Step 8: Monitoring & Maintenance

### 8.1 Set Up Error Monitoring (Optional)
**Sentry** (Recommended - Free tier available):
1. Go to https://sentry.io
2. Create account
3. Create new Next.js project
4. Follow setup instructions
5. Add SENTRY_DSN to Vercel environment variables

### 8.2 Monitor Usage
**Vercel Dashboard**:
- Check deployment logs
- Monitor bandwidth usage
- Review function execution times

**Railway Dashboard**:
- Monitor database size
- Check connection pool
- Review query performance

**Resend Dashboard**:
- Track email delivery rates
- Check bounce rates
- Monitor daily usage

**Twilio Dashboard**:
- Check SMS delivery
- Monitor costs
- Review error logs

### 8.3 Set Up Backups
**Automated Database Backups** (Railway):
1. Railway automatically backs up your database
2. Can restore from any point in last 7 days
3. For longer retention, set up manual exports:

```bash
# Backup command (run weekly)
railway run pg_dump > backup-$(date +%Y%m%d).sql
```

Store backups in Google Drive or Dropbox.

---

## Step 9: Post-Deployment Security

### 9.1 Change Default PINs
1. Login to production site
2. Create all student accounts with strong 4-digit PINs
3. Store PINs securely (password manager)

### 9.2 Review Security Settings
- [ ] Verify HTTPS is working (check for padlock icon)
- [ ] Test that unauthenticated access redirects to login
- [ ] Test that students can't access instructor pages
- [ ] Verify rate limiting works (try 6 failed logins)

### 9.3 Update SECURITY.md
1. Add actual security contact email
2. Update with production deployment details

---

## Costs Summary

| Service | Cost | Usage |
|---------|------|-------|
| Vercel | **Free** | Hobby plan (enough for this app) |
| Railway (Database) | **$5/month** | 500MB storage |
| Resend (Email) | **Free** | Up to 3,000 emails/month |
| Twilio (SMS) | **$0.0075/SMS** | Pay per use |
| GoDaddy Domain | **Already owned** | - |

**Total Monthly Cost**: $5 + SMS usage
**Estimated**: $5-10/month depending on SMS volume

---

## Troubleshooting

### Database Connection Issues
```
Error: P1001: Can't reach database server
```
**Solution**: Check DATABASE_URL is correct and database is running in Railway

### Email Not Sending
```
RESEND_API_KEY not configured
```
**Solution**: Verify RESEND_API_KEY is set in Vercel environment variables

### SMS Not Sending
```
Twilio not configured
```
**Solution**:
1. Verify all 3 Twilio env vars are set
2. If trial: verify recipient numbers in Twilio console
3. Check Twilio error logs

### Domain Not Working
```
DNS_PROBE_FINISHED_NXDOMAIN
```
**Solution**: Wait longer for DNS propagation (up to 24 hours). Verify CNAME record is correct in GoDaddy.

### Build Failing
```
Error: Command failed with exit code 1
```
**Solution**: Check build logs in Vercel. Common issues:
- Missing environment variables
- TypeScript errors
- Database connection during build

---

## Quick Reference

### Important URLs
- **Production Site**: https://flightslot.bprime.net
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Resend Dashboard**: https://resend.com/emails
- **Twilio Console**: https://console.twilio.com
- **GoDaddy DNS**: https://dcc.godaddy.com

### Support
- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://help.railway.app
- **Resend Docs**: https://resend.com/docs
- **Twilio Support**: https://support.twilio.com

---

## Next Steps After Deployment

1. **Create student accounts** for all your students
2. **Send welcome emails/SMS** with their PINs
3. **Add your schedule** and availability
4. **Test with real users** before announcing
5. **Monitor for a few days** to catch any issues
6. **Set up automated backups** (weekly database exports)
7. **Consider upgrading Twilio** if you need to send to unverified numbers

---

**You're all set! Your FlightSlot app is now live at https://flightslot.bprime.net** 🚀

If you run into any issues during deployment, check the troubleshooting section or review the service-specific documentation linked above.
