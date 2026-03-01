import { Stack } from "expo-router";
import { Colors } from "../../constants/theme";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
        headerTintColor: Colors.teal,
        headerStyle: { backgroundColor: Colors.cream },
        headerTitleStyle: {
          fontFamily: "Cormorant-Garamond",
          fontSize: 20,
          fontWeight: "600",
          color: Colors.ink,
        },
        contentStyle: { backgroundColor: Colors.cream },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="privacy-policy"
        options={{ title: "Privacy Policy" }}
      />
    </Stack>
  );
}
