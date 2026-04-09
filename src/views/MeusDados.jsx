import { useState, useEffect } from "react";
import {
  Phone, Mail, MapPin, Briefcase, Check, Loader2, Edit, AlertCircle
} from "lucide-react";
import Label from '../components/ui/Label';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { ButtonPrimary, ButtonGhost } from '../components/ui/Button';
import Divider from '../components/ui/Divider';
import SearchableSelect from '../components/ui/SearchableSelect';

import {
  useAppSelector,
  selectUser,
  selectLocations,
  selectDepartments,
  selectWorkRegimes,
  selectRoles,
  selectRoleTypes,
  selectRegions,
  selectStates,
} from '../store/hooks';
import { useUpdateMeMutation } from '../services/api';

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const ANY = "0";

function buildDiffPayload(profile, user) {
  const payload = {};
  const strChanged = (field, profileField = field) => (profile[profileField] ?? "") !== (user[field] ?? "");
  const idChanged = (field, profileField = field) => String(profile[profileField] ?? ANY) !== String(user[field] ?? ANY);

  if (strChanged("phone"))       payload.phone       = profile.phone       || undefined;
  if (strChanged("email"))       payload.email       = profile.email       || undefined;
  if (strChanged("name"))        payload.name        = profile.name        || undefined;
  if (strChanged("user_key"))    payload.user_key    = profile.user_key    || undefined;
  if (strChanged("observations")) payload.observations = profile.observations || undefined;
  if (strChanged("state"))       payload.state       = profile.state       || undefined;

  if (idChanged("base_id"))      payload.base_id     = profile.base_id !== ANY ? profile.base_id : undefined;
  if (idChanged("region_id"))    payload.region_id   = profile.region_id !== ANY ? parseInt(profile.region_id) : undefined;
  if (idChanged("state_id"))     payload.state_id    = profile.state_id  !== ANY ? parseInt(profile.state_id)  : undefined;

  if (idChanged("role_id"))       payload.role_id       = profile.role_id       !== ANY ? parseInt(profile.role_id)       : undefined;
  if (idChanged("role_type_id"))  payload.role_type_id  = profile.role_type_id  !== ANY ? parseInt(profile.role_type_id)  : undefined;
  if (idChanged("department_id")) payload.department_id = profile.department_id !== ANY ? parseInt(profile.department_id) : undefined;
  if (idChanged("regime_id"))     payload.regime_id     = profile.regime_id     !== ANY ? parseInt(profile.regime_id)     : undefined;

  return payload;
}

