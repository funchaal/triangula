// ─────────────────────────────────────────────────────────────────────────────
// index.jsx — View principal: Meus Interesses
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Plus } from "lucide-react";

import { ButtonPrimary } from '../../components/ui/Button';

import {
  useAppSelector,
  selectinterests,
  selectLocations,
  selectDepartments,
  selectWorkRegimes,
  selectRoles,
  selectRoleTypes,
  selectRegions,
  selectStates,
} from '../../store/hooks';
import {
  useCreateinterestMutation,
  useDeleteinterestMutation,
} from '../../services/api';

import { ANY, EMPTY_INTEREST } from './helpers';

import DicaBanner    from './components/DicaBanner';
import EstadoVazio   from './components/EstadoVazio';
import InteresseCard from './components/InteresseCard';
import InteresseForm from './components/InteresseForm';

function MeusInteresses() {
  const interests   = useAppSelector(selectinterests);
  const locations   = useAppSelector(selectLocations);
  const departments = useAppSelector(selectDepartments);
  const workRegimes = useAppSelector(selectWorkRegimes);
  const roles       = useAppSelector(selectRoles);
  const roleTypes   = useAppSelector(selectRoleTypes);
  const regions     = useAppSelector(selectRegions);
  const states      = useAppSelector(selectStates);

  const [createinterest, { isLoading: isSavinginterest }] = useCreateinterestMutation();
  const [deleteinterest, { isLoading: isDeleting        }] = useDeleteinterestMutation();

  const [showForm,    setShowForm]   = useState(false);
  const [isEditingId, setIsEditingId] = useState(null);
  const [form,        setForm]       = useState(EMPTY_INTEREST);
  const [deletingId,  setDeletingId] = useState(null);

  const handleSaveinterest = async () => {
    try {
      await createinterest({
        id:                   isEditingId || undefined,
        target_base_id:       form.target_base_id,
        target_region_id:     parseInt(form.target_region_id) || 0,
        target_state_id:      parseInt(form.target_state_id)  || 0,
        target_role_id:       parseInt(form.target_role_id)       || 0,
        target_role_type_id:  parseInt(form.target_role_type_id)  || 0,
        target_department_id: parseInt(form.target_department_id) || 0,
        target_regime_id:     parseInt(form.target_regime_id)     || 0,
        observacoes:          form.observacoes,
      }).unwrap();

      setForm(EMPTY_INTEREST);
      setShowForm(false);
      setIsEditingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteinterest(id).unwrap();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleNovoInteresse = () => {
    setIsEditingId(null);
    setForm(EMPTY_INTEREST);
    setShowForm(true);
  };

  const handleCancelar = () => {
    setShowForm(false);
    setIsEditingId(null);
    setForm(EMPTY_INTEREST);
  };

  const filteredRoles = Object.entries(roles)
    .filter(([, role]) =>
      form.target_role_type_id === ANY ||
      String(role.role_type_id) === String(form.target_role_type_id)
    )
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, r]) => ({ value: id, label: r.name }));

  const filteredRegionsOpts = Object.entries(regions)
    .filter(([, r]) =>
      form.target_state_id === ANY || r.state_id === form.target_state_id
    )
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, r]) => ({ value: id, label: r.name }));

  const filteredBasesOpts = Object.entries(locations)
    .filter(([, l]) => {
      if (form.target_region_id !== ANY) return l.region_id === form.target_region_id;
      if (form.target_state_id  !== ANY) return l.state_id  === form.target_state_id;
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

  const dicts = { locations, regions, states, roles, roleTypes, workRegimes, departments };

  return (
    // Fundo mais escuro (#0B1437) para contrastar com os cards (#111C44)
    <div className="h-full flex flex-col bg-[#03072a] overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Cabeçalho App-Style: sem border-bottom, maior espaçamento */}
        <div className="pt-6 sm:pt-6 pb-4 sm:pb-5 pl-5 pr-8 lg:pl-8 shrink-0">
          <div className="flex justify-between items-center h-full">
            <div>
              <h1 className="text-2xl lg:text-2xl font-bold text-white leading-none tracking-wide">
                Meus Interesses
              </h1>
              <div className="text-xs lg:text-sm text-[#A3AED0] mt-0 font-medium">
                {interests.length} interesse{interests.length === 1 ? '' : 's'} cadastrado{interests.length === 1 ? '' : 's'}
              </div>
            </div>
            
            {/* Botão Desktop - Oculto no mobile (hidden md:flex) */}
            <ButtonPrimary
              onClick={handleNovoInteresse}
              disabled={showForm}
              className="hidden md:flex gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 border-none text-white shrink-0 disabled:opacity-50 whitespace-nowrap transition-all"
            >
              <Plus size={18} className="shrink-0" />
              <span className="text-sm font-semibold">Novo Interesse</span>
            </ButtonPrimary>
          </div>
        </div>

        {/* Área de conteúdo */}
        <div className="flex-1 overflow-y-auto scrollbar-custom pb-24 sm:pb-0">
          <div className="px-4 lg:px-8 pb-8 pt-2 space-y-6 md:space-y-8">

            <DicaBanner />

            {showForm && (
              <InteresseForm
                form={form}
                setForm={setForm}
                isEditing={!!isEditingId}
                isSaving={isSavinginterest}
                onSave={handleSaveinterest}
                onCancel={handleCancelar}
                stateOpts={stateOpts}
                filteredRegionsOpts={filteredRegionsOpts}
                filteredBasesOpts={filteredBasesOpts}
                filteredRoles={filteredRoles}
                filteredDeptsOpts={filteredDeptsOpts}
                rtOpts={rtOpts}
                regimeOpts={regimeOpts}
                locations={locations}
                regions={regions}
              />
            )}

            {interests.length === 0 && !showForm ? (
              <EstadoVazio />
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {interests.map(interest => (
                  <InteresseCard
                    key={interest.id}
                    interest={interest}
                    dicts={dicts}
                    onDelete={handleDelete}
                    isDeleting={deletingId === interest.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão Flutuante Mobile - Exibido apenas no mobile (md:hidden) */}
      <button
        onClick={handleNovoInteresse}
        disabled={showForm}
        className="fixed bottom-6 right-6 z-50 md:hidden flex items-center justify-center w-14 h-14 bg-blue-500 hover:bg-blue-400 text-white rounded-full shadow-lg disabled:hidden transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/50"
        aria-label="Novo Interesse"
      >
        <Plus size={24} />
      </button>

      <style>{`
        .scrollbar-custom::-webkit-scrollbar { width: 6px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .animate-in { animation-fill-mode: forwards; }
      `}</style>
    </div>
  );
}

export default MeusInteresses;