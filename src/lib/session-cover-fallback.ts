import type { LucideIcon } from "lucide-react";
import { Briefcase, Calculator, FileCheck, Users } from "lucide-react";
import type { Language } from "./translations";
import { translations } from "./translations";
import type { PublicSessionCard } from "./public-sessions";
import type { SessionTypeFilter } from "../screens/Desktop/sections/BookingSection/BookingFilters";

export type SessionCoverTheme = {
  gradient: string;
  icon: LucideIcon;
  iconClassName: string;
  pillClassName: string;
  categoryPhotoUrl: string;
};

const CATEGORY_COVER_PATHS: Record<SessionTypeFilter, string> = {
  taxPlanning: "/images/sessions/tax-planning.png",
  auditCompliance: "/images/sessions/audit-compliance.png",
  payrollMpf: "/images/sessions/payroll-mpf.png",
  advisory: "/images/sessions/advisory.png",
  all: "/images/sessions/advisory.png",
};

const COVER_THEMES: Record<SessionTypeFilter, SessionCoverTheme> = {
  taxPlanning: {
    gradient: "linear-gradient(135deg, #3d3420 0%, #C9A84C 42%, #EDECE6 100%)",
    icon: Calculator,
    iconClassName: "text-[#0F2A1D]/15",
    pillClassName: "bg-[#0F2A1D]/85 text-white",
    categoryPhotoUrl: CATEGORY_COVER_PATHS.taxPlanning,
  },
  auditCompliance: {
    gradient: "linear-gradient(135deg, #0F2A1D 0%, #1a3d2a 55%, #2C3E35 100%)",
    icon: FileCheck,
    iconClassName: "text-white/20",
    pillClassName: "bg-white/90 text-[#0F2A1D]",
    categoryPhotoUrl: CATEGORY_COVER_PATHS.auditCompliance,
  },
  payrollMpf: {
    gradient: "linear-gradient(135deg, #134e4a 0%, #5eead4 45%, #EDECE6 100%)",
    icon: Users,
    iconClassName: "text-[#0F2A1D]/15",
    pillClassName: "bg-[#0F2A1D]/85 text-white",
    categoryPhotoUrl: CATEGORY_COVER_PATHS.payrollMpf,
  },
  advisory: {
    gradient: "linear-gradient(135deg, #1e3a2f 0%, #6b8f71 50%, #EDECE6 100%)",
    icon: Briefcase,
    iconClassName: "text-[#0F2A1D]/15",
    pillClassName: "bg-[#0F2A1D]/85 text-white",
    categoryPhotoUrl: CATEGORY_COVER_PATHS.advisory,
  },
  all: {
    gradient: "linear-gradient(135deg, #0F2A1D 0%, #C9A84C 50%, #EDECE6 100%)",
    icon: Briefcase,
    iconClassName: "text-[#0F2A1D]/15",
    pillClassName: "bg-[#0F2A1D]/85 text-white",
    categoryPhotoUrl: CATEGORY_COVER_PATHS.all,
  },
};

const TYPE_FILTER_LABEL_KEYS: Record<
  SessionTypeFilter,
  "taxPlanning" | "auditCompliance" | "payrollMpf" | "advisory" | "allTypes"
> = {
  taxPlanning: "taxPlanning",
  auditCompliance: "auditCompliance",
  payrollMpf: "payrollMpf",
  advisory: "advisory",
  all: "allTypes",
};

export function getSessionCoverTheme(typeFilter: SessionTypeFilter): SessionCoverTheme {
  return COVER_THEMES[typeFilter] ?? COVER_THEMES.advisory;
}

export function getSessionCategoryCoverUrl(typeFilter: SessionTypeFilter): string {
  return getSessionCoverTheme(typeFilter).categoryPhotoUrl;
}

/** Resolve cover image: admin upload → category default photo. */
export function resolveSessionCoverSrc(session: PublicSessionCard): string | null {
  if (session.imageUrl) return session.imageUrl;
  return getSessionCategoryCoverUrl(session.typeFilter);
}

export function getSessionCoverCategoryLabel(session: PublicSessionCard, lang: Language): string {
  const categoryTag = session.tags[1];
  const typeTag = session.tags[0];
  if (categoryTag) return categoryTag;
  if (typeTag) return typeTag;

  const key = TYPE_FILTER_LABEL_KEYS[session.typeFilter];
  const filters = translations[lang].booking.filters;
  return filters[key as keyof typeof filters] ?? filters.advisory;
}
