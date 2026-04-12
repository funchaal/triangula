import { Eye, EyeOff } from 'lucide-react';
import FieldTag from '../../../components/ui/FieldTag';
import Input from '../../../components/ui/Input';

export const MIN_PASSWORD_LENGTH = 4;

/**
 * Campo de senha reutilizável com toggle de visibilidade.
 * showHint: exibe tag de comprimento mínimo (útil no registro, não no login)
 */
export function PasswordInput({
  value,
  onChange,
  showPassword,
  setShowPassword,
  autoComplete = 'new-password',
  showHint = true,
}) {
  const tooShort = value.length > 0 && value.length < MIN_PASSWORD_LENGTH;
  const ok       = value.length >= MIN_PASSWORD_LENGTH;

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          required
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="pr-12 tracking-widest placeholder:tracking-normal"
        />
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-white transition-colors p-1"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showHint && (
        <>
          {!value && (
            <FieldTag type="hint" message={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`} />
          )}
          {tooShort && (
            <FieldTag type="error" message={`Senha muito curta — mínimo ${MIN_PASSWORD_LENGTH} caracteres`} />
          )}
          {ok && (
            <FieldTag type="success" message="Comprimento OK" />
          )}
        </>
      )}
    </div>
  );
}
