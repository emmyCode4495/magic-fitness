import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { colors, fonts, motion } from '../theme';

const WORD = 'magic'.split('');

function Letter({ ch, i }: { ch: string; i: number }) {
  const y = useSharedValue(110);
  useEffect(() => {
    y.value = withDelay(120 + i * 70, withTiming(0, { duration: motion.duration.hero, easing: motion.easing.emphasized }));
  }, [i, y]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <View style={{ height: 96, overflow: 'hidden' }}>
      <Animated.Text style={[styles.letter, a]}>{ch}</Animated.Text>
    </View>
  );
}

/** Brand moment: letters rise from masks, the dot lands, then the curtain lifts to reveal the app. */
export function Splash({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const { height } = useWindowDimensions();
  const curtain = useSharedValue(0);
  const dot = useSharedValue(0);
  const tag = useSharedValue(0);

  useEffect(() => {
    dot.value = withDelay(650, withSpring(1, motion.spring.bouncy));
    tag.value = withDelay(900, withTiming(1, { duration: motion.duration.slow }));
    curtain.value = withDelay(1600, withTiming(-height, { duration: 650, easing: motion.easing.emphasized }));
    const a = setTimeout(onReveal, 1550);
    const b = setTimeout(onDone, 2300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [height, curtain, dot, tag, onReveal, onDone]);

  const wrap = useAnimatedStyle(() => ({ transform: [{ translateY: curtain.value }] }));
  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: dot.value }] }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: tag.value, transform: [{ translateY: (1 - tag.value) * 10 }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.wrap, wrap]} pointerEvents="none">
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        {WORD.map((c, i) => <Letter key={i} ch={c} i={i} />)}
        <Animated.View style={[styles.dot, dotStyle]} />
      </View>
      <Animated.Text style={[styles.tag, tagStyle]}>move better, every day</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  letter: { fontFamily: fonts.displayHeavy, fontSize: 88, lineHeight: 96, letterSpacing: -3.5, color: colors.bone, includeFontPadding: false },
  dot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.signal, marginLeft: 4, marginBottom: 22 },
  tag: { marginTop: 18, fontFamily: fonts.textMed, fontSize: 14, letterSpacing: 0.6, color: colors.boneDim },
});
