import React from "react";
import Svg, {
  Rect,
  Path,
  Circle,
  Ellipse,
  Line,
  Text as SvgText,
} from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export function FeedIcon({ size = 32, color = "#6B5B4F" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="24 6 40 74" fill="none">
      <Rect x="30" y="30" width="28" height="46" rx="12" fill={color} opacity={0.2} stroke={color} strokeWidth="2.5" />
      <Rect x="32" y="52" width="24" height="22" rx="9" fill={color} opacity={0.3} />
      <Rect x="28" y="25" width="32" height="10" rx="5" fill={color} opacity={0.25} stroke={color} strokeWidth="2" />
      <Path d="M38 25 C38 18 50 18 50 25" fill={color} opacity={0.5} />
      <Ellipse cx="44" cy="17" rx="5" ry="7" fill={color} opacity={0.45} />
      <Rect x="35" y="34" width="5" height="18" rx="2.5" fill={color} opacity={0.15} />
      <Line x1="54" y1="42" x2="58" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.6} />
      <Line x1="54" y1="50" x2="58" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.6} />
      <Line x1="54" y1="58" x2="58" y2="58" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.6} />
      <Circle cx="44" cy="11" r="1.5" fill={color} opacity={0.65} />
    </Svg>
  );
}

export function SleepIcon({ size = 32, color = "#6B5B4F" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="14 10 62 70" fill="none">
      <Path
        d="M52 18 C38 20 28 32 30 46 C32 60 44 68 56 66 C44 70 28 62 24 48 C20 34 30 18 44 16 C47 15.5 50 16.5 52 18 Z"
        fill={color}
        opacity={0.2}
        stroke={color}
        strokeWidth="1.8"
      />
      <Ellipse
        cx="36"
        cy="35"
        rx="4"
        ry="7"
        fill={color}
        opacity={0.06}
        transform="rotate(-20 36 35)"
      />
      <Path
        d="M62 20 L63.5 24.5 L68 26 L63.5 27.5 L62 32 L60.5 27.5 L56 26 L60.5 24.5 Z"
        fill={color}
        opacity={0.6}
      />
      <Path
        d="M68 38 L68.8 40.4 L71.2 41.2 L68.8 42 L68 44.4 L67.2 42 L64.8 41.2 L67.2 40.4 Z"
        fill={color}
        opacity={0.45}
      />
      <Path
        d="M58 12 L58.6 13.8 L60.4 14.4 L58.6 15 L58 16.8 L57.4 15 L55.6 14.4 L57.4 13.8 Z"
        fill={color}
        opacity={0.35}
      />
      <Ellipse cx="38" cy="72" rx="16" ry="8" fill={color} opacity={0.06} />
      <Ellipse cx="30" cy="72" rx="10" ry="7" fill={color} opacity={0.06} />
      <Ellipse cx="50" cy="73" rx="12" ry="7" fill={color} opacity={0.06} />
      <SvgText
        x="56"
        y="52"
        fontFamily="Georgia, serif"
        fontSize="10"
        fontWeight="bold"
        fill={color}
        opacity={0.5}
      >
        z
      </SvgText>
      <SvgText
        x="62"
        y="43"
        fontFamily="Georgia, serif"
        fontSize="8"
        fontWeight="bold"
        fill={color}
        opacity={0.35}
      >
        z
      </SvgText>
      <SvgText
        x="66"
        y="34"
        fontFamily="Georgia, serif"
        fontSize="6"
        fontWeight="bold"
        fill={color}
        opacity={0.25}
      >
        z
      </SvgText>
    </Svg>
  );
}

