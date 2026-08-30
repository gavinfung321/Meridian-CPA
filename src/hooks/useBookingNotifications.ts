import { useEffect, useId, useRef } from "react";
import { supabase } from "../lib/supabase";

type BookingChangeHandler = () => void;

/**
 * Subscribes to Supabase Realtime changes on `public.bookings`.
 * Each hook instance gets its own channel — required because Supabase
 * cannot add listeners to a channel after subscribe().
 */
export function useBookingNotifications(
  onChange: BookingChangeHandler,
  enabled = true,
): void {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const instanceId = useId().replace(/:/g, "");

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`bookings-realtime-${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          onChangeRef.current();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, instanceId]);
}
