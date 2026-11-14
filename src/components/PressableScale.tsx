import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion } from '../theme';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  wrapStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
  children: React.ReactNode;
};

export function PressableScale({ style, wrapStyle, scaleTo = 0.97, haptic = false, onPress, onPressIn, onPressOut, children, ...rest }: Props) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable
      {...rest}
      style={wrapStyle}
      onPressIn={(e) => {
        s.value = withSpring(scaleTo, motion.spring.snappy);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withSpring(1, motion.spring.bouncy);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync();
        onPress?.(e);
      }}
    >
      <Animated.View style={[style, a]}>{children}</Animated.View>
    </Pressable>
  );
}
