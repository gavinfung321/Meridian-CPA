import { supabase } from "./supabase";

export type UserLoginHistoryRow = {
  id: number;
  user_id: string;
  login_time: string;
  ip_address: string | null;
  user_agent: string | null;
};

export async function recordLoginHistory(userId: string): Promise<void> {
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 512) : null;

  const { error } = await supabase.from("user_login_history").insert({
    user_id: userId,
    user_agent: userAgent,
  });

  if (error) {
    console.warn("Failed to record login history:", error.message);
  }
}

export async function fetchUserLoginHistory(
  userId: string,
  limit = 20,
): Promise<UserLoginHistoryRow[]> {
  const { data, error } = await supabase
    .from("user_login_history")
    .select("id, user_id, login_time, ip_address, user_agent")
    .eq("user_id", userId)
    .order("login_time", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as UserLoginHistoryRow[];
}

export function formatLoginUserAgent(userAgent: string | null): string {
  if (!userAgent?.trim()) return "Unknown device";
  if (userAgent.length <= 80) return userAgent;
  return `${userAgent.slice(0, 77)}…`;
}
