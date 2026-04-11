// ─────────────────────────────────────────────────────────────────────────────
// EstadoVazio.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { Target } from "lucide-react";

function EstadoVazio() {
  return (
    <div className="py-20 md:py-28 text-center border-2 border-dashed border-white/5 bg-white/5 rounded-3xl">
      <Target size={56} className="mx-auto text-[#A3AED0] mb-4 opacity-30" />
      <p className="text-[#A3AED0] font-medium text-sm md:text-base">
        Nenhum interesse cadastrado no momento.
      </p>
    </div>
  );
}

export default EstadoVazio;