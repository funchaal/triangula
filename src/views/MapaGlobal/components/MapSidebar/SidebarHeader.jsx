// ─────────────────────────────────────────────────────────────────────────────
// components/MapSidebar/SidebarHeader.jsx — Cabeçalho da sidebar com título e botão fechar
// ─────────────────────────────────────────────────────────────────────────────

import { X, ArrowRight, MapPin } from "lucide-react";
import { nodeType, resolveLabel } from '../../helpers';

/**
 * @param {object}   selection - Seleção atual (arc ou base)
 * @param {object}   locations - Dicionário de bases
 * @param {object}   regions   - Dicionário de regiões
 * @param {object}   states    - Dicionário de estados
 * @param {function} onClose   - Callback para fechar a sidebar
 */
function SidebarHeader({ selection, locations, regions, states, onClose }) {
  const isArc  = selection.type === 'arc';
  const isBase = selection.type === 'base';
  const nType  = isBase ? nodeType(selection.key) : null;

  const fromLabel = isArc  ? resolveLabel(selection.from, locations, regions, states) : null;
  const toLabel   = isArc  ? resolveLabel(selection.to,   locations, regions, states) : null;
  const nodeLabel = isBase ? resolveLabel(selection.key,  locations, regions, states) : null;

  // Cor do badge de tipo varia conforme região, estado ou base
  const typeColor = nType === 'region' ? 'text-amber-400' : nType === 'state' ? 'text-blue-400' : 'text-indigo-400';
  const typeLabel = nType === 'region' ? 'Região' : nType === 'state' ? 'Estado' : 'Base';

  return (
    <div className="px-6 pt-6 pb-5 border-b border-white/5 shrink-0">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">

          {/* ── Seleção de nó (base / região / estado) ── */}
          {isBase && (
            <>
              <div className={`text-[11px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 ${typeColor}`}>
                <MapPin size={12} /> {typeLabel}
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">{nodeLabel}</h3>
              {/* Subtítulo com região e tipo de base */}
              {nType === 'base' && (() => {
                const loc = locations[selection.key.slice(5)];
                const reg = loc ? regions[loc.region_id] : null;
                return loc
                  ? <p className="text-xs text-[#A3AED0] mt-1 font-medium">{reg?.name ?? ''} · {loc.type}</p>
                  : null;
              })()}
            </>
          )}

          {/* ── Seleção de arco (fluxo de interesses) ── */}
          {isArc && (
            <>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2 text-blue-400 flex items-center gap-1.5">
                <ArrowRight size={12} /> Fluxo de Interesses
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-bold text-white">{fromLabel}</span>
                <ArrowRight size={14} className="text-[#A3AED0]/50 shrink-0" />
                <span className="text-base font-bold text-white">{toLabel}</span>
              </div>
            </>
          )}
        </div>

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="p-2 text-[#A3AED0] hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-4 shrink-0 mt-0.5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default SidebarHeader;