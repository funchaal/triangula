// ─────────────────────────────────────────────────────────────────────────────
// MapaFluxo.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { MapPin } from 'lucide-react';
import MatchMiniMap from '../components/MatchMiniMap/index.jsx';
import { cycleType } from '../helpers';

function MapaFluxo({ selected }) {
  return (
    <div className="flex-1 min-h-0 relative bg-[#0B1437]">

      {/* Overlay com título do ciclo sobre o mapa adaptado para a paleta escura */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 pt-6 pb-20 pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <MapPin size={22} className="text-white" />
          </div>
          <div>
            <div className="text-base md:text-lg font-bold text-white drop-shadow-lg tracking-wide">
              {selected ? cycleType(selected.chain) : 'Visão Geográfica'}
            </div>
            <div className="text-[11px] md:text-xs text-[#A3AED0] font-bold uppercase tracking-widest mt-1">
              Mapa de Fluxo
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0">
        <MatchMiniMap match={selected} />
      </div>
    </div>
  );
}

export default MapaFluxo;