import { writable } from "svelte/store";

export const selectedAlgorithm = writable("bruteForce");

export const hideOutput = writable(false);
