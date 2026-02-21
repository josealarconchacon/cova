import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "../lib/supabase";
import { useStore } from "../store/useStore";

const queryClient = new QueryClient();

export default function RootLayout() {
  const setProfile = useStore((s) => s.setProfile);
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<boolean | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    "Cormorant-Garamond": require("../assets/fonts/CormorantGaramond-SemiBold.ttf"),
    "DM-Sans": require("../assets/fonts/DMSans-Regular.ttf"),
    "DM-Sans-Bold": require("../assets/fonts/DMSans-Bold.ttf"),
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (sess?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sess.user.id)
          .single();
        setProfile(data);
        setSession(true);
      } else {
        setProfile(null);
        setSession(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Wait for both fonts and the first auth event before routing
  useEffect(() => {
    if ((!fontsLoaded && !fontError) || session === null) return;
    setReady(true);
  }, [fontsLoaded, fontError, session]);

  useEffect(() => {
    if (!ready) return;
    if (session) {
      router.replace("/(tabs)/");
    } else {
      router.replace("/(auth)/login");
    }
  }, [ready, session]);

  // Render the navigator immediately so the router has a target;
  // the redirect fires once auth + fonts are resolved.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
