type SelectionListener = () => void;

const selectionListeners = new Set<SelectionListener>();

export const notifySelectionChange = () => {
    selectionListeners.forEach(listener => {
        try {
            listener();
        } catch (error) {
            console.warn('MissionScheduleStore: selection listener failed', error);
        }
    });
};

export const subscribeToSelectionChanges = (listener: SelectionListener) => {
    selectionListeners.add(listener);
    return () => selectionListeners.delete(listener);
};
