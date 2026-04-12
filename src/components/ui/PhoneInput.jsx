import { useState } from 'react';
import BasePhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import FieldTag from './FieldTag';

export function validatePhoneNumber(value) {
  if (!value) return false;
  // Se for Brasil (+55), exige DDD (2) + 9 inicial + 8 dígitos = 11 dígitos -> total de 14 caracteres na string E.164
  if (value.startsWith('+55')) {
    return value.length === 14 && value[5] === '9';
  }
  // Caso contrário, usa a validação padrão da biblioteca
  return isValidPhoneNumber(value);
}

export default function PhoneInput({ value, onChange, placeholder, required, className }) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  const isValid = validatePhoneNumber(value);
  const showError = hasBlurred && !isFocused && ((required && !value) || (value && !isValid));

  return (
    <div className={`flex flex-col gap-1.5 ${className || ''}`}>
      <style>{`
        .PhoneInput { display: flex; align-items: center; }
        .PhoneInputCountry { display: flex; align-items: center; gap: 0.5rem; background-color: #0B1437; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.75rem; padding: 0 0.75rem; height: 46px; transition: background-color 0.2s; }
        .PhoneInputCountry:hover { background-color: #111C44; }
        .PhoneInputCountrySelectArrow { color: #A3AED0; border-right-color: #A3AED0; border-bottom-color: #A3AED0; opacity: 0.8; }
        .PhoneInputInput { flex: 1; background-color: #0B1437; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.75rem; padding: 0.5rem 1rem; color: white; font-size: 0.875rem; height: 46px; outline: none; transition: all 0.2s; }
        .PhoneInputInput:-webkit-autofill,
        .PhoneInputInput:-webkit-autofill:hover,
        .PhoneInputInput:-webkit-autofill:focus,
        .PhoneInputInput:-webkit-autofill:active {
          -webkit-background-clip: text;
          -webkit-text-fill-color: white;
          transition: background-color 5000s ease-in-out 0s;
          box-shadow: inset 0 0 20px 20px #0B1437;
        }
        .PhoneInputInput:focus { border-color: #3b82f6; }
        .PhoneInputInput::placeholder { color: rgba(163, 174, 208, 0.5); }
        .PhoneInputCountrySelect option { background-color: #1B254B; color: white; }
      `}</style>
      <BasePhoneInput
        international
        defaultCountry="BR"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setHasBlurred(true);
        }}
        placeholder={placeholder || "(22) 99999-9999"}
        numberInputProps={{
          className: "bg-transparent text-sm text-white focus:outline-none placeholder:text-[#A3AED0]/50 w-full",
          required: required,
        }}
      />
      {showError && (
        <FieldTag type="error" message="Por favor, insira um número de telefone válido" />
      )}
    </div>
  );
}
