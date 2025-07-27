import { writable } from "svelte/store";

function createDrawTrigger() {
  const { subscribe, update } = writable(0);

  return {
    subscribe,
    redraw() {
      update((n) => n + 1);
    },
  };
}

export const drawTrigger = createDrawTrigger();
