import type { ImageSourcePropType } from 'react-native';

/** Photos cropped from the design reference. Swap these for full-resolution originals. */
export const photos = {
  runner: require('../assets/img/runner.jpg') as ImageSourcePropType,
  stretch: require('../assets/img/stretch.jpg') as ImageSourcePropType,
  plank: require('../assets/img/plank.jpg') as ImageSourcePropType,
  barbell: require('../assets/img/barbell.jpg') as ImageSourcePropType,
  lunge: require('../assets/img/lunge.jpg') as ImageSourcePropType,
  avatar: require('../assets/img/avatar.jpg') as ImageSourcePropType,
};

export type Category = 'Yoga' | 'Cycling' | 'Swimming' | 'Fitness';
export type Tag = 'Cardio' | 'Muscle' | 'Strength' | 'Mobility';
export type Exercise = { name: string; detail: string; minutes: number; tag: Tag; image?: ImageSourcePropType };
export type Workout = {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  minutes: number;
  kcal: number;
  kcalRange: string;
  level: string;
  equipment: string;
  rest: number; // seconds between blocks
  image?: ImageSourcePropType; // no photo yet: the UI draws a category tile instead
  exercises: Exercise[];
};

export const workouts: Workout[] = [
  {
    id: 'challenge',
    title: '30 Days Weight Loss Challenge',
    subtitle: 'Full body workout',
    category: 'Fitness',
    minutes: 30,
    kcal: 300,
    kcalRange: '250-350',
    level: 'Beginner',
    equipment: 'No',
    rest: 25,
    image: photos.runner,
    exercises: [
      { name: 'Warm-up', detail: '5 min · easy jog in place', minutes: 5, tag: 'Cardio', image: photos.runner },
      { name: 'Jumping jacks', detail: '3 sets · 30 sec on, 15 off', minutes: 8, tag: 'Muscle', image: photos.lunge },
      { name: 'Bodyweight squats', detail: '3 sets · 15 reps', minutes: 7, tag: 'Strength', image: photos.barbell },
      { name: 'High knees', detail: '3 sets · 30 sec', minutes: 5, tag: 'Cardio', image: photos.runner },
      { name: 'Cooldown stretch', detail: '5 min · slow breathing', minutes: 5, tag: 'Mobility', image: photos.stretch },
    ],
  },
  {
    id: 'mobility',
    title: 'Morning Mobility Routine',
    subtitle: 'Full body workout',
    category: 'Yoga',
    minutes: 35,
    kcal: 250,
    kcalRange: '200-260',
    level: 'Beginner',
    equipment: 'No',
    rest: 15,
    image: photos.stretch,
    exercises: [
      { name: 'Cat–Cow', detail: '10 slow breaths', minutes: 5, tag: 'Mobility', image: photos.stretch },
      { name: 'Hip 90/90', detail: '60 sec each side', minutes: 8, tag: 'Mobility', image: photos.stretch },
      { name: 'Thoracic rotation', detail: '8 reps each side', minutes: 7, tag: 'Mobility', image: photos.stretch },
      { name: 'Hamstring fold', detail: '60 sec · soft knees', minutes: 6, tag: 'Mobility', image: photos.stretch },
      { name: "Child's pose", detail: '2 min · breathe low', minutes: 5, tag: 'Mobility', image: photos.stretch },
    ],
  },
  {
    id: 'plank',
    title: 'Plank Exercise Loss Challenge',
    subtitle: 'Full body workout',
    category: 'Fitness',
    minutes: 20,
    kcal: 150,
    kcalRange: '130-180',
    level: 'Middle',
    equipment: 'No',
    rest: 20,
    image: photos.plank,
    exercises: [
      { name: 'Plank', detail: '45 sec · ribs down', minutes: 5, tag: 'Strength', image: photos.plank },
      { name: 'Side plank', detail: '30 sec each side', minutes: 5, tag: 'Strength', image: photos.plank },
      { name: 'Hollow hold', detail: '30 sec', minutes: 5, tag: 'Muscle', image: photos.plank },
      { name: 'Dead bug', detail: '10 reps each side', minutes: 5, tag: 'Muscle', image: photos.plank },
    ],
  },
  {
    id: 'body',
    title: 'Body Building',
    subtitle: 'Full body workout',
    category: 'Fitness',
    minutes: 30,
    kcal: 200,
    kcalRange: '180-240',
    level: 'Advanced',
    equipment: 'Barbell',
    rest: 45,
    image: photos.barbell,
    exercises: [
      { name: 'Back squat', detail: '5 reps · 3-1-1 tempo', minutes: 8, tag: 'Strength', image: photos.barbell },
      { name: 'Romanian deadlift', detail: '8 reps · slow lower', minutes: 8, tag: 'Strength', image: photos.barbell },
      { name: 'Overhead press', detail: '8 reps · brace hard', minutes: 7, tag: 'Muscle', image: photos.barbell },
      { name: 'Barbell row', detail: '10 reps · pause at top', minutes: 7, tag: 'Muscle', image: photos.barbell },
    ],
  },
  {
    id: 'lower',
    title: 'Lower Body Strength',
    subtitle: 'Full body workout',
    category: 'Fitness',
    minutes: 25,
    kcal: 220,
    kcalRange: '200-260',
    level: 'Middle',
    equipment: 'Dumbbells',
    rest: 40,
    image: photos.lunge,
    exercises: [
      { name: 'Walking lunge', detail: '12 steps each leg', minutes: 7, tag: 'Strength', image: photos.lunge },
      { name: 'Goblet squat', detail: '10 reps · slow lower', minutes: 7, tag: 'Strength', image: photos.lunge },
      { name: 'Hip thrust', detail: '12 reps · squeeze top', minutes: 6, tag: 'Muscle', image: photos.lunge },
      { name: 'Calf raise', detail: '15 reps · pause at top', minutes: 5, tag: 'Muscle', image: photos.lunge },
    ],
  },
  {
    id: 'spin',
    title: 'Spin Endurance Ride',
    subtitle: 'Cycling workout',
    category: 'Cycling',
    minutes: 40,
    kcal: 420,
    kcalRange: '380-460',
    level: 'Middle',
    equipment: 'Bike',
    rest: 20,
    exercises: [
      { name: 'Warm-up spin', detail: '8 min · light gear', minutes: 8, tag: 'Cardio' },
      { name: 'Hill climb', detail: '6 min · seated, heavy gear', minutes: 6, tag: 'Strength' },
      { name: 'Sprint intervals', detail: '6 x 30 sec all-out', minutes: 12, tag: 'Cardio' },
      { name: 'Cool-down', detail: '6 min · spin it out', minutes: 6, tag: 'Mobility' },
    ],
  },
  {
    id: 'swim',
    title: 'Pool Interval Laps',
    subtitle: 'Swimming workout',
    category: 'Swimming',
    minutes: 30,
    kcal: 320,
    kcalRange: '280-360',
    level: 'Middle',
    equipment: 'Pool',
    rest: 20,
    exercises: [
      { name: 'Easy laps', detail: '4 x 50 m · freestyle', minutes: 8, tag: 'Cardio' },
      { name: 'Kick set', detail: '4 x 25 m · board', minutes: 6, tag: 'Muscle' },
      { name: 'Pace laps', detail: '6 x 50 m · hard but steady', minutes: 12, tag: 'Cardio' },
      { name: 'Cooldown', detail: '2 x 50 m · backstroke', minutes: 4, tag: 'Mobility' },
    ],
  },
];

