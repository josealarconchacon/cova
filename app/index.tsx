import { View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/theme";

// This is the app's true entry point. Expo-router renders this first
// while _layout.tsx resolves fonts + auth state, then navigates away.
export default function IndexGate() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.cream,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color={Colors.teal} />
    </View>
  );
}
