// Scan the bounding box area
// 
// In each square step, determine if we should place a square in this space
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