// ─────────────────────────────────────────────────────────────────────────────
// hooks/useLoginForm.js — Estado, handlers e submit da view Login
// Centraliza toda a lógica para manter o index.jsx e os forms limpos
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

import {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '../../../services/api';
import { useAppSelector } from '../../../store/hooks';
import {
  selectLocations, selectRegions, selectRoles,
} from '../../../store/hooks';

import { ANY, EMPTY_FORM, isStep2Valid, parseApiError } from '../helpers';

/**
 * Hook principal da view Login.
 * Retorna todo o estado, handlers derivados e a função de submit.
 */
export function useLoginForm() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  // ── Mutations ──────────────────────────────────────────────────────────────
  const [login,          { isLoading: isLoginLoading    }] = useLoginMutation();
  const [register,       { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [forgotPassword, { isLoading: isForgotLoading   }] = useForgotPasswordMutation();
  const [resetPassword,  { isLoading: isResetLoading    }] = useResetPasswordMutation();

  const isLoading = isLoginLoading || isRegisterLoading || isForgotLoading || isResetLoading;

  // ── Dados de referência para os selects do passo 2 ────────────────────────
  const locations = useAppSelector(selectLocations);
  const regions   = useAppSelector(selectRegions);
  const roles     = useAppSelector(selectRoles);

  // ── Estado local ──────────────────────────────────────────────────────────
  const [mode,         setMode]         = useState(resetToken ? 'reset' : 'login');
  const [registerStep, setRegisterStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [status,       setStatus]       = useState({ type: null, message: '' });
  const [formData,     setFormData]     = useState(EMPTY_FORM);

  // ── Handlers de campo genérico ────────────────────────────────────────────

  /** Handler padrão para inputs de texto e selects nativos */
  const handleChange = (e) => {
    let { name, value } = e.target;
    // Chave do usuário: apenas alfanumérico maiúsculo
    if (name === 'user_key') value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setFormData(f => ({ ...f, [name]: value }));
  };

  // ── Handlers de localização (estado > região > base em cascata) ───────────

  /** Selecionar base preenche região e estado automaticamente */
  const handleProfileBase = (val) => {
    const loc = locations[val];
    setFormData(f => ({
      ...f,
      base_id:   val,
      region_id: val !== ANY ? (loc?.region_id ?? ANY) : ANY,
      state_id:  val !== ANY ? (loc?.state_id  ?? ANY) : ANY,
    }));
  };

  /** Selecionar região preenche estado e limpa base */
  const handleProfileRegion = (val) => {
    const reg = regions[val];
    setFormData(f => ({
      ...f,
      base_id:   ANY,
      region_id: val,
      state_id:  val !== ANY ? (reg?.state_id ?? ANY) : ANY,
    }));
  };

  /** Selecionar estado limpa região e base */
  const handleProfileState = (e) => {
    setFormData(f => ({ ...f, base_id: ANY, region_id: ANY, state_id: e.target.value }));
  };

  /** Ao mudar o nível (role_type), reseta o cargo se ele não pertencer ao novo tipo */
  const handleRoleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(f => {
      const updated = { ...f, role_type_id: newType };
      if (newType !== ANY && f.role_id !== ANY) {
        const roleDef    = roles[f.role_id];
        const currentTypeId = typeof roleDef === 'object' ? roleDef?.role_type_id : ANY;
        if (String(currentTypeId) !== String(newType)) updated.role_id = ANY;
      }
      return updated;
    });
  };

  // ── Navegação entre modos ─────────────────────────────────────────────────

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setRegisterStep(1);
    setStatus({ type: null, message: '' });
  };

  const goToForgot = () => {
    setMode('forgot');
    setStatus({ type: null, message: '' });
  };

  const goToLogin = () => {
    setMode('login');
    setStatus({ type: null, message: '' });
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Passo 1 do registro: apenas avança para o passo 2
    if (mode === 'register' && registerStep === 1) {
      setRegisterStep(2);
      return;
    }

    setStatus({ type: null, message: '' });

    try {
      if (mode === 'login') {
        await login({ username: formData.username, password: formData.password }).unwrap();
        setStatus({ type: 'success', message: 'Login realizado! Redirecionando...' });
        setTimeout(() => navigate('/'), 800);

      } else if (mode === 'register') {
        await register({
          username:      formData.username,
          password:      formData.password,
          email:         formData.email,
          phone:         formData.phone,
          name:          formData.name,
          user_key:      formData.user_key,
          state:         formData.state,
          base_id:       formData.base_id      !== ANY ? String(formData.base_id)            : undefined,
          region_id:     formData.region_id    !== ANY ? parseInt(formData.region_id)        : undefined,
          state_id:      formData.state_id     !== ANY ? parseInt(formData.state_id)         : undefined,
          role_id:       formData.role_id      !== ANY ? parseInt(formData.role_id)          : undefined,
          role_type_id:  formData.role_type_id !== ANY ? parseInt(formData.role_type_id)     : undefined,
          department_id: formData.department_id!== ANY ? parseInt(formData.department_id)    : undefined,
          regime_id:     formData.regime_id    !== ANY ? parseInt(formData.regime_id)        : undefined,
          observations:  formData.observations,
        }).unwrap();
        setStatus({ type: 'success', message: 'Conta criada com sucesso! Bem-vindo ao Triangula.' });
        setTimeout(() => navigate('/'), 800);

      } else if (mode === 'forgot') {
        await forgotPassword({ username: formData.username }).unwrap();
        setStatus({ type: 'success', message: 'Se o usuário existir, um e-mail foi enviado com as instruções.' });
        setTimeout(() => setMode('login'), 0);

      } else if (mode === 'reset') {
        await resetPassword({ token: resetToken, new_password: formData.password }).unwrap();
        setStatus({ type: 'success', message: 'Senha redefinida com sucesso! Faça login.' });
        setTimeout(() => {
          navigate(location.pathname, { replace: true });
          setMode('login');
          setFormData(f => ({ ...f, password: '' }));
        }, 0);
      }
    } catch (err) {
      setStatus({ type: 'error', message: parseApiError(err, mode) });
    }
  };

  return {
    // Estado
    mode, registerStep, showPassword, status, formData, isLoading, resetToken,
    // Setters simples
    setFormData, setRegisterStep, setShowPassword,
    // Handlers
    handleChange, handleProfileBase, handleProfileRegion,
    handleProfileState, handleRoleTypeChange,
    handleSubmit, switchMode, goToForgot, goToLogin,
    // Derivados
    step2Valid: isStep2Valid(formData),
  };
}