/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#10201d',
    background: '#f7faf9',
    backgroundElement: '#eef5f2',
    backgroundSelected: '#dbeee8',
    textSecondary: '#596a65',
    card: '#ffffff',
    border: '#d9e5e1',
    primary: '#0f766e',
    primaryForeground: '#ffffff',
    muted: '#eef5f2',
    danger: '#b42318',
    success: '#15803d',
    warning: '#b7791f',
  },
  dark: {
    text: '#f4faf8',
    background: '#081311',
    backgroundElement: '#132420',
    backgroundSelected: '#1f3a34',
    textSecondary: '#b6c6c1',
    card: '#0d1b18',
    border: '#29443d',
    primary: '#2dd4bf',
    primaryForeground: '#05201c',
    muted: '#132420',
    danger: '#f97066',
    success: '#4ade80',
    warning: '#fbbf24',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
