import React from 'react';
import { Image, ImageSourcePropType, StyleProp, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Category } from '../data';
import { colors } from '../theme';
import { Icon } from './Icon';

const catIcon = { Yoga: 'yoga', Cycling: 'bike', Swimming: 'swim', Fitness: 'dumbbell' } as const;

/** A workout photo, or (when there is none yet) a lime-tinted tile with the category icon. */
export function Photo({ source, category, style }: { source?: ImageSourcePropType; category: Category; style?: StyleProp<ViewStyle> }) {
  if (source) return <Image source={source} resizeMode="cover" style={style as never} />;
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}>
      <LinearGradient colors={['#242b0e', '#12150a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <Icon name={catIcon[category]} color={colors.lime} size={56} stroke={1.4} />
    </View>
  );
}
