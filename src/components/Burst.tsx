import React, { useEffect } from 'react';
import { Canvas, Circle, Line, vec } from '@shopify/react-native-skia';
import { SharedValue, useDerivedValue, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { colors, motion } from '../theme';

const SPARKS = 48;

function Spark({ i, t, mid, color }: { i: number; t: SharedValue<number>; mid: number; color: string }) {
  const a = (i / SPARKS) * Math.PI * 2;
  const reach = 0.62 + 0.38 * (((i * 7) % 6) / 5); // deterministic variation, no Math.random
  const p1 = useDerivedValue(() => {
    const r = 84 + t.value * (mid - 100) * reach;
    return vec(mid + Math.cos(a) * r, mid + Math.sin(a) * r);
  });
  const p2 = useDerivedValue(() => {
    const r = 84 + t.value * (mid - 100) * reach + 6 + 28 * (1 - t.value);
    return vec(mid + Math.cos(a) * r, mid + Math.sin(a) * r);
  });
  const o = useDerivedValue(() => Math.pow(1 - t.value, 1.4));
  return <Line p1={p1} p2={p2} color={color} strokeWidth={3} strokeCap="round" opacity={o} />;
}

/** Skia shockwave: a ring plus 48 sparks flung outward from the centre. Plays once on mount. */
export function Burst({ size = 380, color = colors.lime, delay = 220, duration = 1400 }: { size?: number; color?: string; delay?: number; duration?: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration, easing: motion.easing.emphasized }));
  }, [t, delay, duration]);
  const mid = size / 2;
  const ringR = useDerivedValue(() => 70 + t.value * (mid - 70));
  const ringO = useDerivedValue(() => 0.5 * (1 - t.value));
  return (
    <Canvas style={{ width: size, height: size, pointerEvents: 'none' }}>
      <Circle cx={mid} cy={mid} r={ringR} color={color} style="stroke" strokeWidth={2} opacity={ringO} />
      {Array.from({ length: SPARKS }).map((_, i) => (
        <Spark key={i} i={i} t={t} mid={mid} color={color} />
      ))}
    </Canvas>
  );
}
