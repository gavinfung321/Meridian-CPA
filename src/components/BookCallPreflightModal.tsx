import { FormEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, ShieldCheck, Users, X } from "lucide-react";
import { Button } from "./ui/button";
import type {
  BookCallPreflightData,
  BookCallServiceLine,
  CalendlyPrefill,
  CalendlyUtmContent,
} from "../lib/calendly";
import {
  destroyCalendlyInlineWidget,
  initCalendlyInlineWidget,
  resetCalendlyScript,
  toCalendlyPrefill,
} from "../lib/calendly";
import { Language, translations } from "../lib/translations";

const OBJECTIVE_KEYS: BookCallServiceLine[] = [
  "audit",
  "tax",
  "bookkeeping",
  "secretarial",
  "advisory",
];

const SIDEBAR_ICONS = [Users, ShieldCheck, CalendarClock] as const;

type ModalStep = "form" | "calendar";

interface BookCallPreflightModalProps {
  lang: Language;
  open: boolean;
  utmContent: CalendlyUtmContent | null;
  onClose: () => void;
  initialName?: string;
  initialEmail?: string;
}

const fieldClassName =
  "h-11 w-full rounded-sm border border-[#0F2A1D]/12 bg-white px-3 text-[15px] text-[#0F2A1D] outline-none transition-colors placeholder:text-[#0F2A1D]/35 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30";

const labelClassName = "flex flex-col gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0F2A1D]/70";

