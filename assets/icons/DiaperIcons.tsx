import React from "react";
import Svg, {
  Rect,
  Path,
  Circle,
  Ellipse,
} from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

// ── Diaper type icons ─────────────────────────────────────────────────────────

export function WetIcon({ size = 28, color = "#1A7EC8" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="16 8 56 72" fill="none">
      <Path d="M44 12 C44 12 22 38 22 54 C22 66 32 76 44 76 C56 76 66 66 66 54 C66 38 44 12 44 12 Z" fill={color} opacity={0.5} stroke={color} strokeWidth="2" />
      <Ellipse cx="36" cy="42" rx="5" ry="9" fill="white" opacity={0.3} transform="rotate(-20 36 42)" />
      <Ellipse cx="50" cy="62" rx="3" ry="5" fill="white" opacity={0.2} transform="rotate(-10 50 62)" />
    </Svg>
  );
}

export function DirtyIcon({ size = 28, color = "#8B5E2A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="14 12 60 68" fill="none">
      <Ellipse cx="44" cy="68" rx="22" ry="10" fill={color} opacity={0.5} />
      <Ellipse cx="44" cy="56" rx="17" ry="14" fill={color} opacity={0.55} />
      <Ellipse cx="44" cy="44" rx="13" ry="12" fill={color} opacity={0.6} />
      <Path d="M44 18 C44 18 36 22 36 30 C36 36 40 38 44 38 C48 38 52 36 52 32 C52 28 48 26 44 26 C41 26 39 28 39 30" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" opacity={0.6} />
      <Circle cx="44" cy="18" r="5" fill={color} opacity={0.6} />
      <Circle cx="39" cy="50" r="3" fill="white" opacity={0.8} />
      <Circle cx="49" cy="50" r="3" fill="white" opacity={0.8} />
      <Circle cx="40" cy="50" r="1.5" fill={color} opacity={0.8} />
      <Circle cx="50" cy="50" r="1.5" fill={color} opacity={0.8} />
      <Path d="M38 57 Q44 62 50 57" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity={0.6} />
    </Svg>
  );
}

export function BothIcon({ size = 28, color = "#1A7EC8" }: IconProps) {
  const poopColor = "#8B5E2A";
  return (
    <Svg width={size} height={size} viewBox="4 10 80 68" fill="none">
      {/* Water drop (left) */}
      <Path d="M26 14 C26 14 10 34 10 46 C10 55 17 63 26 63 C35 63 42 55 42 46 C42 34 26 14 26 14 Z" fill={color} opacity={0.5} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="19" cy="32" rx="3.5" ry="7" fill="white" opacity={0.3} transform="rotate(-20 19 32)" />
      {/* Poop (right) */}
      <Ellipse cx="64" cy="68" rx="16" ry="7" fill={poopColor} opacity={0.5} />
      <Ellipse cx="64" cy="58" rx="12" ry="10" fill={poopColor} opacity={0.55} />
      <Ellipse cx="64" cy="48" rx="9" ry="8" fill={poopColor} opacity={0.6} />
      <Path d="M64 24 C64 24 58 27 58 33 C58 37 61 39 64 39 C67 39 70 37 70 34 C70 31 67 29 64 29 C62 29 61 31 61 33" stroke={poopColor} strokeWidth="3" fill="none" strokeLinecap="round" opacity={0.6} />
      <Circle cx="64" cy="24" r="4" fill={poopColor} opacity={0.6} />
      <Circle cx="60" cy="51" r="2" fill="white" opacity={0.8} />
      <Circle cx="68" cy="51" r="2" fill="white" opacity={0.8} />
      <Circle cx="60.8" cy="51" r="1" fill={poopColor} opacity={0.8} />
      <Circle cx="68.8" cy="51" r="1" fill={poopColor} opacity={0.8} />
      {/* Plus sign */}
      <Rect x="43" y="40" width="4" height="14" rx="2" fill={color} opacity={0.4} />
      <Rect x="39" y="44" width="12" height="4" rx="2" fill={color} opacity={0.4} />
    </Svg>
  );
}

// ── Amount icons ──────────────────────────────────────────────────────────────

export function LittleIcon({ size = 28, color = "#1A7EC8" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="28 20 32 48" fill="none">
      <Path d="M44 26 C44 26 34 40 34 50 C34 56 38 62 44 62 C50 62 54 56 54 50 C54 40 44 26 44 26 Z" fill={color} opacity={0.5} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="39" cy="40" rx="3" ry="6" fill="white" opacity={0.3} transform="rotate(-20 39 40)" />
    </Svg>
  );
}

