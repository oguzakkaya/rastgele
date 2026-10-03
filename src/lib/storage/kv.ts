/** Minimal key-value contract so storage can move to a backend later. */
export type KeyValueStore = {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
};

export function memoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    get: (k) => map.get(k) ?? null,
    set: (k, v) => void map.set(k, v),
    remove: (k) => void map.delete(k),
  };
}

export function browserStore(): KeyValueStore {
  if (typeof window === "undefined") return memoryStore();
  try {
    const probe = "__rastgele_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
  } catch {
    // Private mode or storage disabled.
    return memoryStore();
  }
  return {
    get: (k) => window.localStorage.getItem(k),
    set: (k, v) => {
      try {
        window.localStorage.setItem(k, v);
      } catch {
        // Quota exceeded; persistence is best effort.
      }
    },
    remove: (k) => window.localStorage.removeItem(k),
  };
}
