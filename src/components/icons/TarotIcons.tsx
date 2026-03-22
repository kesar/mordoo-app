import React from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { colors } from '@/src/constants/colors';

type IconProps = { size?: number; color?: string };

// ─── Moved from oracle/index.tsx ─────────────────────────────────────────────

export function StarIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </Svg>
  );
}

export function LockIcon({ size = 24, color = 'rgba(228,225,240,0.5)' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
    </Svg>
  );
}

export function BambooIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2v20M12 6c-2 0-4-1-5-3M12 6c2 0 4-1 5-3M12 12c-2 0-4-1-5-3M12 12c2 0 4-1 5-3M12 18c-2 0-4-1-5-3M12 18c2 0 4-1 5-3" />
    </Svg>
  );
}

// ─── Moved from oracle/index.tsx (send button) ──────────────────────────────

export function SendArrowIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </Svg>
  );
}

// ─── Moved from (main)/_layout.tsx (tab bar) ────────────────────────────────

export function OracleHeartIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
  );
}

// ─── New icons — tarot-inspired geometry ─────────────────────────────────────

export function CalendarIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={4} width={18} height={18} rx={2} />
      <Line x1={16} y1={2} x2={16} y2={6} />
      <Line x1={8} y1={2} x2={8} y2={6} />
      <Line x1={3} y1={10} x2={21} y2={10} />
      <Path d="M15 16a2 2 0 1 1-2-2" />
    </Svg>
  );
}

export function LocationPinIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <Path d="M12 6l1.5 2.5L16 9l-2.5 1.5L12 13l-1.5-2.5L8 9l2.5-1.5L12 6z" />
    </Svg>
  );
}

export function SearchIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={11} cy={11} r={7} />
      <Line x1={16.5} y1={16.5} x2={21} y2={21} />
    </Svg>
  );
}

export function InfoCircleIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={10} />
      <Line x1={12} y1={16} x2={12} y2={12} />
      <Circle cx={12} cy={8} r={0.5} fill={color} />
    </Svg>
  );
}

export function SparkleIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 0L13.8 8.2L20 4L15.8 10.2L24 12L15.8 13.8L20 20L13.8 15.8L12 24L10.2 15.8L4 20L8.2 13.8L0 12L8.2 10.2L4 4L10.2 8.2L12 0Z" />
    </Svg>
  );
}

export function ArrowRightIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={5} y1={12} x2={19} y2={12} />
      <Path d="M14 7l5 5-5 5" />
    </Svg>
  );
}

export function ArrowLeftIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={19} y1={12} x2={5} y2={12} />
      <Path d="M10 17l-5-5 5-5" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 6l-6 6 6 6" />
    </Svg>
  );
}

export function QuoteIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.186 11 15c0 1.933-1.567 3.5-3.5 3.5-1.196 0-2.322-.58-2.917-1.179zM16.583 17.321C15.553 16.227 15 15 15 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C21.591 11.69 23 13.186 23 15c0 1.933-1.567 3.5-3.5 3.5-1.196 0-2.322-.58-2.917-1.179z" />
    </Svg>
  );
}

export function BusinessStarIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2l2.939 6.243L22 9.24l-5 5.014L18.18 22 12 18.69 5.82 22 7 14.254l-5-5.014 7.061-.997L12 2z" />
    </Svg>
  );
}

export function HeartIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
  );
}

export function BodyDiamondIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2L22 12L12 22L2 12L12 2Z" />
    </Svg>
  );
}

export function CheckIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 13l4 4L19 7" />
    </Svg>
  );
}
