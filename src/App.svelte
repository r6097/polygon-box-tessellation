<script lang="ts">
  import Canvas from './lib/Canvas.svelte';
  import OptionsSection from './lib/OptionsSection.svelte';

  let ctx: CanvasRenderingContext2D;

</script>

<main>
  <h1 class="text-2xl font-bold text-shadow-lg text-center">Polygon Box Tessellation</h1>
  <div class="border rounded-md bg-sky-900 shadow-md">
    <Canvas bind:ctx />
  </div>
  <OptionsSection ctx={ctx}/>
</main>

<style>
</style>
