import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "../supabase";

export interface AppleSignInResult {
  userId: string;
  email: string | null;
  fullName: string | null;
}

export async function signInWithApple(): Promise<AppleSignInResult> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error("No identity token received from Apple");
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
  });

  if (error) throw error;
  if (!data.user) throw new Error("No user returned from sign in");

  const fullName = credential.fullName
    ? [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(" ")
        .trim() || null
    : null;

  return {
    userId: data.user.id,
    email: credential.email ?? data.user.email ?? null,
    fullName: fullName || null,
  };
}
