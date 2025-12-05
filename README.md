# FlightSlot - Flight Instructor Scheduling System

A comprehensive web-based calendar and scheduling application designed for flight instructors to manage student schedules, handle time slot requests, and streamline communication.

## Features

### For Instructors
- 📅 **Interactive Calendar** - Month view with visual schedule management
- 👥 **Student Management** - Add, edit, and remove students with auto-generated PINs
- 📝 **Request System** - Review and approve/deny student requests for time slots
- 🔄 **Recurring Schedules** - Assign students to recurring weekly time slots
- 🚫 **Day Blocking** - Block out days when unavailable
- ⚙️ **Time Block Configuration** - Customize daily time blocks (Morning, Afternoon, etc.)
- 📧 **Notifications** - Email and SMS notifications for new requests
- 🔐 **PIN Management** - Reset student PINs when needed

### For Students
- 📱 **Personal Calendar** - View assigned flight times
- 🙋 **Request Time Slots** - Submit requests for available time slots
- 🔔 **Notifications** - Receive confirmations via email/SMS when approved
- 👁️ **Privacy** - Can only see their own schedules; other times show as "unavailable"

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (local) / PostgreSQL (production via Vercel)
- **Authentication**: PIN-based with bcrypt hashing
- **Notifications**:
  - Email via [Resend](https://resend.com)
  - SMS via [Twilio](https://twilio.com)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd flightslot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First Login

- **Default Instructor PIN**: `0000`
- ⚠️ **IMPORTANT**: Change this PIN immediately after first login via Settings page!

## Configuration

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth Secret (change in production!)
AUTH_SECRET="your-secret-key-change-this"

# Instructor Default PIN
INSTRUCTOR_PIN="0000"

# Resend (Email)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### Setting Up Notifications

#### Email (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add `RESEND_API_KEY` to `.env.local`
4. Verify your domain (or use the test domain for development)

#### SMS (Twilio)

1. Sign up at [twilio.com](https://twilio.com)
2. Get a phone number (~$1/month)
3. Get your Account SID and Auth Token from the console
4. Add credentials to `.env.local`
5. SMS costs ~$0.0079 per message

## Usage Guide

### For Instructors

#### Adding Students

1. Go to **Students** page
2. Click **Add Student**
3. Enter name, email (optional), and phone (optional)
4. System auto-generates a 4-digit PIN
5. PIN is automatically sent via SMS/email if contact info provided

#### Assigning Schedules

**Single Assignment:**
1. Go to **Students** page
2. Click **Add Schedule** for a student
3. Select date and time block
4. Click **Add Schedule**

**Recurring Assignment:**
1. Click **Add Schedule** for a student
2. Check **Recurring Schedule**
3. Select days of the week (Mon, Tue, Wed, etc.)
4. Set start date (and optional end date)
5. Click **Add Schedule**

#### Managing Requests

1. Go to **Requests** page
2. View pending requests from students
3. Click **Approve** to add to schedule and notify student
4. Click **Deny** to reject the request

#### Blocking Days

1. Go to **Calendar** page
2. Click **Block** on any day
3. Blocked days prevent schedule creation and show as "Unavailable" to students

#### Configuring Time Blocks

1. Go to **Settings** page
2. Edit existing time blocks:
   - Change name (e.g., "Morning" → "Early Morning")
   - Adjust start/end times
3. Changes automatically update all existing schedules

### For Students

#### Viewing Schedule

- Login with your 4-digit PIN
- Calendar shows your assigned flight times in green
- Other students' times show as "Unavailable" (greyed out)

#### Requesting Time Slots

1. Click **Request** on any available day
2. Select a time block
3. Add optional message
4. Submit request
5. Wait for instructor approval (you'll receive email/SMS confirmation)

#### Cancelling Requests

- View pending requests at the top of the dashboard
- Click **Cancel** to withdraw a request before approval

## Database Schema

### Tables

- **Instructor** - Instructor account with PIN and contact info
- **Student** - Student accounts with PINs
- **TimeBlock** - Configurable time blocks (Morning, Afternoon, etc.)
- **Schedule** - Assigned time slots linking students to dates and time blocks
- **Request** - Student requests for time slots
- **BlockedDay** - Days when instructor is unavailable

## API Routes

### Authentication
- `POST /api/auth/login` - Login with PIN
- `POST /api/auth/logout` - Logout

### Students (Instructor Only)
- `GET /api/students` - List all students
- `POST /api/students` - Create student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student
- `POST /api/students/[id]/reset-pin` - Reset student PIN

### Schedules
- `GET /api/schedule` - Get schedules (filtered by role)
- `POST /api/schedule` - Create schedule(s)
- `DELETE /api/schedule/[id]` - Delete schedule

### Requests
- `GET /api/requests` - Get requests (filtered by role)
- `POST /api/requests` - Create request (students)
- `POST /api/requests/[id]/approve` - Approve request (instructor)
- `POST /api/requests/[id]/deny` - Deny request (instructor)
- `DELETE /api/requests/[id]` - Cancel request (students)

### Time Blocks
- `GET /api/time-blocks` - List all time blocks
- `POST /api/time-blocks` - Create time block (instructor)
- `PUT /api/time-blocks/[id]` - Update time block (instructor)
- `DELETE /api/time-blocks/[id]` - Delete time block (instructor)

### Blocked Days
- `GET /api/blocked-days` - Get blocked days
- `POST /api/blocked-days` - Block a day (instructor)
- `DELETE /api/blocked-days/[id]` - Unblock a day (instructor)

### Settings
- `GET /api/instructor/settings` - Get instructor settings
- `PUT /api/instructor/settings` - Update settings (email, phone, PIN)

## Deployment

### Deploying to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set up Postgres database:**
   - Go to Vercel dashboard
   - Add Postgres database to your project
   - Update `DATABASE_URL` in environment variables

5. **Configure environment variables:**
   - Add all variables from `.env.local` to Vercel
   - Set `AUTH_SECRET` to a strong random string
   - Add Resend and Twilio credentials

6. **Connect your domain:**
   - In Vercel dashboard, go to Domains
   - Add `bprime.net` (or your domain)
   - Update DNS records at GoDaddy:
     - Type: `A`, Name: `@`, Value: `76.76.21.21`
     - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`

7. **Push database schema:**
   ```bash
   npx prisma db push
   ```

8. **Seed production database:**
   ```bash
   npm run db:seed
   ```

## Project Structure

```
flightslot/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication
│   │   ├── students/       # Student management
│   │   ├── schedule/       # Schedule management
│   │   ├── requests/       # Request handling
│   │   ├── time-blocks/    # Time block configuration
│   │   ├── blocked-days/   # Blocked days management
│   │   └── instructor/     # Instructor settings
│   ├── instructor/         # Instructor dashboard pages
│   │   ├── students/      # Student management UI
│   │   ├── requests/      # Requests management UI
│   │   └── settings/      # Settings page
│   ├── student/           # Student dashboard
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home (redirects to login)
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── calendar/          # Calendar components
│       └── MonthView.tsx
├── lib/
│   ├── db.ts             # Prisma client
│   ├── auth.ts           # Authentication helpers
│   ├── utils.ts          # Utility functions
│   └── notifications/    # Notification services
│       ├── email.ts      # Resend integration
│       └── sms.ts        # Twilio integration
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Database seeding
│   └── dev.db            # SQLite database (local)
├── types/
│   └── index.ts          # TypeScript types
├── .env.local            # Environment variables (local)
├── .env.local.example    # Example env file
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Security Features

- ✅ PIN-based authentication with bcrypt hashing
- ✅ Session-based access control
- ✅ Role-based permissions (instructor vs student)
- ✅ HTTP-only cookies
- ✅ SQL injection prevention via Prisma
- ✅ CSRF protection via Next.js
- ⚠️ Change default PINs in production!

## Troubleshooting

### Common Issues

**Cannot connect to database:**
- Ensure `DATABASE_URL` is set correctly
- Run `npm run db:push` to create tables

**Notifications not working:**
- Check API keys are set in `.env.local`
- Restart dev server after adding keys
- Verify domain for Resend
- Check Twilio account balance

**PIN not accepted:**
- Default instructor PIN is `0000`
- Check for typos (numeric only, 4 digits)
- Reset student PINs from Students page

**Schedules not appearing:**
- Check date filters (month/year)
- Verify schedules were created without errors
- Check browser console for errors

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with default data
- `npm run db:studio` - Open Prisma Studio (database GUI)

### Database Management

View and edit data with Prisma Studio:
```bash
npm run db:studio
```

Opens at [http://localhost:5555](http://localhost:5555)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the API documentation
- Check browser console for errors
- Verify environment variables are set

## License

Private project - All rights reserved

---

**Built with Next.js, Prisma, and Tailwind CSS**
