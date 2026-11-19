import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { PressableScale } from '../components/PressableScale';
import { RollingNumber } from '../components/RollingNumber';
import { TAB_BAR_H } from '../components/TabBar';
import { TODAY_INDEX, byId, dailyTasks, photos, week, workouts } from '../data';
import { colors, enter, fonts, limeGlow, motion, type } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const KCAL = 1670;
const KCAL_GOAL = 2700;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning!' : h < 18 ? 'Good afternoon!' : 'Good evening!';
}

/** Dark ring on lime: fills to today's calorie progress, number rolls up inside. */
function PlanRing({ value, goal, size = 124 }: { value: number; goal: number; size?: number }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    p.value = withDelay(350, withTiming(value / goal, { duration: 1300, easing: motion.easing.emphasized }));
    const t = setTimeout(() => setShown(value), 400);
    return () => clearTimeout(t);
  }, [value, goal, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={`${value} kilocalories`}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(16,18,10,0.18)" strokeWidth={stroke} fill="none" />
        <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.ink} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} animatedProps={props} rotation="-90" origin={`${size / 2}, ${size / 2}`} />
      </Svg>
      <RollingNumber value={shown} grouping height={30} style={{ fontFamily: fonts.heavy, fontSize: 26, color: colors.ink }} />
      <Text style={{ fontFamily: fonts.semi, fontSize: 15, color: colors.inkDim }}>kcal</Text>
    </View>
  );
}

function Day({ d, n, done, today, selected, onPress }: { d: string; n: number; done: boolean; today: boolean; selected: boolean; onPress: () => void }) {
  const txt = { color: selected ? colors.ink : colors.text, transitionProperty: 'color', transitionDuration: motion.duration.fast } as const;
  return (
    <PressableScale wrapStyle={{ flex: 1 }} haptic onPress={onPress} accessibilityLabel={`${d} ${n}${done ? ', completed' : ''}`}>
      <Animated.View
        style={[styles.day, selected && limeGlow, { backgroundColor: selected ? colors.lime : colors.surface, borderColor: selected ? colors.lime : colors.line, transitionProperty: ['backgroundColor', 'borderColor'], transitionDuration: motion.duration.fast }]}
      >
        <Animated.Text style={[type.micro, txt, { opacity: 0.8 }]}>{d}</Animated.Text>
        <Animated.Text style={[{ fontFamily: fonts.bold, fontSize: 18 }, txt]}>{n}</Animated.Text>
        {done ? (
          <Icon name="check" color={selected ? colors.ink : colors.lime} size={14} stroke={3} />
        ) : (
          <View style={[styles.dot, today ? { borderWidth: 1.5, borderColor: selected ? colors.ink : colors.lime } : { backgroundColor: selected ? 'rgba(16,18,10,0.3)' : colors.line }]} />
        )}
      </Animated.View>
    </PressableScale>
  );
}

function Meta({ icon, text }: { icon: 'clock' | 'flame'; text: string }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} color={icon === 'clock' ? colors.lime : colors.flame} size={15} />
      <Text style={[type.small, { color: colors.textDim }]}>{text}</Text>
    </View>
  );
}

