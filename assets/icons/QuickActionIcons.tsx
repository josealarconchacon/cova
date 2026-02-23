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
      <Rect
        x="30"
        y="30"
        width="28"
        height="46"
        rx="12"
        fill={color}
        opacity={0.1}
        stroke={color}
        strokeWidth="2"
      />
      <Rect
        x="32"
        y="52"
        width="24"
        height="22"
        rx="9"
        fill={color}
        opacity={0.15}
      />
      <Rect
        x="28"
        y="25"
        width="32"
        height="10"
        rx="5"
        fill={color}
        opacity={0.12}
        stroke={color}
        strokeWidth="1.5"
      />
      <Path d="M38 25 C38 18 50 18 50 25" fill={color} opacity={0.3} />
      <Ellipse cx="44" cy="17" rx="5" ry="7" fill={color} opacity={0.25} />
      <Rect
        x="35"
        y="34"
        width="5"
        height="18"
        rx="2.5"
        fill={color}
        opacity={0.08}
      />
      <Line
        x1="54"
        y1="42"
        x2="58"
        y2="42"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.4}
      />
      <Line
        x1="54"
        y1="50"
        x2="58"
        y2="50"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.4}
      />
      <Line
        x1="54"
        y1="58"
        x2="58"
        y2="58"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.4}
      />
      <Circle cx="44" cy="11" r="1.5" fill={color} opacity={0.45} />
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
