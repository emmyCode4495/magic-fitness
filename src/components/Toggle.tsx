import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, motion } from '../theme';

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const x = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    x.value = withSpring(value ? 1 : 0, motion.spring.snappy);
  }, [value, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 22 }] }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => { Haptics.selectionAsync(); onChange(!value); }}
    >
      <Animated.View style={{ width: 52, height: 30, borderRadius: 15, padding: 3, backgroundColor: value ? colors.lime : colors.surfaceUp, borderWidth: 1, borderColor: value ? colors.lime : colors.line, transitionProperty: ['backgroundColor', 'borderColor'], transitionDuration: motion.duration.fast }}>
        <Animated.View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: value ? colors.ink : colors.textDim }, knob]} />
      </Animated.View>
    </Pressable>
  );
}
