<script lang="ts">
    import AlgorithmSelect from "./AlgorithmSelect.svelte";
    import QuadTreeOptions from "./QuadTreeOptions.svelte";
    import { squareSize } from "./store/squares.svelte";
    import { selectedAlgorithm, hideOutput } from "./store/algorithmSelect.svelte";
    import { polygon } from "./store/polygon.svelte";
    import { drawTrigger } from "./store/drawTrigger.svelte";

    export let ctx: CanvasRenderingContext2D;

    function handleHideOutputChange(event) {
        console.log("onHideOutputChange", event.target.checked)
        hideOutput.set(event.target.checked);
        drawTrigger.redraw();
    }

    function handleClear() {
        console.log("onClear");
        polygon.reset();
        ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        hideOutput.set(false);
        drawTrigger.redraw();
    }
</script>

<div class="border p-4 rounded-md bg-slate shadow-md flex flex-row justify-between items-center">
    <div class="flex flex-col gap-2">
        <AlgorithmSelect />
        <div class="flex flex-row items-center gap-2">
            <button class="border p-2 rounded-md bg-red-600 shadow-md w-32" disabled={!$polygon.isFinished} on:click={handleClear}>Clear Polygon</button>
        </div>
        <div class="flex flex-row items-center gap-2">
            <label for="hideOutput">Hide Generated Squares:</label>
            <input type="checkbox" id="hideOutput" bind:checked={$hideOutput} on:change={handleHideOutputChange} disabled={!$polygon.isFinished}/>
        </div>
    </div>

    <div class="flex flex-col">
    {#if $selectedAlgorithm !== "quadTree"}
        <div class="flex flex-col gap-2 w-64">
            <label for="squareSize">Square Size: {$squareSize}</label>
            <input type="range" id="squareSize" bind:value={$squareSize} min="1" max="100" step="1" />
        </div>
    {/if}

    {#if $selectedAlgorithm === "quadTree"}
        <QuadTreeOptions />
    {/if}
    </div>
</div>