// ─────────────────────────────────────────────────────────────────────────────
// components/actions/FormActions.jsx — Botões de ação condicionais por modo e etapa
// ─────────────────────────────────────────────────────────────────────────────

import { ArrowRight, ArrowLeft } from 'lucide-react';
import LoadingTriangle from '../../../../components/ui/LoadingTriangle';

/**
 * @param {string}   mode         - Modo atual: 'login'|'register'|'forgot'|'reset'
 * @param {number}   registerStep - Etapa atual do registro (1 ou 2)
 * @param {boolean}  isLoading    - True enquanto alguma mutation está em andamento
 * @param {boolean}  step2Valid   - True se o passo 2 do registro está válido
 * @param {function} onBack       - Callback para voltar ao passo 1
 * @param {function} onGoToLogin  - Callback para voltar ao modo login (no forgot)
 */
function FormActions({ mode, registerStep, isLoading, step1Valid, step2Valid, onBack, onGoToLogin }) {

  // ── Esqueceu a senha ──────────────────────────────────────────────────────
  if (mode === 'forgot') {
    return (
      <div className="flex flex-col gap-4">
        <SubmitBtn isLoading={isLoading} color="blue" label="Enviar link de recuperação" />
        <button
          type="button"
          onClick={onGoToLogin}
          className="w-full bg-transparent hover:bg-white/5 text-[#A3AED0] hover:text-white font-semibold h-12 rounded-xl text-sm transition-all"
        >
          Voltar para o login
        </button>
      </div>
    );
  }

  // ── Redefinir senha ───────────────────────────────────────────────────────
  if (mode === 'reset') {
    return <SubmitBtn isLoading={isLoading} color="emerald" label="Salvar Nova Senha" />;
  }

  // ── Registro — passo 1 ────────────────────────────────────────────────────
  if (mode === 'register' && registerStep === 1) {
    return (
      <button
        type="submit"
        disabled={!step1Valid}
        className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-white/5 disabled:text-[#A3AED0]/50 text-white font-bold h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:shadow-none"
      >
        Continuar <ArrowRight size={18} />
      </button>
    );
  }

  // ── Registro — passo 2 ────────────────────────────────────────────────────
  if (mode === 'register' && registerStep === 2) {
    return (
      <div className="flex flex-col-reverse sm:flex-row gap-4 mt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-1/3 bg-white/5 hover:bg-white/10 text-[#A3AED0] hover:text-white font-semibold h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        <button
          type="submit"
          disabled={isLoading || !step2Valid}
          className="w-full sm:flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-[#A3AED0]/50 text-white font-bold h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:shadow-none"
        >
          {isLoading ? <LoadingTriangle size={20} /> : 'Finalizar Cadastro'}
        </button>
      </div>
    );
  }

  // ── Login (padrão) ────────────────────────────────────────────────────────
  return <SubmitBtn isLoading={isLoading} color="blue" label="Entrar na plataforma" />;
}

// ── Botão de submit reutilizável ─────────────────────────────────────────────

const COLOR_CLASSES = {
  blue:    'bg-blue-500 hover:bg-blue-400',
  emerald: 'bg-emerald-500 hover:bg-emerald-400',
};

function SubmitBtn({ isLoading, color, label }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`w-full ${COLOR_CLASSES[color]} disabled:bg-white/5 disabled:text-[#A3AED0]/50 text-white font-bold h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:shadow-none`}
    >
      {isLoading ? <LoadingTriangle size={20} /> : label}
    </button>
  );
}

export default FormActions;