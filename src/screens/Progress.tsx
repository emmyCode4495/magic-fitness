import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PressableScale } from '../components/PressableScale';
import { RollingNumber } from '../components/RollingNumber';
import { progressData, records } from '../data';
import { colors, enter, fonts, motion, radius, type } from '../theme';

const BAR_AREA = 180;
type Range = keyof typeof progressData;

function Bar({ label, value, max, selected, index, onPress }: { label: string; value: number; max: number; selected: boolean; index: number; onPress: () => void }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(index * 40, withSpring(Math.max(value / max, 0.03) * BAR_AREA, motion.spring.fluid));
  }, [value, max, index, h]);
  const bar = useAnimatedStyle(() => ({ height: h.value }));
  return (
    <Pressable onPress={onPress} style={styles.barCol} accessibilityRole="button" accessibilityLabel={`${label}, ${value}`} hitSlop={6}>
      <View style={{ height: BAR_AREA, justifyContent: 'flex-end' }}>
        {/* Height is a spring (UI thread); colour is a CSS transition on the inner fill. */}
        <Animated.View style={[{ borderRadius: 10, overflow: 'hidden' }, bar]}>
          <Animated.View
            style={{ flex: 1, backgroundColor: selected ? colors.signal : colors.inkLine, transitionProperty: 'backgroundColor', transitionDuration: motion.duration.fast }}
          />
        </Animated.View>
      </View>
      <Text style={[type.micro, { color: selected ? colors.bone : colors.boneDim, marginTop: 10 }]}>{label}</Text>
    </Pressable>
  );
}

function Segment({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  const keys = Object.keys(progressData) as Range[];
  const x = useSharedValue(keys.indexOf(value) * 96);
  useEffect(() => {
    x.value = withSpring(keys.indexOf(value) * 96, motion.spring.snappy);
  }, [value, x, keys]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View style={styles.segment}>
      <Animated.View style={[styles.thumb, thumb]} />
      {keys.map((k) => (
        <Pressable
          key={k}
          style={styles.segItem}
          onPress={() => {
            Haptics.selectionAsync();
            onChange(k);
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: k === value }}
        >
          <Text style={[type.small, { fontFamily: fonts.textBold, color: k === value ? colors.ink : colors.boneDim }]}>{k}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<Range>('Days');
  const [sel, setSel] = useState(4);
  const data = progressData[range];
  const max = Math.max(...data.values);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120, paddingHorizontal: 20 }}>
      <Animated.View entering={enter(0)} style={styles.rowBetween}>
        <View>
          <Text style={[type.micro, { color: colors.signal }]}>YOUR PERFORMANCE</Text>
          <Text style={[type.h1, { color: colors.bone, marginTop: 7, fontSize: 36 }]}>Look how far.</Text>
          <Text style={[type.small, { color: colors.boneDim, marginTop: 5 }]}>Every rep is progress.</Text>
        </View>
        <Segment value={range} onChange={setRange} />
      </Animated.View>

      <Animated.View entering={enter(1)} style={styles.summary}>
        <View>
          <Text style={[type.micro, { color: colors.ink, opacity: 0.62 }]}>TOTAL THIS {range.toUpperCase()}</Text>
          <Text style={[type.display, { color: colors.ink, fontSize: 42, marginTop: 5 }]}>{data.values.reduce((a, b) => a + b, 0)} <Text style={[type.small, { color: colors.paperDim }]}>min</Text></Text>
        </View>
        <View style={styles.summaryBadge}><Text style={[type.h2, { color: colors.signal }]}>↗</Text></View>
      </Animated.View>

      <Animated.View entering={enter(2)} style={styles.chart}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
          <RollingNumber value={data.values[sel]} height={72} style={[type.display, { color: colors.bone, fontSize: 64 }]} />
          <Text style={[type.bodyMed, { color: colors.boneDim, marginBottom: 14 }]}>{data.unit}</Text>
        </View>
        <Text style={[type.small, { color: colors.boneDim, marginBottom: 24 }]}>{data.labels[sel]}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {data.values.map((v, i) => (
            <Bar key={i} label={data.labels[i]} value={v} max={max} index={i} selected={i === sel} onPress={() => { Haptics.selectionAsync(); setSel(i); }} />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={enter(3)} style={styles.streak}>
        <View>
          <Text style={[type.micro, { color: colors.paperDim }]}>Weekly streak</Text>
          <Text style={[type.h1, { color: colors.paperInk, fontSize: 40, marginTop: 6 }]}>6 weeks</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={{ width: 10, height: i < 2 ? 18 : 34, borderRadius: 5, backgroundColor: i < 2 ? colors.paperLine : colors.paperInk }} />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={enter(4)} style={{ marginTop: 32 }}>
        <Text style={[type.micro, { color: colors.boneDim, marginBottom: 4 }]}>Personal records</Text>
        {records.map((r) => (
          <View key={r.name} style={styles.record}>
            <Text style={[type.bodyMed, { color: colors.bone }]}>{r.name}</Text>
            <Text style={[type.h2, { color: colors.signal }]}>{r.value}</Text>
          </View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  segment: { flexDirection: 'row', padding: 4, borderRadius: 999, backgroundColor: colors.inkRaised, borderWidth: 1, borderColor: colors.inkLine },
  thumb: { position: 'absolute', top: 4, left: 4, width: 96, height: 40, borderRadius: 999, backgroundColor: colors.bone },
  segItem: { width: 96, height: 40, alignItems: 'center', justifyContent: 'center' },
  summary: { marginTop: 22, padding: 20, borderRadius: 25, backgroundColor: colors.signal, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  chart: { marginTop: 14, padding: 22, borderRadius: 25, backgroundColor: colors.inkRaised, borderWidth: 1, borderColor: colors.inkLine },
  barCol: { flex: 1, alignItems: 'center' },
  streak: { marginTop: 14, padding: 22, borderRadius: 25, backgroundColor: colors.bone, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  record: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.inkLine },
});
