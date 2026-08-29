/**
 * Inserts 5 demo sessions for the public booking section.
 * Usage: node scripts/seed-website-sessions.mjs
 * Requires VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
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

const WEBSITE_SESSIONS = [
  {
    title: "1-on-1 Tax Planning & Advisory (Private Session)",
    sessionTypeName: "Initial Tax Consultation",
    description:
      "Private consultation to review your personal or corporate tax position, identify deductions, and plan ahead with our CPA team.",
    location: "Central Office / Zoom",
    startTime: "2026-09-08T10:00:00+08:00",
    durationMinutes: 60,
    maxSlots: 1,
  },
  {
    title: "HK Profits Tax Return (PTR) Q&A Clinic",
    sessionTypeName: "Audit Readiness Review",
    description:
      "Group workshop covering common PTR filing questions, deadlines, and documentation for Hong Kong SMEs.",
    location: "Boardroom / Hybrid",
    startTime: "2026-09-09T15:00:00+08:00",
    durationMinutes: 45,
    maxSlots: 8,
  },
  {
    title: "MPF & Hong Kong Payroll Compliance Masterclass",
    sessionTypeName: "Payroll & MPF Setup Consultation",
    description:
      "Learn MPF enrolment, contribution calculations, and payroll tax obligations for Hong Kong employers.",
    location: "Online Webinar",
    startTime: "2026-09-10T14:00:00+08:00",
    durationMinutes: 60,
    maxSlots: 20,
  },
  {
    title: "Audit Readiness & Document Review",
    sessionTypeName: "Audit Readiness Review",
    description:
      "One-on-one review of your audit file, internal controls, and statutory record-keeping before year-end.",
    location: "Central Office",
    startTime: "2026-09-11T11:00:00+08:00",
    durationMinutes: 45,
    maxSlots: 1,
  },
  {
    title: "Cross-Border Tax & GBA Structuring Workshop",
    sessionTypeName: "Business Advisory Session",
    description:
      "Seminar on Greater Bay Area entity structuring, cross-border tax considerations, and expansion planning for SMEs.",
    location: "Hybrid",
    startTime: "2026-09-12T16:00:00+08:00",
    durationMinutes: 90,
    maxSlots: 15,
  },
];

function addMinutes(iso, minutes) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

async function main() {
  const { data: types, error: typesError } = await supabase
    .from("session_types")
    .select("id, name, default_price");

  if (typesError) throw typesError;

  const typeByName = new Map(types.map((t) => [t.name, t]));

  const { data: existing, error: existingError } = await supabase
    .from("sessions")
    .select("title");

  if (existingError) throw existingError;

  const existingTitles = new Set((existing ?? []).map((s) => s.title));
  let inserted = 0;
  let skipped = 0;

  for (const session of WEBSITE_SESSIONS) {
    if (existingTitles.has(session.title)) {
      console.log(`Skip (exists): ${session.title}`);
      skipped++;
      continue;
    }

    const sessionType = typeByName.get(session.sessionTypeName);
    if (!sessionType) {
      console.error(`Session type not found: ${session.sessionTypeName}`);
      process.exit(1);
    }

    const { error } = await supabase.from("sessions").insert({
      title: session.title,
      description: session.description,
      type: sessionType.name,
      session_type_id: sessionType.id,
      location: session.location,
      start_time: session.startTime,
      end_time: addMinutes(session.startTime, session.durationMinutes),
      duration_minutes: session.durationMinutes,
      max_slots: session.maxSlots,
      price: sessionType.default_price,
      is_cancelled: false,
    });

    if (error) throw error;
    console.log(`Inserted: ${session.title}`);
    inserted++;
  }

  console.log(`\nDone — ${inserted} inserted, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
