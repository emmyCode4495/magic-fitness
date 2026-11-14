import React, { useEffect } from 'react';
import { StyleProp, Text, TextStyle, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { motion } from '../theme';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ d, height, style, delay }: { d: number; height: number; style: StyleProp<TextStyle>; delay: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(delay, withSpring(-d * height, motion.spring.fluid));
  }, [d, height, delay, y]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <View style={{ height, overflow: 'hidden' }}>
      <Animated.View style={a}>
        {DIGITS.map((n) => (
          <Text key={n} style={[style, { height, lineHeight: height, includeFontPadding: false, fontVariant: ['tabular-nums'] }]}>
            {n}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

type Props = {
  value: number;
  height: number;
  style: StyleProp<TextStyle>;
  minDigits?: number;
  grouping?: boolean;
};

/** Odometer-style number. Each digit is a clipped column that springs to its value. */
export function RollingNumber({ value, height, style, minDigits = 1, grouping = false }: Props) {
  const chars = String(Math.max(0, Math.round(value))).padStart(minDigits, '0').split('');
  const items: { key: string; d?: number; idx: number }[] = [];
  chars.forEach((c, i) => {
    const fromRight = chars.length - 1 - i;
    items.push({ key: `d${fromRight}`, d: Number(c), idx: i });
    if (grouping && fromRight > 0 && fromRight % 3 === 0) items.push({ key: `s${fromRight}`, idx: i });
  });
  return (
    <View style={{ flexDirection: 'row' }} accessible accessibilityLabel={String(value)}>
      {items.map((it) =>
        it.d === undefined ? (
          <Text key={it.key} style={[style, { height, lineHeight: height, includeFontPadding: false }]}>,</Text>
        ) : (
          <Digit key={it.key} d={it.d} height={height} style={style} delay={it.idx * 30} />
        )
      )}
    </View>
  );
}
