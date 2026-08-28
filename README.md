# Meridian CPA - Web Application

This is the developer documentation for the **Meridian CPA** web application. Originally generated as a React prototype by Anima, the project has been structured as a production-ready client booking and corporate web application.

---

## 🚀 Tech Stack

The application is built using a modern, lightweight frontend stack:

- **Framework**: [React 18](https://react.dev/)
- **Build Tool / Dev Server**: [Vite 7](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **UI Components**: Custom components inspired by [Shadcn UI](https://ui.shadcn.com/) (using Radix primitives such as `@radix-ui/react-slot` and `@radix-ui/react-navigation-menu`, `clsx`, `tailwind-merge`, and `class-variance-authority`)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Error Tracking**: [Sentry Browser SDK](https://sentry.io/)

---

## 📁 Project Structure

```bash
├── .gemini/                     # IDE configuration directory
├── dist/                        # Compiled production build output
├── public/                      # Static assets (images, fonts, favicons)
├── scripts/                     # Helper script utilities (OG images, icon generators)
│   ├── generate-icons.mjs
│   └── generate-og.mjs
├── src/
│   ├── components/              # Shared React components
│   │   └── ui/                  # Shadcn-style primitive elements (Button, Card, Navigation)
│   ├── hooks/                   # Custom utility React hooks
│   ├── lib/                     # Libraries & helpers (translations, config utils)
│   ├── screens/                 # Main page screens
│   │   ├── AboutUs/             # About Us page screen
│   │   └── Desktop/             # Main desktop landing page
│   ├── App.tsx                  # Main router and language configuration
│   └── index.tsx                # Application mount point & Sentry initialization
├── GITHUB_ISSUES_GUIDE.md      # Workflow guide for github issues
├── SENTRY_GUIDE.md              # Sentry configuration and tracking setup instructions
├── postcss.config.js            # PostCSS configuration for Tailwind
├── tailwind.config.js           # Tailwind utility customization and color scheme
├── tsconfig.json                # TypeScript compiler config
└── vite.config.ts               # Vite configuration
```

---

## 🛣️ Active Routes

The application features the following routing architecture:
- `/` - Main landing page ([Desktop.tsx](file:///c:/Users/gavin/OneDrive/Desktop/Coding/figma-bolt-Meridian-CPA/src/screens/Desktop/Desktop.tsx))
- `/about` - Corporate overview ([AboutUs.tsx](file:///c:/Users/gavin/OneDrive/Desktop/Coding/figma-bolt-Meridian-CPA/src/screens/AboutUs/AboutUs.tsx))

### Planned Implementation
A complete backend system with Supabase integration is currently designed for:
- User Authentication (Login / Signup)
- Protected Client Dashboards (`/dashboard/*`)
- Protected Admin Management Console (`/admin/*`)

For full schema details, triggers, RLS policies, and view maps, consult the [Booking Implementation Plan](file:///c:/Users/gavin/OneDrive/Desktop/Coding/figma-bolt-Meridian-CPA/Implementation/IMPLEMENTATION_PLAN_BOOKING.md).

---

## 🛠️ Development & Commands

### Prerequisites
Make sure you have [NodeJS](https://nodejs.org/) installed.

### Setup
Install all project dependencies:
```bash
npm install
```

### Dev Mode
Start the Vite development server locally with hot module reloading (HMR):
```bash
npm run dev
```
The server will run on [http://localhost:5173/](http://localhost:5173/).

### Production Build
Compile and bundle the project for production deployment:
```bash
npm run build
```
The optimized bundle files will be generated inside the `dist/` directory.

---

## ⚙️ Integrations

### Sentry
Sentry error tracking is initialized in the app entry point.
- **Reference Guide**: [Sentry Setup Guide](file:///c:/Users/gavin/OneDrive/Desktop/Coding/figma-bolt-Meridian-CPA/SENTRY_GUIDE.md)
- **Status**: Live error capturing is enabled for production stability checks.

### Workflow & Contribution
Refer to the [GitHub Issues Guide](file:///c:/Users/gavin/OneDrive/Desktop/Coding/figma-bolt-Meridian-CPA/GITHUB_ISSUES_GUIDE.md) for naming guidelines, issue template rules, and tracking flows.

