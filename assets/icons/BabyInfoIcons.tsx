import React from "react";
import Svg, {
  Rect,
  Path,
  Circle,
  Ellipse,
  Line,
} from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export function DobIcon({ size = 28, color = "#B07D6C" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="8 14 72 66" fill="none">
      {/* Cake top tier */}
      <Rect x="24" y="42" width="40" height="20" rx="5" fill={color} opacity={0.12} stroke={color} strokeWidth="1.5" />
      {/* Cake bottom tier */}
      <Rect x="14" y="58" width="60" height="20" rx="6" fill={color} opacity={0.15} stroke={color} strokeWidth="1.5" />
      {/* Frosting drips on top */}
      <Path d="M24 42 Q28 38 32 42 Q36 38 40 42 Q44 38 48 42 Q52 38 56 42 Q60 38 64 42" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity={0.25} />
      {/* Frosting drips on bottom */}
      <Path d="M14 58 Q19 53 24 58 Q29 53 34 58 Q39 53 44 58 Q49 53 54 58 Q59 53 64 58 Q69 53 74 58" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity={0.2} />
      {/* Sprinkles */}
      <Rect x="22" y="64" width="6" height="2.5" rx="1.2" fill={color} opacity={0.2} transform="rotate(-30 22 64)" />
      <Rect x="46" y="63" width="6" height="2.5" rx="1.2" fill={color} opacity={0.2} transform="rotate(-15 46 63)" />
      <Rect x="58" y="68" width="6" height="2.5" rx="1.2" fill={color} opacity={0.2} transform="rotate(35 58 68)" />
      {/* Candles */}
      <Rect x="30" y="28" width="7" height="16" rx="3.5" fill={color} opacity={0.3} />
      <Rect x="41" y="26" width="7" height="18" rx="3.5" fill={color} opacity={0.25} />
      <Rect x="52" y="29" width="7" height="15" rx="3.5" fill={color} opacity={0.3} />
      {/* Flames */}
      <Ellipse cx="33.5" cy="26" rx="2.5" ry="3.5" fill={color} opacity={0.45} />
      <Ellipse cx="44.5" cy="24" rx="2.5" ry="3.5" fill={color} opacity={0.45} />
      <Ellipse cx="55.5" cy="27" rx="2.5" ry="3.5" fill={color} opacity={0.45} />
    </Svg>
  );
}

export function BoyIcon({ size = 28, color = "#1976D2" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="8 6 72 80" fill="none">
      {/* Background stars */}
      <Circle cx="18" cy="18" r="1.5" fill={color} opacity={0.3} />
      <Circle cx="70" cy="14" r="1" fill={color} opacity={0.25} />
      <Circle cx="74" cy="30" r="1.5" fill={color} opacity={0.2} />
      <Circle cx="14" cy="40" r="1" fill={color} opacity={0.25} />
      <Circle cx="68" cy="50" r="1.5" fill={color} opacity={0.2} />
      {/* Star sparkles */}
      <Path d="M20 28 L20.5 29.5 L22 30 L20.5 30.5 L20 32 L19.5 30.5 L18 30 L19.5 29.5 Z" fill={color} opacity={0.3} />
      <Path d="M66 22 L66.4 23.2 L67.6 23.6 L66.4 24 L66 25.2 L65.6 24 L64.4 23.6 L65.6 23.2 Z" fill={color} opacity={0.25} />
      {/* Flame glow */}
      <Ellipse cx="44" cy="76" rx="10" ry="8" fill={color} opacity={0.06} />
      {/* Flame */}
      <Path d="M38 70 Q40 82 44 86 Q48 82 50 70 Q47 74 44 72 Q41 74 38 70 Z" fill={color} opacity={0.25} />
      <Path d="M40 70 Q42 78 44 80 Q46 78 48 70 Q46 73 44 71.5 Q42 73 40 70 Z" fill={color} opacity={0.15} />
      {/* Fins */}
      <Path d="M36 56 L28 66 L36 64 Z" fill={color} opacity={0.35} />
      <Path d="M52 56 L60 66 L52 64 Z" fill={color} opacity={0.35} />
      {/* Rocket body */}
      <Rect x="36" y="30" width="16" height="40" rx="6" fill={color} opacity={0.2} stroke={color} strokeWidth="1.5" />
      <Rect x="38" y="32" width="4" height="24" rx="2" fill="white" opacity={0.15} />
      {/* Nose cone */}
      <Path d="M36 30 Q36 10 44 10 Q52 10 52 30 Z" fill={color} opacity={0.15} stroke={color} strokeWidth="1.5" />
      <Path d="M38 30 Q38 14 42 12" stroke="white" strokeWidth="1.5" fill="none" opacity={0.2} strokeLinecap="round" />
      {/* Window */}
      <Circle cx="44" cy="42" r="8" fill={color} opacity={0.12} stroke={color} strokeWidth="1.5" />
      <Circle cx="44" cy="42" r="5.5" fill={color} opacity={0.08} />
      <Ellipse cx="41.5" cy="39.5" rx="2" ry="1.4" fill="white" opacity={0.35} transform="rotate(-30 41.5 39.5)" />
      {/* Bolts */}
      <Circle cx="40" cy="34" r="1.2" fill={color} opacity={0.35} />
      <Circle cx="48" cy="34" r="1.2" fill={color} opacity={0.35} />
      <Line x1="36" y1="52" x2="52" y2="52" stroke={color} strokeWidth="1" opacity={0.25} />
    </Svg>
  );
}

