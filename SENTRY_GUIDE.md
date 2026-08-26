# Sentry Setup Guide

This guide provides a quick reference for setting up and configuring Sentry for Meridian-CPA.

## 1. Create Account & Project
1. Go to [Sentry.io](https://sentry.io/) and create an account or log in.
2. Create a new **Project**.
3. Choose **React** as the platform.
4. Name the project (e.g., `meridian-cpa`) and assign it to your team.

## 2. Install Sentry SDK
Run the following command in your terminal to install the Sentry SDKs:
```bash
npm install @sentry/react @sentry/browser
```
*(Alternatively, use the Sentry wizard: `npx @sentry/wizard@latest -i react`)*

## 3. Initialize Sentry
In your application entry point (e.g., `src/main.tsx` or `src/index.tsx`), add the initialization code:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN_HERE", // Replace with your actual DSN from Sentry project settings
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions (adjust in production)
  // Session Replay
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
});
```

## 4. Verify Integration
To test that Sentry is working, you can deliberately throw an error in one of your components:
```typescript
<button onClick={() => { throw new Error("This is a test error for Sentry!"); }}>
  Test Sentry
</button>
```
Click the button and check your Sentry dashboard for the reported error. Remember to remove this button before deploying to production!

## Useful Links
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
