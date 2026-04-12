import FieldTag from '../../../components/ui/FieldTag';
import Input from '../../../components/ui/Input';

export const USERNAME_REGEX = /^[a-zA-Z0-9._-]*$/;

/**
 * Campo de username com:
 *   - Validação de caracteres em tempo real (regex)
 *   - Verificação de disponibilidade via API com debounce
 *   - Tags de feedback abaixo do input
 *
 * Props:
 *   value          string    — valor atual
 *   onChange       fn        — handler nativo de input (recebe event)
 *   usernameStatus object    — { state: 'idle'|'checking'|'available'|'taken'|'invalid', message }
 */
export function UsernameInput({ value, onChange, usernameStatus = { state: 'idle' } }) {
  const borderColor = {
    idle:      '',
    checking:  '',
    available: 'border-emerald-500/60 focus:border-emerald-500',
    taken:     'border-red-500/60 focus:border-red-500',
    invalid:   'border-red-500/60 focus:border-red-500',
  }[usernameStatus.state] ?? '';

  const tagMap = {
    checking:  { type: 'loading',  message: 'Verificando disponibilidade...' },
    available: { type: 'success',  message: usernameStatus.message ?? 'Username disponível' },
    taken:     { type: 'error',    message: usernameStatus.message ?? 'Username já está em uso' },
    invalid:   { type: 'error',    message: usernameStatus.message ?? 'Caractere inválido' },
    idle:      null,
  };

  const tag = tagMap[usernameStatus.state];

  return (
    <div className="space-y-1.5">
      <Input
        required
        type="text"
        name="username"
        value={value}
        onChange={onChange}
        autoComplete="username"
        placeholder="Ex: rafael.funchal"
        className={`${borderColor} transition-colors`}
      />
      {tag && <FieldTag type={tag.type} message={tag.message} />}
      {usernameStatus.state === 'idle' && (
        <FieldTag type="hint" message="Apenas letras, números, ponto, hífen e underline" />
      )}
    </div>
  );
}
