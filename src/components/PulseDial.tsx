import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';
import Animated, {
  Easing, Extrapolation, SharedValue, interpolate, interpolateColor,
  useAnimatedStyle, useDerivedValue, useSharedValue,
  withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { colors, motion, type } from '../theme';
import { RollingNumber } from './RollingNumber';

const N = 60;
const TICK_W = 3;
const TICK_H = 14;
const GLOW_PAD = 70;

function Tick({ i, progress, size }: { i: number; progress: SharedValue<number>; size: number }) {
  const radius = size / 2 - 22;
  const style = useAnimatedStyle(() => {
    const d = progress.value * N - i;
    const t = Math.min(Math.max(d, 0), 1);
    const lead = interpolate(d, [-0.5, 0.5, 3], [0, 1, 0], Extrapolation.CLAMP);
    return {
      backgroundColor: interpolateColor(t, [0, 1], [colors.inkLine, colors.signal]),
      transform: [
        { rotate: `${(i / N) * 360}deg` },
        { translateY: -radius },
        { scaleY: 1 + 0.25 * t + 0.9 * lead },
      ],
    };
  });
  return (
    <Animated.View
      style={[{ position: 'absolute', left: size / 2 - TICK_W / 2, top: size / 2 - TICK_H / 2, width: TICK_W, height: TICK_H, borderRadius: 2 }, style]}
    />
  );
}

/**
 * Skia light layer behind the ticks: a hot spot that rides the leading edge,
 * and an ember halo that warms up with progress and slowly breathes.
 */
function DialGlow({ progress, size }: { progress: SharedValue<number>; size: number }) {
  const box = size + GLOW_PAD * 2;
  const mid = box / 2;
  const radius = size / 2 - 22;
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
  }, [breath]);

  const cx = useDerivedValue(() => mid + radius * Math.cos(progress.value * Math.PI * 2 - Math.PI / 2));
  const cy = useDerivedValue(() => mid + radius * Math.sin(progress.value * Math.PI * 2 - Math.PI / 2));
  const spot = useDerivedValue(() => vec(cx.value, cy.value));
  const spotOpacity = useDerivedValue(() => Math.min(progress.value * 8, 1) * (0.7 + 0.3 * breath.value));
  const haloOpacity = useDerivedValue(() => progress.value * (0.65 + 0.35 * breath.value));

  return (
    <Canvas style={{ position: 'absolute', left: -GLOW_PAD, top: -GLOW_PAD, width: box, height: box, pointerEvents: 'none' }}>
      <Group opacity={haloOpacity}>
        <Circle cx={mid} cy={mid} r={size / 2 + 10}>
          <RadialGradient c={vec(mid, mid)} r={size / 2 + 10} positions={[0.62, 1]} colors={['rgba(255,91,34,0)', 'rgba(255,91,34,0.16)']} />
        </Circle>
      </Group>
      <Group opacity={spotOpacity}>
        <Circle cx={cx} cy={cy} r={70}>
          <RadialGradient c={spot} r={70} colors={['rgba(255,120,60,0.6)', 'rgba(255,91,34,0)']} />
        </Circle>
      </Group>
    </Canvas>
  );
}

/** Signature element: a 60-tick radial gauge with a comet tail and a Skia glow. */
export function PulseDial({ value, goal, size = 288 }: { value: number; goal: number; size?: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      250,
      withTiming(Math.min(value / goal, 1), { duration: motion.duration.hero * 2, easing: motion.easing.emphasized })
    );
  }, [value, goal, progress]);

  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`${value} of ${goal} calories`}>
      <DialGlow progress={progress} size={size} />
      {Array.from({ length: N }).map((_, i) => (
        <Tick key={i} i={i} progress={progress} size={size} />
      ))}
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[type.micro, { color: colors.boneDim, marginBottom: 6 }]}>Move</Text>
        <RollingNumber value={value} height={68} style={[type.display, { color: colors.bone }]} />
        <Text style={[type.small, { color: colors.boneDim, marginTop: 6 }]}>of {goal} kcal</Text>
      </View>
    </View>
  );
}
