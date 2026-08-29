export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type RecurrenceFrequency = "none" | "weekly";

export interface RecurrenceFormState {
  frequency: RecurrenceFrequency;
  days: Weekday[];
  until: string;
}

export interface WeeklyRecurrenceRules {
  frequency: "weekly";
  days: Weekday[];
  until?: string;
}

export const WEEKDAYS: Array<{ value: Weekday; label: string }> = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const VALID_DAYS = new Set<string>(WEEKDAYS.map((day) => day.value));

export function defaultRecurrenceFormState(): RecurrenceFormState {
  return { frequency: "none", days: [], until: "" };
}

export function parseRecurrenceFormState(
  raw: Record<string, unknown> | null | undefined,
): RecurrenceFormState {
  if (!raw || raw.frequency !== "weekly") {
    return defaultRecurrenceFormState();
  }

  const days = Array.isArray(raw.days)
    ? raw.days.filter((day): day is Weekday => typeof day === "string" && VALID_DAYS.has(day))
    : [];

  const until = typeof raw.until === "string" ? raw.until.slice(0, 10) : "";

  return {
    frequency: days.length > 0 ? "weekly" : "none",
    days,
    until,
  };
}

export function buildRecurrenceRules(
  state: RecurrenceFormState,
): WeeklyRecurrenceRules | null {
  if (state.frequency !== "weekly" || state.days.length === 0) {
    return null;
  }

  const rules: WeeklyRecurrenceRules = {
    frequency: "weekly",
    days: state.days,
  };

  if (state.until.trim()) {
    rules.until = state.until;
  }

  return rules;
}

export function formatRecurrenceSummary(state: RecurrenceFormState): string {
  if (state.frequency !== "weekly" || state.days.length === 0) {
    return "Does not repeat";
  }

  const labels = WEEKDAYS.filter((day) => state.days.includes(day.value)).map((day) => day.label);
  const until = state.until.trim() ? ` until ${state.until}` : "";
  return `Weekly on ${labels.join(", ")}${until}`;
}
