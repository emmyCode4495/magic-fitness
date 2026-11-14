import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../components/PressableScale';
import { Icon } from '../components/Icon';
import { Kind, Workout, workouts } from '../data';
import { colors, enter, motion, radius, type } from '../theme';

const FILTERS: ('All' | Kind)[] = ['All', 'Strength', 'Cardio', 'Mobility'];
const reflow = LinearTransition.springify().damping(20).stiffness(220);

function WorkoutCard({ w, open, onToggle, onStart }: { w: Workout; open: boolean; onToggle: () => void; onStart: () => void }) {
  const rot = useSharedValue(0);
  React.useEffect(() => {
    rot.value = withSpring(open ? 180 : 0, motion.spring.snappy);
  }, [open, rot]);
  const chev = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  return (
    <Animated.View layout={reflow} entering={FadeInDown.springify().damping(18)} exiting={FadeOut.duration(motion.duration.fast)} style={styles.card}>
      <PressableScale scaleTo={0.985} onPress={onToggle} haptic accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={w.title}>
        <View style={styles.rowBetween}>
          <Text style={[type.micro, { color: colors.signal }]}>{w.kind} · {w.level}</Text>
          <Animated.View style={chev}>
            <Icon name="chevron" color={colors.boneDim} size={20} />
          </Animated.View>
        </View>
        <Text style={[type.h1, { color: colors.bone, marginTop: 14, fontSize: 28 }]}>{w.title}</Text>
        <Text style={[type.small, { color: colors.boneDim, marginTop: 8 }]}>{w.minutes} min · {w.kcal} kcal · {w.exercises.length} blocks</Text>
      </PressableScale>

      {open && (
        <Animated.View entering={FadeIn.duration(motion.duration.base)} exiting={FadeOut.duration(motion.duration.instant)} style={{ marginTop: 20 }}>
          {w.exercises.map((e, i) => (
            <View key={i} style={styles.exRow}>
              <Text style={[type.micro, { color: colors.boneDim, width: 28 }]}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[type.bodyMed, { color: colors.bone }]}>{e.name}</Text>
                <Text style={[type.small, { color: colors.boneDim }]}>{e.detail}</Text>
              </View>
            </View>
          ))}
          <PressableScale haptic onPress={onStart} style={styles.start} accessibilityLabel={`Start ${w.title}`}>
            <Text style={[type.bodyMed, { color: colors.ink, fontFamily: 'DMSans_700Bold' }]}>Start session</Text>
            <Icon name="arrow" color={colors.ink} size={20} stroke={2} />
          </PressableScale>
        </Animated.View>
      )}
    </Animated.View>
  );
}

export function TrainScreen({ onStart }: { onStart: (w: Workout) => void }) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'All' | Kind>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const list = workouts.filter((w) => filter === 'All' || w.kind === filter);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120, paddingHorizontal: 20 }}>
      <Animated.View entering={enter(0)}>
        <Text style={[type.micro, { color: colors.signal }]}>TRAINING LIBRARY</Text>
        <Text style={[type.h1, { color: colors.bone, marginTop: 7, fontSize: 36 }]}>Find your next gear.</Text>
        <Text style={[type.body, { color: colors.boneDim, marginTop: 8 }]}>A little stronger with every session.</Text>
      </Animated.View>

      <Animated.View entering={enter(1)} style={styles.libraryBanner}>
        <View style={{ flex: 1 }}>
          <Text style={[type.micro, { color: colors.ink, opacity: 0.65 }]}>READY WHEN YOU ARE</Text>
          <Text style={[type.h2, { color: colors.ink, marginTop: 6 }]}>{workouts.length} guided sessions</Text>
          <Text style={[type.small, { color: colors.paperDim, marginTop: 4 }]}>Strength · Cardio · Mobility</Text>
        </View>
        <View style={styles.bannerMark}><Icon name="arrow" color={colors.signal} size={24} stroke={2.3} /></View>
      </Animated.View>

      <Animated.View entering={enter(2)} style={styles.chips}>
        {FILTERS.map((f) => {
          const on = f === filter;
          return (
            <PressableScale
              key={f}
              haptic
              onPress={() => setFilter(f)}
              style={[styles.chip, on && { backgroundColor: colors.bone, borderColor: colors.bone }]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text style={[type.small, { color: on ? colors.ink : colors.boneDim, fontFamily: 'DMSans_700Bold' }]}>{f}</Text>
            </PressableScale>
          );
        })}
      </Animated.View>

      <Animated.View layout={reflow} style={{ gap: 14, marginTop: 18 }}>
        {list.map((w) => (
          <WorkoutCard key={w.id} w={w} open={openId === w.id} onToggle={() => setOpenId(openId === w.id ? null : w.id)} onStart={() => onStart(w)} />
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  libraryBanner: { marginTop: 22, padding: 20, borderRadius: 25, backgroundColor: colors.signal, flexDirection: 'row', alignItems: 'center' },
  bannerMark: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', gap: 8, marginTop: 22 },
  chip: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 999, borderWidth: 1, borderColor: colors.inkLine },
  card: { backgroundColor: colors.inkRaised, borderRadius: 25, padding: 22, borderWidth: 1, borderColor: colors.inkLine },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.inkLine },
  start: { marginTop: 12, height: 56, borderRadius: 999, backgroundColor: colors.signal, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
