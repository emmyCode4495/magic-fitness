import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Burst } from '../components/Burst';
import { RollingNumber } from '../components/RollingNumber';
import { TAB_BAR_H } from '../components/TabBar';
import { colors, fonts, motion } from '../theme';

/** Timeline, ms. One lift: load the bar, press it up, reveal the name, then a plate carries us into the app. */
const T = { bar: 0, plates: 300, plateGap: 200, lift: 1100, top: 1560, tag: 2050, exit: 2550, cover: 520, contract: 650 };

const GRIP = 0.16; // gap between the two plate stacks, as a fraction of screen width
const PLATES = [
  { w: 22, h: 170, colors: ['#EBFF7A', '#BEDC32'], kg: 20 },
  { w: 18, h: 132, colors: ['#FFFFFF', '#C7C7C7'], kg: 10 },
  { w: 14, h: 98, colors: ['#5A5A5A', '#303030'], kg: 10 },
] as const;
const WORD = 'magic'.split('');

function Plate({ i, side, W }: { i: number; side: -1 | 1; W: number }) {
  const spec = PLATES[i];
  const before = PLATES.slice(0, i).reduce((a, p) => a + p.w + 3, 0);
  const center = W * GRIP + before + spec.w / 2; // distance from the middle of the bar
  const x = useSharedValue(side * (W / 2 + 80));
  useEffect(() => {
    x.value = withDelay(T.plates + i * T.plateGap, withSpring(0, { damping: 13, stiffness: 190, mass: 0.9 }));
  }, [i, x]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Animated.View style={[{ position: 'absolute', left: W / 2 + side * center - spec.w / 2, top: -spec.h / 2, width: spec.w, height: spec.h, borderRadius: 6, overflow: 'hidden' }, a]}>
      <LinearGradient colors={[spec.colors[0], spec.colors[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      {/* A pale edge on the lit side, like light catching the rim of the plate. */}
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: side === -1 ? 0 : undefined, right: side === 1 ? 0 : undefined, width: 2, backgroundColor: 'rgba(255,255,255,0.35)' }} />
    </Animated.View>
  );
}

function Letter({ ch, i }: { ch: string; i: number }) {
  const y = useSharedValue(110);
  useEffect(() => {
    y.value = withDelay(T.top - 220 + i * 70, withTiming(0, { duration: motion.duration.hero, easing: motion.easing.emphasized }));
  }, [i, y]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <View style={{ height: 96, overflow: 'hidden' }}>
      <Animated.Text style={[styles.letter, a]}>{ch}</Animated.Text>
    </View>
  );
}

function ReducedSplash({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const o = useSharedValue(1);
  useEffect(() => {
    const a = setTimeout(onReveal, 500);
    o.value = withDelay(700, withTiming(0, { duration: 300 }));
    const b = setTimeout(onDone, 1050);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [o, onReveal, onDone]);
  const s = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.wrap, s]} pointerEvents="none">
      <Text style={[styles.letter, { height: 96 }]}>magic<Text style={{ color: colors.lime }}>.</Text></Text>
    </Animated.View>
  );
}

