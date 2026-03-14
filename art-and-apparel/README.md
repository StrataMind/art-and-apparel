# Art & Apparel

A beautiful online gallery and e-commerce platform showcasing original digital art, paintings, and custom designs.

**🌐 Live Site:** [https://art-and-apparel.vercel.app](https://art-and-apparel.vercel.app)

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Security](#security)
- [Copyright](#copyright)
- [Contact](#contact)

---

## 🎨 About

Welcome to **Art & Apparel**! This is a modern, responsive online gallery platform featuring:

- **Original Artwork** - Digital paintings and designs available for purchase
- **E-Commerce** - Secure shopping experience with real images and pricing
- **Support System** - Donation options for artist supporters
- **User Authentication** - Secure Google OAuth sign-in
- **Responsive Design** - Beautiful on mobile, tablet, and desktop devices

Every piece showcased here is crafted with passion and attention to detail.

---

## ✨ Features

- ✅ Original artwork gallery with detailed descriptions
- ✅ E-commerce merchandise store with real product images
- ✅ Secure Google OAuth authentication (NextAuth.js)
- ✅ Donation/support system integrated with Stripe
- ✅ Buy Me a Coffee integration
- ✅ Fully responsive design (mobile-first)
- ✅ Commission request system
- ✅ Privacy and Terms pages
- ✅ Production-ready security headers
- ✅ SEO optimized

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + PostCSS |
| **Authentication** | NextAuth.js (Google OAuth) |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma |
| **Hosting** | Vercel |
| **Payments** | Stripe |
| **Linting** | ESLint |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/StrataMind/art-and-apparel.git
cd art-and-apparel

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure your environment
# See Configuration section below

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Visit **http://localhost:3000** to see the application.

---

## 📁 Project Structure

```
art-and-apparel/
├── src/
│   ├── app/
│   │   ├── api/              # API routes (auth, etc.)
│   │   ├── art/              # Art gallery page
│   │   ├── merchandise/      # Shop/sell page
│   │   ├── auth/             # Sign-in page
│   │   ├── privacy/          # Privacy policy
│   │   ├── terms/            # Terms of service
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── header.tsx        # Navigation header
│   │   └── providers.tsx     # App providers
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── db.ts             # Database utilities
│   │   ├── prisma.ts         # Prisma client
│   │   └── utils.ts          # Utility functions
│   ├── types/
│   │   └── next-auth.d.ts    # Type definitions
│   └── middleware.ts         # Next.js middleware
├── prisma/
│   └── schema.prisma         # Database schema
├── public/
│   ├── art1.jpg              # Digital art piece 1
│   ├── art2.jpg              # Digital art piece 2
│   ├── favicon.ico           # Site favicon
│   └── icon.svg              # Site icon
├── .env.example              # Environment template
├── .env.local                # Local environment (not committed)
├── next.config.ts            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe (optional)
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Email (for notifications)
SMTP_FROM=noreply@art-and-apparel.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Generate NextAuth Secret

```bash
# Generate a secure secret
openssl rand -base64 32
```

---

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server on :3000

# Production
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio

# Linting
npm run lint            # Run ESLint

# Type checking
npx tsc --noEmit       # Check TypeScript types
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
# Push your code to GitHub
git push origin main

# Connect your repository to Vercel
# https://vercel.com/new

# Add environment variables in Vercel Dashboard:
# Settings → Environment Variables

# Deploy automatically on git push
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

You are free to:
- ✅ Use this project for personal or commercial purposes
- ✅ Modify and distribute the code
- ✅ Sublicense the software

You must:
- ⚠️ Include a copy of the license and copyright notice
- ⚠️ Provide a link to the license

---

## 🔒 Security

This project follows security best practices:

- ✅ Environment variables for all secrets
- ✅ HTTPS-only in production
- ✅ Security headers configured
- ✅ Input validation on all forms
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ CSRF tokens in forms

**Report Security Issues:** Please see [SECURITY.md](./SECURITY.md) for vulnerability reporting guidelines.

---

## © Copyright

**© 2026 Art & Apparel. All Rights Reserved.**

### Artwork Copyright
All original artwork, images, paintings, and designs displayed on this website are the intellectual property of the artist(s) and are protected by copyright law. Unauthorized reproduction, distribution, or commercial use of any artwork without explicit written permission is prohibited.

### Website Copyright
The website design, code, and content (excluding artwork) are the property of Art & Apparel and protected under copyright law.

### Usage Terms
- ✅ Personal, non-commercial viewing and appreciation
- ✅ Purchasing licenses as explicitly offered on the site
- ❌ Unauthorized reproduction or distribution
- ❌ Commercial use without permission
- ❌ Modification or derivative works without consent

For licensing inquiries, contact: **business@art-and-apparel.com**

See [LICENSE](./LICENSE) and [TERMS.md](./TERMS.md) for complete terms.

---

## 📬 Contact & Support

**Artist Contact:**
- 📧 Email: qnovalabs@gmail.com
- 📱 Instagram: [@suraj_singh_nitk](https://instagram.com/suraj_singh_nitk)
- 🔗 Website: [https://art-and-apparel.vercel.app](https://art-and-apparel.vercel.app)

**Business Inquiries:**
- 📧 Email: business@art-and-apparel.com

**For Commissions:**
- Fill out the "Request Commission" form on the website
- Email: commissions@art-and-apparel.com

---

## ❤️ Support the Artist

Love the art? Support the artist through:
- 🎨 Purchasing original artwork
- ☕ [Buy Me a Coffee](https://buymeacoffee.com/silent_birds)
- 💝 Direct donations via Stripe

---

## 📝 Additional Resources

- [SECURITY.md](./SECURITY.md) - Security guidelines and vulnerability reporting
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [TERMS.md](./TERMS.md) - Terms of Service
- [.env.example](./.env.example) - Environment variables template

---

## 🙏 Acknowledgments

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)

---

**Last Updated:** March 2026  
**Status:** Production Ready ✅
