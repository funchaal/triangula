// ─────────────────────────────────────────────────────────────────────────────
// components/forms/FormLogin.jsx — Campos de usuário e senha para o modo login
// ─────────────────────────────────────────────────────────────────────────────

import { Eye, EyeOff } from 'lucide-react';
import Label from '../../../../components/ui/Label';
import { INPUT_CLASSES } from '../../helpers';

/**
 * @param {object}   formData       - Estado do formulário
 * @param {function} handleChange   - Handler genérico de inputs
 * @param {boolean}  showPassword   - Visibilidade da senha
 * @param {function} setShowPassword- Toggle de visibilidade
 * @param {function} onForgot       - Callback para ir ao modo "esqueceu a senha"
 */
function FormLogin({ formData, handleChange, showPassword, setShowPassword, onForgot }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Usuário */}
      <div className="space-y-1.5">
        <Label>Nome de usuário</Label>
        <input
          required
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          autoComplete="username"
          placeholder="Ex: rafael.funchal"
          className={INPUT_CLASSES}
        />
      </div>

      {/* Senha */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center mb-1">
          <Label className="mb-0">Senha</Label>
          <button
            type="button"
            onClick={onForgot}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Esqueceu a senha?
          </button>
        </div>
        <PasswordInput
          value={formData.password}
          onChange={handleChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          autoComplete="current-password"
        />
      </div>
    </div>
  );
}

/** Campo de senha reutilizável com toggle de visibilidade */
export function PasswordInput({ value, onChange, showPassword, setShowPassword, autoComplete = 'new-password' }) {
  return (
    <div className="relative">
      <input
        required
        type={showPassword ? 'text' : 'password'}
        name="password"
        placeholder="••••••••"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`${INPUT_CLASSES} pr-12 tracking-widest placeholder:tracking-normal`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(v => !v)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-white transition-colors p-1"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default FormLogin;