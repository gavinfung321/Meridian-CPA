import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Language, translations } from "../lib/translations";

interface ContactModalProps {
  lang: Language;
  open: boolean;
  onClose: () => void;
}

export const ContactModal = ({ lang, open, onClose }: ContactModalProps): JSX.Element | null => {
  const f = translations[lang].contact.form;
  const email = translations[lang].contact.email;
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [name, setName] = useState("");
  const [emailAddr, setEmailAddr] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
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
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmailAddr("");
      setPhone("");
      setMessage("");
      setSubmitted(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Consultation request — ${name || "Website"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${emailAddr}\nPhone: ${phone}\n\nMessage:\n${message}`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label={f.cancel}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-[480px] rounded-sm bg-[#F9F9F6] p-6 sm:p-8 shadow-xl"
      >
        <h2 id={titleId} className="font-serif text-[1.75rem] font-bold text-[#0F2A1D] tracking-tight">
          {f.title}
        </h2>

        {submitted ? (
          <div className="mt-6 flex flex-col gap-6">
            <p className="text-[15px] leading-relaxed text-[#2C3E35]">{f.success}</p>
            <Button
              type="button"
              onClick={onClose}
              className="h-auto self-end rounded-full bg-[#0F2A1D] hover:bg-[#C9A84C] hover:text-[#0F2A1D] text-white px-6 py-3 text-[14px] font-semibold transition-all duration-200"
            >
              {f.successClose}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#0F2A1D]">
              {f.name}
              <input
                ref={firstFieldRef}
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-sm border border-[#0F2A1D]/15 bg-white px-3 text-[15px] text-[#0F2A1D] outline-none focus:border-[#C9A84C]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#0F2A1D]">
              {f.email}
              <input
                required
                type="email"
                value={emailAddr}
                onChange={(e) => setEmailAddr(e.target.value)}
                className="h-11 rounded-sm border border-[#0F2A1D]/15 bg-white px-3 text-[15px] text-[#0F2A1D] outline-none focus:border-[#C9A84C]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#0F2A1D]">
              {f.phone}
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-sm border border-[#0F2A1D]/15 bg-white px-3 text-[15px] text-[#0F2A1D] outline-none focus:border-[#C9A84C]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#0F2A1D]">
              {f.message}
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="rounded-sm border border-[#0F2A1D]/15 bg-white px-3 py-2 text-[15px] text-[#0F2A1D] outline-none focus:border-[#C9A84C] resize-y min-h-[100px]"
              />
            </label>
            <div className="mt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="h-auto rounded-full px-6 py-3 text-[14px] font-medium text-[#0F2A1D]/70 hover:text-[#0F2A1D] hover:bg-black/5"
              >
                {f.cancel}
              </Button>
              <Button
                type="submit"
                className="h-auto rounded-full bg-[#0F2A1D] hover:bg-[#C9A84C] hover:text-[#0F2A1D] text-white px-6 py-3 text-[14px] font-semibold transition-all duration-200"
              >
                {f.submit}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
