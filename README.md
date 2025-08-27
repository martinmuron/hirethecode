# Hire the Code

A premium subscription-based marketplace connecting vetted developers with top companies. Built with Next.js 14, TypeScript, and modern web technologies.

## 🚀 Features

### For Developers ($99/month)
- **Smart Profile System**: Showcase skills, rates, and portfolio
- **Project Discovery**: Browse and apply to curated projects  
- **Direct Communication**: Message companies directly
- **Smart Matching**: AI-powered project recommendations
- **Application Tracking**: Monitor application status in real-time
- **Email Notifications**: Stay updated on opportunities

### For Companies ($499/month)
- **Developer Search**: Find developers by skills, rate, and availability
- **Smart Matching**: AI-powered developer recommendations
- **Project Management**: Post and manage project listings
- **Application Dashboard**: Review and manage applications
- **Direct Messaging**: Communicate with developers
- **Analytics**: Track hiring success metrics

### Platform Features
- **Subscription Management**: Stripe-powered billing with self-service portal
- **Notification System**: In-app and email notifications
- **Professional UI**: Beautiful, responsive design with shadcn/ui
- **Type Safety**: Full TypeScript implementation
- **Real-time Updates**: Live application status changes

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui + Tailwind CSS
- **Payments**: Stripe
- **Email**: Resend with React Email
- **Hosting**: Vercel-ready

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Stripe account
- Resend account
- GitHub/Google OAuth apps (optional)

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Install dependencies
npm install

# Seed developer profiles (optional)
npx tsx --env-file=.env.local scripts/seed-developer-profiles.ts

# Start development server
npm run dev
```

## 🎨 Key Components

### Smart Matching Algorithm
- **Skill Match (40%)**: Percentage of required skills the developer has
- **Availability (25%)**: Developer availability status  
- **Rate Compatibility (20%)**: How well developer rate fits budget
- **Experience (15%)**: Skill proficiency levels

### Notification System
- In-app notifications with read/unread status
- Email notifications for critical events
- Application status updates
- New message alerts

### Subscription Management
- Stripe integration with webhooks
- Self-service billing portal
- Plan upgrades/downgrades
- Automatic email confirmations

## 🔧 Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Pages

- `/` - Landing page with pricing and features
- `/dashboard` - Role-based dashboard routing
- `/developers` - Developer search (companies only)
- `/projects` - Project listings and management
- `/company/dashboard` - Company analytics dashboard
- `/company/projects` - Project management interface
- `/billing` - Subscription management
- `/profile` - Role-based profile management

### API Routes

- `/api/auth/*` - NextAuth endpoints
- `/api/profile/*` - Profile management
- `/api/projects/*` - Project CRUD operations
- `/api/developers/*` - Developer search and contact
- `/api/applications/*` - Application management
- `/api/stripe/*` - Stripe integration
- `/api/email/*` - Email testing (dev only)

## 📊 Business Model

- **Developer Subscription**: $99/month or $990/year (17% savings)
- **Company Subscription**: $499/month or $4990/year (17% savings)
- **Value Proposition**: Quality over quantity with vetted developers
- **Revenue Streams**: Monthly/annual subscriptions

## 🔒 Security

- Environment variables for sensitive data
- Server-side authentication checks
- Input validation on all forms
- SQL injection protection with Drizzle ORM
- CSRF protection with NextAuth

## 🚀 Deployment

### Vercel Deployment

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Stripe Webhooks

Configure webhooks in Stripe Dashboard:
- Endpoint: `https://yourdomain.com/api/stripe/webhook`
- Events: `customer.subscription.*`, `invoice.payment_*`

## 📧 Support

Built with comprehensive error handling, logging, and user-friendly interfaces.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.