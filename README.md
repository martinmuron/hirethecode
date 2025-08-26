# Hire the Code

**Premium Talent for Every Project**

A subscription-only marketplace where companies find vetted developers fast, and developers receive targeted project leads.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router, RSC, Server Actions), TypeScript, Tailwind CSS, shadcn/ui
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with GitHub/Google OAuth + credentials
- **Payments**: Stripe (Subscriptions: $99/mo developers, $499/mo companies)
- **Email**: Resend (transactional + smart-match broadcasts)
- **Deployment**: Vercel

## 📋 Features

### For Developers ($99/month)
- Rich profile with skills, portfolio, and availability
- Access to exclusive project board
- Receive targeted project matches via email
- Direct messaging with companies

### For Companies ($499/month)
- Post unlimited projects
- Search and filter vetted developers
- Smart matching system for project requirements
- Company showcase pages

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Neon PostgreSQL database
- Stripe account (for payments)
- Resend account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hirethecode
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

3. **Database Setup**
   ```bash
   # Generate migrations
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Optional: Launch Drizzle Studio
   npm run db:studio
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📚 Project Structure

```
hirethecode/
├── src/
│   ├── app/                    # Next.js 14 app router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Role-based dashboards
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   │   ├── auth/             # Auth forms
│   │   ├── dashboard/        # Dashboard components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utilities and configurations
│   │   ├── db/               # Database schema and config
│   │   └── auth/             # Authentication config
│   └── types/                # TypeScript type definitions
├── drizzle.config.ts         # Drizzle ORM configuration
└── components.json          # shadcn/ui configuration
```

## 🎯 Core Concepts

### User Roles
- **Developers**: Create profiles, browse projects, receive matches
- **Companies**: Post projects, search developers, smart matching

### Subscription Gating
- All core features require active subscriptions
- Automatic billing via Stripe
- Role-based access control

### Smart Matching
- AI-powered project-to-developer matching
- Skills-based filtering and recommendations
- Email notifications for relevant opportunities

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main

### Environment Variables for Production
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth.js
- `NEXTAUTH_URL` - Your production URL
- `STRIPE_SECRET_KEY` - Stripe secret key
- `RESEND_API_KEY` - Resend API key
- OAuth provider credentials (optional)

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Please contact the maintainer for contribution guidelines.