import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, limeGlow, motion } from '../theme';
import { Icon, IconName } from './Icon';

// Four destinations around the centre action button: slots 0,1 | FAB (2) | 3,4.
const TABS: { name: IconName; label: string; slot: number }[] = [
  { name: 'home', label: 'Home', slot: 0 },
  { name: 'health', label: 'Workouts', slot: 1 },
  { name: 'list', label: 'Statistics', slot: 3 },
  { name: 'user', label: 'Profile', slot: 4 },
];
export const TAB_BAR_H = 84;

function TabIcon({ name, active }: { name: IconName; active: boolean }) {
  // Two stacked icons; the lime one cross-fades in with a CSS transition.
  return (
    <View style={{ width: 28, height: 28 }}>
      <View style={StyleSheet.absoluteFill}><Icon name={name} color={colors.textDim} size={28} /></View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: active ? 1 : 0, transitionProperty: 'opacity', transitionDuration: motion.duration.fast }]}>
        <Icon name={name} color={colors.lime} size={28} stroke={2.1} />
      </Animated.View>
    </View>
  );
}

/**
 * Flat black dock with a raised lime action button. The button is contextual:
 * a leaf on the main screens, a play arrow on a workout (it starts that workout).
 */
export function TabBar({ index, onChange, onFab, fabMode }: { index: number; onChange: (i: number) => void; onFab: () => void; fabMode: 'leaf' | 'play' }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const slotW = width / 5;
  const dot = useSharedValue(TABS[index].slot * slotW + slotW / 2 - 3);
  const press = useSharedValue(1);
  const swap = useSharedValue(fabMode === 'play' ? 1 : 0);

  useEffect(() => {
    dot.value = withSpring(TABS[index].slot * slotW + slotW / 2 - 3, motion.spring.snappy);
  }, [index, slotW, dot]);
  useEffect(() => {
    swap.value = withSpring(fabMode === 'play' ? 1 : 0, motion.spring.snappy);
  }, [fabMode, swap]);

  const dotStyle = useAnimatedStyle(() => ({ transform: [{ translateX: dot.value }] }));
  const fabStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const leaf = useAnimatedStyle(() => ({ opacity: 1 - swap.value, transform: [{ scale: 1 - 0.4 * swap.value }, { rotate: `${swap.value * -40}deg` }] }));
  const play = useAnimatedStyle(() => ({ opacity: swap.value, transform: [{ scale: 0.6 + 0.4 * swap.value }, { translateX: 1.5 }] }));

  return (
    <View style={[styles.bar, { height: TAB_BAR_H + insets.bottom, paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        {TABS.map((t, i) => (
          <Pressable
            key={t.name}
            style={[styles.slot, { left: t.slot * slotW, width: slotW }]}
            onPress={() => { Haptics.selectionAsync(); onChange(i); }}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected: i === index }}
          >
            <TabIcon name={t.name} active={i === index} />
          </Pressable>
        ))}
        <Animated.View pointerEvents="none" style={[styles.dot, dotStyle]} />

        <Pressable
          style={[styles.slot, { left: 2 * slotW, width: slotW }]}
          onPressIn={() => { press.value = withSpring(0.9, motion.spring.snappy); }}
          onPressOut={() => { press.value = withSpring(1, motion.spring.bouncy); }}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onFab(); }}
          accessibilityRole="button"
          accessibilityLabel={fabMode === 'play' ? 'Start this workout' : 'Start next workout'}
        >
          <Animated.View style={[styles.fab, fabStyle]}>
            {/* A slow lime ring breathes out of the button: the one always-on motion in the dock. */}
            <Animated.View
              pointerEvents="none"
              style={[styles.halo, {
                animationName: { from: { opacity: 0.4, transform: [{ scale: 1 }] }, to: { opacity: 0, transform: [{ scale: 1.55 }] } },
                animationDuration: '2200ms', animationIterationCount: 'infinite', animationTimingFunction: 'ease-out',
              }]}
            />
            <Animated.View style={[StyleSheet.absoluteFill, styles.center, leaf]}>
              <Icon name="leaf" color={colors.ink} size={28} stroke={2} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, styles.center, play]}>
              <Icon name="play" color={colors.ink} size={26} stroke={2} fill={colors.ink} />
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.bg,
    borderTopLeftRadius: 32, borderTopRightRadius: 32, borderTopWidth: 1, borderColor: colors.line,
  },
  row: { height: TAB_BAR_H, justifyContent: 'center' },
  slot: { position: 'absolute', top: 0, height: TAB_BAR_H, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', bottom: 12, left: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lime },
  fab: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.lime, ...limeGlow },
  halo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 32, borderWidth: 2, borderColor: colors.lime },
  center: { alignItems: 'center', justifyContent: 'center' },
});
