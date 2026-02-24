import { StyleSheet } from "react-native";
import { Colors } from "../../constants/theme";

export const daySectionStyles = StyleSheet.create({
  container: {
    marginBottom: 10,
    backgroundColor: Colors.cream,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chevron: {
    fontSize: 10,
    color: Colors.ink,
  },
  title: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 15,
    color: Colors.ink,
  },
  badge: {
    backgroundColor: Colors.tealPale,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    fontWeight: "600",
    color: Colors.teal,
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
    marginBottom: 2,
  },
  babyName: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 32,
    fontWeight: "600",
    color: Colors.ink,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  babyAge: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.teal,
    fontWeight: "600",
    marginTop: 4,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: Colors.tealPale,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 18,
  },
  syncDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.moss,
    borderWidth: 2,
    borderColor: Colors.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 120,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  timelineTitle: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 16,
    color: Colors.ink,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  syncDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.moss,
  },
  syncText: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    color: Colors.moss,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 22,
    color: Colors.inkLight,
    marginBottom: 6,
  },
  emptyBody: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
  },
});
