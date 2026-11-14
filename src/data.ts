export type Kind = 'Strength' | 'Cardio' | 'Mobility';
export type Exercise = { name: string; detail: string };
export type Workout = {
  id: string;
  title: string;
  kind: Kind;
  minutes: number;
  kcal: number;
  level: string;
  exercises: Exercise[];
};

export const workouts: Workout[] = [
  {
    id: 'lower',
    title: 'Lower Body Strength',
    kind: 'Strength',
    minutes: 45,
    kcal: 380,
    level: 'Intermediate',
    exercises: [
      { name: 'Back Squat', detail: '5 reps · 3-1-1 tempo' },
      { name: 'Romanian Deadlift', detail: '8 reps · slow lower' },
      { name: 'Walking Lunge', detail: '12 steps each leg' },
      { name: 'Calf Raise', detail: '15 reps · pause at top' },
    ],
  },
  {
    id: 'tempo',
    title: 'Tempo Run Intervals',
    kind: 'Cardio',
    minutes: 32,
    kcal: 410,
    level: 'Advanced',
    exercises: [
      { name: 'Easy Warm-up', detail: '5 min · conversational' },
      { name: 'Tempo Block', detail: '4 min · hard but steady' },
      { name: 'Float Recovery', detail: '2 min · jog it out' },
      { name: 'Tempo Block', detail: '4 min · hold the pace' },
      { name: 'Cooldown', detail: '5 min · walk' },
    ],
  },
  {
    id: 'core',
    title: 'Core Circuit',
    kind: 'Strength',
    minutes: 25,
    kcal: 240,
    level: 'Beginner',
    exercises: [
      { name: 'Dead Bug', detail: '10 reps each side' },
      { name: 'Plank', detail: '45 sec · ribs down' },
      { name: 'Side Plank', detail: '30 sec each side' },
      { name: 'Hollow Hold', detail: '30 sec' },
    ],
  },
  {
    id: 'mobility',
    title: 'Mobility Reset',
    kind: 'Mobility',
    minutes: 18,
    kcal: 90,
    level: 'All levels',
    exercises: [
      { name: 'Cat–Cow', detail: '10 slow breaths' },
      { name: 'Hip 90/90', detail: '60 sec each side' },
      { name: 'Thoracic Rotation', detail: '8 reps each side' },
    ],
  },
];

export const week = [
  { d: 'M', n: 9, done: true },
  { d: 'T', n: 10, done: true },
  { d: 'W', n: 11, done: false },
  { d: 'T', n: 12, done: true },
  { d: 'F', n: 13, done: true },
  { d: 'S', n: 14, done: false },
  { d: 'S', n: 15, done: false },
];
export const TODAY_INDEX = 5;

export const progressData = {
  Days: { labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], values: [38, 45, 0, 52, 41, 34, 0], unit: 'min' },
  Weeks: { labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'], values: [210, 260, 180, 300, 240, 320, 274], unit: 'min' },
} as const;

export const records = [
  { name: '5K run', value: '24:18' },
  { name: 'Back squat', value: '92 kg' },
  { name: 'Plank hold', value: '3:04' },
];
