import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Canvas, Circle, LinearGradient as SkGradient, Path, Skia, vec } from '@shopify/react-native-skia';
import Animated, {
  Easing, SharedValue, useAnimatedProps, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { colors, motion, type } from '../theme';
import { RollingNumber } from './RollingNumber';

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

/* ---------- Bar chart ---------- */

const BAR_H = 190;

function Bar({ v, domain, i, dim, on, onPress, label }: { v: number; domain: [number, number]; i: number; dim: boolean; on: boolean; onPress: () => void; label: string }) {
  const h = useSharedValue(0);
  useEffect(() => {
    const t = Math.max((v - domain[0]) / (domain[1] - domain[0]), 0.04);
    h.value = withDelay(i * 45, withSpring(t * BAR_H, motion.spring.fluid));
  }, [v, domain, i, h]);
  const bar = useAnimatedStyle(() => ({ height: h.value }));
  return (
    <Pressable onPress={onPress} hitSlop={6} style={styles.col} accessibilityRole="button" accessibilityLabel={`${label}, ${v}`}>
      <View style={{ height: BAR_H, justifyContent: 'flex-end' }}>
        {/* Height is a spring on the UI thread; the dimming is a CSS transition on opacity. */}
        <Animated.View style={[{ width: 26, borderRadius: 8, backgroundColor: colors.lime, opacity: dim && !on ? 0.35 : 1, transitionProperty: 'opacity', transitionDuration: motion.duration.fast }, bar]} />
      </View>
      <Text style={[type.micro, { color: on ? colors.lime : colors.text, marginTop: 10 }]}>{label}</Text>
    </Pressable>
  );
}

export function BarChart({ values, domain, selected, onSelect, format }: { values: number[]; domain: [number, number]; selected: number | null; onSelect: (i: number) => void; format: (n: number) => string }) {
  const ticks = [0, 1, 2, 3].map((k) => domain[0] + ((domain[1] - domain[0]) * (3 - k)) / 3);
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: 40, height: BAR_H, justifyContent: 'space-between' }}>
        {ticks.map((t, i) => (
          <Text key={i} style={[type.micro, { color: colors.textFaint, marginTop: i === 0 ? -6 : 0, marginBottom: i === 3 ? -6 : 0 }]}>{format(t)}</Text>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { height: BAR_H, justifyContent: 'space-between' }]}>
          {ticks.map((_, i) => <View key={i} style={{ height: 1, backgroundColor: colors.line }} />)}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {values.map((v, i) => (
            <Bar key={i} v={v} i={i} domain={domain} label={String(i + 1)} dim={selected !== null} on={selected === i} onPress={() => onSelect(i)} />
          ))}
        </View>
      </View>
    </View>
  );
}

/* ---------- Line chart (Skia, draws itself in) ---------- */

export function LineChart({ points, height = 130 }: { points: number[]; height?: number }) {
  const [w, setW] = useState(0);
  const draw = useSharedValue(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  useEffect(() => {
    if (!w) return;
    draw.value = 0;
    draw.value = withDelay(250, withTiming(1, { duration: 1300, easing: motion.easing.emphasized }));
  }, [w, draw]);

  const { line, area, peaks } = useMemo(() => {
    const pad = 14;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const pts = points.map((p, i) => ({ x: pad + (i / (points.length - 1)) * (w - pad * 2), y: pad + (1 - (p - min) / (max - min || 1)) * (height - pad * 2) }));
    // Catmull-Rom to cubic Bezier: a smooth curve through every point.
    const curve = (b: ReturnType<typeof Skia.PathBuilder.Make>) => {
      b.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
        b.cubicTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y);
      }
      return b;
    };
    const line = curve(Skia.PathBuilder.Make()).build();
    const area = curve(Skia.PathBuilder.Make()).lineTo(pts[pts.length - 1].x, height).lineTo(pts[0].x, height).close().build();
    const top = pts.reduce((a, b) => (b.y < a.y ? b : a));
    return { line, area, peaks: [pts[1], top] };
  }, [points, w, height]);

  const areaOpacity = useDerivedValue(() => Math.max(0, draw.value - 0.4) / 0.6);
  const dotOpacity = useDerivedValue(() => Math.max(0, draw.value - 0.85) / 0.15);

  return (
    <View onLayout={onLayout} style={{ height }}>
      {w > 0 && (
        <Canvas style={{ width: w, height }}>
          <Path path={area} opacity={areaOpacity}>
            <SkGradient start={vec(0, 0)} end={vec(0, height)} colors={['rgba(213,242,75,0.38)', 'rgba(213,242,75,0)']} />
          </Path>
          <Path path={line} style="stroke" strokeWidth={3} strokeCap="round" strokeJoin="round" color={colors.lime} start={0} end={draw} />
          {peaks.map((p, i) => (
            <Dot key={i} x={p.x} y={p.y} o={dotOpacity} />
          ))}
        </Canvas>
      )}
    </View>
  );
}
function Dot({ x, y, o }: { x: number; y: number; o: SharedValue<number> }) {
  return (
    <>
      <Circle cx={x} cy={y} r={7} color={colors.bg} opacity={o} />
      <Circle cx={x} cy={y} r={5} color={colors.lime} opacity={o} />
    </>
  );
}

/* ---------- Gauge: 270-degree arc open at the bottom ---------- */

export function Gauge({ value, goal, size = 250, unit = 'kcal' }: { value: number; goal: number; size?: number; unit?: string }) {
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75;
  const p = useSharedValue(0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    p.value = withDelay(300, withTiming(Math.min(value / goal, 1), { duration: 1400, easing: motion.easing.emphasized }));
    const t = setTimeout(() => setShown(value), 350);
    return () => clearTimeout(t);
  }, [value, goal, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: arc * (1 - p.value) }));
  return (
    <View style={{ width: size, height: size * 0.86, alignItems: 'center' }} accessible accessibilityLabel={`${value} of ${goal} ${unit}`}>
      <Svg width={size} height={size} style={{ position: 'absolute', top: 0 }}>
        <SvgCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceUp} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${arc} ${c}`} rotation={135} origin={`${size / 2}, ${size / 2}`} />
        <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.lime} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${arc} ${c}`} animatedProps={props} rotation={135} origin={`${size / 2}, ${size / 2}`} />
      </Svg>
      <View style={{ position: 'absolute', top: size * 0.34, alignItems: 'center' }}>
        <RollingNumber value={shown} grouping height={56} style={[type.display, { fontSize: 50, color: colors.text, letterSpacing: -1 }]} />
        <Text style={[type.body, { color: colors.textDim }]}>{unit}</Text>
      </View>
    </View>
  );
}

/* ---------- Macro bar ---------- */

export function MacroBar({ name, value, goal, i }: { name: string; value: number; goal: number; i: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(500 + i * 120, withSpring(Math.min(value / goal, 1), motion.spring.fluid));
  }, [value, goal, i, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} accessible accessibilityLabel={`${name} ${value} of ${goal} grams`}>
      <Text style={[type.body, { color: colors.text, width: 62 }]}>{name}</Text>
      <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.surfaceUp, overflow: 'hidden' }}>
        <Animated.View style={[{ height: 10, borderRadius: 5, backgroundColor: colors.lime }, fill]} />
      </View>
      <Text style={[type.small, { color: colors.textDim, width: 62, textAlign: 'right' }]}>{value}/{goal} g</Text>
    </View>
  );
}

const styles = StyleSheet.create({ col: { alignItems: 'center' } });
