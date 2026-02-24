import { StyleSheet } from "react-native";
import { Colors } from "../../constants/theme";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 32,
    fontWeight: "600",
    color: Colors.ink,
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
    marginTop: 4,
  },

  tabRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
    backgroundColor: Colors.sand,
    borderRadius: 18,
    padding: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  tabText: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 13,
    color: Colors.inkLight,
  },

  chartCard: {
    backgroundColor: Colors.sand,
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
  },
  statStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 30,
  },
  statSuffix: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 1,
  },
  statLabel: {
    fontFamily: "DM-Sans",
    fontSize: 10,
    color: Colors.inkLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.sandDark,
  },

  chartArea: {
    position: "relative",
    height: 170,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.sandDark + "80",
  },
  barsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    flex: 1,
  },
  barWrap: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "70%",
    minHeight: 4,
  },
  barValue: {
    fontFamily: "DM-Sans",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
  },
  dayLabel: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    color: Colors.inkLight,
    marginTop: 8,
    fontWeight: "500",
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    color: Colors.inkLight,
    fontWeight: "500",
  },
  sectionLabel: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: Colors.inkLight,
    marginBottom: 12,
    fontWeight: "600",
  },
  insightCard: {
    padding: 14,
    backgroundColor: Colors.cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.sandDark + "60",
    borderLeftWidth: 3,
    marginBottom: 10,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightTitle: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    fontWeight: "700",
    color: Colors.ink,
  },
  insightText: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkMid,
    lineHeight: 19,
    paddingLeft: 42,
  },
  exportBtn: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  exportBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 14,
  },
});
