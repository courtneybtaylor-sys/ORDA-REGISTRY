# ORDA Registry - SAID-AIoT v1.0

A comprehensive AI agent identity management and governance system built with Next.js, React, TypeScript, and Supabase. Implements the SAID-AIoT v1.0 database schema for decentralized identity (DID), capability governance, immutable action records (testaments), and provider data management.

## 🎯 Features

- **Identity Management**: Decentralized identifier (DID) registry for operators, agents, and devices
- **Capability Passports**: Fine-grained authorization with scope, exclusions, and human-in-the-loop requirements
- **Testament Records**: Immutable, cryptographically-signed action records with secure element signatures
- **Ma'at Engine**: Confidence scoring and governance audit logs with source reliability tracking
- **Provider Data**: Travel and service provider information with reliability metrics
- **RESTful API**: Complete API for integration and third-party access
- **Row Level Security**: Fine-grained access control with PostgreSQL RLS policies

## 🏗️ Architecture

The system implements a 5-layer architecture:

```
Layer 5: PROVIDER DATA (Travel, Services, Africa AI App)
Layer 4: MA'AT ENGINE (Governance, Audit, Confidence Scoring)
Layer 3: TESTAMENT (Immutable Action Records)
Layer 2: CAPABILITY & AUTHORITY (Passports, Scope, Exclusions)
Layer 1: IDENTITY LAYER (Operators, Agents, Devices - DID Registry)
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript 5.6
- **Database**: Supabase (PostgreSQL 15+)
- **Hosting**: Vercel (with automatic deployments)
- **CI/CD**: GitHub Actions
- **Integration**: ORDA Registry API
- **Node.js**: 18+ recommended

## 📁 Project Structure

```
orda-registry/
├── migrations/
│   └── 001_said_aiot_schema_v1.0.sql    (SAID-AIoT database schema)
├── scripts/
│   ├── apply-said-aiot-schema.ts        (Schema migration script)
│   └── apply-schema.ts                  (Legacy schema script)
├── pages/
│   ├── index.tsx                        (Homepage)
│   ├── dashboard.tsx                    (Metrics dashboard)
│   └── api/
│       ├── testament/                   (Testament endpoints)
│       ├── identities.ts                (Identity endpoints)
│       └── compliance.ts                (Compliance endpoints)
├── lib/
│   ├── types/                           (TypeScript interfaces)
│   └── db/                              (Database clients)
├── public/
├── .github/workflows/
│   ├── test.yml                         (CI/CD testing)
│   └── deploy.yml                       (Vercel deployment)
├── SAID_AIOT_SETUP.md                   (SAID-AIoT v1.0 schema guide)
├── CONNECTIONS_SETUP.md                 (Supabase/GitHub/Vercel/ORDA setup)
├── ENVIRONMENT_SETUP.md                 (Environment configuration)
├── .env.example                         (Environment template)
└── README.md                            (This file)
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (https://supabase.com)
- GitHub account for secrets management

### 2. Clone and Install

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed instructions.

### 4. Apply Database Schema

```bash
# Option A: Automated (recommended)
npx ts-node scripts/apply-said-aiot-schema.ts

# Option B: Manual (use Supabase SQL Editor)
# 1. Copy contents of migrations/001_said_aiot_schema_v1.0.sql
# 2. Go to https://supabase.com/dashboard
# 3. SQL Editor → New Query → Paste → Run
```

See [SAID_AIOT_SETUP.md](./SAID_AIOT_SETUP.md) for detailed schema documentation.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

### Setup & Configuration
- **[SAID_AIOT_SETUP.md](./SAID_AIOT_SETUP.md)** - Complete SAID-AIoT v1.0 database schema documentation
- **[CONNECTIONS_SETUP.md](./CONNECTIONS_SETUP.md)** - Supabase, GitHub, Vercel, and ORDA integration guide
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Environment variables and configuration

### API Documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - RESTful API endpoints
- **[CURL-EXAMPLES.md](./CURL-EXAMPLES.md)** - curl examples for API testing

### Development
- **[SCHEMA_SETUP.md](./SCHEMA_SETUP.md)** - Database schema setup (legacy)
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Detailed database schema reference

### Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[MIGRATION_INSTRUCTIONS.md](./MIGRATION_INSTRUCTIONS.md)** - Database migration instructions

## 🔧 Development Workflows

### Build

```bash
npm run build
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint --if-present
```

### Testing

```bash
# Run all tests
npm test

# Run integration tests only
npm run test:integration

# Run specific test
npm run test:orda
```

## 🌐 API Endpoints

The application provides a RESTful API for managing identities, testaments, and compliance:

- `POST /api/testament/log` - Create/record a new testament
- `GET /api/testament/[id]` - Retrieve testament details
- `GET /api/identities` - List all identities
- `GET /api/compliance` - Retrieve compliance metrics
- `GET /api/metrics` - Registry metrics and statistics

## 📦 Deployment

### Deploy to Vercel (Automatic)

```bash
# Push to main branch - automatic deployment via GitHub Actions
git push origin main
```

The application is fully integrated with Vercel for automatic deployments:

1. **Push to GitHub** - Code changes trigger GitHub Actions
2. **Run Tests** - CI/CD pipeline validates code
3. **Deploy to Vercel** - Successful builds auto-deploy to production

### Deploy Manually

```bash
# Build locally
npm run build

# Start production server
npm start

# Or deploy with Vercel CLI
vercel --prod
```

## 🔐 Security

- Row-level security (RLS) policies enforce data access control
- Service role key kept secret (never exposed to browser)
- API keys rotated regularly
- All communication over HTTPS
- Audit logs track all data access

See [CONNECTIONS_SETUP.md](./CONNECTIONS_SETUP.md#7-security-checklist) for security checklist.

## 📊 Monitoring

- **Supabase Dashboard**: Database metrics and logs
- **Vercel Analytics**: Application performance and errors
- **GitHub Actions**: CI/CD pipeline status
- **Audit Logs**: Testament records and queries

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: your feature"`
3. Push to GitHub: `git push -u origin feature/your-feature`
4. Create a Pull Request
5. Wait for tests to pass and reviews
6. Merge to main for automatic deployment

## 📄 License

MIT

## 🆘 Support

For issues, questions, or feedback:

1. Check the documentation in this repository
2. Open an issue on GitHub: https://github.com/courtneybtaylor-sys/ORDA-REGISTRY/issues
3. Contact the ORDA team

---

**Version**: 1.0
**Last Updated**: March 27, 2026
**Status**: Production Ready
