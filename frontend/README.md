# 💻 Monexa Frontend

The modern web application for **Monexa**, built with **React 19**, **TanStack Router**, **Tailwind CSS v4**, and **Vite 8**. Deployed on **AWS Amplify Hosting**.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [TanStack Router](https://tanstack.com/router) (Client-Side SPA with type-safe file-based routing)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + custom OKLCH color token design system
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives + [Lucide React](https://lucide.dev/) icons
- **Charts & Visualizations**: [Recharts](https://recharts.org/) + SVG financial graphs
- **Build Tool**: [Vite 8](https://vitejs.dev/) with Rolldown bundler
- **Hosting**: [AWS Amplify](https://aws.amazon.com/amplify/) (S3 + CloudFront static SPA distribution)

---

## 📁 Directory Structure

```
frontend/
├── public/                 # Static public assets (favicon, robots.txt)
├── scripts/
│   └── build-amplify-static.js  # Post-build packaging script for AWS Amplify
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Radix primitives (Button, Input, Dialog, etc.)
│   │   ├── dashboard/      # Financial widgets, charts, and metrics cards
│   │   ├── app-shell.tsx   # Authenticated layout shell & navigation
│   │   ├── auth-fields.tsx # Unified Login, Signup, and OTP verification forms
│   │   └── auth-shell.tsx  # Landing & authentication visual canvas
│   ├── hooks/              # Custom React hooks (useProfile, useEMIs, etc.)
│   ├── lib/
│   │   ├── api-client.ts   # Centralized typed REST client communicating with backend
│   │   └── utils.ts        # Helper functions & class merging (cn)
│   ├── routes/             # TanStack file-based routes
│   │   ├── index.tsx       # Public landing page
│   │   ├── login.tsx       # Sign in page
│   │   ├── create-account.tsx # Account registration & financial parameter calibration
│   │   ├── forgot-password.tsx
│   │   └── _authenticated/ # Protected routes (Dashboard, Accounts, Goals, etc.)
│   ├── index.html          # HTML entry point
│   ├── main.tsx            # React root mount (ReactDOM.createRoot)
│   ├── router.tsx          # TanStack Router initialization
│   └── styles.css          # Global Tailwind CSS and theme design system
├── package.json
└── vite.config.ts
```

---

## 🏃 Getting Started (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
By default, the client automatically points to `http://localhost:8000/api/v1` during local development (`localhost` or `127.0.0.1`).
To point to a custom backend URL, create a `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build & AWS Amplify

The production build generates a pure static SPA bundle in `dist/` ready for AWS Amplify or any CDN:

```bash
npm run build
```

This runs:
1. `vite build` — bundles client assets and code-splits routes.
2. `node scripts/build-amplify-static.js` — copies assets into `dist/`, dynamically links hashed CSS/JS entries, and ensures static CloudFront compatibility.

### Amplify Reverse Proxy Setup
For production deployments on AWS Amplify, add an HTTPS reverse proxy rule in **Amplify Console > Rewrites and redirects**:
- **Source address**: `/api/<*>`
- **Target address**: `https://<YOUR-BACKEND-URL>/api/<*>`
- **Type**: `200 (Rewrite)`

---

## 🧪 Linting & Formatting
```bash
npm run lint
npm run format
```