export function GirlIcon({ size = 28, color = "#E060A0" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="8 12 72 68" fill="none">
      {/* Stem */}
      <Rect x="42" y="52" width="4" height="26" rx="2" fill={color} opacity={0.25} />
      {/* Leaves */}
      <Path d="M44 66 C44 66 34 62 32 56 C36 54 44 60 44 66 Z" fill={color} opacity={0.2} />
      <Path d="M44 70 C44 70 54 66 56 60 C52 58 44 64 44 70 Z" fill={color} opacity={0.2} />
      {/* Petals */}
      <Ellipse cx="44" cy="26" rx="5.5" ry="10" fill={color} opacity={0.25} />
      <Ellipse cx="44" cy="50" rx="5.5" ry="10" fill={color} opacity={0.25} />
      <Ellipse cx="32" cy="38" rx="10" ry="5.5" fill={color} opacity={0.25} />
      <Ellipse cx="56" cy="38" rx="10" ry="5.5" fill={color} opacity={0.25} />
      <Ellipse cx="35.5" cy="29.5" rx="5.5" ry="10" fill={color} opacity={0.18} transform="rotate(-45 35.5 29.5)" />
      <Ellipse cx="52.5" cy="29.5" rx="5.5" ry="10" fill={color} opacity={0.18} transform="rotate(45 52.5 29.5)" />
      <Ellipse cx="35.5" cy="46.5" rx="5.5" ry="10" fill={color} opacity={0.18} transform="rotate(45 35.5 46.5)" />
      <Ellipse cx="52.5" cy="46.5" rx="5.5" ry="10" fill={color} opacity={0.18} transform="rotate(-45 52.5 46.5)" />
      {/* Center */}
      <Circle cx="44" cy="38" r="9" fill={color} opacity={0.35} />
      <Circle cx="44" cy="38" r="6" fill={color} opacity={0.2} />
      <Circle cx="40" cy="36" r="1.2" fill={color} opacity={0.3} />
      <Circle cx="44" cy="34" r="1.2" fill={color} opacity={0.3} />
      <Circle cx="48" cy="36" r="1.2" fill={color} opacity={0.3} />
      <Circle cx="40" cy="40" r="1.2" fill={color} opacity={0.3} />
      <Circle cx="44" cy="42" r="1.2" fill={color} opacity={0.3} />
      <Circle cx="48" cy="40" r="1.2" fill={color} opacity={0.3} />
      <Ellipse cx="41" cy="35" rx="2" ry="1.2" fill="white" opacity={0.3} transform="rotate(-30 41 35)" />
    </Svg>
  );
}

