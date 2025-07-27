import { writable } from "svelte/store";

/**
 * square: { x, y }[] 4 points
 */
export const squares = writable([]);

/**
 * use in brute-force and scanline algo
 */
export const squareSize = writable(50);
