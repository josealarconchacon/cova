import { Tabs } from "expo-router";
import { Colors } from "../../constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.teal,
        tabBarInactiveTintColor: Colors.inkLight,
        tabBarStyle: { backgroundColor: Colors.cream },
      }}
    />
  );
}
