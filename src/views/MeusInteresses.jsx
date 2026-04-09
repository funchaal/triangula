import { useState } from "react";
import {
  Plus, Trash2, Check, Target,
  Loader2, MapPin, Lightbulb
} from "lucide-react";
import Label from '../components/ui/Label';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import { ButtonPrimary, ButtonGhost } from '../components/ui/Button';
import SearchableSelect from '../components/ui/SearchableSelect';

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
} from '../store/hooks';
import {
  useCreateinterestMutation,
  useDeleteinterestMutation,
} from '../services/api';

const ANY = "0";

const EMPTY_INTEREST = {
  target_base_id: ANY, target_region_id: ANY, target_state_id: ANY,
  target_role_id: ANY, target_role_type_id: ANY,
  target_department_id: ANY, target_regime_id: ANY,
  observacoes: "",
};

function MeusInteresses() {
  const interests  = useAppSelector(selectinterests);
  const locations   = useAppSelector(selectLocations);
  const departments = useAppSelector(selectDepartments);
  const workRegimes = useAppSelector(selectWorkRegimes);
  const roles       = useAppSelector(selectRoles);
  const roleTypes   = useAppSelector(selectRoleTypes);
  const regions     = useAppSelector(selectRegions);
  const states      = useAppSelector(selectStates);

  const [createinterest, { isLoading: isSavinginterest }] = useCreateinterestMutation();
  const [deleteinterest, { isLoading: isDeleting        }] = useDeleteinterestMutation();

  const [showForm,       setShowForm]       = useState(false);
  const [isEditingId,    setIsEditingId]    = useState(null);
  const [form,           setForm]           = useState(EMPTY_INTEREST);
  const [deletingId,     setDeletingId]     = useState(null);

  // ── Handlers ───────────────────────────────────────────────

  const handleInterestBase = (val) => {
    const loc = locations[val];
    setForm(f => ({
      ...f,
      target_base_id:   val,
      target_region_id: val !== ANY ? (loc?.region_id ?? ANY) : ANY,
      target_state_id:  val !== ANY ? (loc?.state_id  ?? ANY) : ANY,
    }));
  };

  const handleInterestRegion = (val) => {
    const reg = regions[val];
    setForm(f => ({
      ...f, target_base_id: ANY, target_region_id: val,
      target_state_id: val !== ANY ? (reg?.state_id ?? ANY) : ANY,
    }));
  };

  const handleInterestState = (e) => {
    setForm(f => ({ ...f, target_base_id: ANY, target_region_id: ANY, target_state_id: e.target.value }));
  };

  const handleTargetRoleTypeChange = (e) => {
    const newType = e.target.value;
    setForm(f => {
      const newForm = { ...f, target_role_type_id: newType };
      if (newType !== ANY && f.target_role_id !== ANY) {
        const roleDef = roles[f.target_role_id];
        if (roleDef && String(roleDef.role_type_id) !== String(newType)) {
          newForm.target_role_id = ANY;
        }
      }
      return newForm;
    });
  };

  const handleSaveinterest = async () => {
    try {
      await createinterest({
        id: isEditingId || undefined,
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
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => { setDeletingId(id); try { await deleteinterest(id).unwrap(); } catch (e) { console.error(e); } finally { setDeletingId(null); } };

  // ── Derived & Filtros ────────────────────────────────────────────────────

  const basesForInterest = Object.entries(locations).filter(([, l]) => {
    if (form.target_region_id !== ANY) return l.region_id === form.target_region_id;
    if (form.target_state_id  !== ANY) return l.state_id  === form.target_state_id;
    return true;
  });

  const regionsForInterest = Object.entries(regions).filter(([, r]) =>
    form.target_state_id === ANY || r.state_id === form.target_state_id
  );

  const filteredRoles = Object.entries(roles)
    .filter(([, role]) => form.target_role_type_id === ANY || String(role.role_type_id) === String(form.target_role_type_id))
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, r]) => ({ value: id, label: r.name }));

  const filteredRegionsOpts = regionsForInterest
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, r]) => ({ value: id, label: r.name }));

  const filteredBasesOpts = basesForInterest
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

  const lbl = (dict, id) => id && String(id) !== ANY ? (dict[String(id)]?.name ?? dict[String(id)] ?? null) : null;

  const destLabel = (interest) => {
    if (interest.target_base_id && interest.target_base_id !== ANY) return locations[interest.target_base_id]?.name ?? interest.target_base_id;
    if (interest.target_region_id && interest.target_region_id !== ANY) return `Região ${regions[interest.target_region_id]?.name ?? interest.target_region_id}`;
    if (interest.target_state_id && interest.target_state_id !== ANY) return `Estado ${states[interest.target_state_id]?.name ?? interest.target_state_id}`;
    return 'Qualquer localidade';
  };

  const destSub = (interest) => {
    if (interest.target_base_id && interest.target_base_id !== ANY) return regions[locations[interest.target_base_id]?.region_id]?.name ?? null;
    if (interest.target_region_id && interest.target_region_id !== ANY && interest.target_state_id !== ANY) return states[interest.target_state_id]?.name;
    return null;
  };

  // ── Renderização ─────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <div className="h-16 pl-16 pr-5 lg:pl-5 border-b border-slate-800 shrink-0">
          <div className="flex justify-between items-center h-full">
            <div>
              <div className="text-sm font-semibold text-slate-200">Meus Interesses</div>
              <div className="text-xs text-slate-600 mt-0.5">
                {interests.length} in{interests.length === 1 ? 'ão' : 'ões'} cadastrada{interests.length === 1 ? '' : 's'}
              </div>
            </div>
            <ButtonPrimary onClick={() => { setShowForm(true); setIsEditingId(null); setForm(EMPTY_INTEREST); }} disabled={showForm} className="gap-2 text-xs px-3 lg:px-4 shrink-0 disabled:opacity-50 whitespace-nowrap">
              <Plus size={16} className="shrink-0" />
              <span className="text-xs">Novo Interesse</span>
            </ButtonPrimary>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom interests-scroll-container pb-24 sm:pb-0">
          <div className="p-3 md:p-8 space-y-6 md:space-y-8">

            <div className="bg-gradient-to-r from-blue-900/20 to-transparent border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start shadow-sm animate-in fade-in duration-500">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                <Lightbulb size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-blue-300">Dica: Amplie suas chances</h4>
                <p className="text-xs text-slate-300/90 mt-1.5 leading-relaxed">
                  Selecione um <strong>Estado</strong> ou <strong>Região</strong> em vez de uma base específica para ter uma busca mais abrangente. Avisaremos por e-mail assim que surgir uma oportunidade compatível.
                </p>
              </div>
            </div>

            {showForm && (
              <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_0_50px_rgba(59,130,246,0.1)] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                  <div className="space-y-4">
                    <SectionTitle icon={<MapPin size={16} />} label="Onde você quer ir?" />
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                      <div className="min-w-0 relative z-50">
                        <Label>Estado</Label>
                        <Select value={form.target_state_id} onChange={handleInterestState} disabled={form.target_base_id !== ANY || form.target_region_id !== ANY}>
                          <option value={ANY}>Qualquer estado</option>
                          {stateOpts.sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([id, s]) => <option key={id} value={id}>{s.name}</option>)}
                        </Select>
                      </div>
                      <div className="min-w-0 relative z-40">
                        <Label>Região</Label>
                        <SearchableSelect 
                          value={form.target_region_id} 
                          onChange={handleInterestRegion} 
                          options={filteredRegionsOpts}
                          disabled={form.target_base_id !== ANY}
                          placeholder="Qualquer região"
                        />
                      </div>
                      <div className="min-w-0 relative z-30">
                        <Label>Base</Label>
                        <SearchableSelect 
                          value={form.target_base_id} 
                          onChange={handleInterestBase} 
                          options={filteredBasesOpts}
                          placeholder="Qualquer base"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <SectionTitle icon={<Target size={16} />} label="Em qual perfil?" />
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="min-w-0 relative z-[60]">
                        <Label>Nível</Label>
                        <Select value={form.target_role_type_id} onChange={handleTargetRoleTypeChange}>
                          <option value={ANY}>Qualquer</option>
                          {rtOpts.map(([id, n]) => <option key={id} value={id}>{typeof n === 'string' ? n : n?.name}</option>)}
                        </Select>
                      </div>
                      <div className="min-w-0 relative z-[50]">
                        <Label>Cargo / Ênfase</Label>
                        <SearchableSelect 
                          value={form.target_role_id}
                          onChange={(val) => setForm(p => ({ ...p, target_role_id: val }))}
                          options={filteredRoles}
                          placeholder="Qualquer"
                        />
                      </div>
                      <div className="min-w-0 relative z-[40]">
                        <Label>Gerência / Depto.</Label>
                        <SearchableSelect 
                          value={form.target_department_id}
                          onChange={(val) => setForm(p => ({ ...p, target_department_id: val }))}
                          options={filteredDeptsOpts}
                          placeholder="Qualquer"
                        />
                      </div>
                      <div className="min-w-0 relative z-[30]">
                        <Label>Regime</Label>
                        <Select value={form.target_regime_id} onChange={e => setForm(p => ({ ...p, target_regime_id: e.target.value }))}>
                          <option value={ANY}>Qualquer</option>
                          {regimeOpts.map(([id, name]) => <option key={id} value={id}>{typeof name === 'string' ? name : name?.name}</option>)}
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 md:mt-8">
                  <Label>Observações Adicionais</Label>
                  <textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                    placeholder="Ex: Apenas unidades de terra..." rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-800" />
                </div>
                <div className="hidden sm:flex flex-col-reverse sm:flex-row gap-3 justify-end mt-6 relative z-0">
                  <ButtonGhost onClick={() => { setShowForm(false); setIsEditingId(null); setForm(EMPTY_INTEREST); }} className="w-full sm:w-auto text-center justify-center">Cancelar</ButtonGhost>
                  <ButtonPrimary onClick={handleSaveinterest} disabled={isSavinginterest} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 border border-emerald-400/20 justify-center">
                    {isSavinginterest ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} {isEditingId ? 'Atualizar Interesse' : 'Salvar Interesse'}
                  </ButtonPrimary>
                </div>

                <div className="fixed bottom-0 left-0 w-full p-4 bg-slate-950 border-t border-slate-800 z-50 flex gap-3 sm:hidden">
                  <ButtonGhost onClick={() => { setShowForm(false); setIsEditingId(null); setForm(EMPTY_INTEREST); }} className="flex-1 justify-center">Cancelar</ButtonGhost>
                  <ButtonPrimary onClick={handleSaveinterest} disabled={isSavinginterest} className="flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 border border-emerald-400/20 justify-center disabled:opacity-40">
                    {isSavinginterest ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} {isEditingId ? 'Atualizar' : 'Salvar'}
                  </ButtonPrimary>
                </div>
              </div>
            )}

            {interests.length === 0 && !showForm ? (
              <div className="py-16 md:py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <Target size={48} className="mx-auto text-slate-800 mb-3 md:mb-4 opacity-30" />
                <p className="text-slate-500 font-medium text-sm md:text-base">Nenhum interesse cadastrado no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {interests.map(interest => {
                  const chips = [
                    lbl(roleTypes,   interest.target_role_type_id),
                    lbl(roles,       interest.target_role_id),
                    lbl(workRegimes, interest.target_regime_id),
                    lbl(departments, interest.target_department_id),
                  ].filter(Boolean);

                  return (
                    <div key={interest.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-lg relative animate-in fade-in duration-300">
                      <div className="flex gap-4 md:gap-5 w-full min-w-0">
                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/10"><MapPin size={22} className="md:w-[24px] md:h-[24px]" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 mt-0.5">
                              <h3 className="text-base md:text-[15px] font-bold text-white truncate leading-tight">{destLabel(interest)}</h3>
                              <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mt-1">{destSub(interest) || 'Localidade Ampla'}</p>
                            </div>
                            <button onClick={() => handleDelete(interest.id)} disabled={deletingId === interest.id} className="p-2 md:p-2.5 text-red-400/70 hover:text-red-400 bg-red-500/10 rounded-lg disabled:opacity-40 transition-all shrink-0" title="Excluir Interesse">
                              {deletingId === interest.id ? <Loader2 size={18} className="animate-spin md:w-[18px] md:h-[18px]" /> : <Trash2 size={18} className="md:w-[18px] md:h-[18px]" />}
                            </button>
                          </div>
                          {chips.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
                              {chips.map((c, i) => <Badge key={i} variant={i === 0 || i === 1 ? 'primary' : 'default'} className="text-[10px] md:text-[11px] px-2 py-0.5">{c}</Badge>)}
                            </div>
                          )}
                        </div>
                      </div>
                      {interest.observacoes && (
                        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                          <Label className="text-[10px] md:text-[11px] text-slate-400">Observações</Label>
                          <p className="text-[10px] md:text-[11px] text-slate-300 italic leading-relaxed mt-1">"{interest.observacoes}"</p>
                        </div>
                      )}
                      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-800/50 flex items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-emerald-500">
                        <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" /> Radar de Match Ativo
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .scrollbar-custom::-webkit-scrollbar { width: 5px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: #334155; }
        .animate-in { animation-fill-mode: forwards; }
      `}</style>
    </div>
  );
}

function SectionTitle({ icon, label }) {
  return <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold uppercase tracking-widest text-slate-500"><span className="text-blue-500/60">{icon}</span>{label}</div>;
}

export default MeusInteresses;