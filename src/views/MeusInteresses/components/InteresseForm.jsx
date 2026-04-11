// ─────────────────────────────────────────────────────────────────────────────
// InteresseForm.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { Check, Loader2, MapPin, Target } from "lucide-react";
import Label           from '../../../components/ui/Label';
import Select          from '../../../components/ui/Select';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import { ButtonPrimary, ButtonGhost } from '../../../components/ui/Button';
import SectionTitle    from './SectionTitle';
import { ANY }         from '../helpers';
import LoadingTriangle from "../../../components/ui/LoadingTriangle";

function InteresseForm({
  form, setForm, isEditing, isSaving, onSave, onCancel,
  stateOpts, filteredRegionsOpts, filteredBasesOpts, filteredRoles, filteredDeptsOpts, rtOpts, regimeOpts,
  locations, regions,
}) {

  const handleInterestState = (e) => {
    setForm(f => ({
      ...f, target_base_id: ANY, target_region_id: ANY, target_state_id: e.target.value,
    }));
  };

  const handleInterestRegion = (val) => {
    const reg = regions?.[val];
    setForm(f => ({
      ...f,
      target_base_id: ANY,
      target_region_id: val,
      target_state_id: val !== ANY && reg?.state_id != null ? String(reg.state_id) : ANY,
    }));
  };

  const handleInterestBase = (val) => {
    const loc = locations?.[val];
    setForm(f => ({
      ...f,
      target_base_id: val,
      target_region_id: val !== ANY && loc?.region_id != null ? String(loc.region_id) : ANY,
      target_state_id:  val !== ANY && loc?.state_id != null ? String(loc.state_id) : ANY,
    }));
  };

  const handleTargetRoleTypeChange = (e) => {
    const newType = e.target.value;
    setForm(f => {
      const newForm = { ...f, target_role_type_id: newType };
      if (newType !== ANY && f.target_role_id !== ANY) {
        const roleDef = filteredRoles.find(r => String(r.value) === String(f.target_role_id));
        if (!roleDef) newForm.target_role_id = ANY;
      }
      return newForm;
    });
  };

  const acoes = (
    <>
      <ButtonGhost
        onClick={onCancel}
        className="w-full sm:w-auto text-[#A3AED0] hover:text-white hover:bg-white/10 rounded-xl justify-center"
      >
        Cancelar
      </ButtonGhost>
      <ButtonPrimary
        onClick={onSave}
        disabled={isSaving || (form.target_state_id === ANY && form.target_region_id === ANY && form.target_base_id === ANY)}
        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-400 border-none text-white rounded-xl justify-center transition-all"
      >
        {isSaving ? <LoadingTriangle size={18} /> : <Check size={18} />}
        {isEditing ? 'Atualizar Interesse' : 'Salvar Interesse'}
      </ButtonPrimary>
    </>
  );

  return (
    <div className="bg-[#111C44] rounded-3xl p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

        <div className="space-y-6">
          <SectionTitle icon={<MapPin size={18} />} label="Onde você quer ir?" />
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">

            <div className="min-w-0 relative">
              <Label className="text-[#A3AED0]">Estado</Label>
              <Select
                value={form.target_state_id}
                onChange={handleInterestState}
                disabled={form.target_base_id !== ANY || form.target_region_id !== ANY}
              >
                <option value={ANY}>Qualquer estado</option>
                {stateOpts
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([id, s]) => <option key={id} value={id}>{s.name}</option>)
                }
              </Select>
            </div>

            <div className="min-w-0 relative">
              <Label className="text-[#A3AED0]">Região</Label>
              <SearchableSelect
                value={form.target_region_id}
                onChange={handleInterestRegion}
                options={filteredRegionsOpts}
                disabled={form.target_base_id !== ANY}
                placeholder="Qualquer região"
              />
            </div>

            <div className="min-w-0 relative">
              <Label className="text-[#A3AED0]">Base</Label>
              <SearchableSelect
                value={form.target_base_id}
                onChange={handleInterestBase}
                options={filteredBasesOpts}
                placeholder="Qualquer base"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SectionTitle icon={<Target size={18} />} label="Em qual perfil?" />
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">

            <div className="min-w-0 relative">
              <Label className="text-[#A3AED0]">Nível</Label>
              <Select value={form.target_role_type_id} onChange={handleTargetRoleTypeChange}>
                <option value={ANY}>Qualquer</option>
                {rtOpts.map(([id, n]) => (
                  <option key={id} value={id}>{typeof n === 'string' ? n : n?.name}</option>
                ))}
              </Select>
            </div>

            <div className="min-w-0 relative">
              <Label className="text-[#A3AED0]">Cargo / Ênfase</Label>
              <SearchableSelect
                value={form.target_role_id}
                onChange={(val) => setForm(p => ({ ...p, target_role_id: val }))}
                options={filteredRoles}
                placeholder="Qualquer"
              />
            </div>

            <div className="min-w-0 relative">
              <Label className="text-[#A3AED0]">Gerência / Depto.</Label>
              <SearchableSelect
                value={form.target_department_id}
                onChange={(val) => setForm(p => ({ ...p, target_department_id: val }))}
                options={filteredDeptsOpts}
                placeholder="Qualquer"
              />
            </div>

            <div className="min-w-0 relative">
              <Label className="text-[#A3AED0]">Regime</Label>
              <Select
                value={form.target_regime_id}
                onChange={e => setForm(p => ({ ...p, target_regime_id: e.target.value }))}
              >
                <option value={ANY}>Qualquer</option>
                {regimeOpts.map(([id, name]) => (
                  <option key={id} value={id}>{typeof name === 'string' ? name : name?.name}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Label className="text-[#A3AED0]">Observações Adicionais</Label>
        <textarea
          value={form.observacoes}
          onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
          placeholder="Ex: Apenas unidades de terra..."
          rows={3}
          className="w-full bg-[#0B1437] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-[#111C44] transition-all resize-none placeholder:text-[#A3AED0]/50 mt-1"
        />
      </div>

      <div className="hidden sm:flex flex-col-reverse sm:flex-row gap-4 justify-end mt-8 relative">
        {acoes}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-[#111C44] border-t border-white/10 flex gap-3 sm:hidden">
        {acoes}
      </div>
    </div>
  );
}

export default InteresseForm;