export function Splash({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const reduce = useReducedMotion();
  if (reduce) return <ReducedSplash onReveal={onReveal} onDone={onDone} />;
  return <LiftSplash onReveal={onReveal} onDone={onDone} />;
}

function LiftSplash({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const cy = H * 0.52;
  const liftDist = Math.max(H * 0.2, 140);
  const D = 2 * Math.hypot(W, H);
  const fabY = H - insets.bottom - TAB_BAR_H / 2;

  const [kg, setKg] = useState(20);
  const [shock, setShock] = useState(false);
  const [covered, setCovered] = useState(false);
  const pos = useRef({ rx: 0, ry: 0, dx: 0, dy: 0 });

  const barX = useSharedValue(0);
  const lift = useSharedValue(0);
  const counter = useSharedValue(1);
  const shake = useSharedValue(0);
  const dot = useSharedValue(0);
  const tag = useSharedValue(0);
  const discS = useSharedValue(18 / D);
  const discX = useSharedValue(0);
  const discY = useSharedValue(0);
  const discO = useSharedValue(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    barX.value = withDelay(T.bar, withTiming(1, { duration: 280, easing: motion.easing.emphasized }));
    // Each pair of plates lands with a thud, and the number on the bar goes up with it.
    PLATES.forEach((p, i) => {
      const land = T.plates + i * T.plateGap + 230;
      at(land, () => {
        setKg((k) => k + p.kg * 2);
        Haptics.impactAsync(i === 0 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
      });
    });

    // The press: the bar strains, then drives up. The weight arrives with a shockwave.
    counter.value = withDelay(T.lift - 60, withTiming(0, { duration: 220 }));
    lift.value = withDelay(T.lift, withSequence(withTiming(0.04, { duration: 140 }), withTiming(1, { duration: T.top - T.lift - 140, easing: Easing.out(Easing.cubic) })));
    at(T.top, () => {
      setShock(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    });
    shake.value = withDelay(T.top, withSequence(withTiming(-7, { duration: 45 }), withTiming(6, { duration: 55 }), withTiming(-4, { duration: 55 }), withTiming(2, { duration: 55 }), withTiming(0, { duration: 60 })));
    dot.value = withDelay(T.top + 260, withSpring(1, motion.spring.bouncy));
    tag.value = withDelay(T.tag, withTiming(1, { duration: motion.duration.slow }));

    // Exit: a lime plate grows out of the dot, fills the screen, then shrinks into the centre button.
    // Started from a timer so the dot's measured position is available.
    at(T.exit, () => {
      const { rx, ry, dx, dy } = pos.current;
      const px = rx + dx + 9;
      const py = ry + dy + 9;
      discX.value = px - W / 2;
      discY.value = py - H / 2;
      discO.value = withSequence(withTiming(1, { duration: 1 }), withDelay(T.cover + T.contract - 1, withTiming(0, { duration: 140 })));
      discS.value = withSequence(
        withTiming(1, { duration: T.cover, easing: Easing.in(Easing.cubic) }),
        withTiming(64 / D, { duration: T.contract, easing: motion.easing.emphasized })
      );
      discX.value = withSequence(withTiming(px - W / 2, { duration: T.cover }), withTiming(0, { duration: T.contract, easing: motion.easing.emphasized }));
      discY.value = withSequence(withTiming(py - H / 2, { duration: T.cover }), withTiming(fabY - H / 2, { duration: T.contract, easing: motion.easing.emphasized }));
    });
    at(T.exit + T.cover + 40, () => { setCovered(true); onReveal(); });
    at(T.exit + T.cover + T.contract - 120, () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    at(T.exit + T.cover + T.contract + 160, onDone);

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bar = useAnimatedStyle(() => ({ transform: [{ scaleX: barX.value }] }));
  const group = useAnimatedStyle(() => ({ transform: [{ translateY: -liftDist * lift.value }, { scale: 1 + 0.05 * lift.value }] }));
  const shaker = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const counterStyle = useAnimatedStyle(() => ({ opacity: counter.value, transform: [{ translateY: (1 - counter.value) * -10 }] }));
  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: dot.value }] }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: tag.value, transform: [{ translateY: (1 - tag.value) * 10 }] }));
  const discStyle = useAnimatedStyle(() => ({ opacity: discO.value, transform: [{ translateX: discX.value }, { translateY: discY.value }, { scale: discS.value }] }));

  const barW = W * 0.94;
  return (
    <View style={[StyleSheet.absoluteFill, styles.wrap, covered && { backgroundColor: 'transparent' }]} pointerEvents="none">
      {!covered && (
        <Animated.View style={[StyleSheet.absoluteFill, shaker]}>
          {/* Wordmark sits where the bar starts; it is revealed as the bar rises off it. */}
          <View style={{ position: 'absolute', left: 0, right: 0, top: cy - 48, height: 96, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }} onLayout={(e) => { pos.current.rx = e.nativeEvent.layout.x; pos.current.ry = cy - 48 + e.nativeEvent.layout.y; }}>
              {WORD.map((c, i) => <Letter key={i} ch={c} i={i} />)}
              <Animated.View style={[styles.dot, dotStyle]} onLayout={(e) => { pos.current.dx = e.nativeEvent.layout.x; pos.current.dy = e.nativeEvent.layout.y; }} />
            </View>
          </View>
          <Animated.Text style={[styles.tag, { top: cy + 58 }, tagStyle]}>move better, every day</Animated.Text>

          <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: cy, height: 0 }, group]}>
            <Animated.View style={[{ position: 'absolute', left: (W - barW) / 2, top: -5, width: barW, height: 10, borderRadius: 5, overflow: 'hidden' }, bar]}>
              <LinearGradient colors={['#E4E4E4', '#8A8A8A', '#4B4B4B']} style={StyleSheet.absoluteFill} />
            </Animated.View>
            {([-1, 1] as const).map((side) => (
              <React.Fragment key={side}>
                {PLATES.map((_, i) => <Plate key={i} i={i} side={side} W={W} />)}
              </React.Fragment>
            ))}
          </Animated.View>

          <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: cy + 118, alignItems: 'center' }, counterStyle]}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <RollingNumber value={kg} height={64} style={{ fontFamily: fonts.heavy, fontSize: 56, color: colors.text, letterSpacing: -1 }} />
              <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: colors.lime }}>kg</Text>
            </View>
          </Animated.View>

          {shock && (
            <View style={{ position: 'absolute', left: W / 2 - 190, top: cy - liftDist - 190 }} pointerEvents="none">
              <Burst size={380} color={colors.lime} delay={0} duration={900} />
            </View>
          )}
        </Animated.View>
      )}

      <Animated.View style={[styles.disc, { width: D, height: D, borderRadius: D / 2, left: (W - D) / 2, top: (H - D) / 2 }, discStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.bg, zIndex: 100 },
  letter: { fontFamily: fonts.heavy, fontSize: 88, lineHeight: 96, letterSpacing: -3, color: colors.text, includeFontPadding: false },
  dot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.lime, marginLeft: 4, marginBottom: 22 },
  tag: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: fonts.semi, fontSize: 14, letterSpacing: 0.4, color: colors.textDim },
  disc: { position: 'absolute', backgroundColor: colors.lime },
});
