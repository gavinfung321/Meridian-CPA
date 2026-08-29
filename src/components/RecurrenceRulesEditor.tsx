import {
  defaultRecurrenceFormState,
  formatRecurrenceSummary,
  WEEKDAYS,
  type RecurrenceFormState,
} from "../lib/recurrence-rules";
import { adminInputClassName } from "../lib/session-admin";
import { cn } from "../lib/utils";

interface RecurrenceRulesEditorProps {
  value: RecurrenceFormState;
  onChange: (value: RecurrenceFormState) => void;
}

export function RecurrenceRulesEditor({
  value,
  onChange,
}: RecurrenceRulesEditorProps): JSX.Element {
  const toggleDay = (day: RecurrenceFormState["days"][number]) => {
    const days = value.days.includes(day)
      ? value.days.filter((current) => current !== day)
      : [...value.days, day];
    onChange({ ...value, days });
  };

  return (
    <div className="sm:col-span-2 space-y-3 rounded-lg border border-[#EDECE6] bg-[#F9F9F6] p-4">
      <div>
        <label htmlFor="recurrenceFrequency" className="mb-1 block text-sm font-medium">
          Recurrence
        </label>
        <select
          id="recurrenceFrequency"
          value={value.frequency}
          onChange={(event) => {
            const frequency = event.target.value as RecurrenceFormState["frequency"];
            onChange(
              frequency === "none"
                ? defaultRecurrenceFormState()
                : { ...value, frequency: "weekly" },
            );
          }}
          className={adminInputClassName}
        >
          <option value="none">Does not repeat</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {value.frequency === "weekly" ? (
        <>
          <div>
            <p className="mb-2 text-sm font-medium">Repeat on</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(({ value: day, label }) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                    value.days.includes(day)
                      ? "border-[#0F2A1D] bg-[#0F2A1D] text-white"
                      : "border-[#EDECE6] bg-white text-[#0F2A1D] hover:bg-[#EDECE6]/50",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="recurrenceUntil" className="mb-1 block text-sm font-medium">
              Repeat until (optional)
            </label>
            <input
              id="recurrenceUntil"
              type="date"
              value={value.until}
              onChange={(event) => onChange({ ...value, until: event.target.value })}
              className={adminInputClassName}
            />
          </div>
        </>
      ) : null}

      <p className="text-xs text-[#0F2A1D]/60">
        {formatRecurrenceSummary(value)}
        {value.frequency === "weekly" && value.days.length === 0
          ? " — select at least one day"
          : null}
      </p>
    </div>
  );
}
