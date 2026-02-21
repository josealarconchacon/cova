import { useEffect } from "react";
import { Stack } from "expo-router";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function AuthLayout() {
  useEffect(() => {
    // If user is already logged in, skip auth screens
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/(tabs)/");
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#FDFAF6" },
      }}
    />
  );
}
