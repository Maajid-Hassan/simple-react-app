export const sampleTasks = [
  {
    id: 'task-1',
    text: 'Refactor design tokens for sleek glassmorphism themes',
    completed: false,
    category: 'work',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
  },
  {
    id: 'task-2',
    text: 'Brainstorm interactive spring animations for the dashboard',
    completed: true,
    category: 'ideas',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'task-3',
    text: 'Review Stripe checkout flow UI transitions',
    completed: false,
    category: 'work',
    priority: 'medium',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'task-4',
    text: 'Design micro-interactions for active checkbox states',
    completed: true,
    category: 'ideas',
    priority: 'medium',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
  },
  {
    id: 'task-5',
    text: 'Daily cardio & deep stretching routine',
    completed: false,
    category: 'personal',
    priority: 'low',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago
  }
];
