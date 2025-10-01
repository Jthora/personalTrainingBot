export type JsonLoader<T> = () => Promise<T>;

export const createJsonLoader = <T>(factory: () => Promise<unknown>): JsonLoader<T> => {
    return async () => {
        const module = await factory();
        if (module && typeof module === "object" && "default" in (module as Record<string, unknown>)) {
            return (module as { default: T }).default;
        }
        return module as T;
    };
};
