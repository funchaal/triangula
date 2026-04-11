// ─────────────────────────────────────────────────────────────────────────────
// components/StatusToast.jsx — Notificação flutuante de sucesso ou erro
// ─────────────────────────────────────────────────────────────────────────────

import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * @param {{ type: 'success'|'error'|null, message: string }} status
 */
function StatusToast({ status }) {
  if (!status.message) return null;

  const isSuccess = status.type === 'success';

  return (
    <div className={`
      fixed bottom-6 md:bottom-auto md:top-8 left-1/2 -translate-x-1/2
      w-[90%] sm:w-auto min-w-[320px] px-5 py-4 rounded-xl shadow-2xl
      flex items-center gap-3 z-50 bg-[#111C44] border
      animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-top-4 duration-300
      ${isSuccess ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'}
    `}>
      {isSuccess
        ? <CheckCircle2 size={20} className="shrink-0" />
        : <AlertCircle  size={20} className="shrink-0" />
      }
      <span className="text-sm font-semibold text-white tracking-wide">
        {status.message}
      </span>
    </div>
  );
}

export default StatusToast;