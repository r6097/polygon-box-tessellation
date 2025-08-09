<script lang="ts">
  import Canvas from './lib/Canvas.svelte';
  import OptionsSection from './lib/OptionsSection.svelte';
  import { polygon } from "./lib/store/polygon.svelte";

  let ctx: CanvasRenderingContext2D;

  $: polygonPoints = $polygon.points;
  $: isPolygonFinished = $polygon.isFinished;

</script>

<main>
  <h1 class="text-2xl font-bold text-shadow-lg text-center">Polygon Box Tessellation</h1>
  <div class="text-sm bg-black/70 text-white p-1 rounded">
    {#if polygonPoints.length === 0}
      <div class="text-sm text-gray-500 text-center mb-2">
        Click on the canvas to start drawing a polygon.
      </div>
    {/if}
    {#if polygonPoints.length > 0}
      <div class="text-sm text-gray-500 text-center mb-2">
        Click on the canvas to add more points. Or click on an existing point to finish the polygon.
      </div>
    {/if}
  </div>
  <div class="border rounded-md bg-sky-900 shadow-md">
    <Canvas bind:ctx />
  </div>
  <OptionsSection ctx={ctx}/>
</main>

<style>
</style>
