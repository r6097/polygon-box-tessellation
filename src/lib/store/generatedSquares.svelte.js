import { derived } from "svelte/store";
import { squareSize } from "./squares.svelte";
import { polygon } from "./polygon.svelte";
import { bruteForce } from "../../algorithms/bruteForce";
import { scanline } from "../../algorithms/scanline";
import { createQuadTree } from "../../algorithms/quadtree";
import { quadTreeOptions } from "./quadTreeOptions.svelte";
import { selectedAlgorithm } from "./algorithmSelect.svelte";

export const generatedSquares = derived(
  [polygon, squareSize, selectedAlgorithm, quadTreeOptions],
  ([$polygon, $squareSize, $selectedAlgorithm]) => {
    if (!$polygon.isFinished) return [];

    if ($selectedAlgorithm === "bruteForce") {
      return bruteForce($polygon, $squareSize);
    } else if ($selectedAlgorithm === "scanline") {
      return scanline($polygon, $squareSize);
    } else if ($selectedAlgorithm === "quadTree") {
      return createQuadTree(
        $polygon,
        quadTreeOptions.recursionDepth,
        quadTreeOptions.quadrantSize
      );
    }

    return [];
  }
);
