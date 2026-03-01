import { Colors } from "../../constants/theme";
import {
  FeedIcon,
  SleepIcon,
  DiaperIcon,
} from "../../assets/icons/QuickActionIcons";

export const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export const WEEK_DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function formatDayName(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export const DIAPER_COLORS = {
  wet: Colors.sky,
  dirty: Colors.bark,
  both: Colors.gold,
} as const;

export const SLEEP_COLORS = {
  nap: Colors.skyPale,
  night: Colors.sky,
} as const;

export type Tab = "feeds" | "sleep" | "diapers";

export const TABS = [
  { id: "feeds" as Tab, Icon: FeedIcon, label: "Feeds", color: Colors.dusk },
  {
    id: "sleep" as Tab,
    Icon: SleepIcon,
    label: "Sleep",
    color: "#2C3E6B",
  },
  {
    id: "diapers" as Tab,
    Icon: DiaperIcon,
    label: "Diapers",
    color: Colors.moss,
  },
];
