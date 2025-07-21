// Scanline algo
//
// imagine slicing the polygon in horizontal pieces, like a 3d printer
function createScanlines(polygon, squaresize, recursionLimit, minimumQuadSize) {
  const bounds = getBoundingBox(polygon);
  const squares = [];

  for (let y = bounds.minY; y < bounds.maxY; y += squaresize) {
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
