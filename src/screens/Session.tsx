import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing, FadeIn, FadeInDown, FadeInRight, FadeOutLeft, SharedValue,
  useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Aurora, Palette } from '../components/Aurora';
import { Burst } from '../components/Burst';
import { HeartRate, useHeartbeat } from '../components/Heart';
import { Icon } from '../components/Icon';
import { LimeButton } from '../components/LimeButton';
import { PressableScale } from '../components/PressableScale';
import { RollingNumber } from '../components/RollingNumber';
import { Workout } from '../data';
import { colors, fonts, motion, type } from '../theme';

const LIME_AURORA: Palette = ['#D5F24B', '#7C9420', '#2A3308'];

const HOLD_MS = 900;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Gradient progress ring. `progress` 0..1 is how much of the ring is drawn. */
function Ring({ size, stroke, progress, a, b, id }: { size: number; stroke: number; progress: SharedValue<number>; a: string; b: string; id: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - progress.value) }));
  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={a} />
          <Stop offset="1" stopColor={b} />
        </SvgGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.track} strokeWidth={stroke} fill="none" />
      <AnimatedCircle
        cx={size / 2} cy={size / 2} r={r} stroke={`url(#${id})`} strokeWidth={stroke} fill="none"
        strokeLinecap="round" strokeDasharray={c} animatedProps={props}
        rotation="-90" origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

const HOLD = 208;

function HoldButton({ onComplete }: { onComplete: () => void }) {
  const hold = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inner = useAnimatedStyle(() => ({ transform: [{ scale: 1 - 0.07 * hold.value }] }));

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const finish = () => {
    timer.current = null;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    hold.value = withTiming(0, { duration: motion.duration.slow, easing: motion.easing.standard });
    onComplete();
  };
  const pressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    hold.value = withTiming(1, { duration: HOLD_MS, easing: Easing.linear });
    timer.current = setTimeout(finish, HOLD_MS);
  };
  const pressOut = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      hold.value = withTiming(0, { duration: 240, easing: motion.easing.exit });
    }
  };

  return (
    <Pressable
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessibilityRole="button"
      accessibilityLabel="Finish block"
      accessibilityHint="Press and hold to finish this block"
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={finish}
      style={{ width: HOLD, height: HOLD, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ring size={HOLD} stroke={9} progress={hold} a={colors.lime} b={colors.lime} id="hold" />
      <Animated.View style={[styles.holdInner, inner]}>
        <Icon name="check" color={colors.lime} size={30} stroke={2.4} />
        <Text style={[type.h2, { color: colors.text, marginTop: 4 }]}>Hold</Text>
        <Text style={[type.small, { color: colors.textDim }]}>to finish block</Text>
      </Animated.View>
    </Pressable>
  );
}

function Seg({ state, done }: { state: 0 | 1 | 2; done: string }) {
  const bg = state === 2 ? done : state === 1 ? colors.text : colors.track;
  return <Animated.View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: bg, transitionProperty: 'backgroundColor', transitionDuration: motion.duration.base }} />;
}

/** A "live" dot driven by a Reanimated 4 CSS keyframe animation: no shared values needed. */
function LiveDot({ color }: { color: string }) {
  return (
    <Animated.View
      style={{
        width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 10,
        animationName: {
          from: { opacity: 1, transform: [{ scale: 1 }] },
          '50%': { opacity: 0.3, transform: [{ scale: 0.6 }] },
          to: { opacity: 1, transform: [{ scale: 1 }] },
        },
        animationDuration: '1400ms',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
      }}
    />
  );
}

function Clock({ seconds, paused, dot }: { seconds: number; paused: boolean; dot: string }) {
  const s = { ...type.h2, color: colors.text };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }} accessible accessibilityLabel={`${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds`}>
      {!paused && <LiveDot color={dot} />}
      <RollingNumber value={Math.floor(seconds / 60)} minDigits={2} height={28} style={s} />
      <Text style={[s, { height: 28, lineHeight: 26 }]}>:</Text>
      <RollingNumber value={seconds % 60} minDigits={2} height={28} style={s} />
    </View>
  );
}

