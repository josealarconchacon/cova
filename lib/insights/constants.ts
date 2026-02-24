import { Colors } from "../../constants/theme";
import {
  FeedIcon,
  SleepIcon,
  DiaperIcon,
} from "../../assets/icons/QuickActionIcons";

export const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export const DIAPER_COLORS = {
  wet: Colors.sky,
  dirty: Colors.bark,
  both: Colors.gold,
} as const;

export type Tab = "feeds" | "sleep" | "diapers";

export const TABS = [
  { id: "feeds" as Tab, Icon: FeedIcon, label: "Feeds", color: Colors.dusk },
  { id: "sleep" as Tab, Icon: SleepIcon, label: "Sleep", color: Colors.sky },
  {
    id: "diapers" as Tab,
    Icon: DiaperIcon,
    label: "Diapers",
    color: Colors.moss,
  },
];
