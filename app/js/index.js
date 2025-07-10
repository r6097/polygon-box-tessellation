const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

let currentPolygon = [];
let isPolygonFinished = false;
let squares = [];
let boundingBox = null;
// dropdown algorithm selection
let selectedProcessingFunction = createSquarePolygons;

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (document.getElementById("showBounding").checked && boundingBox) {
    drawBoundingBox(ctx, boundingBox);
  }

  if (squares.length > 0) {
    drawSquares(ctx, squares);
  }

  if (currentPolygon.length > 0) {
    const polygon = { points: currentPolygon };

    if (document.getElementById("showPolygon").checked || !isPolygonFinished) {
      drawPolygon(ctx, polygon, "red", isPolygonFinished);
    }
  }
}

// Event handlers
canvas.addEventListener("click", (e) => {
  if (isPolygonFinished) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  currentPolygon.push(canvasToCoord(x, y));
  redraw();

  info.textContent = `Polygon has ${currentPolygon.length} vertices. Click "Finish Polygon" when done.`;
});

document.getElementById("finishPolygon").addEventListener("click", () => {
  if (currentPolygon.length < 3) {
    alert("Need at least 3 points to make a polygon!");
    return;
  }

  isPolygonFinished = true;
  const polygon = { points: currentPolygon };
  boundingBox = getBoundingBox(polygon);
  redraw();

  info.textContent = `Polygon finished with ${currentPolygon.length} vertices. Click "Generate Squares" to tessellate.`;
});

document.getElementById("generateSquares").addEventListener("click", () => {
  if (!isPolygonFinished) {
    alert("Finish the polygon first!");
    return;
  }
  const startTime = performance.now();
  const squareSize =
    parseInt(document.getElementById("squareSize").value) / SCALE;

  const recursionLimit = parseInt(
    document.getElementById("recursionLimit").value
  );

  const minimumQuadSize = parseInt(
    document.getElementById("minimumQuadSize").value
  );

  const polygon = { points: currentPolygon };

  squares = selectedProcessingFunction(
    polygon,
    squareSize,
    recursionLimit,
    minimumQuadSize
  );
  redraw();
  const endTime = performance.now();

  info.textContent = `Generated ${
    squares.length
  } squares covering the polygon. Time ${endTime - startTime}ms`;
});

document
  .getElementById("processingFunction")
  .addEventListener("change", (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "bbscan") {
      selectedProcessingFunction = createSquarePolygons;
    } else if (selectedValue === "scanline") {
      selectedProcessingFunction = createScanlines;
    } else if (selectedValue === "quadTree") {
      selectedProcessingFunction = createQuadTree;
    }
    // If squares are already displayed, regenerate them with the new function
    if (squares.length > 0) {
      document.getElementById("generateSquares").click();
    }

    info.textContent = `Swapped to method: ${selectedValue}`;
  });

document.getElementById("clearCanvas").addEventListener("click", () => {
  currentPolygon = [];
  isPolygonFinished = false;
  squares = [];
  boundingBox = null;
  redraw();
  info.textContent = "Click to start drawing a polygon";
});

document.getElementById("loadExample").addEventListener("click", () => {
  currentPolygon = [
    { x: 100, y: 100 },
    { x: 500, y: 100 },
    { x: 600, y: 200 },
    { x: 500, y: 300 },
    { x: 700, y: 300 },
    { x: 600, y: 400 },
    { x: 300, y: 500 },
    { x: 200, y: 500 },
    { x: 50, y: 300 },
    { x: 100, y: 200 },
  ];
  isPolygonFinished = true;
  const polygon = { points: currentPolygon };
  boundingBox = getBoundingBox(polygon);
  redraw();
  info.textContent =
    'Example polygon loaded. Click "Generate Squares" to tessellate.';
});

document.getElementById("squareSize").addEventListener("input", (e) => {
  document.getElementById("squareSizeValue").textContent =
    e.target.value + "px";
  if (squares.length > 0) {
    // Regenerate squares with new size
    document.getElementById("generateSquares").click();
  }
});

document.getElementById("minimumQuadSize").addEventListener("input", (e) => {
  document.getElementById("minimumQuadSizeValue").textContent = e.target.value;
  if (squares.length > 0) {
    // Regenerate squares with new size
    document.getElementById("generateSquares").click();
  }
});

document.getElementById("recursionLimit").addEventListener("input", (e) => {
  document.getElementById("recursionLimitValue").textContent = e.target.value;
  if (squares.length > 0) {
    // Regenerate squares with new size
    document.getElementById("generateSquares").click();
  }
});

document.getElementById("refineRectangles").addEventListener("click", () => {
  if (squares.length === 0) {
    // Regenerate squares with new size
    alert("Need to generate squares first!");
    return;
  }
  const originalCount = squares.length;
  const refined = reduceRectangles(squares);
  info.textContent = `Reduced rectangles from ${originalCount} to ${refined.length}.`;
  squares = refined;
  redraw();
});

document.getElementById("showBounding").addEventListener("change", redraw);
document.getElementById("showPolygon").addEventListener("change", redraw);

// Initial draw
redraw();
