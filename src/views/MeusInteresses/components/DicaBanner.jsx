// ─────────────────────────────────────────────────────────────────────────────
// DicaBanner.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { Lightbulb } from "lucide-react";

function DicaBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-5 md:p-6 flex gap-4 md:gap-5 items-start shadow-sm animate-in fade-in duration-500">
      <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 shrink-0">
        <Lightbulb size={24} />
      </div>
      <div className="flex-1 mt-0.5">
        <h4 className="text-base font-bold text-white tracking-wide">Dica: Amplie suas chances</h4>
        <p className="text-sm text-[#A3AED0] mt-2 leading-relaxed max-w-3xl">
          Selecione um <strong className="text-white">Estado</strong> ou <strong className="text-white">Região</strong> em vez de uma base específica
          para ter uma busca mais abrangente. Avisaremos por e-mail assim que surgir uma oportunidade compatível.
        </p>
      </div>
    </div>
  );
}

export default DicaBanner;