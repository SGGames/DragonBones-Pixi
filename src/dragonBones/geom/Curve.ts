// Cubic Bezier curve utilities

export function cubicBezierPosition(
  x1: number, y1: number,
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  x2: number, y2: number,
  t: number
): { x: number, y: number } {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const a = mt2 * mt;
  const b = mt2 * t * 3;
  const c = mt * t2 * 3;
  const d = t * t2;
  const x = a * x1 + b * cx1 + c * cx2 + d * x2;
  const y = a * y1 + b * cy1 + c * cy2 + d * y2;
  return { x, y };
}

export function cubicBezierTangent(
  x1: number, y1: number,
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  x2: number, y2: number,
  t: number
): { x: number, y: number, tangent: number } {
  const pt = cubicBezierPosition(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
  // Derivative for tangent
  const mt = 1 - t;
  const dx =
      3 * mt * mt * (cx1 - x1) +
      6 * mt * t * (cx2 - cx1) +
      3 * t * t * (x2 - cx2);
  const dy =
      3 * mt * mt * (cy1 - y1) +
      6 * mt * t * (cy2 - cy1) +
      3 * t * t * (y2 - cy2);
  const tangent = Math.atan2(dy, dx);
  return { x: pt.x, y: pt.y, tangent };
}