export const byId = (id: string) => workouts.find((w) => w.id === id) ?? workouts[0];

export const CATEGORIES: { key: 'All' | Category; label: string; icon: 'run' | 'yoga' | 'bike' | 'swim' | 'dumbbell' }[] = [
  { key: 'All', label: 'Workouts', icon: 'run' },
  { key: 'Yoga', label: 'Yoga', icon: 'yoga' },
  { key: 'Cycling', label: 'Cycling', icon: 'bike' },
  { key: 'Swimming', label: 'Swimming', icon: 'swim' },
  { key: 'Fitness', label: 'Fitness', icon: 'dumbbell' },
];

/** Today's plan: seven tasks, one already done. */
export const dailyTasks = [
  { id: 't1', title: 'Warm-up jog', minutes: 5, kcal: 120, workoutId: 'challenge', image: photos.runner, done: true },
  { id: 't2', title: 'Jumping jacks', minutes: 10, kcal: 120, workoutId: 'challenge', image: photos.lunge, done: false },
  { id: 't3', title: 'Core plank', minutes: 8, kcal: 90, workoutId: 'plank', image: photos.plank, done: false },
  { id: 't4', title: 'Back squats', minutes: 15, kcal: 180, workoutId: 'body', image: photos.barbell, done: false },
  { id: 't5', title: 'Walking lunges', minutes: 10, kcal: 110, workoutId: 'lower', image: photos.lunge, done: false },
  { id: 't6', title: 'Mobility flow', minutes: 12, kcal: 80, workoutId: 'mobility', image: photos.stretch, done: false },
  { id: 't7', title: 'Cooldown stretch', minutes: 5, kcal: 40, workoutId: 'mobility', image: photos.stretch, done: false },
];

export const week = [
  { d: 'Mo', n: 9, done: true },
  { d: 'Tu', n: 10, done: true },
  { d: 'We', n: 11, done: false },
  { d: 'Th', n: 12, done: true },
  { d: 'Fr', n: 13, done: true },
  { d: 'Sa', n: 14, done: false },
  { d: 'Su', n: 15, done: false },
];
export const TODAY_INDEX = 5;

export type MetricKey = 'Calories active' | 'Weight' | 'Volume';
export const metrics: Record<MetricKey, { values: number[]; unit: string; icon: 'flame' | 'scale' | 'dumbbell'; total: boolean; domain: [number, number] }> = {
  'Calories active': { values: [150, 230, 290, 340, 380, 450, 500], unit: 'kcal', icon: 'flame', total: true, domain: [0, 520] },
  Weight: { values: [74.8, 74.5, 74.1, 73.9, 73.6, 73.2, 72.9], unit: 'kg', icon: 'scale', total: false, domain: [72, 75] },
  Volume: { values: [1200, 1800, 2100, 2600, 3000, 3600, 4200], unit: 'kg', icon: 'dumbbell', total: true, domain: [0, 4400] },
};

export const recent = [
  { id: 'r1', workoutId: 'lower', title: 'Leg Day', when: 'Today · 42 min', icon: 'dumbbell' as const, curve: [38, 52, 46, 70, 62, 48, 58, 88, 96, 60, 54] },
  { id: 'r2', workoutId: 'mobility', title: 'Morning Mobility Routine', when: 'Yesterday · 35 min', icon: 'yoga' as const },
  { id: 'r3', workoutId: 'challenge', title: 'Tempo Run', when: 'Thu · 32 min', icon: 'run' as const },
];

export const nutrition = {
  kcal: 1847,
  goal: 2400,
  macros: [
    { name: 'Protein', value: 112, goal: 160 },
    { name: 'Carbs', value: 180, goal: 260 },
    { name: 'Fat', value: 48, goal: 70 },
  ],
};

export const profile = { name: 'Antoni Rodrigues', streak: 12, workouts: 47, weight: 72.9 };
