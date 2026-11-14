import { StyleSheet } from 'react-native';
import { Easing, FadeInDown } from 'react-native-reanimated';

export const colors = {
  ink: '#101211',
  inkRaised: '#191D1A',
  inkLine: '#2A312C',
  bone: '#F2F4EC',
  boneDim: '#A3ADA4',
  signal: '#C5F36A',
  paperInk: '#101611',
  paperDim: '#59665A',
  paperLine: '#DCE5D8',
};

export const fonts = {
  displayHeavy: 'BricolageGrotesque_800ExtraBold',
  display: 'BricolageGrotesque_700Bold',
  text: 'DMSans_400Regular',
  textMed: 'DMSans_500Medium',
  textBold: 'DMSans_700Bold',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { card: 28, chip: 16, pill: 999 };

export const type = StyleSheet.create({
  display: { fontFamily: fonts.displayHeavy, fontSize: 64, letterSpacing: -2.6 },
  h1: { fontFamily: fonts.displayHeavy, fontSize: 32, lineHeight: 34, letterSpacing: -1.1 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26, letterSpacing: -0.5 },
  body: { fontFamily: fonts.text, fontSize: 15, lineHeight: 21 },
  bodyMed: { fontFamily: fonts.textMed, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: fonts.textMed, fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: fonts.textBold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase' },
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
  FadeInDown.delay(60 + i * motion.stagger)
    .springify()
    .damping(18)
    .stiffness(170);

export const shadow = {
  lifted: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 26,
    elevation: 10,
  },
};
