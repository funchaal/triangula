// ─────────────────────────────────────────────────────────────────────────────
// MatchCard.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { ArrowLeftRight, Check, Repeat } from 'lucide-react';

function MatchCard({ match, isActive, labels, tipo, confirmed, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded-3xl border transition-all duration-300 p-5 relative overflow-hidden group
        shrink-0 w-[85vw] sm:w-[320px] lg:w-full snap-center bg-[#13204c]
        ${isActive
          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50'
          : 'border-white/5 bg-[#0B1437] hover:border-white/10 hover:bg-white/5'
        }
      `}
    >
      {/* Indicador lateral ativo */}
      {isActive && (
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r-full" />
      )}

      {/* Tipo de ciclo + badge de confirmado */}
      <div className="flex items-center justify-between mb-5 gap-2">
        <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border-none ${
          match.chain.length === 2
            ? 'bg-blue-500/20 text-blue-300'
            : match.chain.length === 3
            ? 'bg-purple-500/20 text-purple-300'
            : 'bg-amber-500/20 text-amber-300'
        }`}>
          <Repeat size={14} />
          {tipo}
        </div>

        {confirmed && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border-none shadow-[0_0_10px_rgba(52,211,153,0.1)]">
            <Check size={14} /> Confirmado
          </div>
        )}
      </div>

      {/* Fluxo do ciclo: pílulas com setas entre elas */}
        <div className="flex flex-wrap items-center gap-2.5">
        {labels.map((label, i) => (
            <div key={i} className="flex items-center gap-2.5">
            <div className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold truncate max-w-[130px] transition-colors ${
                isActive
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/5 text-[#A3AED0] group-hover:bg-white/10 group-hover:text-white'
            }`}>
                {label}
            </div>
            
            {/* A seta só aparece se NÃO for o último item da lista */}
            {i < labels.length - 1 && (
                <ArrowLeftRight size={16} className={isActive ? "text-blue-400" : "text-[#A3AED0]/50"} />
            )}
            </div>
        ))}

        {/* O bloco da "Última pílula" que estava aqui foi removido */}
        </div>
    </div>
  );
}

export default MatchCard;