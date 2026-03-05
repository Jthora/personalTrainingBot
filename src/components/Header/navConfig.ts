export type HeaderNavItem = {
    path: string;
    label: string;
    icon?: string;
};

export const headerNavItems: HeaderNavItem[] = [
    { path: '/mission/brief', label: 'Brief', icon: '🏠' },
    { path: '/mission/triage', label: 'Triage', icon: '🧭' },
    { path: '/mission/case', label: 'Case', icon: '🗂️' },
    { path: '/mission/signal', label: 'Signal', icon: '📡' },
    { path: '/mission/checklist', label: 'Checklist', icon: '✅' },
    { path: '/mission/debrief', label: 'Debrief', icon: '📝' },
];
