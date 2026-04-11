// ─────────────────────────────────────────────────────────────────────────────
// AlertaBanner.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { AlertCircle } from "lucide-react";

function AlertaBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-5 md:p-6 flex gap-4 md:gap-5 items-start shadow-sm animate-in fade-in duration-500">
      <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
        <AlertCircle size={24} />
      </div>
      <div className="flex-1 mt-0.5">
        <h4 className="text-base font-bold text-amber-400 tracking-wide">Atenção aos seus dados</h4>
        <p className="text-sm text-[#A3AED0] mt-2 leading-relaxed max-w-3xl">
          Mantenha as informações sempre atualizadas.{" "}
          <strong className="text-white">Não deixe campos em branco</strong>, especialmente os de lotação e perfil profissional, pois eles são essenciais para o sistema de match.
        </p>
      </div>
    </div>
  );
}

export default AlertaBanner;