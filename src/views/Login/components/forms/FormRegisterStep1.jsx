// ─────────────────────────────────────────────────────────────────────────────
// components/forms/FormForgot.jsx — Campo de usuário para recuperação de senha
// ─────────────────────────────────────────────────────────────────────────────

import Label from '../../../../components/ui/Label';
import { INPUT_CLASSES } from '../../helpers';

export function FormForgot({ formData, handleChange }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <p className="text-sm text-[#A3AED0] mb-2 leading-relaxed">
        Digite seu nome de usuário abaixo. Enviaremos um link de recuperação para o seu e-mail cadastrado.
      </p>
      <div className="space-y-1.5">
        <Label>Nome de usuário</Label>
        <input
          required
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Ex: rafael.funchal"
          className={INPUT_CLASSES}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormReset.jsx — Campo de nova senha para redefinição via token
// ─────────────────────────────────────────────────────────────────────────────

import { PasswordInput } from './FormLogin';

export function FormReset({ formData, handleChange, showPassword, setShowPassword }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-1.5">
        <Label>Nova Senha</Label>
        <PasswordInput
          value={formData.password}
          onChange={handleChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormRegisterStep1.jsx — Usuário, e-mail, telefone e senha (passo 1 do registro)
// ─────────────────────────────────────────────────────────────────────────────

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { PasswordInput as PwdInput } from './FormLogin';

export function FormRegisterStep1({ formData, setFormData, handleChange, showPassword, setShowPassword }) {
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

      {/* E-mail */}
      <div className="space-y-1.5">
        <Label>E-mail pessoal</Label>
        <input
          required
          type="email"
          name="email"
          placeholder="Ex: rafael@email.com"
          value={formData.email}
          onChange={handleChange}
          className={INPUT_CLASSES}
        />
      </div>

      {/* Telefone */}
      <div className="space-y-1.5">
        <Label>Telefone / Celular</Label>
        <PhoneInput
          international
          defaultCountry="BR"
          value={formData.phone}
          onChange={(value) => setFormData(f => ({ ...f, phone: value || '' }))}
          placeholder="(22) 99999-9999"
          numberInputProps={{
            className: "bg-transparent text-sm text-white focus:outline-none placeholder:text-[#A3AED0]/50 w-full",
            required:  true,
          }}
        />
      </div>

      {/* Senha */}
      <div className="space-y-1.5">
        <Label>Senha</Label>
        <PwdInput
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