// ─────────────────────────────────────────────────────────────────────────────
// index.jsx — View principal: Meus Dados
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Briefcase, Check, Loader2, Edit } from "lucide-react";

import Label    from '../../components/ui/Label';
import Select   from '../../components/ui/Select';
import Input    from '../../components/ui/Input';
import { ButtonPrimary, ButtonGhost } from '../../components/ui/Button';
import LoadingTriangle from '../../components/ui/LoadingTriangle';

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
} from '../../store/hooks';
import { useUpdateMeMutation } from '../../services/api';

import {
  ANY,
  EMPTY_PROFILE,
  buildDiffPayload,
  profileFromUser,
  isProfileValid,
} from './helpers';

import AlertaBanner    from './components/AlertaBanner';
import SectionTitle    from './components/SectionTitle';
import ReadOnlyText    from './components/ReadOnlyText';
import LotacaoSelects  from './components/LotacaoSelects';
import PerfilSelects   from './components/PerfilSelects';
import PhoneInputStyles from './components/PhoneInputStyles';

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
  const [profile,   setProfile]   = useState(EMPTY_PROFILE);

  const resetProfile = () => { if (user) setProfile(profileFromUser(user)); };

  useEffect(() => { resetProfile(); }, [user]);

  const diffPayload    = user ? buildDiffPayload(profile, user) : {};
  const profileIsDirty = Object.keys(diffPayload).length > 0;
  const profileValido  = isProfileValid(profile);

  const filteredRoles = Object.entries(roles)
    .filter(([, role]) =>
      profile.role_type_id === ANY ||
      String(role.role_type_id) === String(profile.role_type_id)
    )
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, r]) => ({ value: id, label: r.name }));

  const filteredRegionsOpts = Object.entries(regions)
    .filter(([, r]) =>
      profile.state_id === ANY || r.state_id === profile.state_id
    )
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, r]) => ({ value: id, label: r.name }));

  const filteredBasesOpts = Object.entries(locations)
    .filter(([, l]) => {
      if (profile.region_id !== ANY) return l.region_id === profile.region_id;
      if (profile.state_id  !== ANY) return l.state_id  === profile.state_id;
      return true;
    })
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
      label: typeof d === 'string' ? d : (d?.name || "Desconhecido"),
    }));

  const stateOpts  = Object.entries(states);
  const regimeOpts = Object.entries(workRegimes);
  const rtOpts     = Object.entries(roleTypes);

  const handleSaveProfile = async () => {
    if (!profileIsDirty || !profileValido) return;
    try {
      await updateMe(diffPayload).unwrap();
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelar = () => {
    setIsEditing(false);
    resetProfile();
  };

  return (
    <div className="h-full flex flex-col bg-[#03072a] overflow-hidden">
      <PhoneInputStyles />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Cabeçalho App-Style */}
        <div className="pt-6 sm:pt-6 pb-4 sm:pb-5 pl-5 pr-6 lg:pl-8 shrink-0">
          <div className="flex justify-between items-center h-full">
            <div>
              <h1 className="text-2xl lg:text-2xl font-bold text-white leading-none tracking-wide">
                Meus Dados
              </h1>
              <div className="text-xs lg:text-sm text-[#A3AED0] mt-0 font-medium">
                Gerenciar seu perfil e lotação
              </div>
            </div>

            {/* Botões de ação — versão desktop */}
            {isEditing && (
              <div className="hidden sm:flex items-center gap-3">
                <ButtonGhost onClick={handleCancelar}>Cancelar</ButtonGhost>
                <ButtonPrimary
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile || !profileIsDirty || !profileValido}
                  className="disabled:opacity-40"
                >
                  {isSavingProfile
                    ? <LoadingTriangle size={18} />
                    : <Check size={18} />
                  }
                  Salvar Alterações
                </ButtonPrimary>
              </div>
            )}
          </div>
        </div>

        {/* Área de conteúdo */}
        <div className="flex-1 overflow-y-auto pb-24 sm:pb-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          <div className="px-4 lg:px-8 pb-8 pt-2 space-y-6 md:space-y-8">

            <AlertaBanner />

            {/* Card principal */}
            <div className="bg-[#111C44] rounded-3xl p-6 md:p-8 shadow-2xl">

              {/* ── Avatar + nome ─────────────────────────────────────── */}
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
                  <div className="w-14 h-14 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xl md:text-1xl font-bold text-white shrink-0">
                    {user?.username?.slice(0, 2).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="mt-1">
                        <Input
                          value={profile.name}
                          onChange={e => setProfile(f => ({ ...f, name: e.target.value }))}
                          placeholder="Nome completo"
                          className="w-full font-semibold"
                        />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-xl md:text-xl font-bold text-white truncate">
                          {profile.name || <span className="text-[#A3AED0]/50 italic">Sem nome completo cadastrado</span>}
                        </h1>
                        <p className="text-sm text-[#A3AED0] mt-0 truncate font-medium">
                          @{user?.username ?? '—'}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Botão de editar */}
                {!isEditing && (
                  <ButtonGhost onClick={() => setIsEditing(true)} className="shrink-0 flex items-center gap-2">
                    <Edit size={16} />
                    <span className="hidden sm:inline">Editar Perfil</span>
                  </ButtonGhost>
                )}
              </div>

              <div className="h-px w-full bg-white/5 my-8" />

              {/* ── Contato ───────────────────────────────────────────── */}
              <div className="space-y-5">
                <SectionTitle icon={<Phone size={18} />} label="Contato" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">

                  <div>
                    <Label>Celular</Label>
                    {isEditing ? (
                      <div className="mt-1.5">
                        <PhoneInput
                          international
                          defaultCountry="BR"
                          value={profile.phone}
                          onChange={(value) => setProfile(f => ({ ...f, phone: value || '' }))}
                          placeholder="(22) 99999-9999"
                        />
                      </div>
                    ) : (
                      <ReadOnlyText text={profile.phone} fallback="Não informado" />
                    )}
                  </div>

                  <div>
                    <Label>E-mail</Label>
                    {isEditing ? (
                      <div className="mt-1.5">
                        <Input
                          type="email"
                          value={profile.email}
                          onChange={e => setProfile(f => ({ ...f, email: e.target.value }))}
                          placeholder="seu@email.com"
                        />
                      </div>
                    ) : (
                      <ReadOnlyText text={profile.email} fallback="Não informado" />
                    )}
                  </div>

                  <div>
                    <Label>Chave</Label>
                    {isEditing ? (
                      <div className="mt-1.5">
                        <Input
                          value={profile.user_key}
                          onChange={e => setProfile(f => ({
                            ...f,
                            user_key: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                          }))}
                          maxLength={4}
                          placeholder="Ex: CM0E"
                        />
                      </div>
                    ) : (
                      <ReadOnlyText text={profile.user_key} fallback="Não informado" />
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-white/5 my-8" />

              {/* ── Status de permuta ─────────────────────────────────── */}
              <div className="space-y-5">
                <SectionTitle icon={<Check size={18} />} label="Status de Permuta" />
                {isEditing ? (
                  <div className="max-w-md mt-1.5">
                    <Select
                      value={profile.state}
                      onChange={e => setProfile(f => ({ ...f, state: e.target.value }))}
                    >
                      <option value="permuta">Permuta — precisa de contrapartida</option>
                      <option value="liberado">Liberado — sem contrapartida necessária</option>
                    </Select>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 mt-1.5 w-full bg-[#0B1437] border border-white/10 rounded-xl px-5 py-3.5">
                    <span className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${profile.state === 'liberado' ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-blue-400 shadow-blue-400/50'}`} />
                    <span className="text-sm md:text-base text-white font-bold">
                      {profile.state === 'liberado' ? 'Liberado' : 'Permuta'}
                    </span>
                    <span className="text-xs md:text-sm text-[#A3AED0] hidden sm:inline ml-1 font-medium">
                      {profile.state === 'liberado'
                        ? '— não precisa de contrapartida para sair'
                        : '— precisa de alguém indo para seu lugar'
                      }
                    </span>
                  </div>
                )}
              </div>

              <div className="h-px w-full bg-white/5 my-8" />

              {/* ── Lotação Atual ─────────────────────────────────────── */}
              <div className="space-y-5">
                <SectionTitle icon={<MapPin size={18} />} label="Lotação Atual" />
                <LotacaoSelects
                  profile={profile}
                  setProfile={setProfile}
                  isEditing={isEditing}
                  states={states}
                  regions={regions}
                  locations={locations}
                  stateOpts={stateOpts}
                  filteredRegionsOpts={filteredRegionsOpts}
                  filteredBasesOpts={filteredBasesOpts}
                />
              </div>

              <div className="h-px w-full bg-white/5 my-8" />

              {/* ── Perfil Profissional ───────────────────────────────── */}
              <div className="space-y-5">
                <SectionTitle icon={<Briefcase size={18} />} label="Perfil Profissional" />
                <PerfilSelects
                  profile={profile}
                  setProfile={setProfile}
                  isEditing={isEditing}
                  roleTypes={roleTypes}
                  roles={roles}
                  departments={departments}
                  workRegimes={workRegimes}
                  rtOpts={rtOpts}
                  regimeOpts={regimeOpts}
                  filteredRoles={filteredRoles}
                  filteredDeptsOpts={filteredDeptsOpts}
                />
              </div>

              <div className="h-px w-full bg-white/5 my-8" />

              {/* ── Observações ───────────────────────────────────────── */}
              <div className="space-y-4">
                <Label>Observações</Label>
                {isEditing ? (
                  <textarea
                    value={profile.observations}
                    onChange={e => setProfile(f => ({ ...f, observations: e.target.value }))}
                    placeholder="Ex: Prefiro turno administrativo..."
                    rows={4}
                    className="w-full bg-[#0B1437] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-[#111C44] transition-all resize-none placeholder:text-[#A3AED0]/50 mt-1.5"
                  />
                ) : (
                  <div className="w-full bg-[#0B1437] border border-white/10 rounded-xl px-5 py-4 text-sm text-white/90 min-h-[90px] whitespace-pre-wrap mt-1.5 italic leading-relaxed">
                    {profile.observations || <span className="text-[#A3AED0]/50">Nenhuma observação cadastrada.</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Botões mobile ────────────── */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-[#111C44] backdrop-blur-md border-t border-white/10 z-10 flex gap-3 sm:hidden">
          <ButtonGhost onClick={handleCancelar} className="flex-1 justify-center">
            Cancelar
          </ButtonGhost>
          <ButtonPrimary
            onClick={handleSaveProfile}
            disabled={isSavingProfile || !profileIsDirty || !profileValido}
            className="flex-1 justify-center disabled:opacity-40"
          >
            {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Salvar
          </ButtonPrimary>
        </div>
      )}
    </div>
  );
}

export default MeusDados;