export function DiaperIcon({ size = 32, color = "#6B5B4F" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="6 22 76 50" fill="none">
      <Path
        d="M14 34 C14 30 18 28 22 28 L66 28 C70 28 74 30 74 34 L74 58 C74 62 70 64 66 64 L22 64 C18 64 14 62 14 58 Z"
        fill={color}
        opacity={0.08}
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M14 34 Q44 44 74 34"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity={0.4}
      />
      <Path
        d="M22 64 Q44 56 66 64"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity={0.4}
      />
      <Rect
        x="10"
        y="28"
        width="14"
        height="10"
        rx="5"
        fill={color}
        opacity={0.35}
      />
      <Circle cx="14" cy="33" r="2.5" fill="white" opacity={0.4} />
      <Rect
        x="64"
        y="28"
        width="14"
        height="10"
        rx="5"
        fill={color}
        opacity={0.35}
      />
      <Circle cx="74" cy="33" r="2.5" fill="white" opacity={0.4} />
      <Path
        d="M14 56 Q18 52 22 56"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="2,2"
        opacity={0.3}
      />
      <Path
        d="M66 56 Q70 52 74 56"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="2,2"
        opacity={0.3}
      />
      <Rect
        x="38"
        y="50"
        width="12"
        height="5"
        rx="2.5"
        fill={color}
        opacity={0.15}
      />
      <Path
        d="M34 38 L34.7 40.1 L36.8 40.8 L34.7 41.5 L34 43.6 L33.3 41.5 L31.2 40.8 L33.3 40.1 Z"
        fill={color}
        opacity={0.2}
      />
      <Path
        d="M52 36 L52.5 37.6 L54.1 38.1 L52.5 38.6 L52 40.2 L51.5 38.6 L49.9 38.1 L51.5 37.6 Z"
        fill={color}
        opacity={0.15}
      />
      <Circle cx="44" cy="44" r="1.5" fill={color} opacity={0.15} />
    </Svg>
  );
}

export function MomentIcon({ size = 32, color = "#6B5B4F" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="8 20 72 58" fill="none">
      <Rect
        x="12"
        y="32"
        width="64"
        height="44"
        rx="10"
        fill={color}
        opacity={0.1}
        stroke={color}
        strokeWidth="2"
      />
      <Rect
        x="30"
        y="24"
        width="28"
        height="14"
        rx="7"
        fill={color}
        opacity={0.15}
      />
      <Rect
        x="14"
        y="28"
        width="12"
        height="8"
        rx="4"
        fill={color}
        opacity={0.2}
      />
      <Circle
        cx="44"
        cy="54"
        r="16"
        fill={color}
        opacity={0.08}
        stroke={color}
        strokeWidth="1.5"
      />
      <Circle
        cx="44"
        cy="54"
        r="12"
        fill={color}
        opacity={0.12}
      />
      <Circle
        cx="44"
        cy="54"
        r="8"
        fill={color}
        opacity={0.06}
        stroke={color}
        strokeWidth="1"
      />
      <Circle cx="44" cy="54" r="4" fill={color} opacity={0.25} />
      <Ellipse
        cx="40"
        cy="50"
        rx="2.5"
        ry="1.5"
        fill="white"
        opacity={0.35}
        transform="rotate(-30 40 50)"
      />
      <Circle cx="62" cy="32" r="5" fill={color} opacity={0.18} />
      <Circle cx="62" cy="32" r="3" fill={color} opacity={0.12} />
      <Circle cx="68" cy="22" r="10" fill={color} opacity={0.25} />
      <Path
        d="M68 26 C68 26 63 22.5 63 20 C63 18 64.5 17 66 17.5 C67 17.8 68 18.8 68 18.8 C68 18.8 69 17.8 70 17.5 C71.5 17 73 18 73 20 C73 22.5 68 26 68 26 Z"
        fill="white"
        opacity={0.7}
      />
      <Rect
        x="14"
        y="34"
        width="5"
        height="8"
        rx="2"
        fill={color}
        opacity={0.15}
      />
      <Rect
        x="69"
        y="34"
        width="5"
        height="8"
        rx="2"
        fill={color}
        opacity={0.15}
      />
    </Svg>
  );
}

export function HealthIcon({ size = 32, color = "#6B5B4F" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="12 6 64 76" fill="none">
      <Path
        d="M44 10 L70 22 L70 48 C70 62 58 72 44 78 C30 72 18 62 18 48 L18 22 Z"
        fill={color}
        opacity={0.08}
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M44 16 L64 26 L64 48 C64 59 55 67 44 72 C33 67 24 59 24 48 L24 26 Z"
        fill={color}
        opacity={0.04}
      />
      <Rect x="36" y="28" width="16" height="36" rx="5" fill={color} opacity={0.3} />
      <Rect x="26" y="38" width="36" height="16" rx="5" fill={color} opacity={0.3} />
      <Rect
        x="38"
        y="30"
        width="5"
        height="12"
        rx="2.5"
        fill="white"
        opacity={0.2}
      />
      <Path
        d="M24 58 L32 58 L35 52 L38 64 L41 54 L44 58 L47 58 L50 52 L53 62 L56 58 L64 58"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
      />
      <Path
        d="M44 21 C44 21 41.5 18.5 39.8 19.8 C38 21 38 23.5 40.5 25.5 L44 28 L47.5 25.5 C50 23.5 50 21 48.2 19.8 C46.5 18.5 44 21 44 21 Z"
        fill={color}
        opacity={0.25}
      />
    </Svg>
  );
}

