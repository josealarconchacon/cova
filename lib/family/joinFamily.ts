import { supabase } from "../supabase";

/**
 * Joins an existing family using an invite code. Creates a profile for the user
 * linked to the inviter's family instead of creating a new family.
 *
 * Requires the `create_profile_for_family` RPC to exist in Supabase.
 * Run the migration in supabase/migrations/ to add it.
 */
export async function joinFamily(
  inviteCode: string,
  userId: string,
  displayName: string,
  role: string,
): Promise<{ familyId: string }> {
  const code = inviteCode.toUpperCase();

  // 1. Find family by invite code
  const { data: family, error: familyError } = await supabase
    .from("families")
    .select("id")
    .eq("invite_code", code)
    .single();

  if (familyError || !family) {
    throw new Error("This invite link is invalid or has expired. Ask for a new one.");
  }

  // 2. Create profile for existing family (SECURITY DEFINER RPC)
  const { data: familyId, error: setupError } = await supabase.rpc(
    "create_profile_for_family",
    {
      p_user_id: userId,
      p_family_id: family.id,
      p_display_name: displayName,
      p_role: role,
    },
  );

  if (setupError) {
    throw new Error(setupError.message);
  }

  return { familyId: familyId ?? family.id };
}
