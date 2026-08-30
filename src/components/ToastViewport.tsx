import { CheckCircle2, X, XCircle } from "lucide-react";
import { useToast } from "../contexts/ToastContext";

export function ToastViewport(): JSX.Element {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return <></>;

  return (
    <div
      className="pointer-events-none fixed left-4 top-4 z-[200] flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${
              isSuccess
                ? "border-[#0F2A1D]/15 bg-[#0F2A1D] text-white"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A84C]" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            )}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className={`shrink-0 rounded p-0.5 transition-colors ${
                isSuccess ? "text-white/70 hover:text-white" : "text-red-600 hover:text-red-800"
              }`}
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
