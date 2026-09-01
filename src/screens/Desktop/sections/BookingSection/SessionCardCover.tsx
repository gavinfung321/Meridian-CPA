import { useState } from "react";
import { cn } from "../../../../lib/utils";
import type { Language } from "../../../../lib/translations";
import type { PublicSessionCard } from "../../../../lib/public-sessions";
import {
  getSessionCoverCategoryLabel,
  getSessionCoverTheme,
  resolveSessionCoverSrc,
} from "../../../../lib/session-cover-fallback";

type SessionCardCoverProps = {
  session: PublicSessionCard;
  lang: Language;
};

export function SessionCardCover({ session, lang }: SessionCardCoverProps): JSX.Element {
  const theme = getSessionCoverTheme(session.typeFilter);
  const categoryLabel = getSessionCoverCategoryLabel(session, lang);
  const coverSrc = resolveSessionCoverSrc(session);
  const [photoFailed, setPhotoFailed] = useState(false);
  const Icon = theme.icon;

  if (coverSrc && !photoFailed) {
    return (
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-[#EDECE6]">
        <img
          src={coverSrc}
          alt={session.title}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setPhotoFailed(true)}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F2A1D]/40 via-[#0F2A1D]/10 to-transparent"
          aria-hidden
        />
        <span
          className={cn(
            "absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-sm",
            theme.pillClassName,
          )}
        >
          {categoryLabel}
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[16/9] w-full shrink-0 overflow-hidden"
      style={{ background: theme.gradient }}
    >
      <Icon
        className={cn("absolute -bottom-2 -right-2 h-24 w-24", theme.iconClassName)}
        strokeWidth={1.25}
        aria-hidden
      />
      <span
        className={cn(
          "absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-sm",
          theme.pillClassName,
        )}
      >
        {categoryLabel}
      </span>
    </div>
  );
}
