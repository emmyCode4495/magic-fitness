import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart, Gauge, LineChart, MacroBar } from '../components/Charts';
import { Icon, IconChip } from '../components/Icon';
import { PressableScale } from '../components/PressableScale';
import { RollingNumber } from '../components/RollingNumber';
import { TAB_BAR_H } from '../components/TabBar';
import { MetricKey, metrics, nutrition, profile, recent } from '../data';
import { alpha, colors, enter, fonts, motion, type } from '../theme';

const KEYS = Object.keys(metrics) as MetricKey[];
const fmtTick = (k: MetricKey) => (n: number) => (k === 'Weight' ? n.toFixed(1) : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n)));

function BigNumber({ metric, value }: { metric: MetricKey; value: number }) {
  const s = { ...type.display, color: colors.lime } as const;
  if (metric === 'Weight') {
    const tenths = Math.round(value * 10);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <RollingNumber value={Math.floor(tenths / 10)} height={64} style={s} />
        <Text style={[s, { height: 64, lineHeight: 64 }]}>.</Text>
        <RollingNumber value={tenths % 10} height={64} style={s} />
      </View>
    );
  }
  return <RollingNumber value={value} grouping height={64} style={s} />;
}

export function StatsScreen({ onOpen }: { onOpen: (id: string) => void }) {
  const insets = useSafeAreaInsets();
  const [metric, setMetric] = useState<MetricKey>('Calories active');
  const [sel, setSel] = useState<number | null>(null);
  const m = metrics[metric];
  const total = m.total ? m.values.reduce((a, b) => a + b, 0) : m.values[m.values.length - 1];
  const shown = sel === null ? total : m.values[sel];
  const caption = sel === null ? (m.total ? `Total this week · ${m.unit}` : `Latest · ${m.unit}`) : `Day ${sel + 1} · ${m.unit}`;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + TAB_BAR_H + 32, paddingHorizontal: 20 }}>
      <Animated.View entering={enter(0)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[type.title, { color: colors.text }]}>My Statistic</Text>
        <Icon name="menu" color={colors.textDim} size={26} />
      </Animated.View>

      <Animated.View entering={enter(1)} style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
        <View style={styles.tile}>
          <View style={styles.tileHead}><Icon name="run" color={colors.lime} size={22} /><Text style={[type.h3, { color: colors.text }]}>Streak</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 8 }}>
            <RollingNumber value={profile.streak} height={38} style={[type.title, { fontSize: 32, color: colors.text }]} />
            <Text style={[type.body, { color: colors.textDim }]}>days</Text>
          </View>
        </View>
        <View style={styles.tile}>
          <View style={styles.tileHead}><Icon name="yoga" color={colors.lime} size={22} /><Text style={[type.h3, { color: colors.text }]}>Workouts</Text></View>
          <View style={{ marginTop: 8 }}>
            <RollingNumber value={profile.workouts} height={38} style={[type.title, { fontSize: 32, color: colors.text }]} />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={enter(2)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: 20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
          {KEYS.map((k) => {
            const on = k === metric;
            return (
              <PressableScale key={k} haptic onPress={() => { setMetric(k); setSel(null); }} accessibilityRole="button" accessibilityState={{ selected: on }}>
                <Animated.View style={[styles.chip, { backgroundColor: on ? colors.lime : colors.surface, borderColor: on ? colors.lime : colors.line, transitionProperty: ['backgroundColor', 'borderColor'], transitionDuration: motion.duration.fast }]}>
                  <Icon name={metrics[k].icon} color={on ? colors.ink : colors.lime} size={16} stroke={2} />
                  <Text style={[type.small, { fontFamily: fonts.bold, color: on ? colors.ink : colors.text }]}>{k}</Text>
                </Animated.View>
              </PressableScale>
            );
          })}
        </ScrollView>

        <View style={{ alignItems: 'center', marginTop: 22 }}>
          <BigNumber metric={metric} value={shown} />
          <Animated.Text key={caption} entering={FadeIn.duration(motion.duration.base)} style={[type.small, { color: colors.textDim, marginTop: 2 }]}>{caption}</Animated.Text>
        </View>

        <View style={{ marginTop: 22 }}>
          <BarChart key={metric} values={m.values} domain={m.domain} selected={sel} onSelect={(i) => setSel(sel === i ? null : i)} format={fmtTick(metric)} />
        </View>
      </Animated.View>

      <Animated.View entering={enter(3)} style={[styles.card, { marginTop: 30 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={[type.h2, { color: colors.text }]}>Nutrition today</Text>
          <Text style={[type.small, { color: colors.textDim }]}>goal {nutrition.goal.toLocaleString('en-US')} kcal</Text>
        </View>
        <View style={{ alignItems: 'center', marginTop: 6 }}>
          <Gauge value={nutrition.kcal} goal={nutrition.goal} />
        </View>
        <View style={{ gap: 14, marginTop: 4 }}>
          {nutrition.macros.map((mm, i) => <MacroBar key={mm.name} {...mm} i={i} />)}
        </View>
      </Animated.View>

      <Animated.View entering={enter(4)} style={{ marginTop: 30 }}>
        <Text style={[type.h2, { color: colors.text, marginBottom: 14 }]}>Recent Workouts</Text>
        <View style={{ gap: 12 }}>
          {recent.map((r) => (
            <PressableScale key={r.id} haptic scaleTo={0.985} onPress={() => onOpen(r.workoutId)} accessibilityRole="button" accessibilityLabel={`${r.title}, ${r.when}`}>
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <IconChip name={r.icon} color={colors.lime} bg={alpha(colors.lime, 0.14)} size={42} />
                  <View style={{ flex: 1 }}>
                    <Text style={[type.h3, { color: colors.text }]}>{r.title}</Text>
                    <Text style={[type.small, { color: colors.textDim }]}>{r.when}</Text>
                  </View>
                  <Icon name="next" color={colors.textFaint} size={20} />
                </View>
                {r.curve && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[type.micro, { color: colors.textDim, marginBottom: 6 }]}>Heart rate across the session</Text>
                    <LineChart points={r.curve} />
                  </View>
                )}
              </View>
            </PressableScale>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, padding: 16, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, height: 44, borderRadius: 22, borderWidth: 1 },
  card: { padding: 18, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
});