export const BookCallPreflightModal = ({
  lang,
  open,
  utmContent,
  onClose,
  initialName = "",
  initialEmail = "",
}: BookCallPreflightModalProps): JSX.Element | null => {
  const t = translations[lang].bookCallPreflight;
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const calendarInitRef = useRef(0);

  const [step, setStep] = useState<ModalStep>("form");
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState(false);
  const [calendarAttempt, setCalendarAttempt] = useState(0);
  const [prefill, setPrefill] = useState<CalendlyPrefill | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [objective, setObjective] = useState<BookCallServiceLine | "">("");
  const [briefContext, setBriefContext] = useState("");

  const resetModal = () => {
    destroyCalendlyInlineWidget(embedRef.current);
    setStep("form");
    setCalendarLoading(false);
    setCalendarError(false);
    setCalendarAttempt(0);
    setPrefill(null);
    setName("");
    setEmail("");
    setObjective("");
    setBriefContext("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      if (step === "form") {
        firstFieldRef.current?.focus();
      }
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }

      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, step]);

  useEffect(() => {
    if (!open) {
      resetModal();
      return;
    }

    setName(initialName);
    setEmail(initialEmail);
  }, [open, initialName, initialEmail]);

  useLayoutEffect(() => {
    if (!open || step !== "calendar" || !utmContent || !prefill) {
      return;
    }

    const parentElement = embedRef.current;
    if (!parentElement) {
      return;
    }

    const initId = ++calendarInitRef.current;
    let cancelled = false;

    setCalendarLoading(true);
    setCalendarError(false);

    void initCalendlyInlineWidget({
      utmContent,
      prefill,
      parentElement,
    })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error("[Calendly] Inline embed failed:", error);
        }
        if (!cancelled && initId === calendarInitRef.current) {
          setCalendarError(true);
        }
      })
      .finally(() => {
        if (!cancelled && initId === calendarInitRef.current) {
          setCalendarLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (initId === calendarInitRef.current) {
        destroyCalendlyInlineWidget(parentElement);
      }
    };
  }, [open, step, utmContent, prefill, calendarAttempt]);

  const handleRetryCalendar = () => {
    resetCalendlyScript();
    destroyCalendlyInlineWidget(embedRef.current);
    setCalendarError(false);
    setCalendarAttempt((attempt) => attempt + 1);
  };

  if (!open) return null;

  const objectiveLabel = (key: BookCallServiceLine) => t.objectives[key];
  const isCalendarStep = step === "calendar";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!objective || !utmContent) return;

    const data: BookCallPreflightData = {
      name: name.trim(),
      email: email.trim(),
      objective: objectiveLabel(objective),
      briefContext: briefContext.trim(),
    };

    resetCalendlyScript();
    setCalendarError(false);
    setPrefill(toCalendlyPrefill(data));
    setStep("calendar");
  };

  const handleBackToForm = () => {
    destroyCalendlyInlineWidget(embedRef.current);
    setCalendarLoading(false);
    setCalendarError(false);
    setStep("form");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#0F2A1D]/60 backdrop-blur-[2px]"
        aria-label={t.close}
        onClick={handleClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-[680px] max-h-[calc(100vh-3rem)] w-full max-w-[1040px] flex-col overflow-hidden rounded-sm border border-[#0F2A1D]/10 shadow-2xl md:flex-row"
      >
        <aside className="flex shrink-0 flex-col justify-between bg-[#0F2A1D] px-8 py-8 md:w-[300px] md:py-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9A84C]">
              {t.label}
            </p>
            <p className="mt-3 font-serif text-[1.35rem] font-bold leading-tight tracking-tight text-white">
              {t.brandName}
            </p>
            <div className="mt-4 h-px w-10 bg-[#C9A84C]" aria-hidden="true" />

            <ul className="mt-8 flex flex-col gap-6">
              {t.sidebar.map((item, index) => {
                const Icon = SIDEBAR_ICONS[index] ?? Users;
                return (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/65">{item.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.12em] text-white/45 md:mt-0">
            {t.footerNote}
          </p>
        </aside>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F9F9F6] px-6 py-8 sm:px-8 sm:py-10">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full text-[#0F2A1D]/50 transition-colors hover:bg-[#0F2A1D]/5 hover:text-[#0F2A1D]"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </button>

          {isCalendarStep ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <h2 id={titleId} className="sr-only">
                {t.calendarTitle}
              </h2>
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToForm}
                className="mb-3 h-auto w-fit rounded-full px-0 py-1.5 text-[13px] font-medium text-[#0F2A1D]/70 hover:bg-transparent hover:text-[#0F2A1D]"
              >
                <span className="inline-flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  {t.back}
                </span>
              </Button>

              <div className="relative min-h-0 flex-1 overflow-hidden bg-[#F9F9F6]">
                {calendarLoading && !calendarError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F9F9F6]/90">
                    <p className="text-[14px] font-medium text-[#0F2A1D]/70">{t.loadingCalendar}</p>
                  </div>
                )}
                {calendarError && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#F9F9F6] px-6 text-center">
                    <p className="max-w-sm text-[15px] leading-relaxed text-[#2C3E35]/80">
                      {t.calendarError}
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="button"
                        onClick={handleBackToForm}
                        className="h-auto rounded-full px-6 py-3 text-[14px] font-medium text-[#0F2A1D]/70 hover:bg-[#0F2A1D]/5 hover:text-[#0F2A1D]"
                      >
                        {t.back}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleRetryCalendar}
                        className="h-auto rounded-full bg-[#0F2A1D] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#C9A84C] hover:text-[#0F2A1D]"
                      >
                        {t.retryCalendar}
                      </Button>
                    </div>
                  </div>
                )}
                <div ref={embedRef} className="h-full w-full min-h-0" aria-label={t.calendarTitle} />
              </div>
            </div>
          ) : (
            <>
              <div className="shrink-0 pr-10">
                <h2
                  id={titleId}
                  className="font-serif text-[2rem] font-bold leading-tight tracking-tight text-[#0F2A1D] sm:text-[2.15rem]"
                >
                  {t.title}
                </h2>
                <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-[#2C3E35]/80">
                  {t.subtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className={labelClassName}>
                    {t.name}
                    <input
                      ref={firstFieldRef}
                      required
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={fieldClassName}
                    />
                  </label>
                  <label className={labelClassName}>
                    {t.email}
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldClassName}
                    />
                  </label>
                  <label className={`${labelClassName} sm:col-span-2`}>
                    {t.objective}
                    <select
                      required
                      value={objective}
                      onChange={(e) => setObjective(e.target.value as BookCallServiceLine)}
                      className={fieldClassName}
                    >
                      <option value="" disabled>
                        {t.objectivePlaceholder}
                      </option>
                      {OBJECTIVE_KEYS.map((key) => (
                        <option key={key} value={key}>
                          {objectiveLabel(key)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={`${labelClassName} sm:col-span-2`}>
                    {t.briefContext}
                    <textarea
                      rows={3}
                      value={briefContext}
                      onChange={(e) => setBriefContext(e.target.value)}
                      placeholder={t.briefContextPlaceholder}
                      className="min-h-[88px] w-full resize-y rounded-sm border border-[#0F2A1D]/12 bg-white px-3 py-2.5 text-[15px] text-[#0F2A1D] outline-none transition-colors placeholder:text-[#0F2A1D]/35 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30"
                    />
                  </label>
                </div>

                <div className="mt-auto flex shrink-0 flex-col-reverse gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    className="h-auto rounded-full px-0 py-2 text-[14px] font-medium text-[#0F2A1D]/60 hover:bg-transparent hover:text-[#0F2A1D] sm:px-2"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    type="submit"
                    className="group h-auto w-full rounded-full bg-[#0F2A1D] px-8 py-3.5 text-[14px] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 hover:bg-[#C9A84C] hover:text-[#0F2A1D] sm:w-auto"
                  >
                    <span className="inline-flex items-center gap-2">
                      {t.schedule}
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