function MeusDados() {
  const user        = useAppSelector(selectUser);
  const locations   = useAppSelector(selectLocations);
  const departments = useAppSelector(selectDepartments);
  const workRegimes = useAppSelector(selectWorkRegimes);
  const roles       = useAppSelector(selectRoles);
  const roleTypes   = useAppSelector(selectRoleTypes);
  const regions     = useAppSelector(selectRegions);
  const states      = useAppSelector(selectStates);

  const [updateMe, { isLoading: isSavingProfile }] = useUpdateMeMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    base_id: ANY, region_id: ANY, state_id: ANY,
    role_id: ANY, role_type_id: ANY, department_id: ANY, regime_id: ANY,
    observations: "", phone: "", email: "", name: "", user_key: "", state: "permuta",
  });

  const resetProfile = () => {
    if (user) setProfile({
      base_id:       user.base_id      ?? ANY,
      region_id:     user.region_id    ?? ANY,
      state_id:      user.state_id     ?? ANY,
      role_id:       user.role_id      ?? ANY,
      role_type_id:  user.role_type_id ?? ANY,
      department_id: user.department_id ?? ANY,
      regime_id:     user.regime_id    ?? ANY,
      observations:  user.observations ?? "",
      phone:         user.phone        ?? "",
      email:         user.email        ?? "",
      name:          user.name         ?? "",
      user_key:      user.user_key     ?? "",
      state:         user.state        ?? "permuta",
    });
  };

  useEffect(() => { resetProfile(); }, [user]);

  const diffPayload    = user ? buildDiffPayload(profile, user) : {};
  const profileIsDirty = Object.keys(diffPayload).length > 0;

  const isProfileValid = 
    profile.name.trim() !== '' && profile.phone.trim() !== '' &&
    profile.email.trim() !== '' && profile.user_key.trim().length === 4 &&
    String(profile.state_id) !== ANY && String(profile.region_id) !== ANY &&
    String(profile.base_id) !== ANY && String(profile.role_id) !== ANY &&
    String(profile.role_type_id) !== ANY && String(profile.department_id) !== ANY &&
    String(profile.regime_id) !== ANY;

  // ── Handlers ───────────────────────────────────────────────

  const handleProfileBase = (val) => {
    const loc = locations[val];
    setProfile(f => ({
      ...f, base_id: val,
      region_id: val !== ANY ? (loc?.region_id ?? ANY) : ANY,
      state_id:  val !== ANY ? (loc?.state_id  ?? ANY) : ANY,
    }));
  };

  const handleProfileRegion = (val) => {
    const reg = regions[val];
    setProfile(f => ({
      ...f, base_id: ANY, region_id: val,
      state_id: val !== ANY ? (reg?.state_id ?? ANY) : ANY,
    }));
  };

  const handleProfileState = (e) => setProfile(f => ({ ...f, base_id: ANY, region_id: ANY, state_id: e.target.value }));

  const handleRoleTypeChange = (e) => {
    const newType = e.target.value;
    setProfile(p => {
      const newProfile = { ...p, role_type_id: newType };
      // Se trocou de nível, verifica se o cargo atual pertence a ele. Se não, reseta.
      if (newType !== ANY && p.role_id !== ANY) {
        const roleDef = roles[p.role_id];
        if (roleDef && String(roleDef.role_type_id) !== String(newType)) {
          newProfile.role_id = ANY;
        }
      }
      return newProfile;
    });
  };

  const handleSaveProfile = async () => {
    if (!profileIsDirty || !isProfileValid) return;
    try {
      await updateMe(diffPayload).unwrap();
      setIsEditing(false);
    } catch (e) { console.error(e); }
  };

  // ── Derived ────────────────────────────────────────────────
  const basesForProfile = Object.entries(locations).filter(([, l]) => {
    if (profile.region_id !== ANY) return l.region_id === profile.region_id;
    if (profile.state_id  !== ANY) return l.state_id  === profile.state_id;
    return true;
  });

  const regionsForProfile = Object.entries(regions).filter(([, r]) =>
    profile.state_id === ANY || r.state_id === profile.state_id
  );

  const filteredRoles = Object.entries(roles)
    .filter(([, role]) => profile.role_type_id === ANY || String(role.role_type_id) === String(profile.role_type_id))
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, r]) => ({ value: id, label: r.name }));

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

  const stateOpts  = Object.entries(states);
  const deptOpts   = Object.entries(departments);
  const regimeOpts = Object.entries(workRegimes);
  const rtOpts     = Object.entries(roleTypes);

  // ── Renderização Auxiliar ──────────────────────────────────
  const ReadOnlyText = ({ text, fallback = "—" }) => (
    <div className="w-full bg-slate-900/40 border border-slate-800/60 rounded-lg px-4 py-2.5 flex items-center min-h-[42px] mt-1.5 transition-colors">
      {text ? <span className="text-sm text-slate-200 font-medium">{text}</span> : <span className="text-sm text-slate-500 italic">{fallback}</span>}
    </div>
  );

  const getLabel = (dict, id) => id && String(id) !== ANY ? (dict[String(id)]?.name ?? dict[String(id)]) : null;

  const LocSelects = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4">
      <div className="relative z-50">
        <Label>Estado</Label>
        {isEditing ? (
          <div className="mt-1.5"><Select value={profile.state_id} onChange={handleProfileState} disabled={profile.base_id !== ANY || profile.region_id !== ANY}><option value={ANY}>-</option>{stateOpts.sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([id, s]) => <option key={id} value={id}>{s.name}</option>)}</Select></div>
        ) : <ReadOnlyText text={getLabel(states, profile.state_id)} fallback="Não informado" />}
      </div>
      <div className="relative z-40">
        <Label>Região</Label>
        {isEditing ? (
          <div className="mt-1.5">
            <SearchableSelect 
              value={profile.region_id} 
              onChange={handleProfileRegion} 
              options={filteredRegionsOpts}
              disabled={profile.base_id !== ANY}
              placeholder="-"
            />
          </div>
        ) : <ReadOnlyText text={getLabel(regions, profile.region_id)} fallback="Não informado" />}
      </div>
      <div className="relative z-30">
        <Label>Base</Label>
        {isEditing ? (
          <div className="mt-1.5">
            <SearchableSelect 
              value={profile.base_id} 
              onChange={handleProfileBase} 
              options={filteredBasesOpts}
              placeholder="-"
            />
          </div>
        ) : <ReadOnlyText text={getLabel(locations, profile.base_id)} fallback="Não informado" />}
      </div>
    </div>
  );

  const ProfSelects = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-4">
      <div className="relative z-[60]">
        <Label>Nível</Label>
        {isEditing ? (
          <div className="mt-1.5">
            <Select value={profile.role_type_id} onChange={handleRoleTypeChange}>
              <option value={ANY}>-</option>
              {rtOpts.map(([id, n]) => <option key={id} value={id}>{typeof n === 'string' ? n : n?.name}</option>)}
            </Select>
          </div>
        ) : <ReadOnlyText text={getLabel(roleTypes, profile.role_type_id)} fallback="Não informado" />}
      </div>

      <div className="relative z-[50]">
        <Label>Cargo / Ênfase</Label>
        {isEditing ? (
          <div className="mt-1.5">
            <SearchableSelect 
              value={profile.role_id}
              onChange={(val) => setProfile(p => ({ ...p, role_id: val }))}
              options={filteredRoles}
              placeholder={profile.role_type_id === ANY ? "Selecione o nível..." : "Buscar cargo..."}
            />
          </div>
        ) : <ReadOnlyText text={getLabel(roles, profile.role_id)} fallback="Não informado" />}
      </div>

      <div className="relative z-[40]">
        <Label>Gerência / Depto.</Label>
        {isEditing ? (
          <div className="mt-1.5">
            <SearchableSelect 
              value={profile.department_id}
              onChange={(val) => setProfile(p => ({ ...p, department_id: val }))}
              options={filteredDeptsOpts}
              placeholder="Buscar gerência..."
            />
          </div>
        ) : <ReadOnlyText text={getLabel(departments, profile.department_id)} fallback="Não informado" />}
      </div>

      <div className="relative z-[30]">
        <Label>Regime</Label>
        {isEditing ? (
          <div className="mt-1.5"><Select value={profile.regime_id} onChange={e => setProfile(p => ({ ...p, regime_id: e.target.value }))}><option value={ANY}>-</option>{regimeOpts.map(([id, n]) => <option key={id} value={id}>{typeof n === 'string' ? n : n?.name}</option>)}</Select></div>
        ) : <ReadOnlyText text={getLabel(workRegimes, profile.regime_id)} fallback="Não informado" />}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      <style>{`
        .PhoneInput { display: flex; align-items: center; gap: 0.1rem; }
        .PhoneInputCountry { display: flex; align-items: center; gap: 0.5rem; background-color: rgba(15, 23, 42, 1); border: 1px solid rgba(51, 65, 85, 1); border-radius: 0.5rem; padding: 0 0.75rem; height: 42px; }
        .PhoneInputCountrySelectArrow { color: white; border-right-color: white; border-bottom-color: white; opacity: 0.7; }
        .PhoneInputInput { flex: 1; background-color: rgba(15, 23, 42, 1); border: 1px solid rgba(51, 65, 85, 1); border-radius: 0.5rem; padding: 0.5rem 1rem; color: #e2e8f0; font-size: 0.875rem; height: 42px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .PhoneInputInput:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.5); }
        .PhoneInputInput::placeholder { color: #475569; }
        .PhoneInputCountrySelect option { background-color: #0f172a; color: #e2e8f0; }
      `}</style>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="h-16 pl-16 pr-5 lg:pl-5 border-b border-slate-800 shrink-0">
          <div className="flex justify-between items-center h-full">
            <div>
              <div className="text-sm font-semibold text-slate-200">Meus Dados</div>
              <div className="text-xs text-slate-600 mt-0.5">Gerenciar seu perfil e lotação</div>
            </div>
            {isEditing && (
              <div className="hidden sm:flex items-center gap-3">
                <ButtonGhost onClick={() => { setIsEditing(false); resetProfile(); }}>Cancelar</ButtonGhost>
                <ButtonPrimary onClick={handleSaveProfile} disabled={isSavingProfile || !profileIsDirty || !isProfileValid} className="disabled:opacity-40">
                  {isSavingProfile ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Salvar Alterações
                </ButtonPrimary>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 pb-24 sm:pb-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="bg-gradient-to-r from-amber-900/20 to-transparent border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start shadow-sm">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0"><AlertCircle size={20} /></div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-300">Atenção aos seus dados</h4>
              <p className="text-xs md:text-sm text-slate-300/90 mt-1.5 leading-relaxed">Mantenha as informações sempre atualizadas. <strong>Não deixe campos em branco</strong>, especialmente os de lotação e perfil profissional.</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 md:p-8 shadow-lg">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-lg md:text-2xl font-bold text-white shadow-inner shrink-0">
                  {user?.username?.slice(0, 2).toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg md:text-xl font-bold text-white truncate">{user?.username ?? '—'}</h1>
                  {isEditing ? <div className="mt-1.5"><Input value={profile.name} onChange={e => setProfile(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo" className="w-full" /></div> : <p className="text-sm text-slate-400 mt-1 truncate">{profile.name || <span className="text-slate-600 italic">Sem nome cadastrado</span>}</p>}
                </div>
              </div>
              {!isEditing && <ButtonGhost onClick={() => setIsEditing(true)} className="shrink-0 flex items-center gap-2"><Edit size={16} /> <span className="hidden sm:inline">Editar</span></ButtonGhost>}
            </div>

            <Divider />

            <div className="mt-6 md:mt-8 space-y-4 md:space-y-5">
              <SectionTitle icon={<Phone size={16} />} label="Contato" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4">
                <div>
                  <Label>Celular</Label>
                  {isEditing ? <div className="mt-1.5"><PhoneInput international defaultCountry="BR" value={profile.phone} onChange={(value) => setProfile(f => ({ ...f, phone: value || '' }))} placeholder="(22) 99999-9999" /></div> : <ReadOnlyText text={profile.phone} fallback="Não informado" />}
                </div>
                <div>
                  <Label>E-mail</Label>
                  {isEditing ? <div className="mt-1.5"><Input type="email" value={profile.email} onChange={e => setProfile(f => ({ ...f, email: e.target.value }))} placeholder="seu@email.com" /></div> : <ReadOnlyText text={profile.email} fallback="Não informado" />}
                </div>
                <div>
                  <Label>Chave</Label>
                  {isEditing ? <div className="mt-1.5"><Input value={profile.user_key} onChange={e => { setProfile(f => ({ ...f, user_key: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })); }} maxLength={4} placeholder="Ex: CM0E" /></div> : <ReadOnlyText text={profile.user_key} fallback="Não informado" />}
                </div>
              </div>
            </div>

            <Divider className="mt-6 md:mt-8" />

            <div className="mt-6 md:mt-8 space-y-4 md:space-y-5">
              <SectionTitle icon={<Check size={16} />} label="Status de Permuta" />
              {isEditing ? (
                <div className="max-w-md mt-1.5">
                  <Select value={profile.state} onChange={e => setProfile(f => ({ ...f, state: e.target.value }))}>
                    <option value="permuta">Permuta — precisa de contrapartida</option>
                    <option value="liberado">Liberado — sem contrapartida necessária</option>
                  </Select>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 mt-1.5 w-full bg-slate-900/40 border border-slate-800/60 rounded-lg px-4 py-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${profile.state === 'liberado' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  <span className="text-sm text-slate-200 font-bold">{profile.state === 'liberado' ? 'Liberado' : 'Permuta'}</span>
                  <span className="text-xs md:text-sm text-slate-500 hidden sm:inline">{profile.state === 'liberado' ? '— não precisa de contrapartida para sair' : '— precisa de alguém indo para seu lugar'}</span>
                </div>
              )}
            </div>

            <Divider className="mt-6 md:mt-8" />
            <div className="mt-6 md:mt-8 space-y-4 md:space-y-5">
              <SectionTitle icon={<MapPin size={16} />} label="Lotação Atual" />
              <LocSelects />
            </div>

            <Divider className="mt-6 md:mt-8" />
            <div className="mt-6 md:mt-8 space-y-4 md:space-y-5">
              <SectionTitle icon={<Briefcase size={16} />} label="Perfil Profissional" />
              <ProfSelects />
            </div>

            <Divider className="mt-6 md:mt-8" />
            <div className="mt-6 md:mt-8 space-y-3">
              <Label>Observações</Label>
              {isEditing ? (
                <textarea value={profile.observations} onChange={e => setProfile(f => ({ ...f, observations: e.target.value }))} placeholder="Ex: Prefiro turno administrativo..." rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-700 mt-1.5" />
              ) : <div className="w-full bg-slate-900/40 border border-slate-800/60 rounded-lg px-4 py-3 text-sm text-slate-300 min-h-[80px] whitespace-pre-wrap mt-1.5 italic">{profile.observations || <span className="text-slate-600">Nenhuma observação cadastrada.</span>}</div>}
            </div>

            {isEditing && (
              <div className="fixed bottom-0 left-0 w-full p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 z-50 flex gap-3 sm:hidden shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
                <ButtonGhost onClick={() => { setIsEditing(false); resetProfile(); }} className="flex-1 justify-center bg-slate-900">Cancelar</ButtonGhost>
                <ButtonPrimary onClick={handleSaveProfile} disabled={isSavingProfile || !profileIsDirty || !isProfileValid} className="flex-1 justify-center disabled:opacity-40">{isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Salvar</ButtonPrimary>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, label }) {
  return <div className="flex items-center gap-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500"><span className="text-blue-500/70">{icon}</span>{label}</div>;
}

export default MeusDados;