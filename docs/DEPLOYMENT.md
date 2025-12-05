# FlightSlot Deployment Guide

Deploy FlightSlot to Vercel with PostgreSQL database.

## Prerequisites

- Vercel account (free tier available)
- GitHub account (optional but recommended)
- GoDaddy domain (bprime.net) already owned

## Option 1: Deploy via GitHub (Recommended)

### 1. Create GitHub Repository

```bash
cd flightslot
git init
git add .
git commit -m "Initial commit: FlightSlot scheduling system"
```

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/yourusername/flightslot.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New Project**
4. Import your `flightslot` repository
5. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Add PostgreSQL Database

1. In Vercel dashboard, go to your project
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose **Hobby** (free tier)
6. Name it `flightslot-db`
7. Wait for database creation

Vercel automatically adds `DATABASE_URL` to your environment variables.

### 4. Configure Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**

Add the following:

```env
# Auth (IMPORTANT: Generate a random string!)
AUTH_SECRET="your-secure-random-string-here"

# Instructor PIN (change this!)
INSTRUCTOR_PIN="your-secure-4-digit-pin"

# Resend (Email)
RESEND_API_KEY="re_your_api_key"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="your_token"
TWILIO_PHONE_NUMBER="+12345678900"
```

**Generate AUTH_SECRET**:
```bash
# Generate a random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Deploy

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Configure for production"
git push
```

Or manually deploy:
- Click **Deployments** → **Redeploy**

### 6. Initialize Database

After deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Push database schema
npx prisma db push

# Seed database
npm run db:seed
```

### 7. Connect Custom Domain

In Vercel dashboard:

1. Go to **Settings** → **Domains**
2. Add domain: `bprime.net`
3. Add domain: `www.bprime.net`

In GoDaddy DNS settings:

1. **A Record**:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
   - TTL: `600`

2. **CNAME Record**:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: `600`

Wait 5-10 minutes for DNS propagation.

## Option 2: Direct Vercel Deployment

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login and Deploy

```bash
cd flightslot
vercel login
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project name? `flightslot`
- In which directory is your code located? `./`
- Want to override settings? **N**

### 3. Add Database

See steps 3-7 from Option 1 above.

## Post-Deployment Setup

### 1. Test the Application

1. Visit your domain: `https://bprime.net`
2. Login with your instructor PIN
3. Add a test student
4. Create a test schedule
5. Login as student and test requesting a slot

### 2. Change Default PIN

**CRITICAL**: Change the instructor PIN immediately!

1. Login to `https://bprime.net`
2. Go to Settings
3. Update your PIN
4. Update `INSTRUCTOR_PIN` in Vercel environment variables
5. Redeploy

### 3. Configure Email Domain

In Resend dashboard:

1. Add domain: `bprime.net`
2. Add DNS records shown
3. Wait for verification
4. Update `from` address in code:

Edit `lib/notifications/email.ts`:
```typescript
from: 'FlightSlot <noreply@bprime.net>',
```

Commit and push to redeploy.

## Monitoring & Maintenance

### View Logs

```bash
vercel logs
```

Or in Vercel dashboard: **Deployments** → Click deployment → **Logs**

### View Database

Option 1: Prisma Studio (local connection)
```bash
npx prisma studio
```

Option 2: Vercel Postgres Dashboard
- Vercel dashboard → **Storage** → **Browse**

### Database Backups

Vercel Postgres automatically backs up daily. To export:

```bash
# Get database URL from Vercel
vercel env pull .env.production

# Export database
pg_dump $DATABASE_URL > backup.sql
```

### Update Application

```bash
git add .
git commit -m "Update description"
git push
```

Vercel auto-deploys on push to main branch.

## Scaling Considerations

### Current Setup (Free Tier)

- **Vercel**: 100 GB bandwidth/month
- **Postgres**: 256 MB storage, 60 hours compute/month
- **Resend**: 3,000 emails/month
- **Twilio**: Pay-as-you-go (~$0.0079/SMS)

### If You Need More:

**Vercel Pro** ($20/month):
- Unlimited bandwidth
- Team collaboration
- More build minutes

**Postgres Upgrade**:
- Pro tier: $20/month for more storage/compute

**Alternatives**:
- Railway (offers Postgres)
- Render (offers free Postgres)
- Supabase (free Postgres)

## Security Checklist

- ✅ Changed default instructor PIN
- ✅ Set strong `AUTH_SECRET`
- ✅ Environment variables configured in Vercel
- ✅ Not committing `.env.local` to git
- ✅ SSL/HTTPS enabled (automatic with Vercel)
- ✅ Domain verified with Resend
- ✅ Twilio phone number secured

## Troubleshooting

### Build Fails

Check build logs in Vercel dashboard. Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies

Fix:
```bash
# Test build locally
npm run build
```

### Database Connection Fails

- Verify `DATABASE_URL` is set in Vercel
- Check database is running in Vercel Storage tab
- Try redeploying

### Domain Not Working

- Verify DNS records in GoDaddy
- Wait 10-15 minutes for DNS propagation
- Check Vercel domain status

### Emails Not Sending

- Verify `RESEND_API_KEY` in Vercel
- Check domain verification in Resend
- View logs in Resend dashboard

### SMS Not Sending

- Verify Twilio credentials in Vercel
- Check Twilio account balance
- Ensure phone number is verified (for trial accounts)

## Cost Estimate (Monthly)

Assuming ~50 students, 200 schedules/month, 50 requests/month:

| Service | Cost |
|---------|------|
| Vercel Hosting (Free tier) | $0 |
| Postgres (Free tier) | $0 |
| Resend Email | $0 (under 3k emails) |
| Twilio Phone Number | ~$1 |
| Twilio SMS (~50 messages) | ~$0.40 |
| **Total** | **~$1.40/month** |

Free tier is sufficient for personal use. Upgrade if you exceed limits.

## Rollback Deployment

If something goes wrong:

1. Go to Vercel dashboard
2. Click **Deployments**
3. Find previous working deployment
4. Click **⋯** → **Promote to Production**

## Support

For deployment issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Deployment Complete!** 🎉

Your FlightSlot application is now live at `https://bprime.net`
