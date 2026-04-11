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
      <div className="absolute top-0 left-0 right-0 z-10 px-4 md:px-5 pt-4 md:pt-5 pb-20 pointer-events-none">
        <div className="flex items-center gap-3 md:gap-3.5">
  {/* Container do Ícone: Reduzido de w-12 (48px) para w-11 (44px) no desktop */}
  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
    <MapPin size={18} className="text-white md:hidden" />
    {/* Ícone desktop: Reduzido de 22 para 20 */}
    <MapPin size={20} className="text-white hidden md:block" />
  </div>

  <div>
    {/* Título: Reduzido de text-lg para text-base no desktop */}
    <div className="text-sm md:text-base font-bold text-white drop-shadow-lg tracking-wide leading-tight">
      {selected ? cycleType(selected.chain) : 'Visão Geográfica'}
    </div>
    {/* Subtítulo: Reduzido de text-xs (12px) para text-[10px] no desktop */}
    <div className="text-[9px] md:text-[10px] text-[#A3AED0] font-bold uppercase tracking-widest">
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