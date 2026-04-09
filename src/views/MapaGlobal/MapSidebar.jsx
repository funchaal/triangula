import { X, ArrowRight, MapPin, Users, TrendingUp, Layers, FileText, Loader2 } from "lucide-react";
import { useGetArcUsersQuery, useGetBaseUsersQuery } from '../../services/api';
import { resolveLabel, nodeType } from './helpers';

export default function MapSidebar({ selection, mapData, locations, regions, states, roles, workRegimes, onClose }) {
  if (!selection) return null;
  const isArc  = selection.type === 'arc';
  const isBase = selection.type === 'base';
  const fromLabel = isArc  ? resolveLabel(selection.from, locations, regions, states) : null;
  const toLabel   = isArc  ? resolveLabel(selection.to,   locations, regions, states) : null;
  const nodeLabel = isBase ? resolveLabel(selection.key,  locations, regions, states) : null;
  const nType     = isBase ? nodeType(selection.key) : null;
  const arcInfo     = isArc  ? mapData.find(a => a.from === selection.from && a.to === selection.to) : null;
  const baseArcsOut = isBase ? mapData.filter(a => a.from === selection.key) : [];
  const baseArcsIn  = isBase ? mapData.filter(a => a.to   === selection.key) : [];
  const { data: arcUsers,  isFetching: isArcFetching  } = useGetArcUsersQuery({ from: selection.from, to: selection.to }, { skip: !isArc });
  const { data: baseUsers, isFetching: isBaseFetching } = useGetBaseUsersQuery({ key: selection.key }, { skip: !isBase });
  const isFetching = isArc ? isArcFetching : isBaseFetching;
  const users = isArc ? (arcUsers?.users ?? []) : (baseUsers?.users ?? []);
  const lbl = (dict, id) => id && id !== '0' ? (dict?.[String(id)] ?? null) : null;
  const typeLabel = nType === 'region' ? 'Região' : nType === 'state' ? 'Estado' : 'Base';
  const typeColor = nType === 'region' ? 'text-amber-400' : nType === 'state' ? 'text-sky-400' : 'text-purple-400';

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 flex flex-col z-20 shadow-2xl">
      <div className="px-5 pt-5 pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {isBase && (
              <>
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${typeColor}`}>
                  <MapPin size={11} /> {typeLabel}
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">{nodeLabel}</h3>
                {nType === 'base' && (() => {
                  const loc = locations[selection.key.slice(5)];
                  const reg = loc ? regions[loc.region_id] : null;
                  return loc ? <p className="text-xs text-slate-500 mt-0.5">{reg?.name ?? ''} · {loc.type}</p> : null;
                })()}
              </>
            )}
            {isArc && (
              <>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-purple-400 flex items-center gap-1.5">
                  <ArrowRight size={11} /> Fluxo de Interesses
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{fromLabel}</span>
                  <ArrowRight size={13} className="text-purple-500 shrink-0" />
                  <span className="text-sm font-bold text-white">{toLabel}</span>
                </div>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-600 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors ml-3 shrink-0 mt-0.5">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isArc && arcInfo && (
          <div className="px-5 pt-4 pb-3">
            <div className="bg-purple-500/8 border border-purple-500/20 rounded-xl p-4 flex items-center gap-4">
              <div>
                <div className="text-3xl font-bold font-mono text-purple-400 leading-none">{arcInfo.count}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400/60 mt-1">
                  {arcInfo.count === 1 ? 'pessoa quer essa rota' : 'pessoas querem essa rota'}
                </div>
              </div>
              <Users size={28} className="text-purple-500/30 ml-auto" />
            </div>
          </div>
        )}

        {isBase && (
          <div className="px-5 pt-4 pb-3 grid grid-cols-2 gap-3">
            <div className="bg-purple-500/8 border border-purple-500/20 rounded-xl p-3">
              <div className="text-2xl font-bold font-mono text-purple-400 leading-none">
                {baseArcsOut.reduce((s, a) => s + a.count, 0)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400/60 mt-1 flex items-center gap-1">
                <TrendingUp size={9} /> Querem sair
              </div>
            </div>
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3">
              <div className="text-2xl font-bold font-mono text-emerald-400 leading-none">
                {baseArcsIn.reduce((s, a) => s + a.count, 0)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/60 mt-1 flex items-center gap-1">
                <Users size={9} /> Querem entrar
              </div>
            </div>
          </div>
        )}

        {isBase && (baseArcsOut.length > 0 || baseArcsIn.length > 0) && (
          <div className="px-5 pb-4 space-y-3">
            {baseArcsOut.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Destinos desejados</div>
                <div className="space-y-1">
                  {[...baseArcsOut].sort((a, b) => b.count - a.count).map(arc => (
                    <div key={arc.to} className="flex items-center justify-between py-1.5 px-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
                      <span className="text-xs text-slate-300 truncate">{resolveLabel(arc.to, locations, regions, states)}</span>
                      <span className="text-xs font-mono font-bold text-purple-400 ml-2 shrink-0">{arc.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {baseArcsIn.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Origens interessadas</div>
                <div className="space-y-1">
                  {[...baseArcsIn].sort((a, b) => b.count - a.count).map(arc => (
                    <div key={arc.from} className="flex items-center justify-between py-1.5 px-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
                      <span className="text-xs text-slate-300 truncate">{resolveLabel(arc.from, locations, regions, states)}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400 ml-2 shrink-0">{arc.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-slate-800 mx-5 mb-3" />
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2 mx-5">
          {isBase ? 'Pessoas nesta base' : 'Pessoas interessadas nesta rota'}
        </div>

        {isFetching ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="text-purple-500 animate-spin" />
          </div>
        ) : users.length > 0 ? (
          <div className="px-5 pb-5 space-y-2">
            {users.map((u, i) => (
              <div key={u.username ?? i} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-[10px] font-bold text-purple-400 shrink-0">
                    {u.username?.slice(0, 2).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">{u.name || u.username}</div>
                    {u.name && <div className="text-[10px] text-slate-600 font-mono truncate">{u.username}</div>}
                    {lbl(roles, u.role_id) && <div className="text-[10px] text-slate-500 truncate">{lbl(roles, u.role_id)?.name}</div>}
                    </div>
                </div>
                {lbl(workRegimes, u.regime_id) && (
                  <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                    <Layers size={9} className="shrink-0" />{lbl(workRegimes, u.regime_id)}
                  </div>
                )}
                {(u.phone || u.email) && (
                  <div className="text-[10px] text-slate-400 mb-1 space-y-0.5">
                    {u.phone && <div className="truncate"><span className="text-slate-600">Tel </span>{u.phone}</div>}
                    {u.email && <div className="truncate"><span className="text-slate-600">Email </span>{u.email}</div>}
                  </div>
                )}
                {u.observacoes && (
                  <div className="flex items-start gap-1 mt-1 pt-1 border-t border-slate-800/60">
                    <FileText size={9} className="text-slate-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">"{u.observacoes}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-700 text-center py-4 px-5">Nenhum usuário encontrado.</p>
        )}
      </div>
    </div>
  );
}
