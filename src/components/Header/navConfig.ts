export type HeaderNavItem = {
    path: string;
    label: string;
    icon?: string;
};

export const headerNavItems: HeaderNavItem[] = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/schedules', label: 'Schedules', icon: '🗓️' },
    { path: '/workouts', label: 'Workouts', icon: '💪' },
    { path: '/training', label: 'Training', icon: '🎯' },
];
