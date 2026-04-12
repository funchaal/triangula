// ─────────────────────────────────────────────────────────────────────────────
// StepMarker.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { Marker } from "react-map-gl/maplibre";
import { ArrowRight, Phone, Mail, User } from "lucide-react";

function StepMarker({ step, loc, nextLoc, nextStep, isCurrentUser, roles, workRegimes, zoom }) {
  
  const scale = Math.max(0.4, Math.min(1, (zoom || 6) / 6));

  return (
    <Marker
      longitude={loc.coords[0]}
      latitude={loc.coords[1]}
      anchor="bottom"
      offset={[0, -8]}
      // "Você" fica no fundo (10), outros usuários ficam na frente (50)
      style={{ zIndex: isCurrentUser ? 10 : 50 }}
    >
      <div 
        className="flex flex-col items-center cursor-default group"
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'bottom center',
          transition: 'transform 0.1s ease-out'
        }}
      >

        {/* ── Card principal ────────────────────────────────────────── */}
        <div className={`
          backdrop-blur-xl border rounded-3xl p-5 shadow-2xl shadow-black/50 w-64 text-left flex flex-col gap-4 transition-all duration-300
          ${isCurrentUser
            ? 'bg-[#111C44]/95 border-blue-500 ring-1 ring-blue-500/50 shadow-[0_10px_30px_rgba(59,130,246,0.2)]'
            : 'bg-slate-900/80 border-slate-700/60 hover:bg-slate-900/95 hover:border-slate-600'
          }
        `}>

          {/* Avatar + nome */}
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-inner ${
              isCurrentUser
                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {isCurrentUser
                ? <User size={20} />
                : (step.name || step.username)?.slice(0, 2).toUpperCase() ?? '?'
              }
            </div>
            <div className="flex flex-col overflow-hidden">
              <p
                className={`text-[15px] font-bold truncate text-white`}
                title={isCurrentUser ? 'Você' : (step.name || step.username)}
              >
                {isCurrentUser ? 'Você' : (step.name || step.username)}
              </p>
              {!isCurrentUser && step.name && (
                <p className="text-[11px] font-medium text-slate-400 truncate mt-0" title={`@${step.username}`}>
                  @{step.username}
                </p>
              )}
            </div>
          </div>

          {/* Rota: origem → destino */}
          <div className={`flex items-center justify-between gap-2 text-[11px] font-bold rounded-xl px-3 py-2 border ${
            isCurrentUser ? 'bg-blue-500/20 border-none text-blue-100' : 'bg-slate-950/60 border-slate-800 text-slate-200'
          }`}>
            {/* Texto quebra em linhas em vez de cortar */}
            <span className="flex-1 text-center break-words leading-tight" title={loc.name}>
              {loc.name}
            </span>
            <ArrowRight size={12} className={`shrink-0 mx-1 ${isCurrentUser ? 'text-blue-400' : 'text-slate-500'}`} />
            <span className="flex-1 text-center break-words leading-tight" title={nextLoc?.name ?? nextStep?.base_id}>
              {nextLoc?.name ?? nextStep?.base_id}
            </span>
          </div>

          {/* Informações extras — exibidas apenas para outros usuários */}
          {!isCurrentUser && (
            <div className="space-y-4">

              {/* Cargo, regime e chave */}
              {(step.role_id || step.regime_id || step.user_key) && (
                <div className="grid grid-cols-2 gap-x-3 gap-y-3 text-[11px]">
                  {step.user_key && (
                    <div className="flex flex-col overflow-hidden col-span-2">
                      <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Chave</span>
                      <span className="text-slate-200 truncate font-mono bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/50 inline-block w-fit">
                        {step.user_key}
                      </span>
                    </div>
                  )}
                  {step.role_id && (
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Cargo</span>
                      <span className="text-slate-200 truncate font-medium" title={roles[step.role_id]?.name || step.role_id}>
                        {roles[step.role_id]?.name || step.role_id}
                      </span>
                    </div>
                  )}
                  {step.regime_id && (
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Regime</span>
                      <span className="text-slate-200 truncate font-medium" title={workRegimes[step.regime_id] || step.regime_id}>
                        {workRegimes[step.regime_id] || step.regime_id}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Contatos */}
              {(step.phone || step.email) && (
                <div className="pt-3 border-t border-slate-700/50 space-y-2">
                  {step.phone && (
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400"><Phone size={14} /></div>
                      <span className="font-mono truncate" title={step.phone}>{step.phone}</span>
                    </div>
                  )}
                  {step.email && (
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400"><Mail size={14} /></div>
                      <span className="truncate" title={step.email}>{step.email}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Observações */}
              {step.observations && (
                <div className="pt-3 border-t border-slate-700/50">
                  <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1.5">Observações</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50" title={step.observations}>
                    "{step.observations}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pin triangular apontando para a base */}
        <div className={`w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent transition-colors duration-300 ${
          isCurrentUser ? 'border-t-blue-500' : 'border-t-slate-900/80 group-hover:border-t-slate-900/95'
        }`} />

        {/* Ponto de ancoragem no chão */}
        <div className={`w-3 h-3 rounded-full mt-1 shadow-[0_0_15px_rgba(0,0,0,0.8)] ${
          isCurrentUser ? 'bg-blue-400 ring-2 ring-blue-500/50' : 'bg-slate-400 ring-2 ring-slate-600/50'
        }`} />
      </div>
    </Marker>
  );
}

export default StepMarker;