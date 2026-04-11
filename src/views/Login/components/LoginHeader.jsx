// ─────────────────────────────────────────────────────────────────────────────
// components/LoginHeader.jsx — Logo, título e subtítulo da tela de login
// ─────────────────────────────────────────────────────────────────────────────

import { Triangle } from 'lucide-react';

// Textos por modo
const TITLES = {
  login:    'Acesse o Triangula',
  register: 'Crie sua conta',
  forgot:   'Recuperar Senha',
  reset:    'Criar Nova Senha',
};

const SUBTITLES = {
  login:    'Gerencie seus interesses de permuta com facilidade.',
  register: 'Conecte-se às melhores oportunidades de movimentação.',
  forgot:   'Vamos te ajudar a recuperar o acesso à sua conta.',
  reset:    'Quase lá! Defina sua nova senha de acesso.',
};

/**
 * @param {string} mode - Modo atual: 'login' | 'register' | 'forgot' | 'reset'
 */
function LoginHeader({ mode }) {
  return (
    <div className="mb-8 flex flex-col items-center shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-6">
        <Triangle className="text-white fill-white/20" size={32} />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide text-center">
        {TITLES[mode]}
      </h1>
      <p className="text-[#A3AED0] text-sm mt-2.5 text-center max-w-sm leading-relaxed">
        {SUBTITLES[mode]}
      </p>
    </div>
  );
}

export default LoginHeader;