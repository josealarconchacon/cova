import { router } from "expo-router";
import { supabase } from "../supabase";
import { useStore } from "../../store/useStore";
import { clearPendingInviteCode } from "../family/pendingInvite";
import { queryClient } from "../queryClient";

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();

  useStore.getState().reset();

  await clearPendingInviteCode();

  queryClient.clear();

  router.replace("/(auth)/login");
}
