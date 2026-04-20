// ─────────────────────────────────────────────────────────────────────────────
// hooks/useLayers.js — Memoiza todas as camadas deck.gl do mapa global
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { useAppDispatch } from '../../../store/hooks';
import { ScatterplotLayer, TextLayer, PathLayer } from "@deck.gl/layers";
import { selectArc, selectBase, setHoveredArc } from '../../../store/slices/globalSlice';
import { resolveCoords } from '../helpers';
import { getSegment } from '../geometry';
import { COLORS, CYCLE_DURATION } from '../constants';

// Detectado uma vez no carregamento — não muda durante a sessão.
// Usado para ajustar hitboxes sem re-renderizar ao redimensionar.
const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

// Largura da hitbox invisível dos arcos em pixels.
// No mobile o dedo é ~10-15px, então 44px cobre bem sem conflitar com nós vizinhos.
const ARC_HITBOX_WIDTH = IS_TOUCH ? 44 : 28;

// Raio mínimo de toque para os nós em pixels (Apple HIG recomenda 44px de área).
// O nó visual permanece pequeno; só a hitbox invisível é maior.
const NODE_HOVER_RADIUS = IS_TOUCH ? 22 : 12; // 0 = desabilitado no desktop

/**
 * Constrói as camadas deck.gl reativas ao estado de animação e seleção.
 * Separado do index para manter o componente principal limpo.
 */
