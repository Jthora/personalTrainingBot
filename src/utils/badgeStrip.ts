export interface BadgeStripResult {
    visible: string[];
    overflow: number;
}

export const computeBadgeStrip = (
    badges: string[],
    options?: { max?: number; totalCount?: number }
): BadgeStripResult => {
    const max = options?.max ?? 3;
    const total = options?.totalCount ?? badges.length;
    const visible = badges.slice(0, Math.max(0, max));
    const overflow = Math.max(0, total - visible.length);
    return { visible, overflow };
};
