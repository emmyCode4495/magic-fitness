import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, SharedValue, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { colors, type } from '../theme';
import { Icon } from './Icon';
import { RollingNumber } from './RollingNumber';

/** A lub-dub heartbeat envelope (0..1) that repeats at the given BPM. */
export function useHeartbeat(bpm: number): SharedValue<number> {
  const beat = useSharedValue(0);
  useEffect(() => {
    const rest = Math.max(60000 / bpm - 290, 120);
    beat.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 110, easing: Easing.out(Easing.quad) }),
        withTiming(0.25, { duration: 90 }),
        withTiming(0.7, { duration: 90 }),
        withTiming(0, { duration: rest, easing: Easing.out(Easing.cubic) })
      ),
      -1
    );
  }, [bpm, beat]);
  return beat;
}

/** Live heart-rate chip: the heart beats in time with the number. */
export function HeartRate({ bpm, beat }: { bpm: number; beat: SharedValue<number> }) {
  const heart = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.28 * beat.value }] }));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.surfaceUp, borderWidth: 1, borderColor: colors.line }}>
      <Animated.View style={heart}>
        <Icon name="heart" color={colors.lime} size={18} fill={colors.lime} />
      </Animated.View>
      <View accessible accessibilityLabel={`${bpm} beats per minute`} style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <RollingNumber value={bpm} height={22} style={[type.h3, { color: colors.text }]} />
        <Text style={[type.small, { color: colors.textDim }]}>bpm</Text>
      </View>
    </View>
  );
}
