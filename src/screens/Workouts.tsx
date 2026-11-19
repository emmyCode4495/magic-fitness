import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Photo } from '../components/Photo';
import { PressableScale } from '../components/PressableScale';
import { TAB_BAR_H } from '../components/TabBar';
import { CATEGORIES, Category, Workout, byId, workouts } from '../data';
import { colors, enter, fonts, limeGlow, motion, type } from '../theme';

const SORTS = ['Default', 'Shortest', 'Most calories'] as const;
const reflow = LinearTransition.springify().damping(20).stiffness(220);

function Pill({ icon, text }: { icon: 'play' | 'flame'; text: string }) {
  return (
    <View style={styles.pill}>
      <Icon name={icon} color={icon === 'play' ? colors.text : colors.flame} size={13} stroke={2} fill={icon === 'play' ? colors.text : undefined} />
      <Text style={[type.micro, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

function WorkoutCard({ w, onPress }: { w: Workout; onPress: () => void }) {
  return (
    <Animated.View layout={reflow} entering={FadeInDown.springify().damping(18)} exiting={FadeOut.duration(motion.duration.fast)}>
      <PressableScale haptic onPress={onPress} scaleTo={0.98} accessibilityRole="button" accessibilityLabel={`${w.title}, ${w.minutes} minutes, ${w.kcal} kilocalories`}>
        <View style={styles.card}>
          <Photo source={w.image} category={w.category} style={styles.cardPhoto} />
          {/* Scrim from the card colour keeps the title readable over any photo. */}
          <LinearGradient colors={[colors.surface, colors.surface, 'rgba(21,21,21,0)']} locations={[0, 0.34, 0.74]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          <View style={styles.cardText}>
            <Text style={[type.h2, { color: colors.text, fontSize: 24, lineHeight: 30 }]} numberOfLines={3}>{w.title}</Text>
            <Text style={[type.small, { color: colors.textDim, marginTop: 6 }]}>{w.subtitle}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <Pill icon="play" text={`${w.minutes} Min`} />
              <Pill icon="flame" text={`${w.kcal} Kcal`} />
            </View>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

export function WorkoutsScreen({ onOpen }: { onOpen: (id: string) => void }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<'All' | Category>('All');
  const [sort, setSort] = useState(0);
  const daily = byId('lower');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = workouts.filter((w) => (cat === 'All' || w.category === cat) && (!q || `${w.title} ${w.category} ${w.subtitle}`.toLowerCase().includes(q)));
    if (sort === 1) out.sort((a, b) => a.minutes - b.minutes);
    if (sort === 2) out.sort((a, b) => b.kcal - a.kcal);
    return out;
  }, [query, cat, sort]);
  const showDaily = cat === 'All' && !query.trim();

  return (
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + TAB_BAR_H + 32, paddingHorizontal: 20 }}>
      <Animated.View entering={enter(0)}>
        <Text style={[type.title, { color: colors.text }]}>Workouts</Text>
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Icon name="search" color={colors.textDim} size={20} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or speciality"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              returnKeyType="search"
              accessibilityLabel="Search workouts"
            />
          </View>
          <PressableScale
            haptic
            onPress={() => { Haptics.selectionAsync(); setSort((s) => (s + 1) % SORTS.length); }}
            accessibilityRole="button"
            accessibilityLabel={`Sort: ${SORTS[sort]}. Tap to change`}
          >
            <View style={[styles.filter, sort > 0 && { backgroundColor: colors.lime, borderColor: colors.lime }]}>
              <Icon name="sliders" color={sort > 0 ? colors.ink : colors.lime} size={22} stroke={2} />
            </View>
          </PressableScale>
        </View>
        {sort > 0 && (
          <Animated.Text entering={FadeInDown.duration(motion.duration.base)} style={[type.small, { color: colors.lime, marginTop: 10, fontFamily: fonts.semi }]}>
            Sorted: {SORTS[sort].toLowerCase()}
          </Animated.Text>
        )}
      </Animated.View>

      <Animated.View entering={enter(1)}>
        <Text style={[type.h2, { color: colors.text, marginTop: 24, marginBottom: 14 }]}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
          {CATEGORIES.map((c) => {
            const on = cat === c.key;
            return (
              <PressableScale key={c.key} haptic onPress={() => setCat(c.key)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={c.label}>
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Animated.View style={[styles.catTile, { backgroundColor: on ? colors.lime : colors.surface, borderColor: on ? colors.lime : colors.line, transitionProperty: ['backgroundColor', 'borderColor'], transitionDuration: motion.duration.fast }, on && limeGlow]}>
                    <Icon name={c.icon} color={on ? colors.ink : colors.lime} size={30} stroke={1.8} />
                  </Animated.View>
                  <Text style={[type.small, { color: on ? colors.text : colors.textDim, fontFamily: fonts.semi }]}>{c.label}</Text>
                </View>
              </PressableScale>
            );
          })}
        </ScrollView>
      </Animated.View>

      {showDaily && (
        <Animated.View entering={enter(2)} style={{ marginTop: 24 }}>
          <PressableScale haptic onPress={() => onOpen(daily.id)} scaleTo={0.98} accessibilityRole="button" accessibilityLabel="Daily challenge: lower body strength">
            <View style={styles.daily}>
              <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
                <Text style={[type.title, { color: colors.ink }]}>Daily{'\n'}Challenge</Text>
                <Text style={[type.small, { color: colors.inkDim, fontFamily: fonts.semi }]}>{daily.title} · {daily.minutes} min</Text>
              </View>
              <Image source={daily.image} resizeMode="cover" style={{ width: '46%', height: '100%' }} />
            </View>
          </PressableScale>
        </Animated.View>
      )}

      <Animated.View layout={reflow} style={{ gap: 14, marginTop: 24 }}>
        {list.map((w) => <WorkoutCard key={w.id} w={w} onPress={() => onOpen(w.id)} />)}
        {list.length === 0 && (
          <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
            <Icon name="search" color={colors.textFaint} size={36} />
            <Text style={[type.h3, { color: colors.text }]}>No workouts found</Text>
            <Text style={[type.small, { color: colors.textDim, textAlign: 'center' }]}>Try another name or pick a different category.</Text>
          </Animated.View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  search: { flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, paddingVertical: 0 },
  filter: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  catTile: { width: 66, height: 66, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  daily: { height: 168, flexDirection: 'row', backgroundColor: colors.lime, borderRadius: 26, overflow: 'hidden' },
  card: { height: 188, borderRadius: 26, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  cardPhoto: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '62%' },
  cardText: { flex: 1, width: '66%', padding: 20, justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: colors.line },
});