export const BottleIcon = FeedIcon;

export function BreastMilkIcon({ size = 32, color = "#C2185B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="10 6 68 82" fill="none">
      {/* Mother body */}
      <Path d="M16 88 L16 54 C16 48 22 44 30 44 L52 44 C58 44 64 48 64 54 L64 88 Z" fill={color} opacity={0.35} />
      <Path d="M16 56 C16 50 22 46 30 46 L40 46 C36 50 32 56 30 60 L16 64 Z" fill="white" opacity={0.1} />
      {/* Mother head */}
      <Circle cx="36" cy="22" r="13" fill={color} opacity={0.3} stroke={color} strokeWidth="2" />
      {/* Hair */}
      <Path d="M23 22 C23 14 28 10 36 10 C44 10 49 14 49 22 C49 16 46 12 36 12 C26 12 23 18 23 22 Z" fill={color} opacity={0.6} />
      <Path d="M24 26 C22 32 22 40 26 44" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity={0.5} />
      {/* Face */}
      <Ellipse cx="31" cy="22" rx="1.5" ry="2" fill={color} opacity={0.7} />
      <Ellipse cx="41" cy="22" rx="1.5" ry="2" fill={color} opacity={0.7} />
      <Path d="M32 28 Q36 32 40 28" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={0.5} />
      {/* Cheeks */}
      <Ellipse cx="28" cy="26" rx="3" ry="2" fill={color} opacity={0.2} />
      <Ellipse cx="44" cy="26" rx="3" ry="2" fill={color} opacity={0.2} />
      {/* Arm cradling */}
      <Path d="M16 58 C16 58 18 70 24 74 L50 74 C54 74 58 70 60 66 L64 56" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" opacity={0.3} />
      {/* Baby body */}
      <Ellipse cx="50" cy="62" rx="16" ry="10" fill={color} opacity={0.25} transform="rotate(-10 50 62)" />
      {/* Baby head */}
      <Circle cx="62" cy="54" r="9" fill={color} opacity={0.3} stroke={color} strokeWidth="1.5" />
      {/* Baby hair */}
      <Path d="M56 46 Q60 43 64 46" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={0.45} />
      <Path d="M60 44 Q62 41 65 44" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={0.45} />
      {/* Baby eyes closed */}
      <Path d="M58 54 Q60 52 62 54" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={0.55} />
      <Path d="M63 55 Q65 53 67 55" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={0.55} />
      {/* Heart */}
      <Path d="M70 18 C70 18 67 15 65 16.5 C63 18 63 21 65.5 23 L70 27 L74.5 23 C77 21 77 18 75 16.5 C73 15 70 18 70 18 Z" fill={color} opacity={0.7} />
      {/* Milk drop */}
      <Path d="M42 40 C42 40 40 36 40 34 C40 32 41 31 42 31 C43 31 44 32 44 34 C44 36 42 40 42 40 Z" fill={color} opacity={0.4} />
    </Svg>
  );
}

