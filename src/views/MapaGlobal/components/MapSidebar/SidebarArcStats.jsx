// ─────────────────────────────────────────────────────────────────────────────
// components/MapSidebar/SidebarArcStats.jsx — Card de estatísticas de um arco selecionado
// ─────────────────────────────────────────────────────────────────────────────

import { Users } from "lucide-react";

/**
 * @param {object} arcInfo - Dados do arco selecionado (from, to, count)
 */
function SidebarArcStats({ arcInfo }) {
  if (!arcInfo) return null;

  return (
    <div className="px-6 pt-5 pb-4">
      <div className="bg-[#13204c] rounded-2xl p-5 flex items-center gap-4">
        <div>
          <div className="text-3xl font-bold font-mono text-blue-400 leading-none">
            {arcInfo.count}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#A3AED0] mt-1.5">
            {arcInfo.count === 1 ? 'Pessoa interessada' : 'Pessoas interessadas'}
          </div>
        </div>
        <Users size={32} className="text-blue-500/20 ml-auto" />
      </div>
    </div>
  );
}

export default SidebarArcStats;