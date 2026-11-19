import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { GestureDetector, GestureHandlerRootView, usePanGesture } from 'react-native-gesture-handler';
import Animated, { FadeIn, SlideInRight, SlideOutRight, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { Urbanist_500Medium } from '@expo-google-fonts/urbanist/500Medium';
import { Urbanist_600SemiBold } from '@expo-google-fonts/urbanist/600SemiBold';
import { Urbanist_700Bold } from '@expo-google-fonts/urbanist/700Bold';
import { Urbanist_800ExtraBold } from '@expo-google-fonts/urbanist/800ExtraBold';
import { TabBar } from './src/components/TabBar';
import { Workout, byId, dailyTasks } from './src/data';
import { DetailScreen } from './src/screens/Detail';
import { HomeScreen } from './src/screens/Home';
import { ProfileScreen } from './src/screens/Profile';
import { SessionScreen } from './src/screens/Session';
import { Splash } from './src/screens/Splash';
import { StatsScreen } from './src/screens/Stats';
import { WorkoutsScreen } from './src/screens/Workouts';
import { colors, motion } from './src/theme';

const DISMISS_DISTANCE = 140;
const DISMISS_VELOCITY = 900;
const NEXT_TASK = dailyTasks.find((t) => !t.done) ?? dailyTasks[0];

function Root() {
  const { height } = useWindowDimensions();
  const [splash, setSplash] = useState(true);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState(0); // 0 Home, 1 Workouts, 2 Statistics, 3 Profile
  const [detailId, setDetailId] = useState<string | null>(null);
  const [session, setSession] = useState<{ workout: Workout; startAt: number } | null>(null);
  const sheet = useSharedValue(0); // 0 = hidden, 1 = fully open. Drives the sheet AND the app behind it.

  const clearSession = useCallback(() => setSession(null), []);

  const startSession = useCallback((workout: Workout, startAt = 0) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSession({ workout, startAt });
    sheet.value = withSpring(1, { damping: 22, stiffness: 140, mass: 1 });
  }, [sheet]);

  const close = useCallback(() => {
    sheet.value = withTiming(0, { duration: 320, easing: motion.easing.standard }, (finished) => {
      if (finished) scheduleOnRN(clearSession);
    });
  }, [sheet, clearSession]);

  // Android back: close the session, else leave the workout page.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (session) { close(); return true; }
      if (detailId) { setDetailId(null); return true; }
      return false;
    });
    return () => sub.remove();
  }, [session, detailId, close]);

  // Drag the grabber to dismiss. The sheet follows the finger 1:1; release decides by distance or velocity.
  const pan = usePanGesture({
    activeOffsetY: 6,
    onUpdate: (e) => {
      'worklet';
      sheet.value = Math.min(1, Math.max(0, 1 - e.translationY / height));
    },
    onDeactivate: (e) => {
      'worklet';
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        sheet.value = withTiming(0, { duration: 240, easing: motion.easing.exit }, (finished) => {
          if (finished) scheduleOnRN(clearSession);
        });
      } else {
        sheet.value = withSpring(1, motion.spring.snappy);
      }
    },
  });

  // The app steps back as the session sheet rises over it.
  const appStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(sheet.value, [0, 1], [1, 0.93]) }],
    borderRadius: interpolate(sheet.value, [0, 1], [0, 36]),
    opacity: interpolate(sheet.value, [0, 1], [1, 0.4]),
  }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - sheet.value) * height }] }));
  const onReveal = useCallback(() => setReady(true), []);
  const onDone = useCallback(() => setSplash(false), []);

  const detail = detailId ? byId(detailId) : null;
  // The centre button is contextual: on a workout page it starts that workout; elsewhere it starts what's next in today's plan.
  const onFab = () => startSession(detail ?? byId(NEXT_TASK.workoutId));
  const changeTab = (i: number) => { setDetailId(null); setTab(i); };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <Animated.View style={[{ flex: 1, overflow: 'hidden', backgroundColor: colors.bg }, appStyle]}>
        {ready && (
          <Animated.View key={tab} style={{ flex: 1 }} entering={FadeIn.duration(motion.duration.base)}>
            {tab === 0 && <HomeScreen onOpen={setDetailId} onStart={(id) => startSession(byId(id))} onSeeAll={() => setTab(1)} />}
            {tab === 1 && <WorkoutsScreen onOpen={setDetailId} />}
            {tab === 2 && <StatsScreen onOpen={setDetailId} />}
            {tab === 3 && <ProfileScreen />}
          </Animated.View>
        )}
        {ready && detail && (
          <Animated.View key={detail.id} style={StyleSheet.absoluteFill} entering={SlideInRight.springify().damping(24).stiffness(220)} exiting={SlideOutRight.duration(motion.duration.base)}>
            <DetailScreen workout={detail} onBack={() => setDetailId(null)} onStart={(i) => startSession(detail, i)} />
          </Animated.View>
        )}
        {ready && <TabBar index={detail ? 1 : tab} onChange={changeTab} onFab={onFab} fabMode={detail ? 'play' : 'leaf'} />}
      </Animated.View>

      {session && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.sheet, sheetStyle]}>
          <SessionScreen workout={session.workout} startAt={session.startAt} onClose={close} />
          <GestureDetector gesture={pan}>
            <View style={styles.grabZone} accessible accessibilityLabel="Drag down to close">
              <View style={styles.grabber} />
            </View>
          </GestureDetector>
        </Animated.View>
      )}
      {splash && <Splash onReveal={onReveal} onDone={onDone} />}
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({ Urbanist_500Medium, Urbanist_600SemiBold, Urbanist_700Bold, Urbanist_800ExtraBold });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <Root />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sheet: { top: 44, backgroundColor: colors.bg, borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden' },
  grabZone: { position: 'absolute', top: 0, left: 0, right: 0, height: 36, alignItems: 'center', justifyContent: 'center' },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.32)' },
});
