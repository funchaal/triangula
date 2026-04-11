// ─────────────────────────────────────────────────────────────────────────────
// index.jsx — View principal: Login / Registro / Recuperação de senha
// Orquestra o hook, sessão, e composição dos sub-componentes por modo.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import LoadingTriangle from '../../components/ui/LoadingTriangle';
import { useInitQuery, useRestoreSessionMutation } from '../../services/api';
import { useAppSelector, selectIsLoggedIn } from '../../store/hooks';
import { TOKEN_KEY } from '../../constants';

import { useLoginForm } from './hooks/useLoginForm';

// Componentes estruturais
import LoginBackground  from './components/LoginBackground';
import LoginHeader      from './components/LoginHeader';
import StepIndicator    from './components/StepIndicator';
import StatusToast      from './components/StatusToast';
import PhoneInputStyles from './components/PhoneInputStyles';
import FormActions      from './components/actions/FormActions';

// Formulários por modo/etapa
import FormLogin                          from './components/forms/FormLogin';
import { FormForgot, FormReset, FormRegisterStep1 } from './components/forms/FormRegisterStep1';
import FormRegisterStep2                  from './components/forms/FormRegisterStep2';

export default function Login() {
  const navigate   = useNavigate();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const { isLoading: initLoading } = useInitQuery();
  const [restoreSession, { isLoading: sessionLoading }] = useRestoreSessionMutation();

  // Tenta restaurar sessão existente ao montar
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken && !isLoggedIn) {
      restoreSession().unwrap().catch(() => localStorage.removeItem(TOKEN_KEY));
    }
  }, [restoreSession, isLoggedIn]);

  // Redireciona ao home após login bem-sucedido
  useEffect(() => {
    if (isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);

  // ── Hook principal ────────────────────────────────────────────────────────
  const form = useLoginForm();

  // ── Tela de carregamento inicial ──────────────────────────────────────────
  if (sessionLoading || initLoading) {
    return (
      <div className="h-screen w-full bg-[#0B1437] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <LoadingTriangle size={36} />
          <div className="text-[#A3AED0] text-sm font-bold uppercase tracking-widest animate-pulse mt-2">
            Iniciando Triangula...
          </div>
        </div>
      </div>
    );
  }

  // ── Largura do card varia no passo 2 do registro ──────────────────────────
  const isWideCard = form.mode === 'register' && form.registerStep === 2;

  return (
    <div className="min-h-screen w-full bg-[#0B1437] flex flex-col items-center justify-center p-4 py-8 md:py-12 font-sans selection:bg-blue-500/30 overflow-x-hidden overflow-y-auto relative z-0">
      <PhoneInputStyles />
      <LoginBackground />

      <LoginHeader mode={form.mode} />

      {/* Card principal */}
      <div className={`w-full transition-all duration-500 ${isWideCard ? 'max-w-4xl' : 'max-w-[420px]'}`}>
        <div className={`bg-[#111C44] border border-white/5 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 ${isWideCard ? 'p-6 sm:p-8' : 'p-6 sm:p-10'}`}>

          {/* Indicador de etapas — visível apenas no registro */}
          {form.mode === 'register' && (
            <StepIndicator currentStep={form.registerStep} />
          )}

          <form onSubmit={form.handleSubmit} className="space-y-6">

            {/* ── Formulário por modo/etapa ─────────────────────────── */}
            {form.mode === 'forgot' && (
              <FormForgot formData={form.formData} handleChange={form.handleChange} />
            )}

            {form.mode === 'reset' && (
              <FormReset
                formData={form.formData}
                handleChange={form.handleChange}
                showPassword={form.showPassword}
                setShowPassword={form.setShowPassword}
              />
            )}

            {form.mode === 'login' && (
              <FormLogin
                formData={form.formData}
                handleChange={form.handleChange}
                showPassword={form.showPassword}
                setShowPassword={form.setShowPassword}
                onForgot={form.goToForgot}
              />
            )}

            {form.mode === 'register' && form.registerStep === 1 && (
              <FormRegisterStep1
                formData={form.formData}
                setFormData={form.setFormData}
                handleChange={form.handleChange}
                showPassword={form.showPassword}
                setShowPassword={form.setShowPassword}
              />
            )}

            {form.mode === 'register' && form.registerStep === 2 && (
              <FormRegisterStep2
                formData={form.formData}
                setFormData={form.setFormData}
                handleChange={form.handleChange}
                handleProfileState={form.handleProfileState}
                handleProfileRegion={form.handleProfileRegion}
                handleProfileBase={form.handleProfileBase}
                handleRoleTypeChange={form.handleRoleTypeChange}
              />
            )}

            {/* ── Botões de ação ────────────────────────────────────── */}
            <div className="pt-2 relative z-0">
              <FormActions
                mode={form.mode}
                registerStep={form.registerStep}
                isLoading={form.isLoading}
                step2Valid={form.step2Valid}
                onBack={() => form.setRegisterStep(1)}
                onGoToLogin={form.goToLogin}
              />
            </div>
          </form>
        </div>

        {/* Link de alternância login ↔ registro */}
        {!isWideCard && form.mode !== 'forgot' && form.mode !== 'reset' && (
          <div className="mt-8 text-center animate-in fade-in duration-500 delay-150">
            <p className="text-sm text-[#A3AED0] font-medium">
              {form.mode === 'login' ? 'Ainda não tem acesso?' : 'Já possui uma conta?'}
              <button
                onClick={form.switchMode}
                className="ml-1.5 text-white hover:text-blue-400 font-bold transition-colors"
              >
                {form.mode === 'login' ? 'Crie sua conta' : 'Faça login'}
              </button>
            </p>
          </div>
        )}
      </div>

      <StatusToast status={form.status} />
    </div>
  );
}