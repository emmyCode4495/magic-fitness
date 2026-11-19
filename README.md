# Magic

Fitness app UI in Expo + React Native: black canvas, one lime accent, real workout photos.

## Flow

- **Home**: greeting, lime "My Plan For Today" card with calorie ring, week strip, "Start New Goal" photo cards, Daily Task list (play starts that task's workout).
- **Workouts**: search (name or category), sort button, category tiles, Daily Challenge banner, photo cards.
- **Workout detail**: hero photo with parallax, lime title banner, stat tiles, exercise list (tap an exercise to start from it).
- **Statistics**: streak and workout tiles, metric chips (Calories active / Weight / Volume), tappable bar chart, nutrition gauge with macro bars, recent workouts with a line chart that draws itself in.
- **Profile**: avatar, stats, settings rows with a spring toggle.
- **Centre button** in the tab bar is contextual: a leaf on main screens (starts what is next in today's plan), a play arrow on a workout page (starts that workout).
- **Session** (drag-to-dismiss sheet): hold-to-finish ring, rest countdown with +15 s / skip, live heart-rate chip, summary with average heart rate.

## Where things live

```
App.tsx                 navigation state, session sheet, splash
src/theme.ts            colours, type (Urbanist), motion, springs
src/data.ts             workouts, daily tasks, stats, photos (assets/img)
src/screens/            Home, Workouts, Detail, Stats, Profile, Session, Splash
src/components/         TabBar, Charts (bar, Skia line, gauge, macro bar), Photo, LimeButton,
                        Heart, Aurora (session glow), Burst, RollingNumber, PressableScale, Toggle, Icon
assets/img/             photos cropped from the design reference
```

## Notes

- Photos are crops from the reference screenshots, so they are low resolution. Replace the files in `assets/img/` (same names) with full-size originals.
- Cycling and Swimming have no photos yet; they use a category tile. Add `image` to those entries in `src/data.ts` when you have them.
- Heart rate, nutrition and statistics are demo data. Wire `bpm` in `Session.tsx` to HealthKit / Health Connect when you add a backend.
- Requires a development build (Skia, Reanimated 4, Worklets, Gesture Handler 3); Expo Go will not run it.

## Scripts

```
npm install
npx expo start
```
