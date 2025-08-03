<script>
    import { selectedAlgorithm } from "./store/algorithmSelect.svelte";
    import { drawTrigger } from "./store/drawTrigger.svelte";

    let algorithmOptions = [
        { value: "bruteForce", label: "Brute force" },
        { value: "scanline", label: "Scanline" },
        { value: "quadTree", label: "QuadTree" }
    ];


    function handleAlgorithmChange(event) {
        console.log("onAlgorithmChange", event.target.value);
        selectedAlgorithm.set(event.target.value);
        drawTrigger.redraw();
    }
</script>

<div>
    <label for="algorithm-select">Algorithm:</label>
    <select id="algorithm-select" bind:value={$selectedAlgorithm} on:change={handleAlgorithmChange} class="bg-violet-800 text-white border border-slate-600 rounded">
        {#each algorithmOptions as option}
            <option class="bg-violet-600 text-white" value={option.value}>{option.label}</option>
        {/each}
    </select>
</div>