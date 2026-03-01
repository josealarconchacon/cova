import * as SecureStore from "expo-secure-store";

const PENDING_INVITE_KEY = "pending_invite_code";

export async function setPendingInviteCode(code: string): Promise<void> {
  await SecureStore.setItemAsync(PENDING_INVITE_KEY, code.toUpperCase());
}

export async function getPendingInviteCode(): Promise<string | null> {
  return SecureStore.getItemAsync(PENDING_INVITE_KEY);
}

export async function clearPendingInviteCode(): Promise<void> {
  await SecureStore.deleteItemAsync(PENDING_INVITE_KEY);
}
