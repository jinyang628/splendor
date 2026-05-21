# Frontend

## Set up environment variables

```bash
# Create .env file (by copying from .env.example)
cp .env.example .env
```

## Quick Start

First, run the development server:

```bash
npm install
npm run dev
```

## Implementation notes

Supabase realtime subscriptions require us to enaboel it for specific tables: Database -> Publications -> supabase_realtime -> (Enable it for desired tables)
