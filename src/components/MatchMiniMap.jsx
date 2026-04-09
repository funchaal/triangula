import { useMemo, useRef, useEffect, useState } from 'react';
import Map, { Marker } from "react-map-gl/maplibre";
import { DeckGL } from "@deck.gl/react";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import { MapIcon, ArrowRight, Phone, Mail, User } from "lucide-react";
import { MAP_STYLE } from '../constants';
import { useAppSelector, selectLocations, selectRoles, selectWorkRegimes, selectUser } from '../store/hooks';

// ─── Geometria ────────────────────────────────────────────────────────────────
function toRad(d) { return d * Math.PI / 180; }

function greatCirclePoints(src, tgt, steps = 80) {
  const lat1 = toRad(src[1]), lon1 = toRad(src[0]);
  const lat2 = toRad(tgt[1]), lon2 = toRad(tgt[0]);
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
  ));

  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (d < 0.0001) {
      pts.push([src[0] + (tgt[0] - src[0]) * t, src[1] + (tgt[1] - src[1]) * t, 0]);
      continue;
    }
    const A = Math.sin((1 - t) * d) / Math.sin(d);
    const B = Math.sin(t * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);
    const alt = Math.sin(t * Math.PI) * (d * 180 / Math.PI) * 40000;
    pts.push([lon * 180 / Math.PI, lat * 180 / Math.PI, alt]);
  }
  return pts;
}

// ─── Animação de traço ────────────────────────────────────────────────────────
const DASH_SPEED = 0.0006; 

