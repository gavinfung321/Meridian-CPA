import { supabase } from "./supabase";
import type { Session } from "../types/database";

export type SessionHistorySnapshot = {
  title: string;
  description: string | null;
  location: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  max_slots: number;
  price: number;
  is_cancelled: boolean;
  cancel_reason: string | null;
  session_type_id: string | null;
};

export type SessionHistoryRow = {
  id: number;
  session_id: string;
  changed_by: string | null;
  action: string;
  old_data: SessionHistorySnapshot | null;
  new_data: SessionHistorySnapshot | null;
  created_at: string;
  changer: {
    first_name: string;
    last_name: string;
    role: string;
  } | null;
};

export function sessionToHistorySnapshot(
  session: Pick<
    Session,
    | "title"
    | "description"
    | "location"
    | "start_time"
    | "end_time"
    | "duration_minutes"
    | "max_slots"
    | "price"
    | "is_cancelled"
    | "cancel_reason"
    | "session_type_id"
  >,
): SessionHistorySnapshot {
  return {
    title: session.title,
    description: session.description,
    location: session.location,
    start_time: session.start_time,
    end_time: session.end_time,
    duration_minutes: session.duration_minutes,
    max_slots: session.max_slots,
    price: Number(session.price),
    is_cancelled: session.is_cancelled,
    cancel_reason: session.cancel_reason,
    session_type_id: session.session_type_id,
  };
}

async function logSessionHistory(entry: {
  sessionId: string;
  changedBy: string;
  action: string;
  oldData?: SessionHistorySnapshot | null;
  newData?: SessionHistorySnapshot | null;
}): Promise<void> {
  const { error } = await supabase.from("session_history").insert({
    session_id: entry.sessionId,
    changed_by: entry.changedBy,
    action: entry.action,
    old_data: entry.oldData ?? null,
    new_data: entry.newData ?? null,
  });

  if (error) {
    console.warn("Failed to log session history:", error.message);
  }
}

export async function logSessionCreated(
  sessionId: string,
  changedBy: string,
  newData: SessionHistorySnapshot,
): Promise<void> {
  await logSessionHistory({
    sessionId,
    changedBy,
    action: "CREATED",
    newData,
  });
}

export async function logSessionUpdated(
  sessionId: string,
  changedBy: string,
  oldData: SessionHistorySnapshot,
  newData: SessionHistorySnapshot,
): Promise<void> {
  await logSessionHistory({
    sessionId,
    changedBy,
    action: "UPDATED",
    oldData,
    newData,
  });
}

export async function logSessionCancelled(
  sessionId: string,
  changedBy: string,
  oldData: SessionHistorySnapshot,
  cancelReason: string,
): Promise<void> {
  await logSessionHistory({
    sessionId,
    changedBy,
    action: "CANCELLED",
    oldData,
    newData: { ...oldData, is_cancelled: true, cancel_reason: cancelReason },
  });
}

export async function logSessionReactivated(
  sessionId: string,
  changedBy: string,
  oldData: SessionHistorySnapshot,
): Promise<void> {
  await logSessionHistory({
    sessionId,
    changedBy,
    action: "REACTIVATED",
    oldData,
    newData: { ...oldData, is_cancelled: false, cancel_reason: null },
  });
}

export async function fetchSessionHistory(
  sessionId: string,
  limit = 20,
): Promise<SessionHistoryRow[]> {
  const { data, error } = await supabase
    .from("session_history")
    .select(`
      id,
      session_id,
      changed_by,
      action,
      old_data,
      new_data,
      created_at,
      changer:profiles!session_history_changed_by_fkey (
        first_name,
        last_name,
        role
      )
    `)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as SessionHistoryRow[];
}

export function sessionHistoryActionLabel(action: string): string {
  switch (action) {
    case "CREATED":
      return "Session created";
    case "UPDATED":
      return "Session updated";
    case "CANCELLED":
      return "Session cancelled";
    case "REACTIVATED":
      return "Session reactivated";
    default:
      return action.replaceAll("_", " ").toLowerCase();
  }
}

export function sessionHistoryActorName(
  changer: SessionHistoryRow["changer"],
): string {
  if (!changer) return "System";
  const name = `${changer.first_name} ${changer.last_name}`.trim();
  return name || (changer.role === "admin" ? "Admin" : "Staff");
}
