// ─────────────────────────────────────────────────────────────────────────────
// FormRegisterStep1.jsx — Usuário, e-mail, telefone e senha (passo 1 do registro)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { PasswordInput } from '../PasswordInput';
import Label from '../../../../components/ui/Label';
import FieldTag from '../../../../components/ui/FieldTag';
import PhoneInput, { validatePhoneNumber } from '../../../../components/ui/PhoneInput';
import Input from '../../../../components/ui/Input';

const USERNAME_REGEX   = /^[a-zA-Z0-9._-]*$/;
const MIN_PASSWORD_LEN = 4;
const DEBOUNCE_MS      = 600;

export function FormRegisterStep1({ formData, setFormData, handleChange, showPassword, setShowPassword, setStep1Valid }) {
  const [usernameStatus, setUsernameStatus] = useState({ state: 'idle' });
  const debounceTimer = useRef(null);
  const checkedUsernames = useRef({});

  useEffect(() => {
    if (!setStep1Valid) return;
    const isUsernameValid = usernameStatus.state === 'available';
    const isEmailValid = !!formData.email && formData.email.includes('@');
    const isPhoneValid = validatePhoneNumber(formData.phone);
    const isPwdValid = !!formData.password && formData.password.length >= MIN_PASSWORD_LEN;
    
    setStep1Valid(isUsernameValid && isEmailValid && isPhoneValid && isPwdValid);
  }, [usernameStatus.state, formData.email, formData.phone, formData.password, setStep1Valid]);

  function handleUsernameChange(e) {
    handleChange(e);
    const value = e.target.value;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!value)                      return setUsernameStatus({ state: 'idle' });
    if (!USERNAME_REGEX.test(value)) return setUsernameStatus({ state: 'invalid' });
    if (value.length < 3)            return setUsernameStatus({ state: 'idle' });

    // Se já verificou esse username, usa o valor em cache e não bate na API
    if (checkedUsernames.current[value] !== undefined) {
      return setUsernameStatus({ state: checkedUsernames.current[value] ? 'available' : 'taken' });
    }

    setUsernameStatus({ state: 'checking' });
    debounceTimer.current = setTimeout(async () => {
      try {
        const base = import.meta.env.VITE_API_URL ?? '';
        const res  = await fetch(`${base}/auth/check-username?username=${encodeURIComponent(value)}`);
        const data = await res.json();
        
        // Salva no cache
        checkedUsernames.current[value] = data.available;
        
        setUsernameStatus({ state: data.available ? 'available' : 'taken' });
      } catch {
        setUsernameStatus({ state: 'idle' });
      }
    }, DEBOUNCE_MS);
  }

  const usernameTag = {
    idle:      { type: 'hint',    message: 'Apenas letras, números, ponto, hífen e underline' },
    checking:  { type: 'loading', message: 'Verificando disponibilidade...' },
    available: { type: 'success', message: 'Username disponível' },
    taken:     { type: 'error',   message: 'Este username já está em uso' },
    invalid:   { type: 'error',   message: 'Apenas letras, números, ponto (.), hífen (-) e underline (_)' },
  }[usernameStatus.state];

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
          onChange={handleUsernameChange}
          autoComplete="username"
          placeholder="Ex: rafael.funchal"
        />
        <FieldTag {...usernameTag} className="mt-1.5" />
      </div>

      {/* E-mail */}
      <div className="space-y-1.5">
        <Label>E-mail pessoal</Label>
        <Input
          required
          type="email"
          name="email"
          placeholder="Ex: rafael@email.com"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      {/* Telefone */}
      <div className="space-y-1.5">
        <Label>Telefone / Celular</Label>
        <PhoneInput
          value={formData.phone}
          onChange={(value) => setFormData(f => ({ ...f, phone: value || '' }))}
          required
        />
      </div>

      {/* Senha */}
      <div className="space-y-1.5">
        <Label>Senha</Label>
        <PasswordInput
          value={formData.password}
          onChange={handleChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          autoComplete="new-password"
        />
      </div>

    </div>
  );
}