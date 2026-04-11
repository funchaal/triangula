import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Triangle,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import LoadingTriangle from '../components/ui/LoadingTriangle';
import { 
  useInitQuery, 
  useLoginMutation, 
  useRegisterMutation, 
  useRestoreSessionMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation
} from '../services/api';
import { useAppSelector } from "../store/hooks";
import { selectIsLoggedIn } from "../store/hooks";
import { TOKEN_KEY } from "../constants";

import Label from '../components/ui/Label';
import SearchableSelect from '../components/ui/SearchableSelect';
import {
  selectLocations,
  selectDepartments,
  selectWorkRegimes,
  selectRoles,
  selectRoleTypes,
  selectRegions,
  selectStates,
} from '../store/hooks';

// Importações do Phone Input
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const { isLoading: initLoading } = useInitQuery();
  const [restoreSession, { isLoading: sessionLoading }] = useRestoreSessionMutation();

  useEffect(() => {
    const checkExistingSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      
      if (storedToken && !isLoggedIn) {
        try {
          await restoreSession().unwrap();
        } catch (error) {
          localStorage.removeItem(TOKEN_KEY);
        }
      }
    };

    checkExistingSession();
  }, [restoreSession, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const locations   = useAppSelector(selectLocations);
  const departments = useAppSelector(selectDepartments);
  const workRegimes = useAppSelector(selectWorkRegimes);
  const roles       = useAppSelector(selectRoles);
  const roleTypes   = useAppSelector(selectRoleTypes);
  const regions     = useAppSelector(selectRegions);
  const states      = useAppSelector(selectStates);

  const [mode, setMode] = useState(resetToken ? 'reset' : 'login');
  const [registerStep, setRegisterStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  const ANY = "0";

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    name: '',
    user_key: '',
    state: 'permuta',
    base_id: ANY,
    region_id: ANY,
    state_id: ANY,
    role_id: ANY,
    role_type_id: ANY,
    department_id: ANY,
    regime_id: ANY,
    observations: '',
  });

  const [login,          { isLoading: isLoginLoading }] = useLoginMutation();
  const [register,       { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [resetPassword,  { isLoading: isResetLoading }] = useResetPasswordMutation();

  const isLoading = isLoginLoading || isRegisterLoading || isForgotLoading || isResetLoading;

  const isStep2Valid = 
    formData.name.trim() !== '' &&
    formData.user_key.trim().length === 4 &&
    String(formData.state_id) !== ANY &&
    String(formData.region_id) !== ANY &&
    String(formData.base_id) !== ANY &&
    String(formData.role_id) !== ANY &&
    String(formData.role_type_id) !== ANY &&
    String(formData.department_id) !== ANY &&
    String(formData.regime_id) !== ANY;

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'user_key') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleProfileBase = (val) => {
    const loc = locations[val];
    setFormData(f => ({
      ...f, base_id: val,
      region_id: val !== ANY ? (loc?.region_id ?? ANY) : ANY,
      state_id:  val !== ANY ? (loc?.state_id  ?? ANY) : ANY,
    }));
  };

  const handleProfileRegion = (val) => {
    const reg = regions[val];
    setFormData(f => ({
      ...f, base_id: ANY, region_id: val,
      state_id: val !== ANY ? (reg?.state_id ?? ANY) : ANY,
    }));
  };

  const handleProfileState = (e) => {
    setFormData(f => ({ ...f, base_id: ANY, region_id: ANY, state_id: e.target.value }));
  };

  const handleRoleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(f => {
      const newForm = { ...f, role_type_id: newType };
      if (newType !== ANY && f.role_id !== ANY) {
        const roleDef = roles[f.role_id];
        const currentTypeId = typeof roleDef === 'object' ? roleDef?.role_type_id : ANY;
        if (String(currentTypeId) !== String(newType)) {
          newForm.role_id = ANY;
        }
      }
      return newForm;
    });
  };

  const basesForProfile = Object.entries(locations || {}).filter(([, l]) => {
    if (formData.region_id !== ANY) return String(l.region_id) === String(formData.region_id);
    if (formData.state_id  !== ANY) return String(l.state_id)  === String(formData.state_id);
    return true;
  });

  const regionsForProfile = Object.entries(regions || {}).filter(([, r]) =>
    formData.state_id === ANY || String(r.state_id) === String(formData.state_id)
  );

  const filteredRoles = Object.entries(roles || {})
    .filter(([, role]) => {
      const typeId = typeof role === 'object' ? role?.role_type_id : ANY;
      return formData.role_type_id === ANY || String(typeId) === String(formData.role_type_id);
    })
    .sort((a, b) => {
      const nameA = typeof a[1] === 'string' ? a[1] : (a[1]?.name || "");
      const nameB = typeof b[1] === 'string' ? b[1] : (b[1]?.name || "");
      return nameA.localeCompare(nameB);
    })
    .map(([id, r]) => ({
      value: id,
      label: typeof r === 'string' ? r : (r?.name || "Desconhecido")
    }));

    const filteredRegionsOpts = regionsForProfile
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, r]) => ({ value: id, label: r.name }));

  const filteredBasesOpts = basesForProfile
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, l]) => ({ value: id, label: l.name }));

  const filteredDeptsOpts = Object.entries(departments || {})
    .sort((a, b) => {
      const nameA = typeof a[1] === 'string' ? a[1] : (a[1]?.name || "");
      const nameB = typeof b[1] === 'string' ? b[1] : (b[1]?.name || "");
      return nameA.localeCompare(nameB);
    })
    .map(([id, d]) => ({ 
      value: id, 
      label: typeof d === 'string' ? d : (d?.name || "Desconhecido") 
    }));

  // Classes atualizadas baseadas na nova UI
  const inputBaseClasses = "w-full bg-[#0B1437] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-[#111C44] transition-all placeholder:text-[#A3AED0]/50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Estilo inline para selects nativos terem a setinha correta
  const nativeSelectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23A3AED0' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 1rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1.2em 1.2em',
    paddingRight: '2.5rem',
    appearance: 'none'
  };

  const stateOpts  = Object.entries(states || {});
  const regimeOpts = Object.entries(workRegimes || {});
  const rtOpts     = Object.entries(roleTypes || {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'register' && registerStep === 1) {
        setRegisterStep(2);
        return;
    }

    setStatus({ type: null, message: '' });

    try {
      if (mode === 'login') {
        await login({
          username: formData.username,
          password: formData.password,
        }).unwrap();

        setStatus({ type: 'success', message: 'Login realizado! Redirecionando...' });
        setTimeout(() => navigate('/'), 800);

      } else if (mode === 'register') {
        await register({
          username: formData.username,
          password: formData.password,
          email:    formData.email,
          phone:    formData.phone,
          name: formData.name,
          user_key: formData.user_key,
          state: formData.state,
          base_id: formData.base_id !== ANY ? String(formData.base_id) : undefined,
          region_id: formData.region_id !== ANY ? parseInt(formData.region_id) : undefined,
          state_id: formData.state_id !== ANY ? parseInt(formData.state_id) : undefined,
          role_id: formData.role_id !== ANY ? parseInt(formData.role_id) : undefined,
          role_type_id: formData.role_type_id !== ANY ? parseInt(formData.role_type_id) : undefined,
          department_id: formData.department_id !== ANY ? parseInt(formData.department_id) : undefined,
          regime_id: formData.regime_id !== ANY ? parseInt(formData.regime_id) : undefined,
          observations: formData.observations,
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
      const detail = err?.data?.detail;
      let errorMessage = 'Erro ao processar solicitação. Tente novamente.';

      if (typeof detail === 'string') {
        if (detail === 'Credenciais inválidas') errorMessage = 'Usuário ou senha incorretos.';
        else if (detail === 'Username já cadastrado') errorMessage = 'Este nome de usuário já está em uso.';
        else errorMessage = detail;
      } else if (Array.isArray(detail)) {
        console.error("Erro de validação do Pydantic:", detail);
        errorMessage = 'Verifique os campos preenchidos. Alguns dados estão inválidos ou faltando.';
      } else if (mode === 'reset' && !detail) {
         errorMessage = 'O link de redefinição é inválido ou expirou.';
      }

      setStatus({ type: 'error', message: errorMessage });
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setRegisterStep(1);
    setStatus({ type: null, message: '' });
  };

  if (sessionLoading || initLoading) {
    return (
       <div className="h-screen w-full bg-[#0B1437] flex items-center justify-center">
              <div className="flex flex-col items-center gap-5">
                {/* Usando o LoadingTriangle grande para a tela inicial */}
                <LoadingTriangle size={48} />
                <div className="text-[#A3AED0] text-sm font-bold uppercase tracking-widest animate-pulse mt-2">
                  Iniciando Triangula...
                </div>
              </div>
            </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#0B1437] flex flex-col items-center justify-center p-4 py-8 md:py-12 font-sans selection:bg-blue-500/30 overflow-x-hidden overflow-y-auto relative z-0">
      
      {/* Estilos para customizar PhoneInput no escuro */}
      <style>{`
        .PhoneInput { display: flex; align-items: center; gap: 0.2rem; }
        .PhoneInputCountry { display: flex; align-items: center; gap: 0.5rem; background-color: #0B1437; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.75rem; padding: 0 0.75rem; height: 46px; transition: background-color 0.2s; }
        .PhoneInputCountry:hover { background-color: #111C44; }
        .PhoneInputCountrySelectArrow { color: #A3AED0; border-right-color: #A3AED0; border-bottom-color: #A3AED0; opacity: 0.8; }
        .PhoneInputInput { flex: 1; background-color: #0B1437; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.75rem; padding: 0.5rem 1rem; color: white; font-size: 0.875rem; height: 46px; outline: none; transition: all 0.2s; }
        .PhoneInputInput:focus { border-color: #3b82f6; background-color: #111C44; }
        .PhoneInputInput::placeholder { color: rgba(163, 174, 208, 0.5); }
        .PhoneInputCountrySelect option { background-color: #1B254B; color: white; }
      `}</style>

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header / Logo */}
      <div className="mb-8 flex flex-col items-center shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-6">
          <Triangle className="text-white fill-white/20" size={32} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide text-center">
          {mode === 'login' && 'Acesse o Triangula'}
          {mode === 'register' && 'Crie sua conta'}
          {mode === 'forgot' && 'Recuperar Senha'}
          {mode === 'reset' && 'Criar Nova Senha'}
        </h1>
        <p className="text-[#A3AED0] text-sm mt-2.5 text-center max-w-sm leading-relaxed">
          {mode === 'login' && 'Gerencie seus interesses de permuta com facilidade.'}
          {mode === 'register' && 'Conecte-se às melhores oportunidades de movimentação.'}
          {mode === 'forgot' && 'Vamos te ajudar a recuperar o acesso à sua conta.'}
          {mode === 'reset' && 'Quase lá! Defina sua nova senha de acesso.'}
        </p>
      </div>

      {/* Main Card */}
      <div className={`w-full transition-all duration-500 ${mode === 'register' && registerStep === 2 ? 'max-w-4xl' : 'max-w-[420px]'}`}>
        <div className={`bg-[#111C44] border border-white/5 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 ${mode === 'register' && registerStep === 2 ? 'p-6 sm:p-8' : 'p-6 sm:p-10'}`}>
          
          {mode === 'register' && (
            <div className="flex items-center gap-2.5 mb-8">
              <div className={`h-1.5 flex-1 rounded-full transition-colors ${registerStep >= 1 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-colors ${registerStep >= 2 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {mode === 'forgot' && (
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
                    className={inputBaseClasses}
                  />
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <Label>Nova Senha</Label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={`${inputBaseClasses} pr-12 tracking-widest placeholder:tracking-normal`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-white transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(mode === 'login' || (mode === 'register' && registerStep === 1)) && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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
                    className={inputBaseClasses}
                  />
                </div>

                {mode === 'register' && (
                  <>
                    <div className="space-y-1.5">
                      <Label>E-mail pessoal</Label>
                      <input
                        required
                        type="email"
                        name="email"
                        placeholder="Ex: rafael@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputBaseClasses}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Telefone / Celular</Label>
                      <PhoneInput
                        international
                        defaultCountry="BR"
                        value={formData.phone}
                        onChange={(value) => setFormData({ ...formData, phone: value || '' })}
                        placeholder="(22) 99999-9999"
                        numberInputProps={{
                          className: "bg-transparent text-sm text-white focus:outline-none placeholder:text-[#A3AED0]/50 w-full",
                          required: true
                        }}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center mb-1">
                    <Label className="mb-0">Senha</Label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setStatus({ type: null, message: '' });
                        }}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className={`${inputBaseClasses} pr-12 tracking-widest placeholder:tracking-normal`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-white transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === 'register' && registerStep === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {/* Bloco 1: Dados Pessoais */}
                  <div className="bg-[#0B1437] border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A3AED0] mb-2">Identificação</h3>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Nome Completo</Label>
                            <input 
                                required 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="Ex: Rafael Funchal"
                                className={inputBaseClasses}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Chave</Label>
                                <input 
                                    required
                                    name="user_key" 
                                    value={formData.user_key} 
                                    onChange={handleChange} 
                                    maxLength={4} 
                                    placeholder="Ex: CM0E"
                                    className={inputBaseClasses}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Status</Label>
                                <select style={nativeSelectStyle} name="state" value={formData.state} onChange={handleChange} className={inputBaseClasses}>
                                    <option className="bg-[#1B254B] text-white" value="permuta">Permuta</option>
                                    <option className="bg-[#1B254B] text-white" value="liberado">Liberado</option>
                                </select>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Bloco 2: Lotação */}
                  <div className="bg-[#0B1437] border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A3AED0] mb-2">Sua Lotação Atual</h3>
                    <div className="space-y-4">
                        <div className="space-y-1.5 relative z-50">
                            <Label>Estado</Label>
                            <select style={nativeSelectStyle} name="state_id" value={formData.state_id} onChange={handleProfileState} disabled={formData.base_id !== ANY || formData.region_id !== ANY} className={inputBaseClasses}>
                                <option className="bg-[#1B254B] text-white" value={ANY}>- Selecione -</option>
                                {stateOpts.sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([id, s]) => <option className="bg-[#1B254B] text-white" key={id} value={id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 relative z-40">
                                <Label>Região</Label>
                                <SearchableSelect 
                                  options={filteredRegionsOpts}
                                  value={formData.region_id}
                                  onChange={handleProfileRegion}
                                  disabled={formData.base_id !== ANY}
                                  inputClassName={inputBaseClasses}
                                  placeholder="- Selecione -"
                                />
                            </div>
                            <div className="space-y-1.5 relative z-30">
                                <Label>Base</Label>
                                <SearchableSelect 
                                  options={filteredBasesOpts}
                                  value={formData.base_id}
                                  onChange={handleProfileBase}
                                  inputClassName={inputBaseClasses}
                                  placeholder="- Selecione -"
                                />
                            </div>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Bloco 3: Perfil */}
                <div className="bg-[#0B1437] border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4 relative z-20">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A3AED0] mb-2">Perfil Profissional</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5 relative z-[60]">
                          <Label>Nível</Label>
                          <select style={nativeSelectStyle} name="role_type_id" value={formData.role_type_id} onChange={handleRoleTypeChange} className={inputBaseClasses}>
                              <option className="bg-[#1B254B] text-white" value={ANY}>- Selecione -</option>
                              {rtOpts.map(([id, n]) => <option className="bg-[#1B254B] text-white" key={id} value={id}>{typeof n === 'string' ? n : n?.name}</option>)}
                          </select>
                      </div>
                      <div className="space-y-1.5 relative z-[50]">
                          <Label>Cargo / Ênfase</Label>
                          <SearchableSelect 
                            value={formData.role_id}
                            onChange={(val) => setFormData(f => ({ ...f, role_id: val }))}
                            options={filteredRoles}
                            placeholder={formData.role_type_id === ANY ? "Selecione o nível..." : "Buscar cargo..."}
                            inputClassName={inputBaseClasses}
                          />
                      </div>
                      <div className="space-y-1.5 relative z-[40]">
                          <Label>Gerência / Depto.</Label>
                          <SearchableSelect 
                            value={formData.department_id}
                            onChange={(val) => setFormData(f => ({ ...f, department_id: val }))}
                            options={filteredDeptsOpts}
                            placeholder="- Selecione -"
                            inputClassName={inputBaseClasses}
                          />
                      </div>
                      <div className="space-y-1.5 relative z-[30]">
                          <Label>Regime</Label>
                          <select style={nativeSelectStyle} name="regime_id" value={formData.regime_id} onChange={handleChange} className={inputBaseClasses}>
                              <option className="bg-[#1B254B] text-white" value={ANY}>- Selecione -</option>
                              {regimeOpts.map(([id, n]) => <option className="bg-[#1B254B] text-white" key={id} value={id}>{typeof n === 'string' ? n : n?.name}</option>)}
                          </select>
                      </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-2">
                      <Label>Observações Adicionais (Opcional)</Label>
                      <textarea
                          name="observations"
                          value={formData.observations}
                          onChange={handleChange}
                          placeholder="Ex: Prefiro turno administrativo, disponibilidade para embarque..."
                          rows={2}
                          className={`${inputBaseClasses} resize-none`}
                      />
                  </div>
                </div>
              </div>
            )}

            {/* AÇÕES (Botões) */}
            <div className="pt-2 relative z-0">
                {mode === 'forgot' ? (
                    <div className="flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-white/5 disabled:text-[#A3AED0]/50 text-white font-bold h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(59,130,246,0.25)] disabled:shadow-none"
                        >
                            {isLoading ? <LoadingTriangle size={20} /> : 'Enviar link de recuperação'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                              setMode('login');
                              setStatus({ type: null, message: '' });
                            }}
                            className="w-full bg-transparent hover:bg-white/5 text-[#A3AED0] hover:text-white font-semibold h-12 rounded-xl text-sm transition-all"
                        >
                            Voltar para o login
                        </button>
                    </div>
                ) : mode === 'reset' ? (
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-[#A3AED0]/50 text-white font-bold h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.25)] disabled:shadow-none"
                    >
                        {isLoading ? <LoadingTriangle size={20} /> : 'Salvar Nova Senha'}
                    </button>
                ) : mode === 'register' && registerStep === 1 ? (
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(59,130,246,0.25)]"
                    >
                        Continuar <ArrowRight size={18} />
                    </button>
                ) : mode === 'register' && registerStep === 2 ? (
                    <div className="flex flex-col-reverse sm:flex-row gap-4 mt-2">
                        <button
                            type="button"
                            onClick={() => setRegisterStep(1)}
                            className="w-full sm:w-1/3 bg-white/5 hover:bg-white/10 text-[#A3AED0] hover:text-white font-semibold h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} /> Voltar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !isStep2Valid}
                            className="w-full sm:flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-[#A3AED0]/50 text-white font-bold h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.25)] disabled:shadow-none"
                        >
                            {isLoading ? <LoadingTriangle size={20} /> : 'Finalizar Cadastro'}
                        </button>
                    </div>
                ) : (
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-white/5 disabled:text-[#A3AED0]/50 text-white font-bold h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(59,130,246,0.25)] disabled:shadow-none"
                    >
                        {isLoading ? <LoadingTriangle size={20} /> : 'Entrar na plataforma'}
                    </button>
                )}
            </div>
          </form>
        </div>

        {/* FOOTER */}
        {!(mode === 'register' && registerStep === 2) && mode !== 'forgot' && mode !== 'reset' && (
          <div className="mt-8 text-center animate-in fade-in duration-500 delay-150">
            <p className="text-sm text-[#A3AED0] font-medium">
              {mode === 'login' ? 'Ainda não tem acesso?' : 'Já possui uma conta?'}
              <button
                onClick={switchMode}
                className="ml-1.5 text-white hover:text-blue-400 font-bold transition-colors"
              >
                {mode === 'login' ? 'Crie sua conta' : 'Faça login'}
              </button>
            </p>
          </div>
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      {status.message && (
        <div className={`fixed bottom-6 md:bottom-auto md:top-8 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto min-w-[320px] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-top-4 duration-300 border z-50 bg-[#111C44] ${
          status.type === 'success'
            ? 'border-emerald-500/30 text-emerald-400'
            : 'border-red-500/30 text-red-400'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
          <span className="text-sm font-semibold text-white tracking-wide">{status.message}</span>
        </div>
      )}
    </div>
  );
}