export function MediumIcon({ size = 28, color = "#1A7EC8" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="12 14 64 58" fill="none">
      <Path d="M31 20 C31 20 18 38 18 50 C18 58 24 66 31 66 C38 66 44 58 44 50 C44 38 31 20 31 20 Z" fill={color} opacity={0.5} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="24" cy="36" rx="3" ry="7" fill="white" opacity={0.3} transform="rotate(-20 24 36)" />
      <Path d="M57 28 C57 28 48 42 48 52 C48 58 52 64 57 64 C62 64 66 58 66 52 C66 42 57 28 57 28 Z" fill={color} opacity={0.4} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="51" cy="40" rx="2.5" ry="6" fill="white" opacity={0.3} transform="rotate(-20 51 40)" />
    </Svg>
  );
}

export function LotIcon({ size = 28, color = "#1A7EC8" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="8 10 72 62" fill="none">
      <Path d="M25 22 C25 22 14 38 14 48 C14 56 19 63 25 63 C31 63 36 56 36 48 C36 38 25 22 25 22 Z" fill={color} opacity={0.45} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="19" cy="36" rx="2.5" ry="6" fill="white" opacity={0.3} transform="rotate(-20 19 36)" />
      <Path d="M44 14 C44 14 34 34 34 48 C34 57 38 66 44 66 C50 66 54 57 54 48 C54 34 44 14 44 14 Z" fill={color} opacity={0.55} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="38" cy="32" rx="3" ry="7" fill="white" opacity={0.3} transform="rotate(-20 38 32)" />
      <Path d="M63 22 C63 22 52 38 52 48 C52 56 57 63 63 63 C69 63 74 56 74 48 C74 38 63 22 63 22 Z" fill={color} opacity={0.4} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="57" cy="36" rx="2.5" ry="6" fill="white" opacity={0.3} transform="rotate(-20 57 36)" />
      <Circle cx="10" cy="60" r="3" fill={color} opacity={0.35} />
      <Circle cx="78" cy="58" r="3" fill={color} opacity={0.35} />
      <Circle cx="44" cy="72" r="2.5" fill={color} opacity={0.3} />
    </Svg>
  );
}

// ── Dirty amount icons (poop-shaped) ──────────────────────────────────────────

export function DirtyLittleIcon({ size = 28, color = "#8B5E2A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="26 24 36 46" fill="none">
      <Ellipse cx="44" cy="64" rx="12" ry="5" fill={color} opacity={0.45} />
      <Ellipse cx="44" cy="56" rx="9" ry="8" fill={color} opacity={0.5} />
      <Ellipse cx="44" cy="46" rx="7" ry="6" fill={color} opacity={0.55} />
      <Path d="M44 28 C44 28 39 31 39 35 C39 38 41 39 44 39 C47 39 49 37 49 35 C49 32 46 30 44 30 C43 30 42 31 42 32" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity={0.55} />
      <Circle cx="44" cy="28" r="3" fill={color} opacity={0.55} />
      <Ellipse cx="40" cy="54" rx="2" ry="3" fill="white" opacity={0.2} transform="rotate(-20 40 54)" />
    </Svg>
  );
}

export function DirtyMediumIcon({ size = 28, color = "#8B5E2A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="8 22 72 50" fill="none">
      {/* Left poop */}
      <Ellipse cx="28" cy="66" rx="11" ry="5" fill={color} opacity={0.45} />
      <Ellipse cx="28" cy="58" rx="8" ry="7" fill={color} opacity={0.5} />
      <Ellipse cx="28" cy="50" rx="6" ry="5" fill={color} opacity={0.55} />
      <Path d="M28 34 C28 34 24 37 24 40 C24 42 26 43 28 43 C30 43 32 42 32 40 C32 38 30 36 28 36 C27 36 26 37 26 38" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={0.55} />
      <Circle cx="28" cy="34" r="2.5" fill={color} opacity={0.55} />
      {/* Right poop */}
      <Ellipse cx="60" cy="66" rx="11" ry="5" fill={color} opacity={0.4} />
      <Ellipse cx="60" cy="58" rx="8" ry="7" fill={color} opacity={0.45} />
      <Ellipse cx="60" cy="50" rx="6" ry="5" fill={color} opacity={0.5} />
      <Path d="M60 34 C60 34 56 37 56 40 C56 42 58 43 60 43 C62 43 64 42 64 40 C64 38 62 36 60 36 C59 36 58 37 58 38" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={0.5} />
      <Circle cx="60" cy="34" r="2.5" fill={color} opacity={0.5} />
    </Svg>
  );
}

