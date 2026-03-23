import { Dimensions } from 'react-native';

// Base design width (iPhone 16 / 15 / 14 — 393pt)
const BASE_WIDTH = 393;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Scales a value proportionally to screen width.
 * On a 393pt-wide phone, returns the exact input.
 * On smaller phones (e.g., iPhone SE at 375pt), returns a slightly smaller value.
 * On larger phones (e.g., iPhone 16 Pro Max at 440pt), returns a slightly larger value.
 */
export function scale(size: number): number {
  return Math.round((size * SCREEN_WIDTH) / BASE_WIDTH);
}

/**
 * Moderately scales a value — useful for font sizes where you want
 * less aggressive scaling than full proportional.
 * factor=0.5 means halfway between fixed and fully proportional.
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  return Math.round(size + (scale(size) - size) * factor);
}
