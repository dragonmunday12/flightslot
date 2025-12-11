# FlightSlot Scripts

Utility scripts for managing the FlightSlot database.

## Clear Events Script

### Usage

**Clear schedules and requests only (keep blocked days):**
```bash
npm run clear:events
```

**Clear schedules, requests, AND blocked days:**
```bash
npm run clear:all
```

### What Gets Cleared

#### `npm run clear:events`
- ✅ All schedules (flight assignments)
- ✅ All requests (pending and processed)
- ❌ Blocked days (KEPT)

**What stays:**
- Students
- Instructor account
- Time blocks
- Settings
- Blocked days

#### `npm run clear:all`
- ✅ All schedules (flight assignments)
- ✅ All requests (pending and processed)
- ✅ All blocked days

**What stays:**
- Students
- Instructor account
- Time blocks
- Settings

## Examples

### Scenario 1: Starting a New Semester
You want to clear old schedules but keep your blocked vacation days:
```bash
npm run clear:events
```

### Scenario 2: Complete Fresh Start
You want to clear everything and start from scratch:
```bash
npm run clear:all
```

### Scenario 3: Reset Everything Including Students
If you want to completely reset the database:
```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

## Notes

- These scripts are safe to run - they only affect schedules, requests, and optionally blocked days
- Your instructor account and students are never deleted
- The dev server will automatically reflect changes
- No backup is created - use with caution!
