import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const iconPaths = {
  home: 'M4 11l8-7 8 7M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5M10 20v-5h4v5',
  health: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10ZM12 9.5v4M10 11.5h4',
  leaf: 'M5 19c0-8.5 5-14 14-14 0 9-5.5 14-14 14ZM5 19l8-8',
  list: 'M9 7h11M9 12h11M9 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20c.8-3.5 3.700-5.5 7.500-5.500s6.700 2 7.500 5.500',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
  sliders: 'M4 8h9M17 8h3M4 16h3M11 16h9M15 5.500v5M9 13.500v5',
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  chevron: 'M6 9l6 6 6-6',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  clock: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM12 7.500V12l3 2',
  flame: 'M12 3c.8 3.200 5 5.400 5 10a5 5 0 0 1-10 0c0-1.900.9-3.200 2-4 0 1.800.9 3 2 3 .2-3-1-5.200 1-9Z',
  play: 'M8 5.500v13l11-6.500-11-6.500Z',
  skip: 'M6 6l9 6-9 6V6ZM18 6v12',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.600A4 4 0 0 1 19 10c0 5.600-7 10-7 10Z',
  bolt: 'M13 3L5 13.500h6L10 21l8-10.500h-6L13 3Z',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M9 20h6M10 17h4',
  trend: 'M4 16l5-5 4 4 7-8M15 7h5v5',
  dumbbell: 'M6.500 8v8M3.500 10v4M17.500 8v8M20.500 10v4M6.500 12h11',
  crown: 'M5 17h14M5 17l-1.500-9 4.500 3.500L12 6l4 5.500L20.500 8 19 17',
  run: 'M14.500 5.500a1.600 1.600 0 1 0 0-3.200 1.600 1.600 0 0 0 0 3.200ZM9 21l2.500-5-2.500-2.500 1.500-5 3.500 2 3 .5M10.500 8.500L7 10M11.500 16l3.500 1.500.5 3.500',
  yoga: 'M12 5.500a1.600 1.600 0 1 0 0-3.200 1.600 1.600 0 0 0 0 3.200ZM12 7v7M6 10l6-2 6 2M12 14l-4 6M12 14l4 6',
  bike: 'M6 19a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7ZM18 19a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7ZM6 15.500L9.500 8h5.500l3 7.500M9.500 8l3.500 7.500M8 6h3',
  swim: 'M3 19c1.500-1.200 2.500-1.200 4 0s2.500 1.200 4 0 2.500-1.200 4 0 2.500 1.200 4 0M5 14l5-4 3 2M17.500 6.500a1.500 1.500 0 1 0 0 .01',
  menu: 'M4 8h16M4 16h16',
  steps: 'M9 4c1.700 0 2.500 1.600 2.500 3.500S10.600 11 9 11 6.500 9.400 6.500 7.500 7.300 4 9 4ZM15 12.500c1.700 0 2.500 1.600 2.500 3.500s-.9 3.500-2.500 3.500-2.500-1.600-2.500-3.500.8-3.500 2.500-3.500Z',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.500 2h-15L6 16ZM10 20.500h4',
  target: 'M12 20.500a8.500 8.500 0 1 0 0-17 8.500 8.500 0 0 0 0 17ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 12h.01',
  scale: 'M5 5h14v14H5V5ZM9 9.500c1-1 5-1 6 0M12 9.500l1.500 2.500',
  help: 'M12 20.500a8.500 8.500 0 1 0 0-17 8.500 8.500 0 0 0 0 17ZM9.800 9.800a2.300 2.300 0 1 1 3.300 2c-.7.400-1.100.9-1.100 1.700M12 16.800h.01',
};
export type IconName = keyof typeof iconPaths;

export function Icon({ name, color, size = 22, stroke = 1.8, fill }: { name: IconName; color: string; size?: number; stroke?: number; fill?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={iconPaths[name]} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill={fill ?? 'none'} />
    </Svg>
  );
}

/** Icon on a tinted rounded square. */
export function IconChip({ name, color, bg, size = 40 }: { name: IconName; color: string; bg: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.34, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} color={color} size={size * 0.52} />
    </View>
  );
}
