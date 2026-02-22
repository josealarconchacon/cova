import { View, ActivityIndicator } from "react-native";

// This is the app's true entry point. Expo-router renders this first
// while _layout.tsx resolves fonts + auth state, then navigates away.
export default function IndexGate() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FDFAF6",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color="#3D7A6E" />
    </View>
  );
}
