# Security Documentation

This document outlines the security measures implemented in FlightSlot and best practices for maintaining a secure deployment.

## Table of Contents
1. [Security Features](#security-features)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [Input Validation](#input-validation)
5. [Rate Limiting](#rate-limiting)
6. [Security Headers](#security-headers)
7. [Deployment Security](#deployment-security)
8. [Security Checklist](#security-checklist)
9. [Incident Response](#incident-response)

## Security Features

### Implemented Security Controls

✅ **Authentication**
- PIN-based authentication with bcrypt hashing (10 salt rounds)
- Secure HTTP-only session cookies
- Session expiration (7 days)
- Login rate limiting (5 attempts per minute per IP)

✅ **Authorization**
- Role-based access control (Instructor/Student)
- Middleware-based route protection
- API endpoint authorization checks
- Students can only access their own data

✅ **Input Validation**
- Comprehensive input validation for all user inputs
- Email and phone number sanitization
- UUID validation for IDs
- Date format validation
- Message length limits (500 characters)
- Name validation (2-100 characters, letters only)

✅ **XSS Protection**
- Input sanitization removes HTML tags
- Content Security Policy headers
- X-XSS-Protection headers

✅ **SQL Injection Protection**
- Prisma ORM with parameterized queries
- No raw SQL queries

✅ **Security Headers**
- Strict-Transport-Security (HSTS)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- Content-Security-Policy
- Referrer-Policy
- Permissions-Policy

✅ **CSRF Protection**
- SameSite cookie attribute
- HTTP-only cookies

## Authentication & Authorization

### Authentication Flow

1. User enters 4-digit PIN on login page
2. Rate limiting check (max 5 attempts per minute per IP)
3. PIN format validation
4. PIN verification against bcrypt hash
5. Session creation with HTTP-only cookie
6. Redirect to role-appropriate dashboard

### Session Management

```typescript
// Session cookie settings
{
  httpOnly: true,                         // Prevents JavaScript access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax',                        // CSRF protection
  maxAge: 60 * 60 * 24 * 7               // 7 days
}
```

### Authorization Checks

All protected API routes use one of these functions:
- `requireAuth()` - Requires any authenticated user
- `requireInstructor()` - Requires instructor role
- `requireStudent()` - Requires student role

### Middleware Protection

The `middleware.ts` file provides route-level protection:
- Redirects unauthenticated users to login
- Enforces role-based access to dashboards
- Validates session integrity

## Data Protection

### Password/PIN Security
- PINs are hashed using bcrypt with 10 salt rounds
- PINs are never stored in plain text
- PINs are only displayed once to instructor upon creation

### Sensitive Data
- Email addresses are validated and sanitized
- Phone numbers are validated and stored as digits only
- Session data is stored in HTTP-only cookies
- Database credentials in environment variables

### Database Security
- Prisma ORM prevents SQL injection
- Prepared statements for all queries
- Input validation before database operations

## Input Validation

### Validation Functions

All user inputs are validated using functions in `lib/validation.ts`:

```typescript
// Student name validation
validateStudentName(name: string) // 2-100 chars, letters/spaces/hyphens only

// Email validation
sanitizeEmail(email: string) // RFC-compliant email format

// Phone validation
sanitizePhone(phone: string) // 10-15 digits

// Message validation
validateMessage(message: string) // Max 500 chars, sanitized for XSS

// UUID validation
isValidUUID(id: string) // Valid UUID v4 format

// Date validation
isValidDateString(date: string) // YYYY-MM-DD format
```

### Sanitization

Input sanitization prevents XSS attacks:
- HTML tags removed from text inputs
- String length limits enforced
- Special characters handled appropriately

## Rate Limiting

### Login Endpoint

Rate limiting prevents brute force attacks:
- **Limit**: 5 attempts per minute per IP address
- **Algorithm**: Token bucket
- **Storage**: In-memory (resets on server restart)

### Implementation

```typescript
// In api/auth/login/route.ts
const rateLimit = checkRateLimit(`login:${ip}`, 5, 1, 60000)
if (!rateLimit.allowed) {
  return NextResponse.json(
    { error: 'Too many login attempts. Please try again later.' },
    { status: 429 }
  )
}
```

### Future Enhancements

Consider implementing:
- Rate limiting on all API endpoints
- Distributed rate limiting with Redis for multi-server deployments
- Progressive delays for repeated failures
- IP blocking for persistent attackers

## Security Headers

All responses include security headers configured in `next.config.js`:

| Header | Value | Purpose |
|--------|-------|---------|
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | Force HTTPS |
| X-Frame-Options | SAMEORIGIN | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-XSS-Protection | 1; mode=block | Enable browser XSS filter |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer information |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | Disable unnecessary features |
| Content-Security-Policy | (see config) | Restrict resource loading |

## Deployment Security

### Pre-Deployment Checklist

**Environment Configuration**
- [ ] Set `NODE_ENV=production`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Configure secure database credentials
- [ ] Set up environment variables properly
- [ ] Never commit `.env` file

**SSL/TLS**
- [ ] Enable HTTPS (required for production)
- [ ] Configure SSL certificate
- [ ] Enable HSTS
- [ ] Redirect HTTP to HTTPS

**Database**
- [ ] Use strong database password
- [ ] Enable database encryption at rest
- [ ] Configure database backups
- [ ] Restrict database access to application server only
- [ ] Enable database audit logging

**Application Server**
- [ ] Keep dependencies updated
- [ ] Enable firewall
- [ ] Configure logging
- [ ] Set up monitoring and alerts
- [ ] Disable debug mode
- [ ] Remove development tools

**Email/SMS Configuration**
- [ ] Use API keys (not password authentication)
- [ ] Store API keys in environment variables
- [ ] Rotate API keys regularly
- [ ] Enable 2FA on service accounts
- [ ] Monitor API usage

### Recommended Hosting Platforms

- **Vercel** - Automatic HTTPS, DDoS protection, global CDN
- **Railway** - Easy PostgreSQL setup, environment management
- **AWS** - Full control, use Secrets Manager for keys
- **DigitalOcean** - App Platform with automatic SSL

### Environment Variables in Production

Use secure secrets management:
- AWS Secrets Manager
- HashiCorp Vault
- Platform-specific secrets (Vercel Env Vars, Railway Variables)

**Never**:
- Commit `.env` to version control
- Share credentials in plain text
- Use default/weak passwords

## Security Checklist

### Development
- [ ] Code review for security issues
- [ ] Input validation on all endpoints
- [ ] Authorization checks on protected routes
- [ ] Error handling doesn't leak sensitive info
- [ ] Dependencies are up to date
- [ ] No hardcoded secrets

### Testing
- [ ] Test authentication flows
- [ ] Test authorization (can users access others' data?)
- [ ] Test input validation with malicious inputs
- [ ] Test rate limiting
- [ ] Test session expiration
- [ ] Test HTTPS redirect

### Deployment
- [ ] HTTPS enabled
- [ ] Environment variables configured
- [ ] Database secured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Security headers verified

### Ongoing
- [ ] Monitor for suspicious activity
- [ ] Review logs regularly
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Review user access
- [ ] Test backup restoration

## Incident Response

### If You Suspect a Security Breach

1. **Immediate Actions**
   - Rotate all API keys and secrets
   - Invalidate all active sessions
   - Enable additional logging
   - Document everything

2. **Investigation**
   - Review access logs
   - Check for unauthorized data access
   - Identify attack vector
   - Assess scope of breach

3. **Remediation**
   - Patch vulnerability
   - Restore from clean backup if necessary
   - Strengthen affected security controls
   - Deploy fixes

4. **Communication**
   - Notify affected users if personal data was accessed
   - Document incident and response
   - Update security procedures
   - Train team on prevention

### Security Contacts

- **Report a vulnerability**: [security contact email]
- **Documentation**: This file (SECURITY.md)
- **Support**: [support contact]

## Security Best Practices

### For Instructors

1. **PIN Management**
   - Store student PINs securely (password manager)
   - Never share PINs via insecure channels
   - Reset PINs if compromised

2. **Account Security**
   - Use a strong instructor PIN
   - Change PIN regularly
   - Log out after use on shared computers

3. **Student Data**
   - Only collect necessary information
   - Verify email addresses before sending
   - Respect student privacy

### For Students

1. **PIN Security**
   - Don't share your PIN
   - Memorize it (don't write it down)
   - Report lost/compromised PIN immediately

2. **Session Security**
   - Log out after use
   - Don't use on public computers
   - Clear browser data on shared devices

### For Administrators

1. **System Updates**
   - Update Node.js and npm regularly
   - Run `npm audit` monthly
   - Update Prisma and dependencies
   - Monitor security advisories

2. **Monitoring**
   - Review access logs weekly
   - Monitor failed login attempts
   - Track API usage patterns
   - Set up alerts for anomalies

3. **Backups**
   - Daily database backups
   - Test restoration quarterly
   - Store backups securely and separately
   - Encrypt backup files

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate/advanced-migrate-scenarios)

## Security Updates

This document should be reviewed and updated:
- After any security-related changes
- Quarterly as part of security review
- After any security incidents
- When new features are added

---

Last Updated: 2025-12-10
Version: 1.0