export function HomeScreen({ onOpen, onStart, onSeeAll }: { onOpen: (id: string) => void; onStart: (workoutId: string) => void; onSeeAll: () => void }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(TODAY_INDEX);
  const [tasks, setTasks] = useState(dailyTasks);
  const doneCount = tasks.filter((t) => t.done).length;
  const goals = ['body', 'lower', 'plank', 'challenge'].map(byId);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + TAB_BAR_H + 32 }}>
      <Animated.View entering={enter(0)} style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[type.small, { color: colors.textDim }]}>Hello {greeting()}</Text>
          <Text style={[type.title, { color: colors.text, marginTop: 2 }]}>Antoni Rodrigues</Text>
        </View>
        <Image source={photos.avatar} style={styles.avatar} accessibilityLabel="Your profile photo" />
      </Animated.View>

      <Animated.View entering={enter(1)} style={styles.pad}>
        <View style={styles.plan}>
          <View style={{ flex: 1 }}>
            <Text style={styles.planTitle}>My Plan For Today</Text>
            <Text style={[type.body, { color: colors.inkDim, marginTop: 14, fontFamily: fonts.semi }]}>{doneCount}/{tasks.length} Complete</Text>
          </View>
          <PlanRing value={KCAL} goal={KCAL_GOAL} />
        </View>
      </Animated.View>

      <Animated.View entering={enter(2)} style={[styles.pad, { marginTop: 18 }]}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {week.map((w, i) => (
            <Day key={i} d={w.d} n={w.n} done={w.done} today={i === TODAY_INDEX} selected={selected === i} onPress={() => setSelected(i)} />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={enter(3)}>
        <View style={[styles.sectionHead, styles.pad]}>
          <Text style={[type.h2, { color: colors.text }]}>Start New Goal</Text>
          <PressableScale onPress={onSeeAll} accessibilityRole="button" accessibilityLabel="See all workouts" hitSlop={10}>
            <Text style={[type.small, { color: colors.lime, fontFamily: fonts.semi }]}>See all</Text>
          </PressableScale>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {goals.map((w) => (
            <PressableScale key={w.id} haptic onPress={() => onOpen(w.id)} style={styles.goal} accessibilityRole="button" accessibilityLabel={`${w.title}, ${w.minutes} minutes`}>
              <Image source={w.image} resizeMode="cover" style={StyleSheet.absoluteFill} />
              <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.88)']} locations={[0.25, 1]} style={StyleSheet.absoluteFill} />
              <View style={styles.badge}><Text style={[type.micro, { color: colors.text }]}>{`${w.minutes}:00`}</Text></View>
              <View style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
                <Text style={[type.h3, { color: colors.text }]} numberOfLines={1}>{w.title}</Text>
                <Text style={[type.small, { color: colors.textDim, marginTop: 1 }]}>{w.subtitle}</Text>
                <View style={{ flexDirection: 'row', gap: 14, marginTop: 6 }}>
                  <Meta icon="clock" text={`${w.minutes} Min`} />
                  <Meta icon="flame" text={`${w.kcal} Kcal`} />
                </View>
              </View>
            </PressableScale>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View entering={enter(4)} style={styles.pad}>
        <View style={[styles.sectionHead, { paddingHorizontal: 0 }]}>
          <Text style={[type.h2, { color: colors.text }]}>Daily Task</Text>
          <Text style={[type.small, { color: colors.textDim }]}>{doneCount} of {tasks.length} done</Text>
        </View>
        <View style={{ gap: 12 }}>
          {tasks.map((t) => (
            <Animated.View key={t.id} style={[styles.task, t.done && { opacity: 0.6 }]}>
              <Image source={t.image} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={[type.h3, { color: colors.text }, t.done && { textDecorationLine: 'line-through' }]} numberOfLines={1}>{t.title}</Text>
                <View style={{ flexDirection: 'row', gap: 14, marginTop: 4 }}>
                  <Meta icon="clock" text={`${t.minutes} min`} />
                  <Meta icon="flame" text={`${t.kcal} cal`} />
                </View>
              </View>
              {t.done ? (
                <View style={styles.doneMark} accessible accessibilityLabel="Completed"><Icon name="check" color={colors.ink} size={18} stroke={3} /></View>
              ) : (
                <PressableScale haptic scaleTo={0.88} hitSlop={8} onPress={() => onStart(t.workoutId)} accessibilityRole="button" accessibilityLabel={`Start ${t.title}`}>
                  <Icon name="play" color={colors.lime} size={34} stroke={1.5} fill={colors.lime} />
                </PressableScale>
              )}
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.lime },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.lime, borderRadius: 28, padding: 22, marginTop: 22 },
  planTitle: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: colors.ink },
  day: { height: 86, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 28, marginBottom: 14 },
  goal: { width: 262, height: 206, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.surface },
  badge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.6)' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  task: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  thumb: { width: 60, height: 60, borderRadius: 14, backgroundColor: colors.surfaceUp },
  doneMark: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
});
