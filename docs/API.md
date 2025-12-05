# FlightSlot API Reference

Complete API documentation for all endpoints.

## Authentication

All API routes (except `/api/auth/login`) require authentication via session cookie.

### Login

**POST** `/api/auth/login`

Authenticate with a PIN and create a session.

**Request:**
```json
{
  "pin": "0000"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "role": "instructor",
    "name": "Instructor"
  },
  "redirectTo": "/instructor"
}
```

**Response (Error):**
```json
{
  "error": "Invalid PIN. Please try again."
}
```

### Logout

**POST** `/api/auth/logout`

Destroy the current session.

**Response:**
```json
{
  "success": true,
  "redirectTo": "/login"
}
```

---

## Students

### List All Students

**GET** `/api/students`

**Auth:** Instructor only

**Response:**
```json
[
  {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+12345678900",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "schedules": [
      {
        "id": "clx...",
        "date": "2024-01-20T00:00:00.000Z",
        "timeBlock": {
          "id": "clx...",
          "name": "Morning",
          "startTime": "08:00",
          "endTime": "12:00"
        }
      }
    ]
  }
]
```

### Create Student

**POST** `/api/students`

**Auth:** Instructor only

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+12345678900"
}
```

**Response:**
```json
{
  "student": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+12345678900",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "pin": "1234"
}
```

### Get Single Student

**GET** `/api/students/[id]`

**Auth:** Instructor only

**Response:** Same as student object above with schedules.

### Update Student

**PUT** `/api/students/[id]`

**Auth:** Instructor only

**Request:**
```json
{
  "name": "John Smith",
  "email": "newem ail@example.com",
  "phone": "+19876543210"
}
```

**Response:** Updated student object.

### Delete Student

**DELETE** `/api/students/[id]`

**Auth:** Instructor only

**Response:**
```json
{
  "success": true
}
```

### Reset Student PIN

**POST** `/api/students/[id]/reset-pin`

**Auth:** Instructor only

**Response:**
```json
{
  "success": true,
  "pin": "5678"
}
```

---

## Schedules

### List Schedules

**GET** `/api/schedule?month=1&year=2024`

**Auth:** All users (filtered by role)
- Instructors see all schedules
- Students see only their own schedules

**Query Parameters:**
- `month` (optional): Month number (1-12)
- `year` (optional): Year (e.g., 2024)

**Response:**
```json
[
  {
    "id": "clx...",
    "date": "2024-01-20T00:00:00.000Z",
    "studentId": "clx...",
    "timeBlockId": "clx...",
    "isRecurring": false,
    "recurringId": null,
    "notes": null,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "student": {
      "id": "clx...",
      "name": "John Doe"
    },
    "timeBlock": {
      "id": "clx...",
      "name": "Morning",
      "startTime": "08:00",
      "endTime": "12:00"
    }
  }
]
```

### Create Schedule(s)

**POST** `/api/schedule`

**Auth:** Instructor only

**Request (Single Date):**
```json
{
  "studentId": "clx...",
  "timeBlockId": "clx...",
  "dates": ["2024-01-20", "2024-01-21"]
}
```

**Request (Recurring):**
```json
{
  "studentId": "clx...",
  "timeBlockId": "clx...",
  "recurring": {
    "days": [1, 3, 5],
    "startDate": "2024-01-15",
    "endDate": "2024-03-15"
  }
}
```

**Days of Week:**
- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

**Response:** Array of created schedule objects.

### Delete Schedule

**DELETE** `/api/schedule/[id]?deleteRecurring=false`

**Auth:** Instructor only

**Query Parameters:**
- `deleteRecurring` (optional): If `true`, deletes all recurring instances

**Response:**
```json
{
  "success": true
}
```

---

## Requests

### List Requests

**GET** `/api/requests`

**Auth:** All users (filtered by role)
- Instructors see all requests
- Students see only their own requests

**Response:**
```json
[
  {
    "id": "clx...",
    "date": "2024-01-20T00:00:00.000Z",
    "studentId": "clx...",
    "timeBlockId": "clx...",
    "status": "pending",
    "message": "Need this slot for checkride prep",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "student": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+12345678900"
    },
    "timeBlock": {
      "id": "clx...",
      "name": "Morning",
      "startTime": "08:00",
      "endTime": "12:00"
    }
  }
]
```

**Status Values:**
- `pending` - Awaiting instructor review
- `approved` - Accepted and scheduled
- `denied` - Rejected

### Create Request

**POST** `/api/requests`

**Auth:** Student only

**Request:**
```json
{
  "date": "2024-01-20",
  "timeBlockId": "clx...",
  "message": "Optional message"
}
```

**Response:** Created request object.

**Errors:**
- Slot already taken
- Day is blocked
- Duplicate pending request

### Approve Request

**POST** `/api/requests/[id]/approve`

**Auth:** Instructor only

**Response:**
```json
{
  "success": true,
  "schedule": {
    // Created schedule object
  }
}
```

**Errors:**
- Request already processed
- Slot no longer available

### Deny Request

**POST** `/api/requests/[id]/deny`

**Auth:** Instructor only

**Response:**
```json
{
  "success": true
}
```

### Cancel Request

**DELETE** `/api/requests/[id]`

**Auth:** Student (own requests) or Instructor (any request)

**Response:**
```json
{
  "success": true
}
```

---

## Time Blocks

### List Time Blocks

**GET** `/api/time-blocks`

**Auth:** All users

**Response:**
```json
[
  {
    "id": "clx...",
    "name": "Morning",
    "startTime": "08:00",
    "endTime": "12:00",
    "order": 1,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

### Create Time Block

**POST** `/api/time-blocks`

**Auth:** Instructor only

**Request:**
```json
{
  "name": "Early Morning",
  "startTime": "06:00",
  "endTime": "08:00",
  "order": 0
}
```

**Response:** Created time block object.

### Update Time Block

**PUT** `/api/time-blocks/[id]`

**Auth:** Instructor only

**Request:**
```json
{
  "name": "Morning Flight",
  "startTime": "07:00",
  "endTime": "11:00",
  "order": 1
}
```

**Response:** Updated time block object.

### Delete Time Block

**DELETE** `/api/time-blocks/[id]`

**Auth:** Instructor only

**Response:**
```json
{
  "success": true
}
```

**Error:**
- Cannot delete time block with existing schedules

---

## Blocked Days

### List Blocked Days

**GET** `/api/blocked-days?month=1&year=2024`

**Auth:** All users

**Query Parameters:**
- `month` (optional): Month number (1-12)
- `year` (optional): Year

**Response:**
```json
[
  {
    "id": "clx...",
    "date": "2024-01-25T00:00:00.000Z",
    "reason": "Holiday - Aircraft maintenance",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

### Block a Day

**POST** `/api/blocked-days`

**Auth:** Instructor only

**Request:**
```json
{
  "date": "2024-01-25",
  "reason": "Holiday - Aircraft maintenance"
}
```

**Response:** Created blocked day object.

**Error:**
- Day already blocked (unique constraint)

### Unblock a Day

**DELETE** `/api/blocked-days/[id]`

**Auth:** Instructor only

**Response:**
```json
{
  "success": true
}
```

---

## Instructor Settings

### Get Settings

**GET** `/api/instructor/settings`

**Auth:** Instructor only

**Response:**
```json
{
  "id": "clx...",
  "email": "instructor@example.com",
  "phone": "+12345678900",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

Note: PIN is never returned for security.

### Update Settings

**PUT** `/api/instructor/settings`

**Auth:** Instructor only

**Request:**
```json
{
  "email": "newemail@example.com",
  "phone": "+19876543210",
  "newPin": "5678"
}
```

**Response:** Updated settings object (without PIN).

**Validation:**
- PIN must be exactly 4 digits
- All fields optional

---

## Error Responses

All endpoints may return these error formats:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden: Instructor access required"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "An error occurred. Please try again."
}
```

---

## Rate Limiting

No rate limiting is currently implemented. Consider adding in production:

```javascript
// Example with next-rate-limit
import rateLimit from 'next-rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function POST(request) {
  try {
    await limiter.check(request, 10, 'CACHE_TOKEN')
    // ... rest of handler
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
}
```

---

## Webhooks

Currently not implemented. Future consideration for SMS reply handling (Twilio webhooks).

---

## Testing

Example with `curl`:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"0000"}' \
  -c cookies.txt

# Get students (with session cookie)
curl http://localhost:3000/api/students \
  -b cookies.txt

# Create student
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Test Student","email":"test@example.com"}'
```

Example with JavaScript `fetch`:

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pin: '0000' }),
})

const loginData = await loginResponse.json()

// Get students
const studentsResponse = await fetch('/api/students')
const students = await studentsResponse.json()
```
