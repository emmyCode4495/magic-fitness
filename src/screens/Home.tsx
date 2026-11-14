import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../components/PressableScale';
import { PulseDial } from '../components/PulseDial';
import { Icon } from '../components/Icon';
import { TODAY_INDEX, Workout, week, workouts } from '../data';
import { colors, enter, fonts, motion, radius, shadow, type } from '../theme';

const WAVE = [6, 10, 16, 8, 22, 14, 9, 26, 12, 18, 7, 13, 20, 10, 6, 15, 24, 11, 8, 17];

function Day({ d, n, done, isToday, selected, onPress }: { d: string; n: number; done: boolean; isToday: boolean; selected: boolean; onPress: () => void }) {
  // Reanimated 4 CSS transitions: colours ease on their own when `selected` flips.
  const fade = { transitionProperty: 'color', transitionDuration: motion.duration.fast } as const;
  const txt = { color: selected ? colors.paperInk : colors.boneDim, ...fade };
  return (
    <PressableScale wrapStyle={{ flex: 1 }} haptic onPress={onPress} accessibilityLabel={`${d} ${n}${done ? ', completed' : ''}`}>
      <Animated.View
        style={[
          styles.day,
          { backgroundColor: selected ? colors.bone : colors.inkRaised, transitionProperty: 'backgroundColor', transitionDuration: motion.duration.fast },
        ]}
      >
        <Animated.Text style={[type.micro, txt]}>{d}</Animated.Text>
        <Animated.Text style={[{ fontFamily: fonts.display, fontSize: 20 }, txt]}>{n}</Animated.Text>
        <View style={[styles.dot, done ? { backgroundColor: colors.signal } : isToday ? { borderWidth: 1.5, borderColor: colors.signal } : { backgroundColor: colors.inkLine }]} />
      </Animated.View>
    </PressableScale>
  );
}

export function HomeScreen({ onStart }: { onStart: (w: Workout) => void }) {
  const insets = useSafeAreaInsets();
  const [kcal, setKcal] = useState(0);
  const [selected, setSelected] = useState(TODAY_INDEX);
  useEffect(() => {
    const t = setTimeout(() => setKcal(482), 500);
    return () => clearTimeout(t);
  }, []);
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  // The dial recedes as you scroll: slower than the content, smaller, dimmer.
  const dialParallax = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 320], [1, 0.2], Extrapolation.CLAMP),
    transform: [
      { translateY: scrollY.value * 0.35 },
      { scale: interpolate(scrollY.value, [0, 320], [1, 0.84], Extrapolation.CLAMP) },
    ],
  }));
  const next = workouts[0];
  const rest = workouts.slice(1);
  const stats = [
    { label: 'Steps', value: '7,204' },
    { label: 'Active', value: '46 min' },
    { label: 'Streak', value: '6 wks' },
  ];

  return (
    <Animated.ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120, paddingHorizontal: 20 }}
    >
      <Animated.View entering={enter(0)} style={styles.header}>
        <View>
          <Text style={[type.micro, { color: colors.boneDim }]}>Saturday · 14 Nov</Text>
          <Text style={[type.h1, { color: colors.bone, marginTop: 6 }]}>Morning, Amara.</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.signal }}>A</Text>
        </View>
      </Animated.View>

      <Animated.View entering={enter(1)} style={{ alignItems: 'center', marginTop: 28 }}>
        <Animated.View style={dialParallax}>
          <PulseDial value={kcal} goal={650} />
        </Animated.View>
      </Animated.View>

      <Animated.View entering={enter(2)} style={styles.stats}>
        {stats.map((s, i) => (
          <View key={s.label} style={[styles.stat, i > 0 && styles.statDivider]}>
            <Text style={[type.micro, { color: colors.boneDim }]}>{s.label}</Text>
            <Text style={[type.h2, { color: colors.bone, marginTop: 4 }]}>{s.value}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={enter(3)} style={styles.weekRow}>
        {week.map((w, i) => (
          <Day key={i} {...w} isToday={i === TODAY_INDEX} selected={selected === i} onPress={() => setSelected(i)} />
        ))}
      </Animated.View>

      <Animated.View entering={enter(4)}>
        <Text style={[type.micro, { color: colors.boneDim, marginTop: 32, marginBottom: 12 }]}>Up next</Text>
        <PressableScale scaleTo={0.98} onPress={() => onStart(next)} style={[styles.upNext, shadow.lifted]} accessibilityLabel={`Start ${next.title}`}>
          <View style={styles.rowBetween}>
            <Text style={[type.micro, { color: colors.paperDim }]}>{next.kind} · {next.level}</Text>
            <View style={styles.go}>
              <Icon name="arrow" color={colors.signal} size={22} stroke={2} />
            </View>
          </View>
          <Text style={[type.h1, { color: colors.paperInk, fontSize: 36, lineHeight: 38, marginTop: 28 }]}>{next.title}</Text>
          <Text style={[type.bodyMed, { color: colors.paperDim, marginTop: 8 }]}>{next.minutes} min · {next.kcal} kcal</Text>
          <View style={styles.wave}>
            {WAVE.map((h, i) => (
              <View key={i} style={{ width: 3, height: h, borderRadius: 2, backgroundColor: i < 12 ? colors.paperInk : colors.paperLine }} />
            ))}
          </View>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={enter(5)}>
        <Text style={[type.micro, { color: colors.boneDim, marginTop: 32, marginBottom: 12 }]}>Quick sessions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {rest.map((w) => (
            <PressableScale key={w.id} haptic onPress={() => onStart(w)} style={styles.quick} accessibilityLabel={`Start ${w.title}`}>
              <Text style={[type.micro, { color: colors.signal }]}>{w.kind}</Text>
              <Text style={[type.h2, { color: colors.bone, marginTop: 10 }]}>{w.title}</Text>
              <Text style={[type.small, { color: colors.boneDim, marginTop: 'auto' }]}>{w.minutes} min</Text>
            </PressableScale>
          ))}
        </ScrollView>
      </Animated.View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.inkLine, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', marginTop: 28, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.inkLine },
  stat: { flex: 1, paddingVertical: 16, paddingHorizontal: 16 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: colors.inkLine },
  weekRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  day: { height: 84, borderRadius: 22, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  upNext: { backgroundColor: colors.bone, borderRadius: radius.card, padding: 24 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  go: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  wave: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 28, height: 28 },
  quick: { width: 200, height: 150, borderRadius: radius.card, padding: 20, backgroundColor: colors.inkRaised, borderWidth: 1, borderColor: colors.inkLine },
});
