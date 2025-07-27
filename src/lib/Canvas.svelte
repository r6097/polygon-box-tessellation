<script lang="ts">
  import { onMount } from 'svelte';  
  import { get } from "svelte/store";
  import { polygon } from "./store/polygon.svelte";
  import { hideOutput } from './store/algorithmSelect.svelte';
  import { drawTrigger } from './store/drawTrigger.svelte';
  import { generatedSquares } from './store/generatedSquares.svelte';

  let mouse = { x: 0, y: 0 };
  let hoveredIndex: number | null = null;
  const POINT_RADIUS = 8; // hover detection range

  let canvas: HTMLCanvasElement;
  export let ctx: CanvasRenderingContext2D;
  
  $: polygonPoints = $polygon.points;
  $: isPolygonFinished = $polygon.isFinished;

  function canvasToCoord(x: number, y: number) {
    return { x, y };
  }

  function coordToCanvas(coord: { x: number; y: number }) {
    return { x: coord.x, y: coord.y };
  }

  function handleMouseMove(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    hoveredIndex = null;
    polygonPoints.forEach((pt, i) => {
      const p = coordToCanvas(pt);
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < POINT_RADIUS) {
        hoveredIndex = i;
      }
    });
    drawTrigger.redraw();
  } 

  function handleClickCanvas(event: MouseEvent) {
    if (isPolygonFinished) return;

    if (hoveredIndex !== null && polygonPoints.length > 2) {
      polygon.finish();
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const point = canvasToCoord(x, y);
    polygon.insertPoint(point);
    drawTrigger.redraw();
  }

  function drawPolygon() {
    if (!ctx || polygonPoints.length < 2) return;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    if (isPolygonFinished) ctx.fillStyle = "red";

    ctx.beginPath();
    const firstPoint = coordToCanvas(polygonPoints[0]);
    ctx.moveTo(firstPoint.x, firstPoint.y);
    
    // Draw path
    for (let i = 0; i < polygonPoints.length; i++) {
      const point = coordToCanvas(polygonPoints[i]);
      ctx.lineTo(point.x, point.y);
    }

    if (isPolygonFinished && polygonPoints.length > 2) {
      ctx.closePath();
      ctx.fill();
    }

    ctx.stroke();

    // Draw vertices
    for (const [i, point] of polygonPoints.entries()) {
      const p = coordToCanvas(point);
      ctx.beginPath();
      ctx.arc(p.x, p.y, (i === hoveredIndex) ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = (i === hoveredIndex) ? "orange" : "red";
      ctx.fill();
      if (i === hoveredIndex) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    drawTrigger.redraw();
  }

  function drawSquares(squares) {
    ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
    ctx.strokeStyle = "green";
    ctx.lineWidth = 1;
    for (const square of squares) {
      const topLeft = coordToCanvas(square.points[0]);
      const bottomRight = coordToCanvas(square.points[2]);
      const width = bottomRight.x - topLeft.x;
      const height = bottomRight.y - topLeft.y;
      ctx.fillRect(topLeft.x, topLeft.y, width, height);
      ctx.strokeRect(topLeft.x, topLeft.y, width, height);
    }
    drawTrigger.redraw();
  }

  function draw() {
    if (!ctx) return;

    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    drawPolygon();
  
    if (!get(hideOutput)) drawSquares($generatedSquares);
  }

  onMount(() => {
    ctx = canvas.getContext("2d");
    draw();
  });


  $: if ($drawTrigger || $generatedSquares) {
    draw(); // will now use up-to-date square data
  }
</script>

<canvas bind:this={canvas} width="800" height="600" on:mousemove={handleMouseMove} on:click={handleClickCanvas} class="relative"></canvas>
<div class="absolute top-2 left-2 text-sm bg-black/70 text-white p-1 rounded">
  x: {mouse.x}, y: {mouse.y}
</div>

