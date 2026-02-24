import { Tabs } from "expo-router";
import { Colors } from "../../constants/theme";
import {
  JournalIcon,
  FamilyIcon,
  BabyIcon,
  InsightsIcon,
} from "../../assets/icons/TabIcons";

const ICON_SIZE = 26;

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
            <JournalIcon size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => (
            <InsightsIcon size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: "Family",
          tabBarIcon: ({ color }) => (
            <FamilyIcon size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="baby"
        options={{
          title: "Baby",
          tabBarIcon: ({ color }) => (
            <BabyIcon size={ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
