/**
 * Inserts demo bookings for Phase 3 admin UI testing.
 * Usage: node scripts/seed-test-bookings.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  for (const file of [".env", ".env.local"]) {
    try {
      const text = readFileSync(resolve(root, file), "utf8");
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {
      // file missing
    }
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

/** @type {Array<{ clientEmail: string; sessionTitle: string; status: string; cancel_reason?: string }>} */
const TEST_BOOKINGS = [
  {
    clientEmail: "test_client1@gmail.com",
    sessionTitle: "1-on-1 Tax Planning & Advisory (Private Session)",
    status: "pending",
  },
  {
    clientEmail: "test_client1@gmail.com",
    sessionTitle: "HK Profits Tax Return (PTR) Q&A Clinic",
    status: "confirmed",
  },
  {
    clientEmail: "test_client1@gmail.com",
    sessionTitle: "Audit Readiness & Document Review",
    status: "rejected",
    cancel_reason: "Incomplete documentation submitted with request.",
  },
  {
    clientEmail: "test_client2@gmail.com",
    sessionTitle: "MPF & Hong Kong Payroll Compliance Masterclass",
    status: "pending",
  },
  {
    clientEmail: "test_client2@gmail.com",
    sessionTitle: "Cross-Border Tax & GBA Structuring Workshop",
    status: "confirmed",
  },
  {
    clientEmail: "test_client2@gmail.com",
    sessionTitle: "Audit Readiness & Document Review",
    status: "cancelled",
    cancel_reason: "Client requested to reschedule.",
  },
];

async function main() {
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("role", "client");

  if (profilesError) throw profilesError;

  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("id, title")
    .eq("is_cancelled", false);

  if (sessionsError) throw sessionsError;

  const profileByEmail = new Map(profiles.map((p) => [p.email, p.id]));
  const sessionByTitle = new Map(sessions.map((s) => [s.title, s.id]));

  const { data: existing, error: existingError } = await supabase
    .from("bookings")
    .select("user_id, session_id, status");

  if (existingError) throw existingError;

  const existingKeys = new Set(
    (existing ?? []).map((b) => `${b.user_id}:${b.session_id}:${b.status}`),
  );

  let inserted = 0;
  let skipped = 0;

  for (const booking of TEST_BOOKINGS) {
    const userId = profileByEmail.get(booking.clientEmail);
    const sessionId = sessionByTitle.get(booking.sessionTitle);

    if (!userId) {
      console.error(`Client not found: ${booking.clientEmail}`);
      process.exit(1);
    }
    if (!sessionId) {
      console.error(`Session not found: ${booking.sessionTitle}`);
      process.exit(1);
    }

    const key = `${userId}:${sessionId}:${booking.status}`;
    if (existingKeys.has(key)) {
      console.log(`Skip (exists): ${booking.clientEmail} → ${booking.sessionTitle} (${booking.status})`);
      skipped++;
      continue;
    }

    const row = {
      user_id: userId,
      session_id: sessionId,
      status: booking.status,
      cancel_reason: booking.cancel_reason ?? null,
      cancelled_at:
        booking.status === "cancelled" || booking.status === "rejected"
          ? new Date().toISOString()
          : null,
    };

    const { error } = await supabase.from("bookings").insert(row);
    if (error) throw error;

    console.log(`Inserted: ${booking.clientEmail} → ${booking.sessionTitle} (${booking.status})`);
    inserted++;
    existingKeys.add(key);
  }

  console.log(`\nDone — ${inserted} inserted, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
