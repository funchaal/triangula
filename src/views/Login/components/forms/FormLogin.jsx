// ─────────────────────────────────────────────────────────────────────────────
// components/forms/FormLogin.jsx
// ─────────────────────────────────────────────────────────────────────────────

import Label from '../../../../components/ui/Label';
import { PasswordInput } from '../PasswordInput';
import Input from '../../../../components/ui/Input';

export function FormLogin({ formData, handleChange, showPassword, setShowPassword, onForgot }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Usuário */}
      <div className="space-y-1.5">
        <Label>Nome de usuário</Label>
        <Input
          required
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          autoComplete="username"
          placeholder="Ex: rafael.funchal"
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
          showHint={false}
        />
      </div>
    </div>
  );
}
