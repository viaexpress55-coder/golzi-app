import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0B1020",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 28,
          fontWeight: "bold",
        }}
      >
        ⚽ GOLZI
      </Text>

      <Text
        style={{
          color: "#9CA3AF",
          marginTop: 10,
          fontSize: 16,
        }}
      >
        Home Screen MVP
      </Text>
    </View>
  );
}