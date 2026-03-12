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

const coreNavItems: HeaderNavItem[] = [
    { path: '/mission/brief', label: 'Brief', icon: '🏠' },
    { path: '/mission/triage', label: 'Triage', icon: '🧭' },
    { path: '/mission/case', label: 'Case', icon: '🗂️' },
    { path: '/mission/signal', label: 'Signal', icon: '📡' },
    { path: '/mission/checklist', label: 'Checklist', icon: '✅' },
    { path: '/mission/debrief', label: 'Debrief', icon: '📝' },
];

const statsNavItem: HeaderNavItem = { path: '/mission/stats', label: 'Stats', icon: '📊' };
const planNavItem: HeaderNavItem = { path: '/mission/plan', label: 'Plan', icon: '📅' };

export const headerNavItems: HeaderNavItem[] = coreNavItems;

export const resolveHeaderNavItems = (): HeaderResolvedNavItem[] => {
    const items = [
        ...coreNavItems,
        statsNavItem,
        planNavItem,
    ];
    return items.map((item) => ({
        ...item,
        navigatePath: item.path,
        activePaths: [item.path],
    }));
};
