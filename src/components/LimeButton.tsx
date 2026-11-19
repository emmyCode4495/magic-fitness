import React from 'react';
import { Platform, StyleProp, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, limeGlow } from '../theme';
import { Icon, IconName } from './Icon';
import { PressableScale } from './PressableScale';

type Props = { label: string; onPress: () => void; icon?: IconName; iconFill?: boolean; height?: number; style?: StyleProp<ViewStyle>; tone?: 'lime' | 'dark' };

/** Primary action: solid lime pill with a soft lime glow. Sinks and springs back on press. */
export function LimeButton({ label, onPress, icon, iconFill, height = 56, style, tone = 'lime' }: Props) {
  const lime = tone === 'lime';
  const fg = lime ? colors.ink : colors.text;
  return (
    <PressableScale
      haptic
      onPress={onPress}
      wrapStyle={style}
      style={[{ borderRadius: 999 }, lime && Platform.OS === 'ios' ? limeGlow : null]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={{
          height, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24,
          backgroundColor: lime ? colors.lime : colors.surfaceUp, borderWidth: lime ? 0 : 1, borderColor: colors.line,
        }}
      >
        {icon && <Icon name={icon} color={fg} size={20} stroke={2.2} fill={iconFill ? fg : undefined} />}
        <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: fg }}>{label}</Text>
      </View>
    </PressableScale>
  );
}
