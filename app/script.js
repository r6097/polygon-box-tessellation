const SCALE = 10;

// Convert canvas coordinates to our coordinate system
function canvasToCoord(x, y) {
  return { x: x, y: y }; // Scale down for math
}
// coordinates back to canvas
function coordToCanvas(coord) {
  return { x: coord.x, y: coord.y }; // Scale up for display
}

// Tessellation logic

// 1. Given polygon, define bounding box to limit search.
function getBoundingBox(polygon) {
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  for (const point of polygon.points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  return { minX, maxX, minY, maxY };
}

function pointInPolygon(point, polygon) {
  const { x, y } = point;
  const points = polygon.points;
  let inside = false;

  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x,
      yi = points[i].y;
    const xj = points[j].x,
      yj = points[j].y;

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

function segmentsIntersect(p1, q1, p2, q2) {
  function orientation(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (Math.abs(val) < 1e-10) return 0;
    return val > 0 ? 1 : 2;
  }

  function onSegment(p, q, r) {
    return (
      q.x <= Math.max(p.x, r.x) &&
      q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) &&
      q.y >= Math.min(p.y, r.y)
    );
  }

  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  if (o1 !== o2 && o3 !== o4) return true;

  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;

  return false;
}

// Use to determine if the square will be inside our original polygon
function polygonOverlapsPolygon(poly1, poly2) {
  for (const point of poly1.points) {
    if (pointInPolygon(point, poly2)) {
      return true;
    }
  }

  for (const point of poly2.points) {
    if (pointInPolygon(point, poly1)) {
      return true;
    }
  }

  for (let i = 0; i < poly1.points.length; i++) {
    const p1 = poly1.points[i];
    const q1 = poly1.points[(i + 1) % poly1.points.length];

    for (let j = 0; j < poly2.points.length; j++) {
      const p2 = poly2.points[j];
      const q2 = poly2.points[(j + 1) % poly2.points.length];

      if (segmentsIntersect(p1, q1, p2, q2)) {
        return true;
      }
    }
  }

  return false;
}

// 2(A). Scan the bounding box by squareSize steps.
// Based on current step's coordinate
// determine if we should place a square in this space
function createSquarePolygons(
  polygon,
  squareSize,
  recursionLimit,
  minimumQuadSize
) {
  const bounds = getBoundingBox(polygon);
  const squares = [];

  for (let x = bounds.minX; x < bounds.maxX; x += squareSize) {
    for (let y = bounds.minY; y < bounds.maxY; y += squareSize) {
      const square = {
        points: [
          { x, y },
          { x: x + squareSize, y },
          { x: x + squareSize, y: y + squareSize },
          { x, y: y + squareSize },
        ],
      };

      if (polygonOverlapsPolygon(square, polygon)) {
        squares.push(square);
      }
    }
  }

  return squares;
}

// If i draw a horizontal line at y,
// what coordinates on the polygon will we interesect?
function findHorizontalIntersections(polygon, y) {
  const intersections = []; // x-values
  const points = polygon.points;

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);

    if (y >= minY && y <= maxY && p1.y !== p2.y) {
      const t = (y - p1.y) / (p2.y - p1.y);
      const x = p1.x + t * (p2.x - p1.x);
      intersections.push(x);
    }
  }

  return intersections;
}

// 2(B). Leverage scanline algorithm
function createSquarePolygonsV2(
  polygon,
  squareSize,
  recursionLimit,
  minimumQuadSize
) {
  const bounds = getBoundingBox(polygon);
  const squares = [];

  // still bounded by extrema
  for (let y = bounds.minY; y < bounds.maxY; y += squareSize) {
    // we iterate up in a loop
    // imagine slicing the polygon in horizontal pieces, like a 3d printer
    const intersections = findHorizontalIntersections(polygon, y);

    // sort
    intersections.sort((a, b) => a - b);

    // Generate squares between pairs of intersections
    for (let i = 0; i < intersections.length; i += 2) {
      if (i + 1 < intersections.length) {
        const startX = intersections[i];
        const endX = intersections[i + 1];

        // Create squares from startX to endX
        for (
          let x = Math.floor(startX / squareSize) * squareSize;
          x < endX;
          x += squareSize
        ) {
          const square = {
            points: [
              { x, y },
              { x: x + squareSize, y },
              { x: x + squareSize, y: y + squareSize },
              { x, y: y + squareSize },
            ],
          };
          squares.push(square);
        }
      }
    }
  }

  return squares;
}