export function FormulaIcon({ size = 32, color = "#3A9ED8" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="8 12 72 70" fill="none">
      {/* Can body */}
      <Rect x="18" y="30" width="48" height="46" rx="8" fill={color} opacity={0.2} stroke={color} strokeWidth="2" />
      <Rect x="20" y="32" width="8" height="42" rx="4" fill="white" opacity={0.12} />
      {/* Label band */}
      <Rect x="18" y="40" width="48" height="26" fill={color} opacity={0.3} />
      <Rect x="18" y="40" width="48" height="2" fill={color} opacity={0.15} />
      <Rect x="18" y="64" width="48" height="2" fill={color} opacity={0.15} />
      {/* Label logo area */}
      <Ellipse cx="42" cy="53" rx="14" ry="10" fill="white" opacity={0.1} />
      <Circle cx="42" cy="51" r="7" fill="white" opacity={0.18} />
      <Path d="M38 51 Q42 55 46 51" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={0.65} />
      <Circle cx="39.5" cy="49" r="1.2" fill={color} opacity={0.6} />
      <Circle cx="44.5" cy="49" r="1.2" fill={color} opacity={0.6} />
      {/* Stars on label */}
      <Path d="M24 50 L24.5 51.5 L26 52 L24.5 52.5 L24 54 L23.5 52.5 L22 52 L23.5 51.5 Z" fill={color} opacity={0.45} />
      <Path d="M58 50 L58.5 51.5 L60 52 L58.5 52.5 L58 54 L57.5 52.5 L56 52 L57.5 51.5 Z" fill={color} opacity={0.45} />
      {/* Lid */}
      <Rect x="16" y="24" width="52" height="10" rx="5" fill={color} opacity={0.2} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="42" cy="24" rx="26" ry="4" fill={color} opacity={0.15} />
      <Ellipse cx="42" cy="34" rx="26" ry="3" fill={color} opacity={0.1} />
      {/* Scoop handle */}
      <Path d="M56 28 C60 20 68 16 70 20 C72 24 66 28 62 30" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity={0.5} />
      {/* Scoop bowl */}
      <Ellipse cx="58" cy="30" rx="7" ry="5" fill={color} opacity={0.25} stroke={color} strokeWidth="1.2" />
      <Ellipse cx="58" cy="29" rx="5" ry="3" fill={color} opacity={0.15} />
      {/* Bottom rim */}
      <Rect x="18" y="72" width="48" height="4" rx="4" fill={color} opacity={0.3} />
      {/* Floating dots */}
      <Circle cx="14" cy="44" r="2" fill={color} opacity={0.3} />
      <Circle cx="72" cy="38" r="1.5" fill={color} opacity={0.25} />
    </Svg>
  );
}

export function OtherLiquidIcon({ size = 32, color = "#7B1FA2" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="8 4 72 80" fill="none">
      {/* Drops */}
      <Path d="M22 20 C22 20 18 14 18 12 C18 9.8 19.8 8 22 8 C24.2 8 26 9.8 26 12 C26 14 22 20 22 20 Z" fill={color} opacity={0.45} />
      <Path d="M66 22 C66 22 62 16 62 14 C62 11.8 63.8 10 66 10 C68.2 10 70 11.8 70 14 C70 16 66 22 66 22 Z" fill={color} opacity={0.45} />
      <Path d="M20 70 C20 70 16 64 16 62 C16 59.8 17.8 58 20 58 C22.2 58 24 59.8 24 62 C24 64 20 70 20 70 Z" fill={color} opacity={0.45} />
      <Path d="M68 72 C68 72 64 66 64 64 C64 61.8 65.8 60 68 60 C70.2 60 72 61.8 72 64 C72 66 68 72 68 72 Z" fill={color} opacity={0.45} />
      {/* Scattered dots */}
      <Circle cx="34" cy="14" r="3" fill={color} opacity={0.3} />
      <Circle cx="54" cy="74" r="3" fill={color} opacity={0.3} />
      <Circle cx="14" cy="36" r="2.5" fill={color} opacity={0.3} />
      <Circle cx="74" cy="52" r="2.5" fill={color} opacity={0.3} />
      {/* Center circles */}
      <Circle cx="44" cy="44" r="26" fill={color} opacity={0.08} />
      <Circle cx="44" cy="44" r="20" fill={color} opacity={0.1} />
      {/* Plus shape */}
      <Rect x="36" y="24" width="16" height="40" rx="8" fill={color} opacity={0.55} />
      <Rect x="24" y="36" width="40" height="16" rx="8" fill={color} opacity={0.55} />
      {/* Plus shine */}
      <Rect x="38" y="26" width="5" height="14" rx="2.5" fill="white" opacity={0.2} />
      <Rect x="26" y="38" width="14" height="5" rx="2.5" fill="white" opacity={0.2} />
      {/* Center dot */}
      <Circle cx="44" cy="44" r="5" fill="white" opacity={0.25} />
    </Svg>
  );
}

// ── Sleep modal icons ─────────────────────────────────────────────────────────

