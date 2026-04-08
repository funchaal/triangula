import { useEffect } from 'react';
import { Target, ArrowRight, MapPin, Check, Repeat } from 'lucide-react';
import MatchMiniMap from '../components/MatchMiniMap';
import {
  useAppSelector, useAppDispatch,
  selectMatches, selectSelectedMatch, selectLocations,
} from '../store/hooks';
import { selectMatch } from '../store/slices/authSlice';

function MeusMatches() {
  const dispatch  = useAppDispatch();
  const matches   = useAppSelector(selectMatches);
  const selected  = useAppSelector(selectSelectedMatch);
  const locations = useAppSelector(selectLocations);

  useEffect(() => {
    if (matches.length > 0 && !selected) {
      dispatch(selectMatch(matches[0].id));
    }
  }, [matches.length, selected, dispatch]);

  useEffect(() => {
    if (matches.length === 0) {
      dispatch(selectMatch(null));
    }
  }, [matches.length, dispatch]);

  function chainLabels(chain) {
    return chain.map(step => locations[step.base_id]?.name ?? step.base_id);
  }

  function cycleType(chain) {
    if (chain.length === 2) return 'Permuta Direta';
    if (chain.length === 3) return 'Triangulação';
    return 'Ciclo Quádruplo';
  }

  function allAccepted(chain) {
    return chain.every(s => s.aceite === true);
  }

  if (!matches.length) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950">
        <div className="text-center px-8 max-w-sm animate-in fade-in duration-500">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-900/50 rounded-full flex items-center justify-center border border-slate-800">
            <Target size={32} className="text-slate-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-300 mb-2">Nenhum ciclo encontrado</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Seus dados estão sendo cruzados. Cadastre ou atualize seus interesses para aumentar as chances do algoritmo encontrar um match.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-950 overflow-hidden">

      {/* ── Lista de ciclos ──────────────────────────────────────────────── */}
      <div className="lg:w-[420px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/50 z-10">

        {/* Header */}
        <div className="h-16 pl-16 pr-5 lg:pl-5 border-b border-slate-800 shrink-0 flex flex-col justify-center bg-slate-950">
          <div className="text-sm font-semibold text-slate-200">Possíveis Movimentações</div>
          <div className="text-xs text-slate-600 mt-0.5">
            {matches.length} ciclo{matches.length !== 1 ? 's' : ''} encontrado{matches.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Mobile: scroll horizontal com snap | Desktop: scroll vertical */}
        <div className="
          lg:flex-1 lg:overflow-y-auto lg:p-5 lg:space-y-4
          flex lg:flex lg:flex-col
          overflow-x-auto overflow-y-hidden lg:overflow-x-hidden
          px-4 py-5
          gap-4 lg:gap-0
          snap-x snap-mandatory lg:snap-none
          [&::-webkit-scrollbar]:hidden
          lg:[&::-webkit-scrollbar]:w-1.5
          lg:[&::-webkit-scrollbar]:block
          lg:[&::-webkit-scrollbar-track]:bg-transparent
          lg:[&::-webkit-scrollbar-thumb]:bg-slate-800
          lg:[&::-webkit-scrollbar-thumb]:rounded-full
        ">
          {matches.map(m => {
            const labels    = chainLabels(m.chain);
            const tipo      = cycleType(m.chain);
            const confirmed = allAccepted(m.chain);
            const isActive  = selected?.id === m.id;

            return (
              <div
                key={m.id}
                onClick={() => dispatch(selectMatch(m.id))}
                className={`
                  cursor-pointer rounded-2xl border transition-all duration-300 p-4 relative overflow-hidden
                  shrink-0 w-[85vw] sm:w-[320px] lg:w-full snap-center
                  ${isActive
                    ? 'border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-slate-900 shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/20'
                    : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/40'
                  }
                `}
              >
                {/* Indicador Ativo Lateral (Desktop) */}
                {isActive && (
                  <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}

                {/* Tipo + status */}
                <div className="flex items-center justify-between mb-4 gap-2">
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                    m.chain.length === 2
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : m.chain.length === 3
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    <Repeat size={12} />
                    {tipo}
                  </div>
                  
                  {confirmed && (
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                      <Check size={12} /> Confirmado
                    </div>
                  )}
                </div>

                {/* Fluxo da Cadeia (Design melhorado com pílulas) */}
                <div className="flex flex-wrap items-center gap-2">
                  {labels.map((label, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate max-w-[120px] border ${
                        isActive ? 'bg-blue-500/10 border-blue-500/30 text-blue-100' : 'bg-slate-800/50 border-slate-700 text-slate-300'
                      }`}>
                        {label}
                      </div>
                      <ArrowRight size={14} className={isActive ? "text-blue-400/60" : "text-slate-600"} />
                    </div>
                  ))}
                  {/* Destino Final (Fechando o ciclo) */}
                  <div className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate max-w-[120px] border border-dashed ${
                    isActive ? 'bg-transparent border-blue-500/50 text-blue-300' : 'bg-transparent border-slate-600 text-slate-500'
                  }`}>
                    {labels[0]}
                  </div>
                </div>

              </div>
            );
          })}

          {/* Espaçador mobile para não colar o último card na borda */}
          <div className="shrink-0 w-2 lg:hidden" />
        </div>
      </div>

      {/* ── Mapa do ciclo selecionado ────────────────────────────────────── */}
      <div className="flex-1 min-h-0 relative bg-slate-950">
        <div className="absolute top-0 left-0 right-0 z-10 px-6 pt-5 pb-16 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-blue-900/20">
              <MapPin size={18} className="text-blue-400" />
            </div>
            <div>
              <div className="text-sm md:text-base font-bold text-white drop-shadow-md">
                {selected ? cycleType(selected.chain) : 'Visão Geográfica'}
              </div>
              <div className="text-[10px] md:text-xs text-blue-300/80 font-medium uppercase tracking-widest drop-shadow-md">
                Mapa de Fluxo
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0">
          <MatchMiniMap match={selected} />
        </div>
      </div>
    </div>
  );
}

export default MeusMatches;