// 2(C) scanline variant, whose lines are squaresize high
function createScanlines(polygon, squaresize, recursionLimit, minimumQuadSize) {
  const bounds = getBoundingBox(polygon);
  const squares = [];

  // still bounded by extrema
  for (let y = bounds.minY; y < bounds.maxY; y += squaresize) {
    // we iterate up in a loop
    // imagine slicing the polygon in horizontal pieces, like a 3d printer
    const intersections = findHorizontalIntersections(polygon, y);

    // sort
    intersections.sort((a, b) => a - b);

    // Generate squares between pairs of intersections
    for (let i = 0; i < intersections.length; i += 2) {
      if (i + 1 < intersections.length) {
        const startX = intersections[i];
        const endX = intersections[i + 1];

        // Create 1 rectangle from startX to endX
        const rect = {
          points: [
            { x: startX, y },
            { x: endX, y },
            { x: endX, y: y + squaresize },
            { x: startX, y: y + squaresize },
          ],
          uuid: `${JSON.stringify(polygon)}-${y}-${i}`,
        };
        squares.push(rect);
      }
    }
  }

  return squares;
}

/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  intersectsPolygon(polygon) {
    const polygonPoints = polygon.points;
    if (polygonPoints.length < 3) return false;

    // check polygon vertices in rectangle
    for (let point of polygonPoints) {
      if (this.containsPoint(point)) {
        return true;
      }
    }

    // check rectangle points in polygon
    const corners = [
      { x: this.x, y: this.y },
      { x: this.x + this.width, y: this.y },
      { x: this.x + this.width, y: this.y + this.height },
      { x: this.x, y: this.y + this.height },
    ];

    for (let corner of corners) {
      if (this.pointInPolygon(corner, polygonPoints)) {
        return true;
      }
    }

    // check line interesections
    for (let i = 0; i < polygonPoints.length; i++) {
      const p1 = polygonPoints[i];
      const p2 = polygonPoints[(i + 1) % polygonPoints.length];

      if (this.lineIntersectsRectangle(p1, p2)) {
        return true;
      }
    }

    return false;
  }

  containsPoint(point) {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.width &&
      point.y >= this.y &&
      point.y <= this.y + this.height
    );
  }

  pointInPolygon(point, polygonPoints) {
    let inside = false;
    for (
      let i = 0, j = polygonPoints.length - 1;
      i < polygonPoints.length;
      j = i++
    ) {
      if (
        polygonPoints[i].y > point.y !== polygonPoints[j].y > point.y &&
        point.x <
          ((polygonPoints[j].x - polygonPoints[i].x) *
            (point.y - polygonPoints[i].y)) /
            (polygonPoints[j].y - polygonPoints[i].y) +
            polygonPoints[i].x
      ) {
        inside = !inside;
      }
    }
    return inside;
  }

  isEntirelyInsidePolygon(polygon) {
    const polygonPoints = polygon.points;
    if (polygonPoints.length < 3) return false;

    const corners = [
      { x: this.x, y: this.y },
      { x: this.x + this.width, y: this.y },
      { x: this.x + this.width, y: this.y + this.height },
      { x: this.x, y: this.y + this.height },
    ];

    for (let corner of corners) {
      if (!this.pointInPolygon(corner, polygonPoints)) {
        return false;
      }
    }

    return true;
  }

  lineIntersectsRectangle(p1, p2) {
    const rectLines = [
      [
        { x: this.x, y: this.y },
        { x: this.x + this.width, y: this.y },
      ],
      [
        { x: this.x + this.width, y: this.y },
        { x: this.x + this.width, y: this.y + this.height },
      ],
      [
        { x: this.x + this.width, y: this.y + this.height },
        { x: this.x, y: this.y + this.height },
      ],
      [
        { x: this.x, y: this.y + this.height },
        { x: this.x, y: this.y },
      ],
    ];

    for (let rectLine of rectLines) {
      if (this.linesIntersect(p1, p2, rectLine[0], rectLine[1])) {
        return true;
      }
    }
    return false;
  }

  linesIntersect(p1, q1, p2, q2) {
    function orientation(p, q, r) {
      const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
      if (val === 0) return 0;
      return val > 0 ? 1 : 2;
    }

    function onSegment(p, q, r) {
      return (
        q.x <= Math.max(p.x, r.x) &&
        q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) &&
        q.y >= Math.min(p.y, r.y)
      );
    }

    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    if (o1 !== o2 && o3 !== o4) return true;

    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false;
  }

  // TODO update old algos to incorporate class
  toAdaptedForm() {
    return {
      points: [
        { x: this.x, y: this.y },
        { x: this.x + this.width, y: this.y },
        { x: this.x + this.width, y: this.y + this.height },
        { x: this.x, y: this.y + this.height },
      ],
    };
  }
}

