import { getBoundingBox, polygonOverlapsPolygon } from "./geometry";

export function bruteForce(polygon, squareSize) {
  const bounds = getBoundingBox(polygon);
  if (!bounds) return [];
  console.log("squareSize:", squareSize);
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
