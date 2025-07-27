export function getBoundingBox(polygon) {
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

export function pointInPolygon(point, polygon) {
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

export function segmentsIntersect(p1, q1, p2, q2) {
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
export function polygonOverlapsPolygon(poly1, poly2) {
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

export function findHorizontalIntersections(polygon, y) {
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
