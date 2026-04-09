import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MapGL from "react-map-gl/maplibre";
import { DeckGL } from "@deck.gl/react";
import { ScatterplotLayer, TextLayer, PathLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, Plus } from "lucide-react";

import { MAP_STYLE } from '../../constants';
import {
  useAppSelector, useAppDispatch,
  selectMapData, selectLocations, selectRegions, selectStates,
  selectMapSelection, selectHoveredArc,
  selectRoles, selectWorkRegimes,
} from '../../store/hooks';
import { selectArc, selectBase, clearSelection, setHoveredArc } from '../../store/slices/globalSlice';

import {
  COLORS, INITIAL_VIEW, GROW_DURATION, HOLD_DURATION, CYCLE_DURATION, ACTIVE_DURATION, STAGGER_DELAY
} from './constants';
import { buildArcPoints, getSegment } from './geometry';
import { resolveCoords, resolveLabel, nodeType } from './helpers';
import MapSidebar from './MapSidebar';

function MapaGlobal() {
  const navigate = useNavigate();
  const dispatch    = useAppDispatch();
  const mapData     = useAppSelector(selectMapData);
  const locations   = useAppSelector(selectLocations);
  const regions     = useAppSelector(selectRegions);
  const states      = useAppSelector(selectStates);
  const selection   = useAppSelector(selectMapSelection);
  const hoveredArc  = useAppSelector(selectHoveredArc);
  const roles       = useAppSelector(selectRoles);
  const workRegimes = useAppSelector(selectWorkRegimes);

  const [hoveredNodeKey, setHoveredNodeKey] = useState(null);
  const [time,    setTime]    = useState(0);
  const [ripples, setRipples] = useState({});

  const animRef       = useRef(null);
  const startRef      = useRef(null);
  const rippleIdRef   = useRef(0);
  const wasHoldingRef = useRef({});

  // ── arcData ───────────────────────────────────────────────────────────────
    const arcData = useMemo(() => {
    const pairPhases = {};
    let pairCount = 0;

    // Mapeia apenas as rotas únicas para distribuir o tempo
    mapData.forEach((a) => {
      const pairKey = [a.from, a.to].sort().join('|');
      if (!(pairKey in pairPhases)) {
        pairPhases[pairKey] = pairCount++;
      }
    });

    // Constante para espalhar as animações de forma não repetitiva (Golden Ratio)
    const goldenRatio = 0.61803398875;

    return mapData.map((a) => {
      const src = resolveCoords(a.from, locations, regions, states);
      const tgt = resolveCoords(a.to,   locations, regions, states);
      if (!src || !tgt) return null;
      
      const pairKey = [a.from, a.to].sort().join('|');
      const hasRev  = mapData.some(b => b.from === a.to && b.to === a.from);
      
      // Calcula uma fração de tempo completamente dessincronizada para cada rota
      const fraction = (pairPhases[pairKey] * goldenRatio) % 1;
      const basePhase = fraction * CYCLE_DURATION;
      
      // Mantém a trava estrita: se há retorno, espera a DURAÇÃO ATIVA do primeiro
      const reverseOffset = (hasRev && a.from > a.to ? ACTIVE_DURATION : 0);
      
      // Define o ciclo: espera o retorno se existir, ou reinicia com 1000ms de folga se for via única
      const localCycle = hasRev ? CYCLE_DURATION : ACTIVE_DURATION + 1000;
      
      const phase = basePhase + reverseOffset;
      
      return { 
        ...a, 
        phaseOffset: phase, 
        localCycle, 
        arcPoints: buildArcPoints(src, tgt, 0.2) 
      };
    }).filter(Boolean);
  }, [mapData, locations, regions, states]);

  const scatterData = useMemo(() => {
    const keys = new Set(Object.keys(locations).map(id => `base:${id}`));
    mapData.forEach(a => { keys.add(a.from); keys.add(a.to); });
    return [...keys].map(key => {
      const coords = resolveCoords(key, locations, regions, states);
      if (!coords) return null;
      return { key, name: resolveLabel(key, locations, regions, states), position: coords, kind: nodeType(key) };
    }).filter(Boolean);
  }, [mapData, locations, regions, states]);

  // ── Animação ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      setTime(elapsed);

      const newRipples = {};
      arcData.forEach(arc => {
        const ct  = (elapsed + arc.phaseOffset) % CYCLE_DURATION;
        const key = `${arc.from}-${arc.to}`;
        const isHolding = ct >= GROW_DURATION && ct < GROW_DURATION + HOLD_DURATION;
        if (isHolding && !wasHoldingRef.current[key]) {
          if (!newRipples[arc.to]) newRipples[arc.to] = [];
          newRipples[arc.to].push({ id: rippleIdRef.current++, startTime: elapsed });
        }
        wasHoldingRef.current[key] = isHolding;
      });

      if (Object.keys(newRipples).length > 0)
        setRipples(prev => {
          const next = { ...prev };
          Object.entries(newRipples).forEach(([k, p]) => { next[k] = [...(prev[k] || []), ...p]; });
          return next;
        });

      setRipples(prev => {
        let changed = false;
        const next = {};
        Object.entries(prev).forEach(([k, pulses]) => {
          const f = pulses.filter(r => elapsed - r.startTime < 2200);
          if (f.length !== pulses.length) changed = true;
          if (f.length > 0) next[k] = f;
        });
        return changed ? next : prev;
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [arcData]);

  const hasSelection = !!selection;

  // ── pathData + hoverData ──────────────────────────────────────────────────
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

      const isHov    = hoveredArc?.from === arc.from && hoveredArc?.to === arc.to;
      const isSel    = selection?.type === 'arc' && selection.from === arc.from && selection.to === arc.to;
      const nodeHit  = hoveredNodeKey === arc.from || hoveredNodeKey === arc.to ||
                       (selection?.type === 'base' && (selection.key === arc.from || selection.key === arc.to));
      const isActive = isHov || isSel || nodeHit;
      const isDim    = hasSelection && !isActive;
      const color    = isSel ? COLORS.arcSel : isActive ? COLORS.arcHot : isDim ? COLORS.arcDim : COLORS.arc;

      for (let i = i0; i < i1; i++)
        pathSegs.push({ path: [arc.arcPoints[i], arc.arcPoints[i + 1]], color });

      const hoverI0 = Math.max(0,  i0 - 2);
      const hoverI1 = Math.min(n,  i1 + 2);
      hoverSegs.push({
        path:  arc.arcPoints.slice(hoverI0, hoverI1 + 1),
        from:  arc.from,
        to:    arc.to,
      });
    });

    return { pathData: pathSegs, hoverData: hoverSegs };
  }, [arcData, time, hoveredArc, hoveredNodeKey, selection, hasSelection]);

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

  // ── Layers ────────────────────────────────────────────────────────────────
  const layers = useMemo(() => [
    new PathLayer({
      id: "arc-hover",
      data: hoverData,
      getPath:    d => d.path,
      getWidth:   18,
      getColor:   [0, 0, 0, 0],
      widthUnits: "pixels",
      pickable:   true,
      parameters: { depthTest: false },
      onHover: ({ object }) =>
        dispatch(setHoveredArc(object ? { from: object.from, to: object.to } : null)),
      onClick: ({ object }) => {
        if (object) dispatch(selectArc({ from: object.from, to: object.to }));
      },
      updateTriggers: { getPath: time },
    }),

    new PathLayer({
      id: "arc-trail",
      data: pathData,
      getPath:    d => d.path,
      getWidth:   2,
      getColor:   d => d.color,
      widthUnits: "pixels",
      widthMinPixels: 1,
      capRounded: true,
      jointRounded: true,
      pickable:   false,
      parameters: { depthTest: false },
      updateTriggers: { getColor: [hoveredArc, hoveredNodeKey, selection, time] },
    }),

    new ScatterplotLayer({
      id: "ripple",
      data: rippleData,
      getPosition:  d => d.position,
      getRadius:    d => d.radius,
      getFillColor: [0, 0, 0, 0],
      getLineColor: d => [...COLORS.ripple, Math.round(d.opacity * 140)],
      lineWidthMinPixels: 1,
      stroked: true, filled: false, pickable: false,
      radiusUnits: "pixels",
      updateTriggers: { getRadius: time, getLineColor: time },
    }),

    new ScatterplotLayer({
      id: "nodes",
      data: scatterData,
      getPosition: d => d.position,
      getRadius: d => {
        const active = hoveredNodeKey === d.key || (selection?.type === 'base' && selection.key === d.key);
        if (d.kind === 'base')   return active ? 7 : 5;
        if (d.kind === 'region') return active ? 8 : 6;
        return active ? 9 : 7;
      },
      getFillColor: d => {
        const isSel = selection?.type === 'base' && selection.key === d.key;
        const isHov = hoveredNodeKey === d.key;
        if (d.kind === 'region') return isHov || isSel ? COLORS.nodeRegionHov : COLORS.nodeRegion;
        if (d.kind === 'state')  return isHov || isSel ? COLORS.nodeStateHov  : COLORS.nodeState;
        if (isSel) return COLORS.nodeBaseSel;
        if (isHov) return COLORS.nodeBaseHov;
        return COLORS.nodeBase;
      },
      getLineColor: d => {
        const isSel = selection?.type === 'base' && selection.key === d.key;
        const isHov = hoveredNodeKey === d.key;
        if (d.kind === 'region') return (isSel || isHov) ? [...COLORS.nodeRegionBorder.slice(0,3), 255] : COLORS.nodeRegionBorder;
        if (d.kind === 'state')  return (isSel || isHov) ? [...COLORS.nodeStateBorder.slice(0,3),  255] : COLORS.nodeStateBorder;
        return COLORS.nodeBorder;
      },
      lineWidthMinPixels: d => d.kind === 'base' ? 1.5 : 2.5,
      stroked: true, pickable: true,
      radiusUnits: "pixels",
      onHover:  ({ object }) => setHoveredNodeKey(object?.key ?? null),
      onClick:  ({ object }) => { if (object) dispatch(selectBase(object.key)); },
      updateTriggers: {
        getRadius:    [hoveredNodeKey, selection],
        getFillColor: [hoveredNodeKey, selection],
        getLineColor: [hoveredNodeKey, selection],
      },
      transitions: { getRadius: 100, getFillColor: 100 },
    }),

    new TextLayer({
      id: "labels",
      data: scatterData,
      getPosition:    d => d.position,
      getText:        d => d.name,
      getSize:        d => d.kind === 'base' ? 12 : 10,
      getColor: d => {
        const isSel = selection?.type === 'base' && selection.key === d.key;
        if (isSel || hoveredNodeKey === d.key) return COLORS.labelActive;
        return COLORS.label;
      },
      fontFamily:     "monospace",
      fontWeight:     "bold",
      getPixelOffset: [0, -16],
      billboard:      true,
      characterSet: 'auto', 
      updateTriggers: { getColor: [hoveredNodeKey, selection] },
    }),

  ], [pathData, hoverData, rippleData, scatterData, hoveredArc, hoveredNodeKey, selection, dispatch, time]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <DeckGL
        initialViewState={INITIAL_VIEW}
        controller
        layers={layers}
        style={{ position: "absolute", inset: 0 }}
        getCursor={({ isHovering }) => isHovering ? "pointer" : "grab"}
        onClick={({ object }) => { if (!object) dispatch(clearSelection()); }}
      >
        <div style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,40,80,0.15)', pointerEvents:'none', zIndex:1 }} />
        <MapGL mapStyle={MAP_STYLE} />
      </DeckGL>

      {/* Header Atualizado */}
      <div className="absolute top-0 left-0 right-0 z-10 pl-16 pr-4 lg:pl-6 pt-4 pb-10 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none flex items-start justify-between">
        
        {/* Bloco de Título */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm">
            <Layers size={18} className="text-blue-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-bold text-white drop-shadow-md">Mapa de Interesses</h1>
            <span className="text-[10px] md:text-xs text-blue-300/70 font-medium tracking-wider uppercase drop-shadow-md">Sistema Triangula</span>
          </div>
        </div>

        {/* Botão Novo Interesse - Desktop */}
        <button
          type="button"
          onClick={() => navigate('/interests')}
          className="pointer-events-auto hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full shadow-[0_4px_15px_rgba(37,99,235,0.4)] transition-all active:scale-95 font-medium text-sm"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Cadastrar novo interesse</span>
        </button>

      </div>

      {/* Botão Novo Interesse - Mobile */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 md:hidden pointer-events-auto w-max">
        <button
          type="button"
          onClick={() => navigate('/interests')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full shadow-[0_4px_15px_rgba(37,99,235,0.4)] border border-blue-400/50 transition-all active:scale-95 font-medium text-sm"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Cadastrar novo interesse</span>
        </button>
      </div>

      <MapSidebar
        selection={selection}
        mapData={mapData}
        locations={locations}
        regions={regions}
        states={states}
        roles={roles}
        workRegimes={workRegimes}
        onClose={() => dispatch(clearSelection())}
      />
    </div>
  );
}

export default MapaGlobal;