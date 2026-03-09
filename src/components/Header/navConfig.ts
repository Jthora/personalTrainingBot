import { type MissionRoutePath } from '../../routes/missionCutover';

export type HeaderNavItem = {
    path: MissionRoutePath;
    label: string;
    icon?: string;
};

export type HeaderResolvedNavItem = HeaderNavItem & {
    navigatePath: string;
    activePaths: string[];
};

export const headerNavItems: HeaderNavItem[] = [
    { path: '/mission/brief', label: 'Brief', icon: '🏠' },
    { path: '/mission/triage', label: 'Triage', icon: '🧭' },
    { path: '/mission/case', label: 'Case', icon: '🗂️' },
    { path: '/mission/signal', label: 'Signal', icon: '📡' },
    { path: '/mission/checklist', label: 'Checklist', icon: '✅' },
    { path: '/mission/debrief', label: 'Debrief', icon: '📝' },
];

export const resolveHeaderNavItems = (): HeaderResolvedNavItem[] => (
    headerNavItems.map((item) => {
        return {
            ...item,
            navigatePath: item.path,
            activePaths: [item.path],
        };
    })
);
