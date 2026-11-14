import React from 'react';
import Svg, { Path } from 'react-native-svg';

const paths = {
  today: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 0 0 0-17Z M12 7.5V12l3 2',
  train: 'M6.5 8v8M3.5 10v4M17.5 8v8M20.5 10v4M6.5 12h11',
  progress: 'M5 19v-7M12 19V6M19 19v-9',
  arrow: 'M7 17L17 7M9 7h8v8',
  close: 'M6 6l12 12M18 6L6 18',
  chevron: 'M6 9l6 6 6-6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
};
export type IconName = keyof typeof paths;

export function Icon({ name, color, size = 22, stroke = 1.8 }: { name: IconName; color: string; size?: number; stroke?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={paths[name]} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
