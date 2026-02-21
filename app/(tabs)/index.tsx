import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/theme";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cova 🌿</Text>
      <Text style={styles.sub}>Your project is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "600",
    color: Colors.teal,
    marginBottom: 8,
  },
  sub: {
    fontSize: 16,
    color: Colors.inkLight,
  },
});
