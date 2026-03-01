import { View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/theme";

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
