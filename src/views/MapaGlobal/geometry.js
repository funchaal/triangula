import { GROW_DURATION, HOLD_DURATION, SHRINK_DURATION, ARC_STEPS } from './constants';

export function toRad(d) { return d * Math.PI / 180; }

export function greatCirclePoint(src, tgt, t) {
  const lat1 = toRad(src[1]), lon1 = toRad(src[0]);
  const lat2 = toRad(tgt[1]), lon2 = toRad(tgt[0]);
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
  ));
  if (d < 0.0001)
    return [src[0] + (tgt[0] - src[0]) * t, src[1] + (tgt[1] - src[1]) * t, 0];
  const A = Math.sin((1 - t) * d) / Math.sin(d);
  const B = Math.sin(t * d) / Math.sin(d);
  const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
  const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);
  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lon = Math.atan2(y, x);
  const ease = Math.sqrt(1 - (2 * t - 1) ** 2); // equação do círculo unitário
const altitude = ease * 0.5 * (d * 180 / Math.PI) * 111000;
  return [lon * 180 / Math.PI, lat * 180 / Math.PI, altitude];
}

export function perpNormal(src, tgt) {
  const dx = tgt[0] - src[0], dy = tgt[1] - src[1];
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return [-dy / len, dx / len];
}

export function buildArcPoints(src, tgt, offsetAmount = 0) {
  const [px, py] = perpNormal(src, tgt);
  const pts = [];
  for (let i = 0; i <= ARC_STEPS; i++) {
    const t = i / ARC_STEPS;
    const [lng, lat, alt] = greatCirclePoint(src, tgt, t);
    const bulge = Math.sin(t * Math.PI);
pts.push([lng + px * offsetAmount * bulge, lat + py * offsetAmount * bulge, alt]);
  }
  return pts;
}

export function getSegment(ct) {
  if (ct < GROW_DURATION)   return { tTail: 0, tFront: ct / GROW_DURATION };
  if (ct < GROW_DURATION + HOLD_DURATION) return { tTail: 0, tFront: 1 };
  if (ct < GROW_DURATION + HOLD_DURATION + SHRINK_DURATION)
    return { tTail: (ct - GROW_DURATION - HOLD_DURATION) / SHRINK_DURATION, tFront: 1 };
  return { tTail: 1, tFront: 1 };
}
