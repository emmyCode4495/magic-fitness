import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing, FadeInDown, FadeInRight, FadeOutLeft,
  useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../components/PressableScale';
import { RollingNumber } from '../components/RollingNumber';
import { Burst } from '../components/Burst';
import { Icon } from '../components/Icon';
import { Workout } from '../data';
import { colors, motion, type } from '../theme';

const HOLD_MS = 900;
const SIZE = 184;
const STROKE = 8;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function HoldButton({ onComplete }: { onComplete: () => void }) {
  const hold = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ring = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - hold.value) }));
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
      accessibilityLabel="Finish set"
      accessibilityHint="Press and hold to finish this set"
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={finish}
      style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.paperLine} strokeWidth={STROKE} fill="none" />
        <AnimatedCircle
          cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.signal} strokeWidth={STROKE} fill="none"
          strokeLinecap="round" strokeDasharray={C} animatedProps={ring}
          rotation="-90" origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <Animated.View style={[styles.holdInner, inner]}>
        <Text style={[type.h2, { color: colors.bone }]}>HOLD</Text>
        <Text style={[type.small, { color: colors.boneDim }]}>to finish set</Text>
      </Animated.View>
    </Pressable>
  );
}

function Seg({ state }: { state: 0 | 1 | 2 }) {
  const bg = state === 2 ? colors.paperInk : state === 1 ? colors.signal : colors.paperLine;
  return (
    <Animated.View
      style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: bg, transitionProperty: 'backgroundColor', transitionDuration: motion.duration.base }}
    />
  );
}

/** A "live" dot driven by a Reanimated 4 CSS keyframe animation: no shared values needed. */
function LiveDot() {
  return (
    <Animated.View
      style={{
        width: 8, height: 8, borderRadius: 4, backgroundColor: colors.signal, marginRight: 10,
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

function Clock({ seconds, paused }: { seconds: number; paused: boolean }) {
  const s = { ...type.h2, color: colors.paperInk };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {!paused && <LiveDot />}
      <RollingNumber value={Math.floor(seconds / 60)} minDigits={2} height={28} style={s} />
      <Text style={[s, { height: 28, lineHeight: 26 }]}>:</Text>
      <RollingNumber value={seconds % 60} minDigits={2} height={28} style={s} />
    </View>
  );
}

export function SessionScreen({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const last = workout.exercises.length - 1;
  const ex = workout.exercises[idx];

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  const complete = () => (idx < last ? setIdx(idx + 1) : setDone(true));

  return (
    <View style={{ flex: 1, paddingTop: 34, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}>
      <View style={styles.top}>
        <PressableScale haptic onPress={onClose} style={styles.close} accessibilityLabel="Close session">
          <Icon name="close" color={colors.paperInk} size={22} stroke={2} />
        </PressableScale>
        <Clock seconds={elapsed} paused={done} />
      </View>

      {!done ? (
        <>
          <View style={styles.segs}>
            {workout.exercises.map((_, i) => (
              <Seg key={i} state={i < idx ? 2 : i === idx ? 1 : 0} />
            ))}
          </View>
          <Text style={[type.micro, { color: colors.paperDim, marginTop: 36 }]}>
            {workout.title} · {idx + 1} of {workout.exercises.length}
          </Text>
          <View style={{ flex: 1 }}>
            <Animated.View key={idx} entering={FadeInRight.springify().damping(18).stiffness(160)} exiting={FadeOutLeft.duration(motion.duration.fast)}>
              <Text style={[type.display, { color: colors.paperInk, fontSize: 52, lineHeight: 54, letterSpacing: -2, marginTop: 14 }]}>{ex.name}</Text>
              <Text style={[type.bodyMed, { color: colors.paperDim, marginTop: 14, fontSize: 17 }]}>{ex.detail}</Text>
            </Animated.View>
          </View>
          {idx < last && (
            <Text style={[type.small, { color: colors.paperDim, textAlign: 'center', marginBottom: 20 }]}>Next · {workout.exercises[idx + 1].name}</Text>
          )}
          <View style={{ alignItems: 'center' }}>
            <HoldButton key={idx} onComplete={complete} />
          </View>
        </>
      ) : (
        <Animated.View entering={FadeInDown.springify().damping(16)} style={{ flex: 1, justifyContent: 'center' }}>
          <View style={styles.burst} pointerEvents="none">
            <Burst size={400} />
          </View>
          <Text style={[type.micro, { color: colors.paperDim }]}>Session complete</Text>
          <RollingNumber value={workout.kcal} height={120} style={[type.display, { color: colors.paperInk, fontSize: 112, letterSpacing: -5 }]} />
          <Text style={[type.h2, { color: colors.paperInk, marginTop: 4 }]}>kcal burned</Text>
          <Text style={[type.body, { color: colors.paperDim, marginTop: 12 }]}>
            {workout.exercises.length} blocks · {Math.floor(elapsed / 60)}m {elapsed % 60}s on the clock
          </Text>
          <PressableScale haptic onPress={onClose} style={styles.doneBtn} accessibilityLabel="Done">
            <Text style={[type.bodyMed, { color: colors.bone, fontFamily: 'DMSans_700Bold' }]}>Done</Text>
          </PressableScale>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: colors.paperLine, alignItems: 'center', justifyContent: 'center' },
  segs: { flexDirection: 'row', gap: 6, marginTop: 24 },
  holdInner: { width: SIZE - 28, height: SIZE - 28, borderRadius: (SIZE - 28) / 2, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  burst: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  doneBtn: { marginTop: 40, height: 60, borderRadius: 999, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
});