class QuadTree {
  constructor(bounds, maxDepth = 6, minSize = 10) {
    this.bounds = bounds;
    this.maxDepth = maxDepth;
    this.minSize = minSize;
    this.rectangles = [];
    this.maxDepthReached = 0;
  }

  generateRectangles(polygon, depth = 0) {
    this.maxDepthReached = Math.max(this.maxDepthReached, depth);

    // Base case: does not touch polygon, skip quadrant
    if (!this.bounds.intersectsPolygon(polygon)) {
      return;
    }

    // Other base case: this quadrant is fully covered by polygon, do not subdivide
    if (this.bounds.isEntirelyInsidePolygon(polygon)) {
      this.rectangles.push(
        new Rectangle(
          this.bounds.x,
          this.bounds.y,
          this.bounds.width,
          this.bounds.height
        )
      );
      return;
    }

    // add quadrant if it fufills size restriction
    if (
      depth >= this.maxDepth ||
      this.bounds.width <= this.minSize ||
      this.bounds.height <= this.minSize
    ) {
      if (this.bounds.intersectsPolygon(polygon)) {
        this.rectangles.push(
          new Rectangle(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            this.bounds.height
          )
        );
      }
      return;
    }

    // otherwise recurse through subdivision
    const halfWidth = this.bounds.width / 2;
    const halfHeight = this.bounds.height / 2;

    const quadrants = [
      new Rectangle(this.bounds.x, this.bounds.y, halfWidth, halfHeight),
      new Rectangle(
        this.bounds.x + halfWidth,
        this.bounds.y,
        halfWidth,
        halfHeight
      ),
      new Rectangle(
        this.bounds.x,
        this.bounds.y + halfHeight,
        halfWidth,
        halfHeight
      ),
      new Rectangle(
        this.bounds.x + halfWidth,
        this.bounds.y + halfHeight,
        halfWidth,
        halfHeight
      ),
    ];

    for (let quadrant of quadrants) {
      const childTree = new QuadTree(quadrant, this.maxDepth, this.minSize);
      childTree.generateRectangles(polygon, depth + 1);
      this.rectangles.push(...childTree.rectangles);
      this.maxDepthReached = Math.max(
        this.maxDepthReached,
        childTree.maxDepthReached
      );
    }
  }

  getRectangles() {
    return this.rectangles;
  }
}

function createQuadTree(polygon, squareSize, recursionLimit, minimumQuadSize) {
  const bounds = getBoundingBox(polygon);

  const rectBounds = new Rectangle(
    bounds.minX,
    bounds.minY,
    bounds.maxX - bounds.minX,
    bounds.maxY - bounds.minY
  );

  const quadTree = new QuadTree(rectBounds, recursionLimit, minimumQuadSize);
  quadTree.generateRectangles(polygon);
  return quadTree.getRectangles().map((r) => r.toAdaptedForm());
}

function reduceRectangles(rectangles) {
  let copy = rectangles.map((r) => fromPoints(r.points));

  let i = 0;
  while (copy.length > 1) {
    console.log(`iter ${i}`);
    console.log(copy);
    const next = mergeVertical(mergeHorizontal(copy));
    console.log(next);
    // cannot be reduced further
    if (next.length == copy.length) {
      break;
    }
    copy = [...next];
    console.log(copy);
    i += 1;
  }
  console.log(copy);
  return copy.map((r) => r.toAdaptedForm());
}

function mergeVertical(rectangles) {
  const merged = [];
  const used = new Set();

  for (let i = 0; i < rectangles.length; i++) {
    if (used.has(i)) continue;

    let rect = rectangles[i];
    let expandedRect = new Rectangle(rect.x, rect.y, rect.width, rect.height);

    // Try to merge with rectangles below
    let foundMerge = true;
    while (foundMerge) {
      foundMerge = false;

      for (let j = i + 1; j < rectangles.length; j++) {
        if (used.has(j)) continue;

        const other = rectangles[j];

        // Can merge vertically if:
        // 1. Same width and x position
        // 2. Adjacent vertically
        if (
          expandedRect.width === other.width &&
          expandedRect.x === other.x &&
          expandedRect.y + expandedRect.height === other.y
        ) {
          // Create potential merged rectangle
          const testRect = new Rectangle(
            expandedRect.x,
            expandedRect.y,
            expandedRect.width,
            expandedRect.height + other.height
          );

          expandedRect = testRect;
          used.add(j);
          foundMerge = true;
          break;
        }
      }
    }

    merged.push(expandedRect);
    used.add(i);
  }

  return merged;
}

