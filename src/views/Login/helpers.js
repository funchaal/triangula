// ─────────────────────────────────────────────────────────────────────────────
// helpers.js — Constantes e utilitários da view Login
// ─────────────────────────────────────────────────────────────────────────────

export const ANY = "0";

/** Estado inicial do formulário unificado de login/registro */
export const EMPTY_FORM = {
  username:      '',
  password:      '',
  email:         '',
  phone:         '',
  name:          '',
  user_key:      '',
  state:         'permuta',
  base_id:       ANY,
  region_id:     ANY,
  state_id:      ANY,
  role_id:       ANY,
  role_type_id:  ANY,
  department_id: ANY,
  regime_id:     ANY,
  observations:  '',
};

/**
 * Valida se o passo 2 do registro está completo para liberar o submit.
 * Todos os campos obrigatórios de perfil e lotação devem estar preenchidos.
 */
export function isStep2Valid(formData) {
  return (
    formData.name.trim()             !== '' &&
    formData.user_key.trim().length  === 4  &&
    String(formData.state_id)        !== ANY &&
    String(formData.region_id)       !== ANY &&
    String(formData.base_id)         !== ANY &&
    String(formData.role_id)         !== ANY &&
    String(formData.role_type_id)    !== ANY &&
    String(formData.department_id)   !== ANY &&
    String(formData.regime_id)       !== ANY
  );
}

/**
 * Interpreta o erro retornado pela API e retorna uma mensagem amigável em PT-BR.
 * @param {object} err  - Erro capturado no catch do RTK Query
 * @param {string} mode - Modo atual: 'login' | 'register' | 'forgot' | 'reset'
 */
export function parseApiError(err, mode) {
  const detail = err?.data?.detail;

  if (typeof detail === 'string') {
    if (detail === 'Credenciais inválidas')    return 'Usuário ou senha incorretos.';
    if (detail === 'Username já cadastrado')   return 'Este nome de usuário já está em uso.';
    return detail;
  }

  if (Array.isArray(detail)) {
    return 'Verifique os campos preenchidos. Alguns dados estão inválidos ou faltando.';
  }

  if (mode === 'reset' && !detail) {
    return 'O link de redefinição é inválido ou expirou.';
  }

  return 'Erro ao processar solicitação. Tente novamente.';
}

/** Classes Tailwind base para inputs no tema escuro da tela de login */
export const INPUT_CLASSES =
  "w-full bg-[#0B1437] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-[#111C44] transition-all placeholder:text-[#A3AED0]/50 disabled:opacity-50 disabled:cursor-not-allowed";

/** Estilo inline para selects nativos com seta customizada no tema escuro */
export const SELECT_ARROW_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23A3AED0' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 1rem center',
  backgroundRepeat:   'no-repeat',
  backgroundSize:     '1.2em 1.2em',
  paddingRight:       '2.5rem',
  appearance:         'none',
};