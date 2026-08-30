import {
  CalendarPlus,
  ChevronDown,
  ClipboardPlus,
  Plus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

interface QuickActionItem {
  label: string;
  to?: string;
  icon: LucideIcon;
  iconClassName: string;
  disabled?: boolean;
  disabledReason?: string;
  onNavigate?: () => void;
  onClick?: () => void;
}

const buildAdminQuickActions = (onManualBooking?: () => void): QuickActionItem[] => [
  {
    label: "New session",
    to: "/admin/sessions/new",
    icon: CalendarPlus,
    iconClassName: "bg-[#0F2A1D]/10 text-[#0F2A1D]",
  },
  {
    label: "Add client",
    icon: UserPlus,
    iconClassName: "bg-emerald-50 text-emerald-700",
    disabled: true,
    disabledReason: "Coming in Phase 5",
  },
  {
    label: "Manual booking",
    icon: ClipboardPlus,
    iconClassName: "bg-[#C9A84C]/20 text-[#0F2A1D]",
    onClick: onManualBooking,
  },
];

interface AdminQuickActionMenuProps {
  onManualBooking?: () => void;
}

export function AdminQuickActionMenu({ onManualBooking }: AdminQuickActionMenuProps): JSX.Element {
  const adminQuickActions = buildAdminQuickActions(onManualBooking);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-md bg-[#0F2A1D] px-3 text-sm font-medium text-white transition-colors hover:bg-[#0F2A1D]/90"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Quick action</span>
        <ChevronDown
          className={cn("h-4 w-4 opacity-80 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-[#EDECE6] bg-white py-1 shadow-lg"
        >
          {adminQuickActions.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                    item.iconClassName,
                    item.disabled && "opacity-50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{item.label}</span>
                  {item.disabled && item.disabledReason ? (
                    <span className="block text-xs text-[#0F2A1D]/50">{item.disabledReason}</span>
                  ) : null}
                </span>
              </>
            );

            if (item.disabled || (!item.to && !item.onClick)) {
              return (
                <div
                  key={item.label}
                  role="menuitem"
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-center gap-3 px-3 py-2.5 text-[#0F2A1D]/40"
                >
                  {content}
                </div>
              );
            }

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    item.onClick?.();
                    closeMenu();
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[#0F2A1D] hover:bg-[#F9F9F6]"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.to!}
                role="menuitem"
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-2.5 text-[#0F2A1D] hover:bg-[#F9F9F6]"
              >
                {content}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
