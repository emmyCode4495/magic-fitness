import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../components/Icon';
import { LimeButton } from '../components/LimeButton';
import { Photo } from '../components/Photo';
import { PressableScale } from '../components/PressableScale';
import { TAB_BAR_H } from '../components/TabBar';
import { Workout } from '../data';
import { colors, enter, fonts, type } from '../theme';

const HERO_H = 340;

function Tile({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon name={icon} color={colors.lime} size={14} />
        <Text style={[type.micro, { color: colors.text }]} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={[type.h3, { color: colors.text, marginTop: 8 }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

export function DetailScreen({ workout: w, onBack, onStart }: { workout: Workout; onBack: () => void; onStart: (startAt: number) => void }) {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });
  // Hero: stretches when you over-pull, and drifts up slower than the content when you scroll.
  const hero = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-200, 0, HERO_H], [-100, 0, HERO_H * 0.45], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-200, 0], [1.6, 1], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_H + 32 }}>
        <Animated.View style={[{ height: HERO_H, overflow: 'hidden' }, hero]}>
          <Photo source={w.image} category={w.category} style={{ width: '100%', height: HERO_H }} />
        </Animated.View>

        <Animated.View entering={enter(0)} style={styles.banner}>
          <Text style={styles.bannerTitle}>{w.title}</Text>
        </Animated.View>

        <View style={{ paddingHorizontal: 20 }}>
          <Animated.View entering={enter(1)} style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
            <Tile icon="clock" label="Time" value={`${w.minutes} Min`} />
            <Tile icon="flame" label="Calorie" value={w.kcalRange} />
            <Tile icon="crown" label="Level" value={w.level} />
            <Tile icon="dumbbell" label="Equipment" value={w.equipment} />
          </Animated.View>

          <Animated.View entering={enter(2)} style={styles.headRow}>
            <Text style={[type.h2, { color: colors.text }]}>Exercises</Text>
            <Text style={[type.small, { color: colors.textDim }]}>{w.exercises.length} blocks · tap to start there</Text>
          </Animated.View>

          <View style={{ gap: 12 }}>
            {w.exercises.map((e, i) => (
              <Animated.View key={e.name} entering={enter(3 + i)}>
                <PressableScale haptic onPress={() => onStart(i)} scaleTo={0.98} accessibilityRole="button" accessibilityLabel={`${e.name}, ${e.minutes} minutes. Start from here`}>
                  <View style={styles.row}>
                    {e.image ? (
                      <Image source={e.image} style={styles.thumb} />
                    ) : (
                      <View style={[styles.thumb, { alignItems: 'center', justifyContent: 'center' }]}><Text style={[type.h3, { color: colors.lime }]}>{i + 1}</Text></View>
                    )}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <Text style={[type.h3, { color: colors.text, flexShrink: 1 }]} numberOfLines={1}>{e.name}</Text>
                        <View style={styles.tag}><Text style={[type.micro, { color: colors.ink }]}>{e.tag}</Text></View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                        <View style={styles.meta}><Icon name="clock" color={colors.lime} size={15} /><Text style={[type.small, { color: colors.textDim }]}>{e.minutes} minutes</Text></View>
                        <View style={styles.meta}><Icon name="crown" color={colors.lime} size={15} /><Text style={[type.small, { color: colors.textDim }]}>{w.level}</Text></View>
                      </View>
                    </View>
                  </View>
                </PressableScale>
              </Animated.View>
            ))}
          </View>

          <Animated.View entering={enter(4 + w.exercises.length)} style={{ marginTop: 24 }}>
            <LimeButton label="Start workout" icon="play" iconFill onPress={() => onStart(0)} height={58} />
          </Animated.View>
        </View>
      </Animated.ScrollView>

      <PressableScale haptic onPress={onBack} style={[styles.back, { top: insets.top + 8 }]} wrapStyle={{ position: 'absolute', left: 20, top: insets.top + 8 }} accessibilityRole="button" accessibilityLabel="Back">
        <Icon name="back" color={colors.text} size={24} stroke={2.2} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { marginTop: -38, backgroundColor: colors.lime, borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingVertical: 26, paddingHorizontal: 28, alignItems: 'center', minHeight: 110, justifyContent: 'center' },
  bannerTitle: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4, color: colors.ink, textAlign: 'center' },
  tile: { flex: 1, padding: 10, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 26, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  thumb: { width: 62, height: 62, borderRadius: 14, backgroundColor: colors.surfaceUp },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, backgroundColor: colors.lime },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
});
