import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://aaac1bbb4b63ab706e11aef249fa0c25@o4511976945549312.ingest.us.sentry.io/4511977083437056", // Replace with your actual DSN from Sentry project settings
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

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
