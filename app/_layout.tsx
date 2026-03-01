import { useEffect, useRef, useState } from "react";
import { LogBox } from "react-native";
import { Stack, useRouter } from "expo-router";

LogBox.ignoreLogs(["Invalid Refresh Token", "Refresh Token Not Found"]);
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase, withTimeout } from "../lib/supabase";
import { useStore } from "../store/useStore";
import { queryClient } from "../lib/queryClient";
import type { Baby } from "../types";

type RouteTarget = "/(tabs)/" | "/onboarding" | "/(auth)/login" | null;

const PROFILE_TIMEOUT_MS = 15_000;
const SAFETY_TIMEOUT_MS = 20_000;

export default function RootLayout() {
  const setProfile = useStore((s) => s.setProfile);
  const setActiveBaby = useStore((s) => s.setActiveBaby);
  const router = useRouter();
  const [target, setTarget] = useState<RouteTarget>(null);
  const lastNavigated = useRef<RouteTarget>(null);

  const [fontsLoaded, fontError] = useFonts({
    "Cormorant-Garamond": require("../assets/fonts/CormorantGaramond-SemiBold.ttf"),
    "DM-Sans": require("../assets/fonts/DMSans-Regular.ttf"),
    "DM-Sans-Bold": require("../assets/fonts/DMSans-Bold.ttf"),
  });

  const isFirstEvent = useRef(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, sess) => {
      console.log("[RootLayout] authStateChange:", event);
      const firstEvent = isFirstEvent.current;
      isFirstEvent.current = false;

      try {
        if (!sess?.user) {
          setProfile(null);
          setActiveBaby(null);
          setTarget("/(auth)/login");
          return;
        }

        const cached = useStore.getState();
        if (cached.profile?.id === sess.user.id) {
          console.log("[RootLayout] store already populated, skipping queries");
          setTarget(cached.activeBaby ? "/(tabs)/" : "/onboarding");
          return;
        }

        if (event === "SIGNED_IN" && !firstEvent) {
          return;
        }

        console.log("[RootLayout] fetching profile for", event);
        const { data: profile, error: profileError } = await withTimeout(
          supabase.from("profiles").select("*").eq("id", sess.user.id).single(),
          PROFILE_TIMEOUT_MS,
        );

        if (profileError || !profile) {
          console.warn(
            "[RootLayout] profile query failed:",
            profileError?.message,
          );
          await supabase.auth.signOut().catch(() => {});
          setProfile(null);
          setActiveBaby(null);
          setTarget("/(auth)/login");
          return;
        }

        setProfile(profile);

        console.log("[RootLayout] fetching baby…");
        const { data: babies } = await withTimeout(
          supabase
            .from("babies")
            .select("*")
            .eq("family_id", profile.family_id)
            .order("created_at", { ascending: true })
            .limit(1),
          PROFILE_TIMEOUT_MS,
        );

        const baby = (babies?.[0] as Baby) ?? null;
        setActiveBaby(baby);
        setTarget(baby ? "/(tabs)/" : "/onboarding");
      } catch (e: any) {
        console.warn("[RootLayout] auth fallback:", e?.message ?? e);
        setTarget((prev) => prev ?? "/(auth)/login");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTarget((prev) => {
        if (prev !== null) return prev;
        console.warn("[RootLayout] safety timeout – no auth event received");
        return "/(auth)/login";
      });
    }, SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, []);

  // ── Navigation ───────────────────────────────────────────────────────────
  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    if (!fontsReady || target === null) return;
    if (target === lastNavigated.current) return;

    console.log("[RootLayout] navigating to:", target);
    lastNavigated.current = target;

    const id = setTimeout(() => {
      try {
        router.replace(target);
      } catch (e) {
        console.error("[RootLayout] router.replace failed:", e);
        lastNavigated.current = null;
      }
    }, 0);
    return () => clearTimeout(id);
  }, [fontsReady, target]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