export function DirtyLotIcon({ size = 28, color = "#8B5E2A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="4 20 80 56" fill="none">
      {/* Left poop */}
      <Ellipse cx="20" cy="68" rx="10" ry="4.5" fill={color} opacity={0.4} />
      <Ellipse cx="20" cy="61" rx="7" ry="6" fill={color} opacity={0.45} />
      <Ellipse cx="20" cy="53" rx="5" ry="4.5" fill={color} opacity={0.5} />
      <Path d="M20 38 C20 38 17 40 17 43 C17 45 18 46 20 46 C22 46 23 45 23 43 C23 41 21 39 20 39 C19 39 18 40 18 41" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity={0.5} />
      <Circle cx="20" cy="38" r="2" fill={color} opacity={0.5} />
      {/* Center poop (tallest) */}
      <Ellipse cx="44" cy="68" rx="12" ry="5" fill={color} opacity={0.5} />
      <Ellipse cx="44" cy="59" rx="9" ry="8" fill={color} opacity={0.55} />
      <Ellipse cx="44" cy="49" rx="7" ry="6" fill={color} opacity={0.6} />
      <Path d="M44 30 C44 30 40 33 40 37 C40 39 42 40 44 40 C46 40 48 39 48 37 C48 35 46 33 44 33 C43 33 42 34 42 35" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={0.55} />
      <Circle cx="44" cy="30" r="2.5" fill={color} opacity={0.55} />
      {/* Right poop */}
      <Ellipse cx="68" cy="68" rx="10" ry="4.5" fill={color} opacity={0.4} />
      <Ellipse cx="68" cy="61" rx="7" ry="6" fill={color} opacity={0.45} />
      <Ellipse cx="68" cy="53" rx="5" ry="4.5" fill={color} opacity={0.5} />
      <Path d="M68 38 C68 38 65 40 65 43 C65 45 66 46 68 46 C70 46 71 45 71 43 C71 41 69 39 68 39 C67 39 66 40 66 41" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity={0.5} />
      <Circle cx="68" cy="38" r="2" fill={color} opacity={0.5} />
    </Svg>
  );
}

// ── Poo type icons ────────────────────────────────────────────────────────────

export function SeedyYellowIcon({ size = 28, color = "#E8B800" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="12 12 64 64" fill="none">
      <Circle cx="44" cy="44" r="28" fill={color} opacity={0.5} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="36" cy="36" rx="3" ry="5" fill={color} opacity={0.7} transform="rotate(20 36 36)" />
      <Ellipse cx="50" cy="34" rx="3" ry="5" fill={color} opacity={0.7} transform="rotate(-30 50 34)" />
      <Ellipse cx="32" cy="50" rx="3" ry="5" fill={color} opacity={0.7} transform="rotate(45 32 50)" />
      <Ellipse cx="52" cy="50" rx="3" ry="5" fill={color} opacity={0.7} transform="rotate(-10 52 50)" />
      <Ellipse cx="44" cy="56" rx="3" ry="5" fill={color} opacity={0.7} transform="rotate(60 44 56)" />
      <Ellipse cx="40" cy="44" rx="3" ry="5" fill={color} opacity={0.6} transform="rotate(-50 40 44)" />
      <Ellipse cx="34" cy="32" rx="6" ry="4" fill="white" opacity={0.25} transform="rotate(-30 34 32)" />
    </Svg>
  );
}

export function TanBrownIcon({ size = 28, color = "#A07040" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="12 12 64 64" fill="none">
      <Circle cx="44" cy="44" r="28" fill={color} opacity={0.5} stroke={color} strokeWidth="1.5" />
      <Path d="M32 36 Q44 30 56 36 Q62 42 56 50 Q44 58 32 50 Q26 44 32 36 Z" fill={color} opacity={0.3} />
      <Ellipse cx="38" cy="40" rx="5" ry="8" fill={color} opacity={0.25} transform="rotate(30 38 40)" />
      <Ellipse cx="52" cy="50" rx="4" ry="7" fill={color} opacity={0.2} transform="rotate(-20 52 50)" />
      <Ellipse cx="34" cy="32" rx="7" ry="4" fill="white" opacity={0.2} transform="rotate(-30 34 32)" />
    </Svg>
  );
}

