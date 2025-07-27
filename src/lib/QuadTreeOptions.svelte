<script>
    import { quadTreeOptions } from "./store/quadTreeOptions.svelte";
    import { drawTrigger } from "./store/drawTrigger.svelte";

    function handleRecursionDepthChange(event) {
        console.log("onRecursionDepthChange", event.target.value)
        quadTreeOptions.setRecursionDepth(event.target.value);
        drawTrigger.redraw();
    }

    function handleQuadrantSizeChange(event) {
        console.log("onQuadrantSizeChange", event.target.value)
        quadTreeOptions.setQuadrantSize(event.target.value);
        drawTrigger.redraw();
    }
</script>

<div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2 w-64">
        <label for="quadrantSize">Quadrant Size: {quadTreeOptions.quadrantSize}</label>
        <input type="range" id="quadrantSize" bind:value={quadTreeOptions.quadrantSize} min="1" max="100" step="1" on:change={handleQuadrantSizeChange} />
    </div>
    <div class="flex flex-col gap-2 w-64">
        <label for="recursionLimit">Recursion Depth Limit: {quadTreeOptions.recursionDepth}</label>
        <input type="range" id="recursionLimit" bind:value={quadTreeOptions.recursionDepth} min="1" max="20" step="1" on:change={handleRecursionDepthChange} />
    </div>  
</div>