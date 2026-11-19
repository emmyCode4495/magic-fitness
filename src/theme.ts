import { StyleSheet } from 'react-native';
import { Easing, FadeInDown } from 'react-native-reanimated';

/** Black canvas, one lime accent. Surfaces step up in lightness; lime is kept for what matters. */
export const colors = {
  bg: '#0B0B0B',
  surface: '#151515',
  surfaceUp: '#1E1E1E',
  line: '#2B2B2B',
  track: 'rgba(255,255,255,0.14)',
  lime: '#D5F24B',
  flame: '#FF9F43',
  limeSoft: 'rgba(213,242,75,0.14)',
  ink: '#10120A', // text on lime
  inkDim: 'rgba(16,18,10,0.66)',
  text: '#FFFFFF',
  textDim: '#A3A3A3',
  textFaint: '#6F6F6F',
};

export const fonts = {
  regular: 'Urbanist_500Medium',
  semi: 'Urbanist_600SemiBold',
  bold: 'Urbanist_700Bold',
  heavy: 'Urbanist_800ExtraBold',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { card: 24, tile: 18, chip: 14, pill: 999 };

export const type = StyleSheet.create({
  display: { fontFamily: fonts.heavy, fontSize: 56, letterSpacing: -1.5 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  h3: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: fonts.semi, fontSize: 12, lineHeight: 16 },
});

export const motion = {
  duration: { instant: 90, fast: 160, base: 260, slow: 420, hero: 700 },
  easing: {
    standard: Easing.bezier(0.2, 0, 0, 1),
    emphasized: Easing.bezier(0.3, 0, 0, 1),
    exit: Easing.bezier(0.4, 0, 1, 1),
  },
  spring: {
    snappy: { damping: 20, stiffness: 300, mass: 0.9 },
    fluid: { damping: 18, stiffness: 160, mass: 1 },
    bouncy: { damping: 11, stiffness: 180, mass: 1 },
  },
  stagger: 55,
};

/** Staggered spring entrance used by every screen. */
export const enter = (i = 0) =>
  FadeInDown.delay(40 + i * motion.stagger)
    .springify()
    .damping(18)
    .stiffness(170);

export const shadow = {
  lifted: { shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.45, shadowRadius: 24, elevation: 10 },
};

export const limeGlow = {
  shadowColor: colors.lime,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.4,
  shadowRadius: 18,
};

export const alpha = (h: string, a: number) => {
  const n = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${n[0]},${n[1]},${n[2]},${a})`;
};