export function AgeIcon({ size = 28, color = "#8FAF72" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="14 14 60 60" fill="none">
      {/* Soil mound */}
      <Ellipse cx="44" cy="70" rx="26" ry="8" fill={color} opacity={0.15} />
      <Ellipse cx="44" cy="68" rx="26" ry="6" fill={color} opacity={0.2} />
      {/* Soil dots */}
      <Circle cx="34" cy="68" r="1.5" fill={color} opacity={0.15} />
      <Circle cx="44" cy="70" r="1.5" fill={color} opacity={0.15} />
      <Circle cx="54" cy="67" r="1.5" fill={color} opacity={0.15} />
      {/* Stem */}
      <Path d="M44 68 C44 68 42 55 44 42 C44 40 44 36 44 32" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity={0.5} />
      {/* Left leaf */}
      <Path d="M44 50 C44 50 30 46 24 36 C24 36 28 30 38 34 C42 36 44 42 44 50 Z" fill={color} opacity={0.35} />
      <Path d="M44 50 C40 44 32 38 26 36" stroke={color} strokeWidth="0.8" fill="none" opacity={0.25} />
      {/* Right leaf */}
      <Path d="M44 42 C44 42 56 36 64 26 C64 26 60 20 50 24 C46 26 44 34 44 42 Z" fill={color} opacity={0.3} />
      <Path d="M44 42 C48 36 56 28 63 26" stroke={color} strokeWidth="0.8" fill="none" opacity={0.25} />
      {/* Small top leaf */}
      <Path d="M44 32 C44 32 50 26 52 20 C52 20 46 18 44 24 C43 27 44 30 44 32 Z" fill={color} opacity={0.25} />
      {/* Sprout tip */}
      <Ellipse cx="44" cy="20" rx="3" ry="5" fill={color} opacity={0.2} transform="rotate(-10 44 20)" />
      {/* Dew drops */}
      <Ellipse cx="30" cy="40" rx="2" ry="2.8" fill={color} opacity={0.15} transform="rotate(15 30 40)" />
      <Ellipse cx="58" cy="32" rx="1.5" ry="2.2" fill={color} opacity={0.12} transform="rotate(-10 58 32)" />
    </Svg>
  );
}

export function JournalSinceIcon({ size = 28, color = "#5A8FC9" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="8 14 72 64" fill="none">
      {/* Book shadow */}
      <Ellipse cx="44" cy="74" rx="30" ry="4" fill={color} opacity={0.08} />
      {/* Left cover */}
      <Path d="M14 24 C14 22 16 20 18 20 L44 20 L44 70 L18 70 C16 70 14 68 14 66 Z" fill={color} opacity={0.15} stroke={color} strokeWidth="1.5" />
      {/* Right cover */}
      <Path d="M74 24 C74 22 72 20 70 20 L44 20 L44 70 L70 70 C72 70 74 68 74 66 Z" fill={color} opacity={0.15} stroke={color} strokeWidth="1.5" />
      {/* Left page */}
      <Path d="M16 26 C16 24 18 22 20 22 L44 22 L44 68 L20 68 C18 68 16 66 16 64 Z" fill={color} opacity={0.05} />
      {/* Right page */}
      <Path d="M72 26 C72 24 70 22 68 22 L44 22 L44 68 L68 68 C70 68 72 66 72 64 Z" fill={color} opacity={0.05} />
      {/* Spine */}
      <Rect x="42" y="20" width="4" height="50" fill={color} opacity={0.35} />
      <Rect x="42.5" y="20" width="1" height="50" fill="white" opacity={0.15} />
      {/* Left page lines */}
      <Line x1="22" y1="32" x2="40" y2="32" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.3} />
      <Line x1="22" y1="38" x2="40" y2="38" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.3} />
      <Line x1="22" y1="44" x2="40" y2="44" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.3} />
      <Line x1="22" y1="50" x2="40" y2="50" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.3} />
      <Line x1="22" y1="56" x2="36" y2="56" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.3} />
      {/* Right page lines */}
      <Line x1="48" y1="32" x2="66" y2="32" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.3} />
      <Line x1="48" y1="38" x2="66" y2="38" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.3} />
      <Line x1="48" y1="44" x2="66" y2="44" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.3} />
      <Line x1="48" y1="50" x2="66" y2="50" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.3} />
      <Line x1="48" y1="56" x2="60" y2="56" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.3} />
      {/* Bookmark ribbon */}
      <Path d="M64 20 L64 38 L60 34 L56 38 L56 20 Z" fill={color} opacity={0.3} />
      {/* Page curl */}
      <Path d="M68 68 Q74 64 72 58" stroke={color} strokeWidth="1" fill="none" opacity={0.2} />
      {/* Star on left page */}
      <Path d="M30 26 L31 28.4 L33.4 28.4 L31.6 29.8 L32.4 32.2 L30 30.8 L27.6 32.2 L28.4 29.8 L26.6 28.4 L29 28.4 Z" fill={color} opacity={0.25} />
    </Svg>
  );
}
