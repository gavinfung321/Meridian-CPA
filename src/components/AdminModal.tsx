import { useEffect, useId, useRef, type ReactNode } from "react";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
  wide?: boolean;
}

export function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide = false,
}: AdminModalProps): JSX.Element | null {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full rounded-xl border border-[#EDECE6] bg-white p-6 shadow-lg ${
          wide ? "max-w-lg" : "max-w-md"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="font-serif text-xl font-semibold text-[#0F2A1D]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-[#0F2A1D]/70">{description}</p>
        ) : null}
        <div className="mt-4">{children}</div>
        <div className="mt-6 flex justify-end gap-3">{footer}</div>
      </div>
    </div>
  );
}
