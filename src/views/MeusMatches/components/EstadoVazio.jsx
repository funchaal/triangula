// ─────────────────────────────────────────────────────────────────────────────
// EstadoVazio.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { Target } from 'lucide-react';

function EstadoVazio() {
  return (
    <div className="h-full flex items-center justify-center bg-[#0B1437]">
      <div className="text-center px-8 max-w-sm animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl">
          <Target size={40} className="text-[#A3AED0] opacity-50" />
        </div>
        <h2 className="text-xl font-bold text-white mb-3">Nenhum ciclo encontrado</h2>
        <p className="text-sm text-[#A3AED0] leading-relaxed">
          Seus dados estão sendo cruzados. Cadastre ou atualize seus interesses para aumentar as
          chances do algoritmo encontrar um match.
        </p>
      </div>
    </div>
  );
}

export default EstadoVazio;