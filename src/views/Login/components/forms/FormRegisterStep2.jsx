// ─────────────────────────────────────────────────────────────────────────────
// components/forms/FormRegisterStep2.jsx — Identificação, lotação e perfil (passo 2 do registro)
// ─────────────────────────────────────────────────────────────────────────────

import Label           from '../../../../components/ui/Label';
import SearchableSelect from '../../../../components/ui/SearchableSelect';
import { INPUT_CLASSES, SELECT_ARROW_STYLE, ANY } from '../../helpers';
import { useAppSelector, selectLocations, selectDepartments, selectWorkRegimes, selectRoles, selectRoleTypes, selectRegions, selectStates } from '../../../../store/hooks';

/**
 * @param {object}   formData             - Estado atual do formulário
 * @param {function} handleChange         - Handler genérico para inputs/selects
 * @param {function} handleProfileState   - Handler de estado (localização)
 * @param {function} handleProfileRegion  - Handler de região
 * @param {function} handleProfileBase    - Handler de base
 * @param {function} handleRoleTypeChange - Handler de tipo de cargo
 * @param {function} setFormData          - Setter do estado do formulário
 */
function FormRegisterStep2({
  formData, handleChange,
  handleProfileState, handleProfileRegion, handleProfileBase,
  handleRoleTypeChange, setFormData,
}) {
  // ── Dados de referência ─────────────────────────────────────────────────
  const locations   = useAppSelector(selectLocations);
  const departments = useAppSelector(selectDepartments);
  const workRegimes = useAppSelector(selectWorkRegimes);
  const roles       = useAppSelector(selectRoles);
  const roleTypes   = useAppSelector(selectRoleTypes);
  const regions     = useAppSelector(selectRegions);
  const states      = useAppSelector(selectStates);

  // ── Opções filtradas para os selects ────────────────────────────────────

  const stateOpts  = Object.entries(states  || {});
  const regimeOpts = Object.entries(workRegimes || {});
  const rtOpts     = Object.entries(roleTypes || {});

  const filteredRegionsOpts = Object.entries(regions || {})
    .filter(([, r]) => formData.state_id === ANY || String(r.state_id) === String(formData.state_id))
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, r]) => ({ value: id, label: r.name }));

  const filteredBasesOpts = Object.entries(locations || {})
    .filter(([, l]) => {
      if (formData.region_id !== ANY) return String(l.region_id) === String(formData.region_id);
      if (formData.state_id  !== ANY) return String(l.state_id)  === String(formData.state_id);
      return true;
    })
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([id, l]) => ({ value: id, label: l.name }));

  const filteredRoles = Object.entries(roles || {})
    .filter(([, role]) => {
      const typeId = typeof role === 'object' ? role?.role_type_id : ANY;
      return formData.role_type_id === ANY || String(typeId) === String(formData.role_type_id);
    })
    .sort((a, b) => {
      const nameA = typeof a[1] === 'string' ? a[1] : (a[1]?.name || '');
      const nameB = typeof b[1] === 'string' ? b[1] : (b[1]?.name || '');
      return nameA.localeCompare(nameB);
    })
    .map(([id, r]) => ({ value: id, label: typeof r === 'string' ? r : (r?.name || 'Desconhecido') }));

  const filteredDeptsOpts = Object.entries(departments || {})
    .sort((a, b) => {
      const nameA = typeof a[1] === 'string' ? a[1] : (a[1]?.name || '');
      const nameB = typeof b[1] === 'string' ? b[1] : (b[1]?.name || '');
      return nameA.localeCompare(nameB);
    })
    .map(([id, d]) => ({ value: id, label: typeof d === 'string' ? d : (d?.name || 'Desconhecido') }));

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

        {/* ── Bloco 1: Identificação ───────────────────────────────── */}
        <div className="bg-[#0B1437] border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A3AED0] mb-2">Identificação</h3>

          <div className="space-y-1.5">
            <Label>Nome Completo</Label>
            <input required name="name" value={formData.name} onChange={handleChange}
              placeholder="Ex: Rafael Funchal" className={INPUT_CLASSES} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Chave</Label>
              <input required name="user_key" value={formData.user_key} onChange={handleChange}
                maxLength={4} placeholder="Ex: CM0E" className={INPUT_CLASSES} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select style={SELECT_ARROW_STYLE} name="state" value={formData.state}
                onChange={handleChange} className={INPUT_CLASSES}>
                <option className="bg-[#1B254B] text-white" value="permuta">Permuta</option>
                <option className="bg-[#1B254B] text-white" value="liberado">Liberado</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Bloco 2: Lotação ─────────────────────────────────────── */}
        <div className="bg-[#0B1437] border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A3AED0] mb-2">Sua Lotação Atual</h3>

          {/* Estado */}
          <div className="space-y-1.5 relative z-50">
            <Label>Estado</Label>
            <select style={SELECT_ARROW_STYLE} name="state_id" value={formData.state_id}
              onChange={handleProfileState}
              disabled={formData.base_id !== ANY || formData.region_id !== ANY}
              className={INPUT_CLASSES}>
              <option className="bg-[#1B254B] text-white" value={ANY}>- Selecione -</option>
              {stateOpts.sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([id, s]) => (
                <option className="bg-[#1B254B] text-white" key={id} value={id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Região */}
            <div className="space-y-1.5 relative z-40">
              <Label>Região</Label>
              <SearchableSelect
                options={filteredRegionsOpts}
                value={formData.region_id}
                onChange={handleProfileRegion}
                disabled={formData.base_id !== ANY}
                inputClassName={INPUT_CLASSES}
                placeholder="- Selecione -"
              />
            </div>
            {/* Base */}
            <div className="space-y-1.5 relative z-30">
              <Label>Base</Label>
              <SearchableSelect
                options={filteredBasesOpts}
                value={formData.base_id}
                onChange={handleProfileBase}
                inputClassName={INPUT_CLASSES}
                placeholder="- Selecione -"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bloco 3: Perfil Profissional ─────────────────────────────── */}
      <div className="bg-[#0B1437] border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4 relative z-20">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A3AED0] mb-2">Perfil Profissional</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Nível */}
          <div className="space-y-1.5 relative z-[60]">
            <Label>Nível</Label>
            <select style={SELECT_ARROW_STYLE} name="role_type_id" value={formData.role_type_id}
              onChange={handleRoleTypeChange} className={INPUT_CLASSES}>
              <option className="bg-[#1B254B] text-white" value={ANY}>- Selecione -</option>
              {rtOpts.map(([id, n]) => (
                <option className="bg-[#1B254B] text-white" key={id} value={id}>
                  {typeof n === 'string' ? n : n?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cargo */}
          <div className="space-y-1.5 relative z-[50]">
            <Label>Cargo / Ênfase</Label>
            <SearchableSelect
              value={formData.role_id}
              onChange={(val) => setFormData(f => ({ ...f, role_id: val }))}
              options={filteredRoles}
              placeholder={formData.role_type_id === ANY ? 'Selecione o nível...' : 'Buscar cargo...'}
              inputClassName={INPUT_CLASSES}
            />
          </div>

          {/* Departamento */}
          <div className="space-y-1.5 relative z-[40]">
            <Label>Gerência / Depto.</Label>
            <SearchableSelect
              value={formData.department_id}
              onChange={(val) => setFormData(f => ({ ...f, department_id: val }))}
              options={filteredDeptsOpts}
              placeholder="- Selecione -"
              inputClassName={INPUT_CLASSES}
            />
          </div>

          {/* Regime */}
          <div className="space-y-1.5 relative z-[30]">
            <Label>Regime</Label>
            <select style={SELECT_ARROW_STYLE} name="regime_id" value={formData.regime_id}
              onChange={handleChange} className={INPUT_CLASSES}>
              <option className="bg-[#1B254B] text-white" value={ANY}>- Selecione -</option>
              {regimeOpts.map(([id, n]) => (
                <option className="bg-[#1B254B] text-white" key={id} value={id}>
                  {typeof n === 'string' ? n : n?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-1.5 pt-2">
          <Label>Observações Adicionais (Opcional)</Label>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Ex: Prefiro turno administrativo, disponibilidade para embarque..."
            rows={2}
            className={`${INPUT_CLASSES} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}

export default FormRegisterStep2;