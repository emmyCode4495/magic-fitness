import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Circle, Fill, Group, LinearGradient, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import {
  Easing, SharedValue, interpolateColor, useDerivedValue, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';

export type Palette = readonly [string, string, string];

const TAU = Math.PI * 2;
const CLEAR = 'rgba(11,11,11,0)';

// Three slow orbits. Integer multipliers keep the 40s loop seamless.
const BLOBS = [
  { fx: 0.25, fy: 0.16, ax: 0.22, ay: 0.10, kx: 1, ky: 1, px: 0, py: 1.5, r: 0.9 },
  { fx: 0.82, fy: 0.44, ax: 0.16, ay: 0.14, kx: 2, ky: 1, px: 1, py: 2, r: 0.85 },
  { fx: 0.3, fy: 0.9, ax: 0.26, ay: 0.07, kx: 1, ky: 3, px: 3, py: 0, r: 0.95 },
];

type Pair = { from: Palette; to: Palette };

function Blob({ i, w, h, clock, mix, pair, beat }: {
  i: number; w: number; h: number; clock: SharedValue<number>; mix: SharedValue<number>; pair: Pair; beat?: SharedValue<number>;
}) {
  const cfg = BLOBS[i];
  const center = useDerivedValue(() =>
    vec(
      w * (cfg.fx + cfg.ax * Math.sin(TAU * cfg.kx * clock.value + cfg.px)),
      h * (cfg.fy + cfg.ay * Math.cos(TAU * cfg.ky * clock.value + cfg.py))
    )
  );
  const rad = useDerivedValue(() => w * cfg.r * (1 + 0.07 * (beat ? beat.value : 0)));
  const cols = useDerivedValue(() => [interpolateColor(mix.value, [0, 1], [pair.from[i], pair.to[i]]), CLEAR]);
  return (
    <Circle c={center} r={rad}>
      <RadialGradient c={center} r={rad} colors={cols} />
    </Circle>
  );
}

/**
 * The app's light. Three soft colour fields drift slowly behind everything, cross-fade
 * when the palette changes, and swell with `beat` (a heartbeat shared value) when given.
 * A bottom scrim keeps the dock and lower content legible on any hue.
 */
export function Aurora({ palette, beat, intensity = 0.55 }: { palette: Palette; beat?: SharedValue<number>; intensity?: number }) {
  const { width: w, height: h } = useWindowDimensions();
  const clock = useSharedValue(0);
  const mix = useSharedValue(1);
  const [pair, setPair] = useState<Pair>({ from: palette, to: palette });

  useEffect(() => {
    clock.value = withRepeat(withTiming(1, { duration: 40000, easing: Easing.linear }), -1, false);
  }, [clock]);

  useEffect(() => {
    setPair((p) => (p.to === palette ? p : { from: p.to, to: palette }));
    mix.value = 0;
    mix.value = withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) });
  }, [palette, mix]);

  return (
    <Canvas style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      <Fill color={colors.bg} />
      <Group opacity={intensity}>
        {BLOBS.map((_, i) => (
          <Blob key={i} i={i} w={w} h={h} clock={clock} mix={mix} pair={pair} beat={beat} />
        ))}
      </Group>
      <Rect x={0} y={h * 0.55} width={w} height={h * 0.45}>
        <LinearGradient start={vec(0, h * 0.55)} end={vec(0, h)} colors={[CLEAR, 'rgba(11,11,11,0.85)']} />
      </Rect>
    </Canvas>
  );
}
