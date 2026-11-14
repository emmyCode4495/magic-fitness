# Magic

Animated fitness app UI. **Expo SDK 58 · React Native 0.88 · React 19.3 · TypeScript 6**

| Animation stack | Version |
| --- | --- |
| react-native-reanimated | 4.7.1 (CSS transitions + keyframes, springs, layout animations) |
| react-native-worklets | 0.13.0 |
| react-native-gesture-handler | 3.3 (hook API: `usePanGesture`) |
| @shopify/react-native-skia | 2.14 (GPU glow + spark burst) |
| expo-blur | 58 (frosted dock) |

## Requirements

- Node **22.13+** (Expo 58 requirement)
- Xcode 26+ for iOS, Android Studio for Android
- Expo Go for SDK 58, or a development build

## Run

```bash
npm install
npx expo start          # scan the QR with Expo Go (SDK 58)
```

Native build (no Expo Go):

```bash
npx expo prebuild
npx expo run:ios        # or run:android
```

## Effects, and where they live

| Effect | Tech | File |
| --- | --- | --- |
| Pulse Dial: 60 ticks with a comet tail | Reanimated | `src/components/PulseDial.tsx` |
| Dial light: leading-edge hot spot + breathing ember halo | Skia | `src/components/PulseDial.tsx` (`DialGlow`) |
| Completion shockwave: ring + 48 sparks | Skia | `src/components/Burst.tsx` |
| Odometer numbers | Reanimated springs | `src/components/RollingNumber.tsx` |
| Frosted floating dock, stretching pill | expo-blur + Reanimated | `src/components/TabBar.tsx` |
| Drag-to-dismiss session sheet; the app behind scrubs scale/radius/dim with your finger | Gesture Handler 3 + Worklets | `App.tsx` |
| Dial recedes on scroll (parallax) | Reanimated scroll handler | `src/screens/Home.tsx` |
| Colour transitions + live pulsing dot | Reanimated 4 CSS transitions / keyframes | `Home.tsx`, `Progress.tsx`, `Session.tsx` |
| Press-and-hold ring to finish a set | Reanimated + SVG | `src/screens/Session.tsx` |

## Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Start the dev server |
| `npm run typecheck` | Strict TypeScript check |
| `npm run doctor` | `expo-doctor` project health check |

## Layout

```
App.tsx            Shell: fonts, gesture root, tabs, session sheet, splash
index.ts           Entry (registerRootComponent)
app.json           Expo config
eas.json           EAS Build profiles: development / preview / production
babel.config.js    babel-preset-expo (auto-adds the worklets plugin)
metro.config.js    Expo default Metro config
tsconfig.json      Strict, extends expo/tsconfig.base
assets/            icon, adaptive icon, splash icon, favicon
src/theme.ts       ALL tokens: colors, fonts, type, motion, shadows
src/data.ts        Demo data (no backend)
src/components/    PulseDial, Burst, RollingNumber, TabBar, PressableScale, Icon
src/screens/       Splash, Home, Train, Progress, Session
```

## Shipping

1. Change `ios.bundleIdentifier` and `android.package` in `app.json` (currently `com.magic.fitness`).
2. `npm i -g eas-cli && eas login && eas build:configure`
3. `eas build --profile preview --platform android` for an installable APK
4. `eas build --profile production`, then `eas submit`

## Notes

- Demo data only. There is no backend yet.
- Everything visual comes from `src/theme.ts`. Retheme there.
- Reanimated respects the OS "Reduce Motion" setting by default.
- Android blur uses `BlurTargetView`; test it on a real device or a development build.
