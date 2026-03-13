# Security Policy

## Environment Variables

Never commit these files:
- `.env`
- `.env.local`
- `.env.production`

Always use Vercel's environment variables dashboard for production secrets.

## Required Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

```
DATABASE_URL=your-database-url
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Security Headers

The following security headers are configured:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## Best Practices

1. Never expose API keys in client-side code
2. Use environment variables for all secrets
3. Keep dependencies updated
4. Use HTTPS only in production
5. Validate all user inputs
6. Use prepared statements for database queries (Prisma handles this)

## Reporting Security Issues

If you discover a security vulnerability, please email: security@yourdomain.com
