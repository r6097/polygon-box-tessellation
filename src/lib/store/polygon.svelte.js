import { writable } from "svelte/store";

function createPolygon() {
  const { subscribe, update, set } = writable({
    points: [],
    isFinished: false,
  });

  return {
    subscribe,
    insertPoint(p) {
      update((state) => {
        return {
          ...state,
          points: [...state.points, p],
        };
      });
    },
    finish() {
      update((state) => ({
        ...state,
        isFinished: true,
      }));
    },
    reset() {
      set({ points: [], isFinished: false });
    },
  };
}

export const polygon = createPolygon();
