// ─────────────────────────────────────────────────────────────────────────────
// components/PhoneInputStyles.jsx — CSS injetado para o PhoneInput no tema escuro da tela de login
// ─────────────────────────────────────────────────────────────────────────────

function PhoneInputStyles() {
  return (
    <style>{`
      .PhoneInput { display: flex; align-items: center; gap: 0.2rem; }
      .PhoneInputCountry { display: flex; align-items: center; gap: 0.5rem; background-color: #0B1437; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 0 0.75rem; height: 46px; transition: background-color 0.2s; }
      .PhoneInputCountry:hover { background-color: #111C44; }
      .PhoneInputCountrySelectArrow { color: #A3AED0; border-right-color: #A3AED0; border-bottom-color: #A3AED0; opacity: 0.8; }
      .PhoneInputInput { flex: 1; background-color: #0B1437; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 0.5rem 1rem; color: white; font-size: 0.875rem; height: 46px; outline: none; transition: all 0.2s; }
      .PhoneInputInput:focus { border-color: #3b82f6; background-color: #111C44; }
      .PhoneInputInput::placeholder { color: rgba(163,174,208,0.5); }
      .PhoneInputCountrySelect option { background-color: #1B254B; color: white; }
    `}</style>
  );
}

export default PhoneInputStyles;