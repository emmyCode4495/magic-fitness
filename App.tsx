import React, { ComponentRef, useCallback, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { BlurTargetView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { GestureDetector, GestureHandlerRootView, usePanGesture } from 'react-native-gesture-handler';
import Animated, { FadeIn, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { TabBar } from './src/components/TabBar';
import { Workout } from './src/data';
import { HomeScreen } from './src/screens/Home';
import { ProgressScreen } from './src/screens/Progress';
import { SessionScreen } from './src/screens/Session';
import { Splash } from './src/screens/Splash';
import { TrainScreen } from './src/screens/Train';
import { colors, motion } from './src/theme';

const DISMISS_DISTANCE = 140;
const DISMISS_VELOCITY = 900;

function Root() {
  const { height } = useWindowDimensions();
  const [splash, setSplash] = useState(true);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState(0);
  const [session, setSession] = useState<Workout | null>(null);
  const sheet = useSharedValue(0); // 0 = hidden, 1 = fully open. Drives the sheet AND the app behind it.
  const blurTarget = useRef<ComponentRef<typeof View>>(null);

  const clearSession = useCallback(() => setSession(null), []);

  const open = useCallback((w: Workout) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSession(w);
    sheet.value = withSpring(1, { damping: 22, stiffness: 140, mass: 1 });
  }, [sheet]);

  const close = useCallback(() => {
    sheet.value = withTiming(0, { duration: 320, easing: motion.easing.standard }, (finished) => {
      if (finished) scheduleOnRN(clearSession);
    });
  }, [sheet, clearSession]);

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
    opacity: interpolate(sheet.value, [0, 1], [1, 0.55]),
  }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - sheet.value) * height }] }));
  const onReveal = useCallback(() => setReady(true), []);
  const onDone = useCallback(() => setSplash(false), []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <StatusBar style="light" />
      <Animated.View style={[{ flex: 1, overflow: 'hidden', backgroundColor: colors.ink }, appStyle]}>
        <BlurTargetView ref={blurTarget} style={{ flex: 1 }}>
          {ready && (
            <Animated.View key={tab} style={{ flex: 1 }} entering={FadeIn.duration(motion.duration.base)}>
              {tab === 0 && <HomeScreen onStart={open} />}
              {tab === 1 && <TrainScreen onStart={open} />}
              {tab === 2 && <ProgressScreen />}
            </Animated.View>
          )}
        </BlurTargetView>
        {ready && <TabBar index={tab} onChange={setTab} blurTarget={blurTarget} />}
      </Animated.View>

      {session && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.sheet, sheetStyle]}>
          <SessionScreen workout={session} onClose={close} />
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
  const [loaded] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.ink }} />;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ink }}>
      <SafeAreaProvider>
        <Root />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sheet: { top: 44, backgroundColor: colors.bone, borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden' },
  grabZone: { position: 'absolute', top: 0, left: 0, right: 0, height: 36, alignItems: 'center', justifyContent: 'center' },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.paperLine },
});
