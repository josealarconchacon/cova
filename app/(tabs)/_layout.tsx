import { Text } from "react-native";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.teal,
        tabBarInactiveTintColor: Colors.inkLight,
        tabBarStyle: {
          backgroundColor: Colors.cream,
          borderTopColor: Colors.sandDark,
          height: 84,
          paddingBottom: 24,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Journal",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🌿</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: "Family",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>👨‍👩‍👧</Text>
          ),
        }}
      />
    </Tabs>
  );
}
