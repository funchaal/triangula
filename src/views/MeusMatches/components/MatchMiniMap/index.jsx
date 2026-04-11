// ─────────────────────────────────────────────────────────────────────────────
// MatchMiniMap/index.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useRef, useEffect, useState } from 'react';
import Map from "react-map-gl/maplibre";
import { DeckGL } from "@deck.gl/react";
import { MapIcon } from "lucide-react";

import { MAP_STYLE } from '../../../../constants';
import { useAppSelector, selectLocations, selectRoles, selectWorkRegimes, selectUser } from '../../../../store/hooks';

import { greatCirclePoints, calcViewState } from './geometry';
import { buildLayers, DASH_SPEED }          from './layers';
import StepMarker                            from './StepMarker';

function MatchMiniMap({ match }) {
  const locations   = useAppSelector(selectLocations);
  const roles       = useAppSelector(selectRoles);
  const workRegimes = useAppSelector(selectWorkRegimes);
  const currentUser = useAppSelector(selectUser);

  const [progress, setProgress] = useState(0);
  const animRef  = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    setProgress(0);
    startRef.current = null;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      setProgress((elapsed * DASH_SPEED) % 1);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [match?.id]);

  const { arcs, viewState } = useMemo(() => {
    if (!match?.chain?.length) return { arcs: [], viewState: null };

    const chain  = match.chain;
    const coords = chain.map(step => locations[step.base_id]?.coords).filter(Boolean);

    if (coords.length < 2) return { arcs: [], viewState: null };

    const arcs = chain.map((step, i) => {
      const next = chain[(i + 1) % chain.length];
      const src  = locations[step.base_id]?.coords;
      const tgt  = locations[next.base_id]?.coords;
      if (!src || !tgt) return null;
      return {
        id:     `${step.base_id}-${next.base_id}`,
        points: greatCirclePoints(src, tgt, 80),
        src, tgt,
      };
    }).filter(Boolean);

    return { arcs, viewState: calcViewState(coords) };
  }, [match, locations]);

  const layers = useMemo(() => buildLayers(arcs, progress), [arcs, progress]);

  // ── Estados vazios integrados à nova paleta ──────────────────────────────

  if (!match) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#0B1437]">
        <div className="text-center text-[#A3AED0] animate-pulse">
          <MapIcon size={48} className="mx-auto mb-4 opacity-20" />
        </div>
      </div>
    );
  }

  if (!viewState) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#0B1437]">
        <p className="text-sm text-[#A3AED0]/50 font-medium">Coordenadas não disponíveis.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#0B1437]">
      <DeckGL
        key={match.id}
        initialViewState={viewState}
        controller
        layers={layers}
        style={{ position: "absolute", inset: 0 }}
        getCursor={({ isDragging }) => isDragging ? 'grabbing' : 'grab'}
      >
        <Map mapStyle={MAP_STYLE}>
          {match.chain.map((step, i) => {
            const loc      = locations[step.base_id];
            if (!loc) return null;

            const nextStep = match.chain[(i + 1) % match.chain.length];
            const nextLoc  = locations[nextStep?.base_id];
            const isCurrentUser = currentUser?.username === step.username;

            return (
              <StepMarker
                key={step.base_id}
                step={step}
                loc={loc}
                nextLoc={nextLoc}
                nextStep={nextStep}
                isCurrentUser={isCurrentUser}
                roles={roles}
                workRegimes={workRegimes}
              />
            );
          })}
        </Map>
      </DeckGL>
    </div>
  );
}

export default MatchMiniMap;