export function GreenIcon({ size = 28, color = "#1E8840" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="12 12 64 64" fill="none">
      <Circle cx="44" cy="44" r="28" fill={color} opacity={0.5} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="38" cy="40" rx="6" ry="10" fill={color} opacity={0.3} transform="rotate(20 38 40)" />
      <Ellipse cx="52" cy="50" rx="5" ry="8" fill={color} opacity={0.25} transform="rotate(-15 52 50)" />
      <Ellipse cx="34" cy="32" rx="7" ry="4" fill="white" opacity={0.25} transform="rotate(-30 34 32)" />
    </Svg>
  );
}

export function OrangeIcon({ size = 28, color = "#E06010" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="12 12 64 64" fill="none">
      <Circle cx="44" cy="44" r="28" fill={color} opacity={0.5} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="38" cy="40" rx="6" ry="10" fill={color} opacity={0.25} transform="rotate(20 38 40)" />
      <Ellipse cx="52" cy="50" rx="5" ry="8" fill={color} opacity={0.2} transform="rotate(-15 52 50)" />
      <Ellipse cx="34" cy="32" rx="7" ry="4" fill="white" opacity={0.25} transform="rotate(-30 34 32)" />
    </Svg>
  );
}

export function WateryRunnyIcon({ size = 28, color = "#4AB0F0" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="16 6 56 82" fill="none">
      <Path d="M44 10 C44 10 28 36 28 54 C28 64 35 74 44 74 C53 74 60 64 60 54 C60 36 44 10 44 10 Z" fill={color} opacity={0.4} stroke={color} strokeWidth="1.5" />
      <Path d="M44 70 C44 70 46 76 46 80 C46 82 45 84 44 84 C43 84 42 82 42 80 C42 76 44 70 44 70 Z" fill={color} opacity={0.35} />
      <Path d="M30 58 C30 58 24 55 22 58 C22 60 24 62 26 61 C28 60 30 58 30 58 Z" fill={color} opacity={0.4} />
      <Path d="M58 58 C58 58 64 55 66 58 C66 60 64 62 62 61 C60 60 58 58 58 58 Z" fill={color} opacity={0.4} />
      <Ellipse cx="44" cy="74" rx="16" ry="4" fill={color} opacity={0.15} />
      <Ellipse cx="37" cy="30" rx="3" ry="8" fill="white" opacity={0.3} transform="rotate(-15 37 30)" />
    </Svg>
  );
}

export function MucousyIcon({ size = 28, color = "#9080C0" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="10 14 68 60" fill="none">
      <Circle cx="34" cy="50" r="18" fill={color} opacity={0.2} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="27" cy="43" rx="5" ry="3" fill="white" opacity={0.4} transform="rotate(-30 27 43)" />
      <Circle cx="58" cy="36" r="14" fill={color} opacity={0.18} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="52" cy="30" rx="4" ry="2.5" fill="white" opacity={0.4} transform="rotate(-30 52 30)" />
      <Circle cx="62" cy="60" r="10" fill={color} opacity={0.16} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="57" cy="55" rx="3" ry="2" fill="white" opacity={0.4} transform="rotate(-30 57 55)" />
      <Path d="M48 50 Q52 44 52 40" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={0.35} />
      <Path d="M50 58 Q56 60 58 58" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={0.35} />
    </Svg>
  );
}

export function BlackDarkIcon({ size = 28, color = "#2A2A34" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="12 12 64 64" fill="none">
      <Circle cx="44" cy="44" r="28" fill={color} opacity={0.65} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="36" cy="38" rx="7" ry="11" fill={color} opacity={0.3} transform="rotate(20 36 38)" />
      <Ellipse cx="54" cy="52" rx="6" ry="9" fill={color} opacity={0.25} transform="rotate(-15 54 52)" />
      <Ellipse cx="34" cy="32" rx="6" ry="3.5" fill="white" opacity={0.12} transform="rotate(-30 34 32)" />
    </Svg>
  );
}

export function BloodRedIcon({ size = 28, color = "#C01020" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="12 12 64 64" fill="none">
      <Circle cx="44" cy="44" r="28" fill={color} opacity={0.55} stroke={color} strokeWidth="1.5" />
      <Ellipse cx="38" cy="40" rx="7" ry="11" fill={color} opacity={0.3} transform="rotate(20 38 40)" />
      <Ellipse cx="52" cy="52" rx="6" ry="9" fill={color} opacity={0.25} transform="rotate(-15 52 52)" />
      <Ellipse cx="34" cy="32" rx="7" ry="4" fill="white" opacity={0.22} transform="rotate(-30 34 32)" />
    </Svg>
  );
}
