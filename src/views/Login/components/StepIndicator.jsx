// ─────────────────────────────────────────────────────────────────────────────
// components/StepIndicator.jsx — Barra de progresso de etapas do registro
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {number} currentStep - Etapa atual (1 ou 2)
 * @param {number} totalSteps  - Total de etapas (padrão: 2)
 */
function StepIndicator({ currentStep, totalSteps = 2 }) {
  return (
    <div className="flex items-center gap-2.5 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            currentStep >= i + 1
              ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
              : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  );
}

export default StepIndicator;