function mergeHorizontal(rectangles) {
  const merged = [];
  const used = new Set();

  for (let i = 0; i < rectangles.length; i++) {
    if (used.has(i)) continue;

    let rect = rectangles[i];
    let expandedRect = new Rectangle(rect.x, rect.y, rect.width, rect.height);

    // Try to merge with rectangles to the right
    let foundMerge = true;
    while (foundMerge) {
      foundMerge = false;

      for (let j = i + 1; j < rectangles.length; j++) {
        if (used.has(j)) continue;

        const other = rectangles[j];

        // Can merge horizontally if:
        // 1. Same height and y position
        // 2. Adjacent horizontally
        if (
          expandedRect.height === other.height &&
          expandedRect.y === other.y &&
          expandedRect.x + expandedRect.width === other.x
        ) {
          // Create potential merged rectangle
          const testRect = new Rectangle(
            expandedRect.x,
            expandedRect.y,
            expandedRect.width + other.width,
            expandedRect.height
          );

          expandedRect = testRect;
          used.add(j);
          foundMerge = true;
          break;
        }
      }
    }

    merged.push(expandedRect);
    used.add(i);
  }

  return merged;
}

function combineRectangles(rectangles) {
  function merge(a, b) {
    return new Rectangle(
      Math.max(rectangles.map((r) => r.x)),
      Math.max(rectangles.map((r) => r.y))
    );
  }

  if (rectangles.length == 1) {
    return rectangles;
  }
}

function fromPoints(points) {
  const xCoordinates = points.map((point) => point.x);
  const yCoordinates = points.map((point) => point.y);

  // Find minimum and maximum values
  const minX = Math.min(...xCoordinates);
  const minY = Math.min(...yCoordinates);
  const maxX = Math.max(...xCoordinates);
  const maxY = Math.max(...yCoordinates);

  // Calculate width and height
  const width = maxX - minX;
  const height = maxY - minY;

  return new Rectangle(minX, minY, width, height);
}

/**
 * UI
 */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

let currentPolygon = [];
let isPolygonFinished = false;
let squares = [];
let boundingBox = null;
// dropdown algorithm selection
let selectedProcessingFunction = createSquarePolygonsV2;

function drawPolygon(polygon, color, fill = false) {
  if (polygon.points.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  if (fill) {
    ctx.fillStyle = color;
  }

  ctx.beginPath();
  const firstPoint = coordToCanvas(polygon.points[0]);
  ctx.moveTo(firstPoint.x, firstPoint.y);

  for (let i = 1; i < polygon.points.length; i++) {
    const point = coordToCanvas(polygon.points[i]);
    ctx.lineTo(point.x, point.y);
  }

  if (isPolygonFinished && polygon.points.length > 2) {
    ctx.closePath();
    if (fill) ctx.fill();
  }

  ctx.stroke();

  // Draw vertices
  ctx.fillStyle = color;
  for (const point of polygon.points) {
    const canvasPoint = coordToCanvas(point);
    ctx.beginPath();
    ctx.arc(canvasPoint.x, canvasPoint.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function drawBoundingBox(bounds) {
  if (!bounds) return;

  ctx.strokeStyle = "blue";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);

  const topLeft = coordToCanvas({ x: bounds.minX, y: bounds.minY });
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  ctx.strokeRect(topLeft.x, topLeft.y, width, height);
  ctx.setLineDash([]);
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
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (document.getElementById("showBounding").checked && boundingBox) {
    drawBoundingBox(boundingBox);
  }

  if (squares.length > 0) {
    drawSquares(squares);
  }

  if (currentPolygon.length > 0) {
    const polygon = { points: currentPolygon };

    if (document.getElementById("showPolygon").checked || !isPolygonFinished) {
      drawPolygon(polygon, "red", isPolygonFinished);
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
    } else if (selectedValue === "scanlinesquares") {
      selectedProcessingFunction = createSquarePolygonsV2;
    } else if (selectedValue === "truescanline") {
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
