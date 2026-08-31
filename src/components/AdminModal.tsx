import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "../lib/utils";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
  /** @deprecated Prefer `size="lg"` */
  wide?: boolean;
  size?: "md" | "lg" | "xl";
}

const sizeClasses = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide = false,
  size,
}: AdminModalProps): JSX.Element | null {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const resolvedSize = size ?? (wide ? "lg" : "md");

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
        className={cn(
          "flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-lg",
          sizeClasses[resolvedSize],
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-[#EDECE6] px-6 py-5">
          <h2 id={titleId} className="font-serif text-xl font-semibold text-[#0F2A1D]">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm text-[#0F2A1D]/70">{description}</p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>

        <div className="shrink-0 border-t border-[#EDECE6] px-6 py-4">
          <div className="flex flex-wrap justify-end gap-3">{footer}</div>
        </div>
      </div>
    </div>
  );
}
