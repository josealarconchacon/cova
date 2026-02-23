import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Profile } from "../types";

export function useFamilyData(familyId: string | undefined) {
  const { data: members = [] } = useQuery({
    queryKey: ["family-members", familyId],
    enabled: !!familyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", familyId!);
      if (error) throw error;
      return data as Profile[];
    },
  });

  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    if (!familyId) return;
    supabase
      .from("families")
      .select("invite_code")
      .eq("id", familyId)
      .single()
      .then(({ data }) => {
        if (data) setInviteCode(data.invite_code);
      });
  }, [familyId]);

  return { members, inviteCode };
}
