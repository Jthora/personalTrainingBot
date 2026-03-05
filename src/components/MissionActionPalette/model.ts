export type MissionPaletteAction = {
  id: string;
  label: string;
  keywords: string[];
  path: string;
  search?: string;
};

const normalize = (value: string): string => value.trim().toLowerCase();

export const filterMissionPaletteActions = (
  actions: MissionPaletteAction[],
  query: string,
): MissionPaletteAction[] => {
  const normalized = normalize(query);
  if (!normalized) return actions;

  return actions.filter((action) => {
    if (normalize(action.label).includes(normalized)) return true;
    return action.keywords.some((keyword) => normalize(keyword).includes(normalized));
  });
};
