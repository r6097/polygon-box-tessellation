// encapsulate geometry-related functions

import { getBoundingBox } from "./geometry";

// used in QuadTree class
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

  // my Rectangle class -> polygonal form
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

// Run the quadtree algorithm with generateRectangles
// will recursively run maxDepth times
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

export function createQuadTree(polygon, recursionLimit, minimumQuadSize) {
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
