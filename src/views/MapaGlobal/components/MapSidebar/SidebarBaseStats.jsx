// ─────────────────────────────────────────────────────────────────────────────
// components/MapSidebar/SidebarBaseStats.jsx — Estatísticas e fluxos de um nó selecionado
// Exibe total de saídas/entradas e lista de destinos/origens mais demandados
// ─────────────────────────────────────────────────────────────────────────────

import { TrendingUp, Users } from "lucide-react";
import { resolveLabel } from '../../helpers';

/**
 * @param {Array}  baseArcsOut - Arcos saindo do nó selecionado
 * @param {Array}  baseArcsIn  - Arcos chegando ao nó selecionado
 * @param {object} locations   - Dicionário de bases
 * @param {object} regions     - Dicionário de regiões
 * @param {object} states      - Dicionário de estados / bacias
 */
function SidebarBaseStats({ baseArcsOut, baseArcsIn, locations, regions, states }) {
  const hasMoves = baseArcsOut.length > 0 || baseArcsIn.length > 0;

  return (
    <>
      {/* Cards de totais: querem sair / querem entrar */}
      <div className="px-6 pt-5 pb-4 grid grid-cols-2 gap-4">
        <div className="bg-[#13204c] rounded-2xl p-4">
          <div className="text-2xl font-bold font-mono text-indigo-400 leading-none">
            {baseArcsOut.reduce((s, a) => s + a.count, 0)}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#A3AED0] mt-1.5 flex items-center gap-1.5">
            <TrendingUp size={10} className="text-indigo-400" /> Querem sair
          </div>
        </div>
        <div className="bg-[#13204c] rounded-2xl p-4">
          <div className="text-2xl font-bold font-mono text-emerald-400 leading-none">
            {baseArcsIn.reduce((s, a) => s + a.count, 0)}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#A3AED0] mt-1.5 flex items-center gap-1.5">
            <Users size={10} className="text-emerald-400" /> Querem entrar
          </div>
        </div>
      </div>

      {/* Listas de destinos e origens */}
      {hasMoves && (
        <div className="px-6 pb-5 space-y-4">
          {baseArcsOut.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#A3AED0]/70 mb-2.5">
                Destinos desejados
              </div>
              <div className="space-y-1.5">
                {[...baseArcsOut].sort((a, b) => b.count - a.count).map(arc => (
                  <div key={arc.to} className="flex items-center justify-between py-2.5 px-4 bg-[#13204c] rounded-xl">
                    <span className="text-xs md:text-sm text-white font-medium truncate">
                      {resolveLabel(arc.to, locations, regions, states)}
                    </span>
                    <span className="text-xs md:text-sm font-mono font-bold text-indigo-400 ml-3 shrink-0">
                      {arc.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {baseArcsIn.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#A3AED0]/70 mb-2.5">
                Origens interessadas
              </div>
              <div className="space-y-1.5">
                {[...baseArcsIn].sort((a, b) => b.count - a.count).map(arc => (
                  <div key={arc.from} className="flex items-center justify-between py-2.5 px-4 bg-[#13204c] rounded-xl">
                    <span className="text-xs md:text-sm text-white font-medium truncate">
                      {resolveLabel(arc.from, locations, regions, states)}
                    </span>
                    <span className="text-xs md:text-sm font-mono font-bold text-emerald-400 ml-3 shrink-0">
                      {arc.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default SidebarBaseStats;