# Money Lens Architecture

> "Money Lens follows a separation-of-concerns architecture where the Next.js frontend handles presentation and user interaction, the Python backend owns financial business logic and data access, and Amazon Bedrock provides natural-language intelligence and explanations."

## Frontend Architecture
- **Framework**: Next.js (App Router) + React + TypeScript + Tailwind CSS
- **Design Language**: Dark Luxury Fintech (Near-black / Slate-950, Electric Cyan accent, Emerald/Amber indicators)
- **Currency System**: Indian Rupee (`₹`) with Lakhs/Crores compact options
- **State & Data**: Centralized API client (`src/lib/api/`) with mock toggle (`NEXT_PUBLIC_USE_MOCK_DATA`)

## Directory Layout
```
frontend/src/
├── app/                  # App router pages (dashboard, simulator, goals, etc.)
├── components/
│   ├── ui/               # Generic primitive widgets (Button, Card, Badge, Progress)
│   ├── layout/           # AppShell, Sidebar, Header, MobileNav
│   ├── dashboard/        # Summary, Trajectory container, QuickActions, Previews
│   └── charts/           # Interactive SVG Financial Trajectory chart
├── hooks/                # useDashboard, useSimulation, etc.
├── lib/
│   ├── api/              # client.ts, dashboard.ts
│   ├── mock/             # Mock financial telemetry
│   ├── formatters/       # currency.ts, date.ts
│   └── utils/            # cn helper
├── types/                # Strict TypeScript contracts
└── config/               # env.ts
```
