const SCALE = 10;

function canvasToCoord(x, y) {
  return { x, y };
}

function coordToCanvas(coord) {
  return { x: coord.x, y: coord.y };
}

function drawPolygon(ctx, polygon, color, isPolygonFinished) {
  if (polygon.points.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  if (isPolygonFinished) ctx.fillStyle = color;

  ctx.beginPath();
  const firstPoint = coordToCanvas(polygon.points[0]);
  ctx.moveTo(firstPoint.x, firstPoint.y);
  for (let i = 1; i < polygon.points.length; i++) {
    const point = coordToCanvas(polygon.points[i]);
    ctx.lineTo(point.x, point.y);
  }
  if (isPolygonFinished && polygon.points.length > 2) {
    ctx.closePath();
    if (isPolygonFinished) ctx.fill();
  }
  ctx.stroke();

  ctx.fillStyle = color;
  for (const point of polygon.points) {
    const canvasPoint = coordToCanvas(point);
    ctx.beginPath();
    ctx.arc(canvasPoint.x, canvasPoint.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function drawBoundingBox(ctx, bounds) {
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

function drawSquares(ctx, squares) {
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
