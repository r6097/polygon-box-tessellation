
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