type Phase = 'work' | 'rest' | 'done';

export function SessionScreen({ workout, startAt = 0, onClose }: { workout: Workout; startAt?: number; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const restLen = workout.rest;
  const last = workout.exercises.length - 1;

  const [idx, setIdx] = useState(Math.min(startAt, workout.exercises.length - 1));
  const [phase, setPhase] = useState<Phase>('work');
  const [elapsed, setElapsed] = useState(0);
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(restLen);
  const [bpm, setBpm] = useState(92);
  const samples = useRef<number[]>([]);
  const ringP = useSharedValue(1);
  const beat = useHeartbeat(bpm);
  const ex = workout.exercises[idx];
  const upcoming = workout.exercises[Math.min(idx + 1, last)];

  // Session clock keeps running through rests; it stops at the summary.
  useEffect(() => {
    if (phase === 'done') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Simulated heart rate: climbs toward an effort target for the workout type, eases down in rest.
  useEffect(() => {
    const target = phase === 'rest' ? 112 : phase === 'done' ? 100 : workout.category === 'Cycling' || workout.category === 'Swimming' ? 152 : workout.category === 'Yoga' ? 98 : 140;
    const id = setInterval(() => {
      setBpm((b) => {
        const n = Math.round(b + Math.max(-7, Math.min(7, target - b)) + (Math.random() * 4 - 2));
        samples.current.push(n);
        return n;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [phase, workout.category]);

  const advance = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIdx((i) => i + 1);
    setPhase('work');
  }, []);

  useEffect(() => {
    if (phase !== 'rest') return;
    const id = setInterval(() => setRestLeft((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'rest') return;
    if (restLeft <= 0) {
      advance();
      return;
    }
    const target = restLeft / restTotal;
    if (restLeft === restTotal) ringP.value = 1;
    else ringP.value = withTiming(target, { duration: 1000, easing: Easing.linear });
  }, [phase, restLeft, restTotal, advance, ringP]);

  const complete = () => {
    if (idx < last) {
      setRestTotal(restLen);
      setRestLeft(restLen);
      setPhase('rest');
    } else {
      setPhase('done');
    }
  };
  const addTime = () => {
    Haptics.selectionAsync();
    setRestTotal((x) => x + 15);
    setRestLeft((x) => x + 15);
  };

  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, '0');
  const avgBpm = samples.current.length ? Math.round(samples.current.reduce((a, b) => a + b, 0) / samples.current.length) : bpm;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Aurora palette={LIME_AURORA} beat={beat} intensity={0.4} />
      <View style={{ flex: 1, paddingTop: 34, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}>
        <View style={styles.top}>
          <PressableScale haptic onPress={onClose} accessibilityRole="button" accessibilityLabel="Close session">
            <View style={styles.close}>
              <Icon name="close" color={colors.text} size={22} stroke={2} />
            </View>
          </PressableScale>
          <Clock seconds={elapsed} paused={phase === 'done'} dot={colors.lime} />
          <HeartRate bpm={bpm} beat={beat} />
        </View>

        {phase !== 'done' && (
          <View style={styles.segs}>
            {workout.exercises.map((_, i) => (
              <Seg key={i} done={colors.lime} state={i < idx ? 2 : i === idx ? 1 : 0} />
            ))}
          </View>
        )}

        {phase === 'work' && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28 }}>
              {ex.image && <Image source={ex.image} style={styles.thumb} />}
              <View style={{ flex: 1 }}>
                <Text style={[type.small, { color: colors.lime, fontFamily: fonts.bold }]}>Block {idx + 1} of {workout.exercises.length}</Text>
                <Text style={[type.small, { color: colors.textDim }]} numberOfLines={1}>{workout.title}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Animated.View key={idx} entering={FadeInRight.springify().damping(18).stiffness(160)} exiting={FadeOutLeft.duration(motion.duration.fast)}>
                <Text style={[type.display, { color: colors.text, fontSize: 48, lineHeight: 52, letterSpacing: -1.5, marginTop: 14 }]}>{ex.name}</Text>
                <Text style={[type.body, { color: colors.textDim, marginTop: 12, fontSize: 18 }]}>{ex.detail}</Text>
              </Animated.View>
            </View>
            {idx < last && (
              <Text style={[type.small, { color: colors.textDim, textAlign: 'center', marginBottom: 20 }]}>Next: {upcoming.name}</Text>
            )}
            <View style={{ alignItems: 'center' }}>
              <HoldButton key={idx} onComplete={complete} />
            </View>
          </>
        )}

        {phase === 'rest' && (
          <Animated.View entering={FadeIn.duration(motion.duration.base)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 244, height: 244, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={`Rest, ${restLeft} seconds left`}>
              <Ring size={244} stroke={10} progress={ringP} a={colors.lime} b={colors.lime} id="rest" />
              <Text style={[type.body, { color: colors.textDim }]}>Rest</Text>
              <RollingNumber value={restLeft} height={92} style={[type.display, { color: colors.text, fontSize: 80 }]} />
              <Text style={[type.small, { color: colors.textDim }]}>seconds</Text>
            </View>
            <View style={styles.upNext}>
              {upcoming.image && <Image source={upcoming.image} style={styles.thumb} />}
              <View style={{ flex: 1 }}>
                <Text style={[type.small, { color: colors.textDim }]}>Up next</Text>
                <Text style={[type.h3, { color: colors.text, marginTop: 2 }]}>{upcoming.name}</Text>
                <Text style={[type.small, { color: colors.textDim }]}>{upcoming.detail}</Text>
              </View>
            </View>
            <View style={styles.restActions}>
              <PressableScale haptic onPress={addTime} accessibilityRole="button" accessibilityLabel="Add 15 seconds">
                <View style={styles.addTime}>
                  <Icon name="plus" color={colors.text} size={18} stroke={2.2} />
                  <Text style={[type.body, { color: colors.text, fontFamily: fonts.bold }]}>15 s</Text>
                </View>
              </PressableScale>
              <LimeButton label="Skip rest" icon="skip" onPress={advance} style={{ flex: 1 }} />
            </View>
          </Animated.View>
        )}

        {phase === 'done' && (
          <Animated.View entering={FadeInDown.springify().damping(16)} style={{ flex: 1, justifyContent: 'center' }}>
            <View style={styles.burst} pointerEvents="none">
              <Burst size={400} color={colors.lime} />
            </View>
            <Text style={[type.body, { color: colors.textDim }]}>Session complete</Text>
            <RollingNumber value={workout.kcal} height={120} style={[type.display, { color: colors.text, fontSize: 112, letterSpacing: -5 }]} />
            <Text style={[type.h2, { color: colors.text, marginTop: 4 }]}>kcal burned</Text>
            <View style={styles.summary}>
              {[
                { label: 'Time', value: `${mm}:${ss}` },
                { label: 'Avg heart rate', value: `${avgBpm} bpm` },
                { label: 'Blocks', value: `${workout.exercises.length}` },
              ].map((s, i) => (
                <View key={s.label} style={[styles.sum, i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.line }]}>
                  <Text style={[type.h2, { color: colors.text }]}>{s.value}</Text>
                  <Text style={[type.small, { color: colors.textDim }]}>{s.label}</Text>
                </View>
              ))}
            </View>
            <LimeButton label="Done" icon="check" onPress={onClose} height={60} style={{ marginTop: 28 }} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceUp, borderWidth: 1, borderColor: colors.line },
  thumb: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.surfaceUp },
  summary: { flexDirection: 'row', marginTop: 28, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  segs: { flexDirection: 'row', gap: 6, marginTop: 24 },
  holdInner: { width: HOLD - 30, height: HOLD - 30, borderRadius: (HOLD - 30) / 2, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  upNext: { alignSelf: 'stretch', marginTop: 28, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  restActions: { alignSelf: 'stretch', flexDirection: 'row', gap: 12, marginTop: 16 },
  addTime: { height: 56, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 28, backgroundColor: colors.surfaceUp, borderWidth: 1, borderColor: colors.line },
  burst: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  sum: { flex: 1, paddingVertical: 16, paddingHorizontal: 14 },
});