export function useLayers({
  arcData, scatterData, ripples,
  time, hoveredArc, hoveredNodeKey, selection,
  locations, regions, states,
  setHoveredNodeKey,
}) {
  const dispatch     = useAppDispatch();
  const hasSelection = !!selection;

  // ── Segmentos de trilha animada e hitbox de hover/toque ──────────────────
  const { pathData, hoverData } = useMemo(() => {
    const pathSegs  = [];
    const hoverSegs = [];

    arcData.forEach(arc => {
      const ct = (time + arc.phaseOffset) % CYCLE_DURATION;
      const { tTail, tFront } = getSegment(ct);
      if (tFront <= tTail) return;

      const n  = arc.arcPoints.length - 1;
      const i0 = Math.max(0, Math.floor(tTail  * n));
      const i1 = Math.min(n, Math.ceil (tFront * n));

      const isHov   = !IS_TOUCH && hoveredArc?.from === arc.from && hoveredArc?.to === arc.to;
      const isSel   = selection?.type === 'arc' && selection.from === arc.from && selection.to === arc.to;
      const nodeHit = hoveredNodeKey === arc.from || hoveredNodeKey === arc.to ||
                      (selection?.type === 'base' && (selection.key === arc.from || selection.key === arc.to));
      const isActive = isHov || isSel || nodeHit;
      const isDim    = hasSelection && !isActive;
      const color    = isSel ? COLORS.arcSel : isActive ? COLORS.arcHot : isDim ? COLORS.arcDim : COLORS.arc;

      for (let i = i0; i < i1; i++)
        pathSegs.push({ path: [arc.arcPoints[i], arc.arcPoints[i + 1]], color });

      // No desktop: hitbox cobre apenas o segmento animado atual (+ margem de 2 pts).
      // No mobile: hitbox cobre o arco INTEIRO — o usuário não vê onde o traço está
      // no momento do toque, então precisa conseguir clicar em qualquer ponto do arco.
      if (IS_TOUCH) {
        hoverSegs.push({ path: arc.arcPoints, from: arc.from, to: arc.to });
      } else {
        const hoverI0 = Math.max(0, i0 - 2);
        const hoverI1 = Math.min(n, i1 + 2);
        hoverSegs.push({ path: arc.arcPoints.slice(hoverI0, hoverI1 + 1), from: arc.from, to: arc.to });
      }
    });

    return { pathData: pathSegs, hoverData: hoverSegs };
  }, [arcData, time, hoveredArc, hoveredNodeKey, selection, hasSelection]);

  // ── Ripples nos nós de destino ────────────────────────────────────────────
  const rippleData = useMemo(() => {
    const out = [];
    Object.entries(ripples).forEach(([nodeKey, pulses]) => {
      if (!Array.isArray(pulses)) return;
      const coords = resolveCoords(nodeKey, locations, regions, states);
      if (!coords) return;
      pulses.forEach(({ startTime }) => {
        const t = Math.min((time - startTime) / 1800, 1);
        out.push({ position: coords, radius: 6 + t * 22, opacity: Math.max(0, 1 - t) });
      });
    });
    return out;
  }, [ripples, time, locations, regions, states]);

  // ── Montagem das camadas ──────────────────────────────────────────────────
  return useMemo(() => [

    // Hitbox invisível sobre os arcos (hover no desktop, toque no mobile).
    // No mobile cobre o arco inteiro; a largura maior compensa a imprecisão do dedo.
    new PathLayer({
      id: "arc-hover",
      data: hoverData,
      getPath:    d => d.path,
      getWidth:   ARC_HITBOX_WIDTH,
      getColor:   [0, 0, 0, 0],
      widthUnits: "pixels",
      pickable:   true,
      parameters: { depthTest: false },
      onHover: !IS_TOUCH ? ({ object }) =>
        dispatch(setHoveredArc(object ? { from: object.from, to: object.to } : null)) : undefined,
      onClick: ({ object }) => {
        if (object) dispatch(selectArc({ from: object.from, to: object.to }));
      },
      updateTriggers: { getPath: time },
    }),

    // Trilha colorida animada dos arcos
    new PathLayer({
      id: "arc-trail",
      data: pathData,
      getPath:        d => d.path,
      getWidth:       2,
      getColor:       d => d.color,
      widthUnits:     "pixels",
      widthMinPixels: 1,
      capRounded:     true,
      jointRounded:   true,
      pickable:       false,
      parameters:     { depthTest: false },
      updateTriggers: { getColor: [hoveredArc, hoveredNodeKey, selection, time] },
    }),

    // Ondas de chegada nos nós de destino
    new ScatterplotLayer({
      id: "ripple",
      data: rippleData,
      getPosition:        d => d.position,
      getRadius:          d => d.radius,
      getFillColor:       [0, 0, 0, 0],
      getLineColor:       d => [...COLORS.ripple, Math.round(d.opacity * 140)],
      lineWidthMinPixels: 1,
      stroked: true, filled: false, pickable: false,
      radiusUnits:    "pixels",
      updateTriggers: { getRadius: time, getLineColor: time },
    }),

    // Hitbox invisível dos nós — só existe no mobile.
    // Garante área de toque mínima de ~44px sem alterar o visual dos nós.
    new ScatterplotLayer({
  id: "node-touch-hitbox",
  data: scatterData,
  getPosition:  d => d.position,
  getRadius:    NODE_HOVER_RADIUS,
  getFillColor: [0, 0, 0, 0],
  radiusUnits:  "pixels",
  pickable:     true,
  stroked:      false,
  parameters:   { depthTest: false },
  onClick: ({ object }) => { if (object) dispatch(selectBase(object.key)); },
  // Hover no desktop via hitbox (mais fácil de acertar)
  onHover: !IS_TOUCH ? ({ object }) => setHoveredNodeKey(object?.key ?? null) : undefined,
}),

    // Nós visuais (bases, regiões, estados / bacias) — tamanho visual inalterado
    new ScatterplotLayer({
      id: "nodes",
      data: scatterData,
      getPosition: d => d.position,
      getRadius: d => {
        const active = (!IS_TOUCH && hoveredNodeKey === d.key) || (selection?.type === 'base' && selection.key === d.key);
        if (d.kind === 'base')   return active ? 7 : 5;
        if (d.kind === 'region') return active ? 8 : 6;
        return active ? 9 : 7;
      },
      getFillColor: d => {
        const isSel = selection?.type === 'base' && selection.key === d.key;
        const isHov = !IS_TOUCH && hoveredNodeKey === d.key; // Adicionado !IS_TOUCH
        if (d.kind === 'region') return isHov || isSel ? COLORS.nodeRegionHov : COLORS.nodeRegion;
        if (d.kind === 'state')  return isHov || isSel ? COLORS.nodeStateHov  : COLORS.nodeState;
        if (isSel) return COLORS.nodeBaseSel;
        if (isHov) return COLORS.nodeBaseHov;
        return COLORS.nodeBase;
      },
      getLineColor: d => {
        const isSel = selection?.type === 'base' && selection.key === d.key;
        const isHov = !IS_TOUCH && hoveredNodeKey === d.key; // Adicionado !IS_TOUCH
        if (d.kind === 'region') return (isSel || isHov) ? [...COLORS.nodeRegionBorder.slice(0, 3), 255] : COLORS.nodeRegionBorder;
        if (d.kind === 'state')  return (isSel || isHov) ? [...COLORS.nodeStateBorder.slice(0, 3),  255] : COLORS.nodeStateBorder;
        return COLORS.nodeBorder;
      },
      lineWidthMinPixels: d => d.kind === 'base' ? 1.5 : 2.5,
      stroked: true,
      // No mobile o onClick fica na hitbox invisível acima; aqui fica só no desktop
      pickable: !IS_TOUCH,
      radiusUnits: "pixels",
      onHover:  ({ object }) => setHoveredNodeKey(object?.key ?? null),
      onClick:  !IS_TOUCH ? ({ object }) => { if (object) dispatch(selectBase(object.key)); } : undefined,
      updateTriggers: {
        getRadius:    [hoveredNodeKey, selection],
        getFillColor: [hoveredNodeKey, selection],
        getLineColor: [hoveredNodeKey, selection],
      },
      transitions: { getRadius: 100, getFillColor: 100 },
    }),

    // Labels de texto sobre os nós
    new TextLayer({
      id: "labels",
      data: scatterData,
      getPosition:    d => d.position,
      getText:        d => d.name,
      getSize:        d => d.kind === 'base' ? 10 : 12,
      getColor: d => {
        const isSel = selection?.type === 'base' && selection.key === d.key;
        const isHov = !IS_TOUCH && hoveredNodeKey === d.key; // Adicionado !IS_TOUCH
        if (isSel || isHov) return COLORS.labelActive;
        return COLORS.label;
      },
      fontFamily:     "monospace",
      fontWeight:     "normal",
      getPixelOffset: [0, -16],
      billboard:      true,
      characterSet:   'auto',
      updateTriggers: { getColor: [hoveredNodeKey, selection] },
    }),

  ], [pathData, hoverData, rippleData, scatterData, hoveredArc, hoveredNodeKey, selection, dispatch, time]);
}