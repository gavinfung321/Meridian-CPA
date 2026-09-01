export type SessionFormatKey = "private" | "clinic" | "workshop";

export function getSessionFormatKey(maxSlots: number): SessionFormatKey {
  if (maxSlots <= 1) return "private";
  if (maxSlots <= 8) return "clinic";
  return "workshop";
}
