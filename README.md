# ORDA Registry

A modern digital testament and identity ledger system built with Next.js 16, React 19, TypeScript, and Supabase.

## Features

- **Testament Management**: Create, view, and manage digital testaments
- **Identity Ledger**: Maintain a comprehensive ledger of identities
- **Registry Metrics**: Real-time statistics and analytics dashboard
- **Compliance Tracking**: Monitor compliance status across the registry
- **RESTful API**: Complete API for integration and third-party access

## Tech Stack

- **Framework**: Next.js 16
- **Runtime**: React 19
- **Language**: TypeScript 5.6
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Node.js**: 18+

## Project Structure

```
orda-registry/
├── pages/
│   ├── index.tsx              (Homepage with search + metrics)
│   ├── dashboard.tsx          (Metrics dashboard)
│   ├── identities.tsx         (Identity ledger)
│   ├── docs.tsx               (API documentation)
│   ├── testament/
│   │   └── [id].tsx           (Testament viewer)
│   └── api/
│       ├── metrics.ts         (GET metrics endpoint)
│       ├── identities.ts      (GET identities endpoint)
│       ├── compliance.ts      (GET compliance endpoint)
│       └── testament/
│           ├── [id].ts        (GET testament endpoint)
│           └── log.ts         (POST testament endpoint)
├── lib/
│   ├── types/
│   │   └── index.ts           (TypeScript interfaces)
│   └── db/
│       └── supabase.ts        (Supabase client setup)
├── public/
│   └── favicon.ico
├── package.json
├── tsconfig.json
├── next.config.js
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

## Environment Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup (Supabase)

Create the following tables in your Supabase database:

#### Identities Table
```sql
CREATE TABLE identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Testaments Table
```sql
CREATE TABLE testaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identity_id UUID NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_testaments_identity_id ON testaments(identity_id);
```

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Type Checking

```bash
npm run type-check
```

## API Documentation

See `/docs` page in the application or check the [API Documentation](./pages/docs.tsx) for detailed endpoint information.

### Available Endpoints

- `GET /api/metrics` - Retrieve registry metrics
- `GET /api/identities` - List all identities
- `GET /api/testament/[id]` - Get a specific testament
- `POST /api/testament/log` - Create a new testament
- `GET /api/compliance` - Retrieve compliance records

## Deployment

### Deploy to Vercel

```bash
vercel
```

The application is pre-configured for Vercel deployment. Environment variables will be managed through Vercel's dashboard.

## License

MIT

## Support

For issues or questions, please open an issue in the repository.