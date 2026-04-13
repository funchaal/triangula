// ─────────────────────────────────────────────────────────────────────────────
// hooks/useArcData.js — Memoiza a lista de arcos com seus pontos e fases de animação
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { resolveCoords } from '../helpers';
import { buildArcPoints } from '../geometry';
import { CYCLE_DURATION, ACTIVE_DURATION } from '../constants';

/**
 * Calcula os arcos do mapa com fase de animação, offset de ciclo e pontos do arco.
 * Usa razão áurea para distribuir as fases e evitar sobreposição visual.
 */
export function useArcData(mapData, locations, regions, states) {
  return useMemo(() => {
    const pairPhases = {};
    let pairCount = 0;

    // Atribui uma fase única para cada par de nós (independente da direção)
    mapData.forEach((a) => {
      const pairKey = [a.from, a.to].sort().join('|');
      if (!(pairKey in pairPhases)) {
        pairPhases[pairKey] = pairCount++;
      }
    });

    const goldenRatio = 0.61803398875;

    return mapData.map((a) => {
      const src = resolveCoords(a.from, locations, regions, states);
      const tgt = resolveCoords(a.to,   locations, regions, states);
      if (!src || !tgt) return null;

      const pairKey = [a.from, a.to].sort().join('|');
      const hasRev  = mapData.some(b => b.from === a.to && b.to === a.from);

      // Distribui as fases com razão áurea para evitar agrupamento visual
      const fraction   = (pairPhases[pairKey] * goldenRatio) % 1;
      const basePhase  = fraction * CYCLE_DURATION;

      // Se há arco reverso, o arco oposto começa na segunda metade do ciclo
      const reverseOffset = (hasRev && a.from > a.to ? ACTIVE_DURATION : 0);
      const localCycle    = hasRev ? CYCLE_DURATION : ACTIVE_DURATION + 1000;
      const phase         = basePhase + reverseOffset;

      const offsetSide = (hasRev && a.from > a.to) ? -0.01 : 0.01;

      return {
        ...a,
        phaseOffset: phase,
        localCycle,
        arcPoints: buildArcPoints(src, tgt, offsetSide),
      };
    }).filter(Boolean);
  }, [mapData, locations, regions, states]);
}