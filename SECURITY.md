# Security Policy

This document outlines the security practices and guidelines for the Art & Apparel project.

## Table of Contents
- [Environment Variables](#environment-variables)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Security Headers](#security-headers)
- [Best Practices](#best-practices)
- [Vulnerability Reporting](#vulnerability-reporting)
- [Security Checklist](#security-checklist)

---

## 🔐 Environment Variables

### Never Commit These Files
```
.env
.env.local
.env.production
.env.*.local
.DS_Store
node_modules/
.next/
```

These are already listed in `.gitignore`.

### Required Environment Variables

Set these in **Vercel Dashboard** (Settings → Environment Variables):

**Database:**
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**NextAuth:**
```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key-here
```
Generate a secure secret:
```bash
openssl rand -base64 32
```

**Google OAuth:**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Stripe (Payment Processing):**
```
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

**Email Notifications:**
```
SMTP_FROM=noreply@art-and-apparel.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🔑 Authentication & Authorization

### NextAuth.js Configuration
- Uses Google OAuth for secure authentication
- Never stores passwords in database
- Sessions are encrypted and httpOnly
- CSRF protection enabled by default

### Security Practices
```typescript
// ✅ CORRECT - Use session validation
if (!session) {
  redirect('/api/auth/signin');
}

// ❌ INCORRECT - Client-side only validation
if (!user) {
  // This can be bypassed!
}
```

### Protected Routes
All sensitive routes should validate the session on the server:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Handle authenticated request
}
```

---

## 🛡️ Data Protection

### Database Security
- Use **prepared statements** (Prisma handles this automatically)
- Never concatenate SQL queries
- Use parameterized queries

```typescript
// ✅ CORRECT - Prisma handles parameterization
const user = await prisma.user.findUnique({
  where: { email: userInput }
});

// ❌ INCORRECT - SQL Injection vulnerability!
// const user = await db.query(`SELECT * FROM users WHERE email = '${userInput}'`);
```

### Input Validation
- Validate all user inputs
- Sanitize before storing in database
- Use Zod for schema validation

```typescript
import { z } from 'zod';

const emailSchema = z.string().email();
const validated = emailSchema.parse(userInput);
```

### Password Security
- Never store plain text passwords
- Use bcrypt for hashing (if applicable)
- Never log passwords or sensitive data

```typescript
import bcrypt from 'bcrypt';

const hashed = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashed);
```

---

## 🔒 Security Headers

The following security headers are configured via `next.config.ts`:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### What Each Header Does
- **X-Content-Type-Options: nosniff** - Prevents MIME-type sniffing
- **X-Frame-Options: DENY** - Prevents clickjacking attacks
- **X-XSS-Protection** - Enables XSS protection filter
- **Referrer-Policy** - Controls referrer information
- **Permissions-Policy** - Disables unnecessary browser features
- **HSTS** - Forces HTTPS connections

---

## ✅ Best Practices

### 1. Dependency Management
```bash
# Keep dependencies updated
npm audit
npm audit fix
npm update

# Lock file must be committed
# package-lock.json should be in version control
```

### 2. Environment Setup
```bash
# Local development
cp .env.example .env.local
# Fill in LOCAL credentials (not production secrets!)

# Production (via Vercel Dashboard)
# Never use development credentials in production
```

### 3. API Routes
- Always validate request method
- Check user authorization
- Return appropriate HTTP status codes
- Never expose internal errors to client

```typescript
export async function POST(req: Request) {
  // Validate method
  if (req.method !== 'POST') {
    return new Response("Method not allowed", { status: 405 });
  }

  // Validate session
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Validate input
  try {
    const body = await req.json();
    const validated = inputSchema.parse(body);
    // Process request
  } catch (error) {
    return new Response("Invalid input", { status: 400 });
  }
}
```

### 4. HTTPS Only
- All production traffic must use HTTPS
- Set `NEXTAUTH_URL` to https://...
- Stripe webhook endpoints must be HTTPS

### 5. Third-party Libraries
- Only use well-maintained packages
- Review security advisories: `npm audit`
- Keep dependencies up to date

### 6. Logging & Monitoring
- Never log sensitive data (passwords, tokens, credit cards)
- Use Vercel Analytics for monitoring
- Set up alerts for errors

---

## 🚨 Vulnerability Reporting

### Responsible Disclosure

If you discover a security vulnerability, please **DO NOT** create a public GitHub issue.

Instead, email: **security@art-and-apparel.com**

**Include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

**Our commitment:**
- Acknowledge receipt within 24 hours
- Provide updates every 48 hours
- Credit you in the fix (if desired)
- Keep your identity confidential

---

## 📋 Security Checklist

- [ ] All secrets in environment variables (never hardcoded)
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enabled in production
- [ ] `NEXTAUTH_SECRET` is cryptographically secure
- [ ] Database credentials rotated regularly
- [ ] API routes validate user sessions
- [ ] Input validation on all forms
- [ ] Security headers configured
- [ ] Dependencies up to date (`npm audit`)
- [ ] CORS properly configured
- [ ] No sensitive data in logs
- [ ] Stripe credentials are for production
- [ ] Email configuration uses app passwords (not main account)
- [ ] Rate limiting considered for API routes
- [ ] Error messages don't expose internals

---

## 🔄 Security Updates

When security updates are released:

1. Review the CVE details
2. Test update in development
3. Deploy to staging
4. Monitor for issues
5. Deploy to production
6. Document the update

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/going-to-production#security)
- [NextAuth.js Security](https://next-auth.js.org/getting-started/example#security-considerations)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management)

---

## 📞 Contact

For security issues, contact: **security@art-and-apparel.com**

---

**Last Updated:** March 2026  
**Security Level:** Production Ready ✅
