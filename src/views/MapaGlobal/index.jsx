// ─────────────────────────────────────────────────────────────────────────────
// index.jsx — View principal: Mapa Global
// Orquestra dados, animação e composição das camadas deck.gl + UI sobreposta.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MapGL from "react-map-gl/maplibre";
import { DeckGL } from "@deck.gl/react";
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

import { INITIAL_VIEW } from './constants';
import { resolveCoords, resolveLabel, nodeType } from './helpers';

// Hooks exclusivos desta view
import { useArcData }   from './hooks/useArcData';
import { useAnimation } from './hooks/useAnimation';
import { useLayers }    from './hooks/useLayers';

// Componentes exclusivos desta view
import MapSidebar from './components/MapSidebar';

function MapaGlobal() {
  const navigate    = useNavigate();
  const dispatch    = useAppDispatch();

  // ── Dados da store ────────────────────────────────────────────────────────
  const mapData     = useAppSelector(selectMapData);
  const locations   = useAppSelector(selectLocations);
  const regions     = useAppSelector(selectRegions);
  const states      = useAppSelector(selectStates);
  const selection   = useAppSelector(selectMapSelection);
  const hoveredArc  = useAppSelector(selectHoveredArc);
  const roles       = useAppSelector(selectRoles);
  const workRegimes = useAppSelector(selectWorkRegimes);

  // Estado local de hover sobre nós (não precisa ir para a store)
  const [hoveredNodeKey, setHoveredNodeKey] = useState(null);

  // ── Dados derivados e animação ────────────────────────────────────────────
  const arcData = useArcData(mapData, locations, regions, states);
  const { time, ripples } = useAnimation(arcData);

  // Nós únicos visíveis no mapa (bases + origens/destinos dos arcos)
  const scatterData = useMemo(() => {
    const keys = new Set(Object.keys(locations).map(id => `base:${id}`));
    mapData.forEach(a => { keys.add(a.from); keys.add(a.to); });
    return [...keys].map(key => {
      const coords = resolveCoords(key, locations, regions, states);
      if (!coords) return null;
      return {
        key,
        name:     resolveLabel(key, locations, regions, states),
        position: coords,
        kind:     nodeType(key),
      };
    }).filter(Boolean);
  }, [mapData, locations, regions, states]);

  // ── Camadas deck.gl ───────────────────────────────────────────────────────
  const layers = useLayers({
    arcData, scatterData, ripples,
    time, hoveredArc, hoveredNodeKey, selection,
    locations, regions, states,
    // Repassa setHoveredNodeKey para o hook poder atualizar estado local via onHover
    setHoveredNodeKey,
  });

  // ── Renderização ──────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0B1437]">
      <DeckGL
        initialViewState={INITIAL_VIEW}
        controller
        layers={layers}
        style={{ position: "absolute", inset: 0 }}
        getCursor={({ isHovering }) => isHovering ? "pointer" : "grab"}
        onClick={({ object }) => { if (!object) dispatch(clearSelection()); }}
      >
        <MapGL mapStyle={MAP_STYLE} />
      </DeckGL>

      {/* ── Header: título + botão desktop ───────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-10 pl-4 pr-4 lg:pl-5 pt-5 pb-12 pointer-events-none flex items-start justify-between">

            <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
      {/* Container do Ícone: Menor no mobile (w-10) e padrão no desktop (md:w-12) */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
        <Layers size={18} className="text-white md:hidden" /> {/* Ícone menor mobile */}
        <Layers size={22} className="text-white hidden md:block" /> {/* Ícone padrão desktop */}
      </div>

      <div className="flex flex-col">
        {/* Título: text-sm no mobile */}
        <h1 className="text-sm md:text-xl font-bold text-white tracking-wide drop-shadow-md leading-tight">
          Mapa Global
        </h1>
        {/* Subtítulo: text-[9px] no mobile */}
        <span className="text-[9px] md:text-xs text-[#A3AED0] font-bold tracking-widest uppercase">
          Visão de Interesses
        </span>
      </div>
    </div>


        {/* Botão Novo Interesse — visível apenas no desktop */}
        <button
          type="button"
          onClick={() => navigate('/interests')}
          className="pointer-events-auto hidden md:flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-5 py-3 mt-1 mr-2 rounded-xl transition-all font-semibold text-sm border-none"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Cadastrar interesse</span>
        </button>
      </div>

      {/* ── Botão Novo Interesse — mobile (fixado acima da nav) ──────── */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 md:hidden pointer-events-auto w-max">
        <button
          type="button"
          onClick={() => navigate('/interests')}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-6 py-3.5 rounded-2xl shadow-[0_4px_15px_rgba(59,130,246,0.25)] transition-all active:scale-95 font-semibold text-sm border-none"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Cadastrar interesse</span>
        </button>
      </div>

      {/* ── Sidebar lateral de detalhes ───────────────────────────────── */}
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