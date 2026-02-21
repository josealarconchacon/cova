// Track which co-parents are currently active in the app.
// Powers the green "online" dot next to each co-parent.

import { useState, useEffect } from "react";
import { supabase } from "./supabase";

interface PresenceUser {
  user_id: string;
  display_name: string;
  role: string;
  online_at: string;
}

interface UsePresenceResult {
  onlineUserIds: string[];
  isCoParentOnline: (userId: string) => boolean;
}

export function usePresence(
  familyId: string | undefined,
  profile: {
    id: string;
    display_name: string;
    role: string;
  } | null,
): UsePresenceResult {
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!familyId || !profile) return;

    const channel = supabase.channel(`presence-${familyId}`, {
      config: {
        presence: { key: profile.id },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        // state is keyed by user id
        setOnlineUserIds(Object.keys(state));
      })
      .on("presence", { event: "join" }, ({ key }) => {
        setOnlineUserIds((prev) => [...new Set([...prev, key])]);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setOnlineUserIds((prev) => prev.filter((id) => id !== key));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Announce our presence to all other subscribers
          await channel.track({
            user_id: profile.id,
            display_name: profile.display_name,
            role: profile.role,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, profile?.id]);

  return {
    onlineUserIds,
    isCoParentOnline: (userId: string) => onlineUserIds.includes(userId),
  };
}