// ─── Componente principal ─────────────────────────────────────────────────────
function MatchMiniMap({ match }) {
  const locations = useAppSelector(selectLocations);
  const roles = useAppSelector(selectRoles);
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

  const { arcs, nodes, viewState } = useMemo(() => {
    if (!match?.chain?.length) return { arcs: [], nodes: [], viewState: null };

    const chain = match.chain;
    const coords = chain.map(step => locations[step.base_id]?.coords).filter(Boolean);

    if (coords.length < 2) return { arcs: [], nodes: [], viewState: null };

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

    const lngs = coords.map(c => c[0]);
    const lats  = coords.map(c => c[1]);
    const span  = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
    
    // Ajuste de zoom para dar mais respiro aos cards grandes
    const vs = {
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitude:  (Math.min(...lats) + Math.max(...lats)) / 2,
      zoom:  span < 1 ? 7.5 : span < 4 ? 5.5 : span < 8 ? 4.5 : 3.5,
      pitch: 45, // Inclinado um pouco mais para a sensação 3D
      bearing: 0,
    };

    return { arcs, nodes: chain, viewState: vs };
  }, [match, locations]);

  // ── Layers ────────────────────────────────────────────────────────────────
  const layers = useMemo(() => {
    if (!arcs.length) return [];

    const trailData = arcs.map(arc => ({ path: arc.points, id: arc.id }));

    const dashData = arcs.map((arc, i) => {
      const offset = i / arcs.length;
      const p = (progress + offset) % 1;
      const dashLen = 0.25;
      const mappedP = p * (1 + dashLen); 
      const tail  = Math.max(0, mappedP - dashLen);
      const front = Math.min(1, mappedP);
      const n     = arc.points.length - 1;
      const i0    = Math.floor(tail  * n);
      const i1    = Math.ceil(front * n);
      
      return {
        path:  arc.points.slice(i0, i1 + 1),
        color: [59, 130, 246, 255],
      };
    });

    const arrowData = arcs.flatMap(arc => {
      const arrows = [];
      for (const t of [0.35, 0.65]) {
        const idx = Math.floor(t * (arc.points.length - 2));
        const p1 = arc.points[idx];
        const p2 = arc.points[idx + 1];
        if (!p1 || !p2) continue;
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        const scale = 0.12;
        const ux = dx / len, uy = dy / len;
        const px = -uy, py = ux;
        const tip = p2;
        const left  = [p2[0] - ux * scale + px * scale * 0.5, p2[1] - uy * scale + py * scale * 0.5, p2[2]];
        const right = [p2[0] - ux * scale - px * scale * 0.5, p2[1] - uy * scale - py * scale * 0.5, p2[2]];
        arrows.push({ path: [left, tip, right] });
      }
      return arrows;
    });

    return [
      new PathLayer({
        id: "trail-bg",
        data: trailData,
        getPath:  d => d.path,
        getWidth: 3,
        getColor: [59, 130, 246, 30],
        widthUnits: "pixels",
        capRounded: true,
        jointRounded: true,
        pickable: false,
        parameters: { depthTest: false },
      }),
      new PathLayer({
        id: "trail-dash",
        data: dashData,
        getPath:  d => d.path,
        getWidth: 4,
        getColor: d => d.color,
        widthUnits: "pixels",
        capRounded: true,
        jointRounded: true,
        pickable: false,
        parameters: { depthTest: false },
        updateTriggers: { getPath: progress, getColor: progress },
      }),
      new PathLayer({
        id: "arrows",
        data: arrowData,
        getPath:  d => d.path,
        getWidth: 2,
        getColor: [59, 130, 246, 200],
        widthUnits: "pixels",
        capRounded: false,
        jointRounded: false,
        pickable: false,
        parameters: { depthTest: false },
      }),
      new ScatterplotLayer({
        id: "trail-head",
        data: arcs.map((arc, i) => {
          const offset = i / arcs.length;
          const p = (progress + offset) % 1;
          const mappedP = p * (1 + 0.25);
          const front = Math.min(1, mappedP);
          const idx = Math.min(Math.floor(front * (arc.points.length - 1)), arc.points.length - 1);
          return { position: arc.points[idx] };
        }),
        getPosition:  d => d.position,
        getRadius:    6000,
        getFillColor: [147, 197, 253, 255],
        getLineColor: [59, 130, 246, 150],
        lineWidthMinPixels: 2,
        stroked: true,
        radiusUnits: "meters",
        pickable: false,
        parameters: { depthTest: false },
        updateTriggers: { getPosition: progress },
      }),
    ];
  }, [arcs, progress]);

  if (!match) return (
    <div className="flex items-center justify-center w-full h-full bg-slate-950">
      <div className="text-center text-slate-600 animate-pulse">
        <MapIcon size={48} className="mx-auto mb-4 opacity-20" />
      </div>
    </div>
  );

  if (!viewState) return (
    <div className="flex items-center justify-center w-full h-full bg-slate-950">
      <p className="text-sm text-slate-600">Coordenadas não disponíveis.</p>
    </div>
  );

  return (
    <div className="relative w-full h-full bg-slate-950">
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
            const loc = locations[step.base_id];
            if (!loc) return null;
            const nextStep = match.chain[(i + 1) % match.chain.length];
            const nextLoc  = locations[nextStep?.base_id];

            // Verifica se o card atual é o do usuário logado
            const isCurrentUser = currentUser?.username === step.username;

            return (
              <Marker key={step.base_id} longitude={loc.coords[0]} latitude={loc.coords[1]} anchor="bottom" offset={[0, -8]} style={{ zIndex: isCurrentUser ? 50 : 10 }}>
                <div className="flex flex-col items-center cursor-default group">
                  <div className={`
                    backdrop-blur-xl border rounded-2xl p-4 shadow-2xl shadow-black/80 w-64 text-left flex flex-col gap-3 transition-all duration-300
                    ${isCurrentUser 
                      ? 'bg-blue-950/80 border-blue-500/50 ring-2 ring-blue-500/20' 
                      : 'bg-slate-900/80 border-slate-700/60 hover:bg-slate-900/95 hover:border-slate-600'
                    }
                  `}>
                    
                    {/* Header: Avatar + Name */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border shadow-inner ${
                        isCurrentUser 
                          ? 'bg-blue-500 text-white border-blue-400' 
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {isCurrentUser ? <User size={18} /> : (step.name || step.username)?.slice(0, 2).toUpperCase() ?? '?'}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <p className={`text-sm font-bold truncate ${isCurrentUser ? 'text-white' : 'text-slate-200'}`} title={isCurrentUser ? 'Você' : (step.name || step.username)}>
                          {isCurrentUser ? 'Você' : (step.name || step.username)}
                        </p>
                        {!isCurrentUser && step.name && (
                          <p className="text-[11px] font-medium text-slate-500 truncate" title={`@${step.username}`}>@{step.username}</p>
                        )}
                      </div>
                    </div>

                    {/* Rota */}
                    <div className={`flex items-center justify-center gap-1.5 text-[10px] font-semibold rounded-lg px-2.5 py-2 border ${
                      isCurrentUser ? 'bg-blue-900/30 border-blue-500/30' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <span className="text-slate-300 truncate max-w-[80px]" title={loc.name}>{loc.name}</span>
                      <ArrowRight size={10} className={isCurrentUser ? "text-blue-400 shrink-0 mx-0.5" : "text-slate-500 shrink-0 mx-0.5"} />
                      <span className="text-slate-300 truncate max-w-[80px]" title={nextLoc?.name ?? nextStep?.base_id}>{nextLoc?.name ?? nextStep?.base_id}</span>
                    </div>

                    {/* Renderiza informações adicionais apenas se NÃO for o usuário logado */}
                    {!isCurrentUser && (
                      <div className="space-y-3">
                        {/* Info: Role, Regime, User Key */}
                        {(step.role_id || step.regime_id || step.user_key) && (
                          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]">
                            {step.user_key && (
                              <div className="flex flex-col overflow-hidden col-span-2">
                                <span className="text-slate-500 text-[9px] uppercase tracking-wider font-bold mb-0.5">Chave</span>
                                <span className="text-slate-300 truncate font-mono bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 inline-block w-fit" title={step.user_key}>{step.user_key}</span>
                              </div>
                            )}
                            {step.role_id && (
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-slate-500 text-[9px] uppercase tracking-wider font-bold mb-0.5">Cargo</span>
                                <span className="text-slate-300 truncate" title={roles[step.role_id]?.name || step.role_id}>
                                  {roles[step.role_id]?.name || step.role_id}
                                </span>
                              </div>
                            )}
                            {step.regime_id && (
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-slate-500 text-[9px] uppercase tracking-wider font-bold mb-0.5">Regime</span>
                                <span className="text-slate-300 truncate" title={workRegimes[step.regime_id] || step.regime_id}>{workRegimes[step.regime_id] || step.regime_id}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Contatos */}
                        {(step.phone || step.email) && (
                          <div className="pt-2.5 border-t border-slate-700/60 space-y-1.5">
                            {step.phone && (
                              <div className="flex items-center gap-2 text-xs text-slate-300">
                                <div className="p-1 bg-blue-500/10 rounded text-blue-400"><Phone size={12} /></div>
                                <span className="font-mono truncate" title={step.phone}>{step.phone}</span>
                              </div>
                            )}
                            {step.email && (
                              <div className="flex items-center gap-2 text-xs text-slate-300">
                                <div className="p-1 bg-blue-500/10 rounded text-blue-400"><Mail size={12} /></div>
                                <span className="truncate" title={step.email}>{step.email}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Observações */}
                        {step.observations && (
                          <div className="pt-2.5 border-t border-slate-700/60">
                            <span className="text-slate-500 text-[9px] uppercase tracking-wider font-bold block mb-1">Observações</span>
                            <p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-2" title={step.observations}>
                              "{step.observations}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Pin Base (Triangle) */}
                  <div className={`w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent transition-colors duration-300 ${
                    isCurrentUser ? 'border-t-blue-500/50' : 'border-t-slate-700/60 group-hover:border-t-slate-600'
                  }`} />
                  
                  {/* Anchor Dot */}
                  <div className={`w-2.5 h-2.5 rounded-full mt-0.5 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                    isCurrentUser ? 'bg-blue-400 ring-2 ring-blue-500/40' : 'bg-slate-400 ring-1 ring-slate-600'
                  }`} />
                </div>
              </Marker>
            );
          })}
        </Map>
      </DeckGL>
    </div>
  );
}

export default MatchMiniMap;