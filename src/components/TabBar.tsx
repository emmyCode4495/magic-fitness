import React, { ComponentRef, useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, motion, shadow } from '../theme';
import { Icon, IconName } from './Icon';

export const TABS: { key: string; label: string; icon: IconName }[] = [
  { key: 'today', label: 'Today', icon: 'today' },
  { key: 'train', label: 'Train', icon: 'train' },
  { key: 'progress', label: 'Progress', icon: 'progress' },
];

const W = 96;
const H = 62;
const PAD = 6;

/** Floating dock. The signal pill stretches toward its destination: the leading edge snaps, the trailing edge lags. */
export function TabBar({ index, onChange, blurTarget }: { index: number; onChange: (i: number) => void; blurTarget?: React.RefObject<ComponentRef<typeof View> | null> }) {
  const insets = useSafeAreaInsets();
  const left = useSharedValue(index * W);
  const right = useSharedValue(index * W + W);
  const prev = useRef(index);

  useEffect(() => {
    const goingRight = index > prev.current;
    const lead = motion.spring.snappy;
    const trail = motion.spring.fluid;
    left.value = withSpring(index * W, goingRight ? trail : lead);
    right.value = withSpring(index * W + W, goingRight ? lead : trail);
    prev.current = index;
  }, [index, left, right]);

  const pill = useAnimatedStyle(() => ({
    left: PAD + left.value,
    width: Math.max(right.value - left.value, 28),
  }));

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 12 }]} pointerEvents="box-none">
      <View style={[styles.bar, shadow.lifted]}>
        <View style={styles.clip} pointerEvents="none">
          <BlurView
            intensity={55}
            tint="dark"
            blurTarget={blurTarget}
            blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(16,18,17,0.82)' }]} />
        </View>
        <Animated.View style={[styles.pill, pill]} />
        {TABS.map((t, i) => {
          const active = i === index;
          const c = active ? colors.ink : colors.boneDim;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="tab"
              accessibilityLabel={t.label}
              accessibilityState={{ selected: active }}
              style={styles.tab}
              onPress={() => {
                if (!active) Haptics.selectionAsync();
                onChange(i);
              }}
            >
              <Icon name={t.icon} color={c} size={22} />
              <Text style={[styles.label, { color: c }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    padding: PAD,
    borderRadius: 999,
    backgroundColor: colors.inkRaised,
    borderWidth: 1,
    borderColor: colors.inkLine,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 14,
  },
  clip: { ...StyleSheet.absoluteFill, borderRadius: 999, overflow: 'hidden' },
  pill: { position: 'absolute', top: PAD, height: H, borderRadius: 999, backgroundColor: colors.signal },
  tab: { width: W, height: H, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontFamily: fonts.textBold, fontSize: 11, letterSpacing: 0.35 },
});
