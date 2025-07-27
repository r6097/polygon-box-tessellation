import { writable } from "svelte/store";

function createQuadTreeOptions() {
  const { subscribe, update, set } = writable({
    recursionDepth: 6,
    quadrantSize: 20,
  });

  return {
    subscribe,
    setRecursionDepth(depth) {
      update((state) => ({
        ...state,
        recursionDepth: depth,
      }));
    },
    setQuadrantSize(size) {
      update((state) => ({
        ...state,
        quadrantSize: size,
      }));
    },
    reset() {
      set({ recursionDepth: 6, quadrantSize: 20 });
    },
  };
}

export const quadTreeOptions = createQuadTreeOptions();