export function StartTimerIcon({ size = 24, color = "#5A8FC9" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="10 4 68 82" fill="none">
      {/* Crown / top button */}
      <Rect x="36" y="8" width="16" height="6" rx="3" fill={color} opacity={0.45} />
      <Rect x="38" y="10" width="12" height="8" rx="4" fill={color} opacity={0.4} />
      {/* Side buttons */}
      <Rect x="14" y="30" width="6" height="10" rx="3" fill={color} opacity={0.35} />
      <Rect x="68" y="30" width="6" height="10" rx="3" fill={color} opacity={0.35} />
      {/* Outer ring */}
      <Circle cx="44" cy="54" r="32" fill={color} opacity={0.25} />
      {/* Inner body */}
      <Circle cx="44" cy="54" r="27" fill="white" opacity={0.6} />
      <Circle cx="44" cy="54" r="27" fill="none" stroke={color} strokeWidth="1.5" opacity={0.35} />
      {/* Tick marks */}
      <Line x1="44" y1="30" x2="44" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.5} />
      <Line x1="44" y1="74" x2="44" y2="78" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.5} />
      <Line x1="20" y1="54" x2="24" y2="54" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.5} />
      <Line x1="64" y1="54" x2="68" y2="54" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.5} />
      {/* Diagonal ticks */}
      <Line x1="28" y1="36" x2="30.8" y2="38.8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.35} />
      <Line x1="60" y1="36" x2="57.2" y2="38.8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.35} />
      <Line x1="28" y1="72" x2="30.8" y2="69.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.35} />
      <Line x1="60" y1="72" x2="57.2" y2="69.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.35} />
      {/* Minute hand */}
      <Line x1="44" y1="54" x2="44" y2="36" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity={0.65} />
      {/* Hour hand */}
      <Line x1="44" y1="54" x2="56" y2="46" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.6} />
      {/* Center dot */}
      <Circle cx="44" cy="54" r="3.5" fill={color} opacity={0.55} />
      <Circle cx="44" cy="54" r="1.5" fill="white" opacity={0.7} />
      {/* Shine */}
      <Ellipse cx="35" cy="44" rx="5" ry="8" fill="white" opacity={0.2} transform="rotate(-20 35 44)" />
    </Svg>
  );
}

export function LogPastSleepIcon({ size = 24, color = "#5A8FC9" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="8 6 74 80" fill="none">
      {/* Notepad shadow */}
      <Rect x="17" y="15" width="50" height="62" rx="7" fill={color} opacity={0.08} />
      {/* Notepad body */}
      <Rect x="14" y="12" width="50" height="62" rx="7" fill="white" opacity={0.6} stroke={color} strokeWidth="1.2" />
      {/* Spiral binding */}
      <Rect x="12" y="12" width="6" height="62" rx="3" fill={color} opacity={0.15} />
      {/* Spiral coils */}
      <Circle cx="15" cy="22" r="4" fill="none" stroke={color} strokeWidth="2" opacity={0.35} />
      <Circle cx="15" cy="34" r="4" fill="none" stroke={color} strokeWidth="2" opacity={0.35} />
      <Circle cx="15" cy="46" r="4" fill="none" stroke={color} strokeWidth="2" opacity={0.35} />
      <Circle cx="15" cy="58" r="4" fill="none" stroke={color} strokeWidth="2" opacity={0.35} />
      <Circle cx="15" cy="70" r="4" fill="none" stroke={color} strokeWidth="2" opacity={0.35} />
      {/* Lines on notepad */}
      <Line x1="24" y1="28" x2="56" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.25} />
      <Line x1="24" y1="36" x2="56" y2="36" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.25} />
      <Line x1="24" y1="44" x2="50" y2="44" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.25} />
      <Line x1="24" y1="52" x2="54" y2="52" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.25} />
      <Line x1="24" y1="60" x2="46" y2="60" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.25} />
      {/* Moon on notepad */}
      <Path d="M52 18 C46 19 42 24 43 30 C44 36 50 39 56 37 C50 40 42 36 40 30 C38 24 43 18 49 17 C50 16.8 51 17.3 52 18 Z" fill={color} opacity={0.4} />
      {/* Pencil body */}
      <Rect x="58" y="46" width="10" height="34" rx="3" fill={color} opacity={0.35} transform="rotate(-40 58 46)" />
      {/* Pencil tip */}
      <Path d="M72 70 L76 80 L68 78 Z" fill={color} opacity={0.4} transform="rotate(-40 72 70)" />
      <Path d="M72 70 L76 80 L74 75 Z" fill={color} opacity={0.6} transform="rotate(-40 72 70)" />
      {/* Pencil eraser */}
      <Rect x="57" y="42" width="10" height="5" rx="2" fill={color} opacity={0.3} transform="rotate(-40 57 42)" />
      {/* Pencil shine */}
      <Rect x="60" y="48" width="2.5" height="20" rx="1.2" fill="white" opacity={0.25} transform="rotate(-40 60 48)" />
    </Svg>
  );
}
