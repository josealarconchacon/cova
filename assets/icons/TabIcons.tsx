import React from "react";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Ellipse,
  Circle,
  Line,
} from "react-native-svg";

interface TabIconProps {
  size?: number;
  color?: string;
}

export function JournalIcon({ size = 26, color = "#9A8C7C" }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="16 10 56 68" fill="none">
      <Rect
        x="20"
        y="14"
        width="44"
        height="58"
        rx="4"
        fill={color}
        opacity={0.08}
        stroke={color}
        strokeWidth="2"
      />
      <Line x1="29" y1="14" x2="29" y2="72" stroke={color} strokeWidth="2" />
      <Line x1="35" y1="30" x2="57" y2="30" stroke={color} strokeWidth="1.5" opacity={0.5} />
      <Line x1="35" y1="38" x2="57" y2="38" stroke={color} strokeWidth="1.5" opacity={0.5} />
      <Line x1="35" y1="46" x2="57" y2="46" stroke={color} strokeWidth="1.5" opacity={0.5} />
      <Line x1="35" y1="54" x2="50" y2="54" stroke={color} strokeWidth="1.5" opacity={0.5} />
      <Path
        d="M56 22 C60 18 66 16 64 24 L54 46 L52 44 Z"
        fill={color}
        opacity={0.6}
      />
      <Path d="M52 44 L54 46 L50 50 Z" fill={color} opacity={0.8} />
      <Path
        d="M62 14 L62 34 L58 30 L54 34 L54 14 Z"
        fill={color}
        opacity={0.35}
      />
      <Circle cx="44" cy="64" r="2" fill={color} opacity={0.4} />
    </Svg>
  );
}

export function FamilyIcon({ size = 26, color = "#9A8C7C" }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="12 8 64 66" fill="none">
      <Path
        d="M44 16 L70 38 L70 68 L18 68 L18 38 Z"
        stroke={color}
        strokeWidth="2"
        fill={color}
        fillOpacity={0.06}
      />
      <Path d="M44 16 L70 38 L18 38 Z" fill={color} opacity={0.1} />
      <Rect
        x="38"
        y="50"
        width="12"
        height="18"
        rx="6"
        stroke={color}
        strokeWidth="2"
        fill={color}
        fillOpacity={0.08}
      />
      <Rect x="22" y="44" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity={0.08} opacity={0.7} />
      <Rect x="56" y="44" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity={0.08} opacity={0.7} />
      <Circle cx="33" cy="27" r="3.5" fill={color} opacity={0.6} />
      <Path d="M33 31 C33 31 29 36 30 38 L36 38 C37 36 33 31 33 31 Z" fill={color} opacity={0.4} />
      <Circle cx="44" cy="25" r="4" fill={color} opacity={0.75} />
      <Path d="M44 29 C44 29 40 34 41 37 L47 37 C48 34 44 29 44 29 Z" fill={color} opacity={0.55} />
      <Circle cx="55" cy="27" r="3.5" fill={color} opacity={0.6} />
      <Path d="M55 31 C55 31 51 36 52 38 L58 38 C59 36 55 31 55 31 Z" fill={color} opacity={0.4} />
      <Path
        d="M44 12 C44 12 42 10 40.5 11 C38.5 12 38.5 15 41 17 L44 19.5 L47 17 C49.5 15 49.5 12 47.5 11 C46 10 44 12 44 12 Z"
        fill={color}
        opacity={0.5}
      />
    </Svg>
  );
}

export function BabyIcon({ size = 26, color = "#9A8C7C" }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="16 14 56 60" fill="none">
      <Path
        d="M44 22 C36 22 28 26 26 34 L22 34 C20 34 20 42 22 42 L26 42 C26 50 30 62 32 68 L56 68 C58 62 62 50 62 42 L66 42 C68 42 68 34 66 34 L62 34 C60 26 52 22 44 22 Z"
        fill={color}
        fillOpacity={0.06}
        stroke={color}
        strokeWidth="2"
      />
      <Ellipse cx="44" cy="22" rx="8" ry="4" fill="none" stroke={color} strokeWidth="1.8" />
      <Circle cx="40" cy="66" r="2" stroke={color} strokeWidth="1.2" fill={color} fillOpacity={0.15} />
      <Circle cx="44" cy="67" r="2" stroke={color} strokeWidth="1.2" fill={color} fillOpacity={0.15} />
      <Circle cx="48" cy="66" r="2" stroke={color} strokeWidth="1.2" fill={color} fillOpacity={0.15} />
      <Path
        d="M44 38 C44 38 41.5 35.5 39.8 36.8 C38 38 38 40.5 40.5 42.5 L44 45 L47.5 42.5 C50 40.5 50 38 48.2 36.8 C46.5 35.5 44 38 44 38 Z"
        fill={color}
        opacity={0.65}
      />
      <Circle cx="30" cy="48" r="1.5" fill={color} opacity={0.3} />
      <Circle cx="58" cy="48" r="1.5" fill={color} opacity={0.3} />
      <Circle cx="32" cy="56" r="1" fill={color} opacity={0.2} />
      <Circle cx="56" cy="57" r="1" fill={color} opacity={0.2} />
      <Path
        d="M38 20 C40 16 44 18 44 18 C44 18 48 16 50 20 L47 22 C45.5 20 42.5 20 41 22 Z"
        fill={color}
        opacity={0.4}
      />
      <Path
        d="M26 42 Q30 46 34 42 Q38 46 42 42 Q46 46 50 42 Q54 46 58 42 Q61 46 62 42"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        opacity={0.3}
      />
    </Svg>
  );
}

export function InsightsIcon({ size = 26, color = "#9A8C7C" }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="16 2 56 76" fill="none">
      <Path
        d="M44 14 C33 14 26 21 26 30 C26 37 30 42 36 46 L36 56 L52 56 L52 46 C58 42 62 37 62 30 C62 21 55 14 44 14 Z"
        stroke={color}
        strokeWidth="2"
        fill={color}
        fillOpacity={0.06}
      />
      <Rect x="36" y="56" width="16" height="4" rx="2" stroke={color} strokeWidth="1.8" fill={color} fillOpacity={0.08} />
      <Rect x="37" y="62" width="14" height="4" rx="2" stroke={color} strokeWidth="1.8" fill={color} fillOpacity={0.08} />
      <Path d="M40 66 L44 72 L48 66 Z" fill={color} opacity={0.4} />
      <Path d="M38 36 Q44 30 50 36" stroke={color} strokeWidth="1.5" fill="none" opacity={0.55} />
      <Path d="M40 40 Q44 34 48 40" stroke={color} strokeWidth="1.2" fill="none" opacity={0.4} />
      <Line x1="44" y1="10" x2="44" y2="6" stroke={color} strokeWidth="1.5" opacity={0.4} />
      <Line x1="56" y1="14" x2="59" y2="11" stroke={color} strokeWidth="1.5" opacity={0.35} />
      <Line x1="32" y1="14" x2="29" y2="11" stroke={color} strokeWidth="1.5" opacity={0.35} />
      <Line x1="64" y1="26" x2="68" y2="24" stroke={color} strokeWidth="1.5" opacity={0.25} />
      <Line x1="24" y1="26" x2="20" y2="24" stroke={color} strokeWidth="1.5" opacity={0.25} />
      <Circle cx="66" cy="34" r="2" fill={color} opacity={0.35} />
      <Circle cx="22" cy="34" r="2" fill={color} opacity={0.35} />
      <Circle cx="44" cy="8" r="1.5" fill={color} opacity={0.45} />
    </Svg>
  );
}
