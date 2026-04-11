// ─────────────────────────────────────────────────────────────────────────────
// layers.js — Fábrica das camadas deck.gl usadas na animação dos arcos do mapa
// ─────────────────────────────────────────────────────────────────────────────

import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";

/** Velocidade do traço animado (quanto maior, mais rápido) */
export const DASH_SPEED = 0.0006;

/**
 * Monta e retorna todas as camadas deck.gl para um dado estado de animação.
 * @param {Array}  arcs     - Array de arcos com { points, id }
 * @param {number} progress - Progresso atual da animação [0, 1]
 * @returns {Array} Camadas deck.gl prontas para uso
 */
export function buildLayers(arcs, progress) {
  if (!arcs.length) return [];

  // Camada de fundo — traço completo translúcido
  const trailData = arcs.map(arc => ({ path: arc.points, id: arc.id }));

  // Camada animada — segmento iluminado que percorre o arco
  const dashData = arcs.map((arc, i) => {
    const offset   = i / arcs.length;
    const p        = (progress + offset) % 1;
    const dashLen  = 0.25;
    const mappedP  = p * (1 + dashLen);
    const tail     = Math.max(0, mappedP - dashLen);
    const front    = Math.min(1, mappedP);
    const n        = arc.points.length - 1;
    const i0       = Math.floor(tail  * n);
    const i1       = Math.ceil(front * n);

    return {
      path:  arc.points.slice(i0, i1 + 1),
      color: [59, 130, 246, 255],
    };
  });

  // Camada de setas — pequenas chevrons ao longo de cada arco
  const arrowData = arcs.flatMap(arc => {
    const arrows = [];
    for (const t of [0.35, 0.65]) {
      const idx = Math.floor(t * (arc.points.length - 2));
      const p1  = arc.points[idx];
      const p2  = arc.points[idx + 1];
      if (!p1 || !p2) continue;

      const dx  = p2[0] - p1[0];
      const dy  = p2[1] - p1[1];
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const scale = 0.12;
      const ux = dx / len, uy = dy / len;
      const px = -uy,      py = ux;
      const tip   = p2;
      const left  = [p2[0] - ux * scale + px * scale * 0.5, p2[1] - uy * scale + py * scale * 0.5, p2[2]];
      const right = [p2[0] - ux * scale - px * scale * 0.5, p2[1] - uy * scale - py * scale * 0.5, p2[2]];

      arrows.push({ path: [left, tip, right] });
    }
    return arrows;
  });

  // Posição da "cabeça" iluminada de cada arco (bolinha no topo do traço)
  const headData = arcs.map((arc, i) => {
    const offset  = i / arcs.length;
    const p       = (progress + offset) % 1;
    const mappedP = p * (1 + 0.25);
    const front   = Math.min(1, mappedP);
    const idx     = Math.min(Math.floor(front * (arc.points.length - 1)), arc.points.length - 1);
    return { position: arc.points[idx] };
  });

  return [
    new PathLayer({
      id: "trail-bg",
      data: trailData,
      getPath:       d => d.path,
      getWidth:      3,
      getColor:      [59, 130, 246, 30],
      widthUnits:    "pixels",
      capRounded:    true,
      jointRounded:  true,
      pickable:      false,
      parameters:    { depthTest: false },
    }),
    new PathLayer({
      id: "trail-dash",
      data: dashData,
      getPath:       d => d.path,
      getWidth:      4,
      getColor:      d => d.color,
      widthUnits:    "pixels",
      capRounded:    true,
      jointRounded:  true,
      pickable:      false,
      parameters:    { depthTest: false },
      updateTriggers: { getPath: progress, getColor: progress },
    }),
    new PathLayer({
      id: "arrows",
      data: arrowData,
      getPath:       d => d.path,
      getWidth:      2,
      getColor:      [59, 130, 246, 200],
      widthUnits:    "pixels",
      capRounded:    false,
      jointRounded:  false,
      pickable:      false,
      parameters:    { depthTest: false },
    }),
    new ScatterplotLayer({
      id: "trail-head",
      data: headData,
      getPosition:          d => d.position,
      getRadius:            6000,
      getFillColor:         [147, 197, 253, 255],
      getLineColor:         [59, 130, 246, 150],
      lineWidthMinPixels:   2,
      stroked:              true,
      radiusUnits:          "meters",
      pickable:             false,
      parameters:           { depthTest: false },
      updateTriggers:       { getPosition: progress },
    }),
  ];
}