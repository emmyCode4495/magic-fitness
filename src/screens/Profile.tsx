import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconChip, IconName } from '../components/Icon';
import { PressableScale } from '../components/PressableScale';
import { RollingNumber } from '../components/RollingNumber';
import { TAB_BAR_H } from '../components/TabBar';
import { Toggle } from '../components/Toggle';
import { photos, profile } from '../data';
import { alpha, colors, enter, type } from '../theme';

function Row({ icon, label, value, last, right }: { icon: IconName; label: string; value?: string; last?: boolean; right?: React.ReactNode }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.line }]}>
      <IconChip name={icon} color={colors.lime} bg={alpha(colors.lime, 0.14)} size={40} />
      <Text style={[type.h3, { color: colors.text, flex: 1 }]}>{label}</Text>
      {right ?? (
        <>
          {value && <Text style={[type.small, { color: colors.textDim }]}>{value}</Text>}
          <Icon name="next" color={colors.textFaint} size={18} />
        </>
      )}
    </View>
  );
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [reminders, setReminders] = useState(true);
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + TAB_BAR_H + 32, paddingHorizontal: 20 }}>
      <Animated.View entering={enter(0)} style={{ alignItems: 'center', marginTop: 12 }}>
        <Image source={photos.avatar} style={styles.avatar} accessibilityLabel="Your profile photo" />
        <Text style={[type.title, { color: colors.text, marginTop: 14 }]}>{profile.name}</Text>
        <View style={styles.goal}><Icon name="target" color={colors.ink} size={14} stroke={2.2} /><Text style={[type.micro, { color: colors.ink }]}>Goal: lose weight</Text></View>
      </Animated.View>

      <Animated.View entering={enter(1)} style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
        {[
          { label: 'Workouts', node: <RollingNumber value={profile.workouts} height={34} style={[type.title, { color: colors.text }]} /> },
          { label: 'Day streak', node: <RollingNumber value={profile.streak} height={34} style={[type.title, { color: colors.text }]} /> },
          { label: 'Weight (kg)', node: <Text style={[type.title, { color: colors.text, height: 34 }]}>{profile.weight}</Text> },
        ].map((s) => (
          <View key={s.label} style={styles.stat}>
            {s.node}
            <Text style={[type.small, { color: colors.textDim, marginTop: 2 }]}>{s.label}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={enter(2)} style={[styles.list, { marginTop: 24 }]}>
        <PressableScale scaleTo={0.99}><Row icon="target" label="Daily goal" value="2,700 kcal" /></PressableScale>
        <Row icon="bell" label="Workout reminders" right={<Toggle value={reminders} onChange={setReminders} label="Workout reminders" />} />
        <PressableScale scaleTo={0.99}><Row icon="scale" label="Units" value="Metric" /></PressableScale>
        <PressableScale scaleTo={0.99}><Row icon="help" label="Help & support" last /></PressableScale>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 108, height: 108, borderRadius: 54, borderWidth: 3, borderColor: colors.lime },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: colors.lime },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  list: { borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
});
