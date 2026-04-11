// ─────────────────────────────────────────────────────────────────────────────
// PerfilSelects.jsx
// ─────────────────────────────────────────────────────────────────────────────

import Select           from '../../../components/ui/Select';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import Label            from '../../../components/ui/Label';
import ReadOnlyText from './ReadOnlyText';
import { ANY, getLabel } from '../helpers';

function PerfilSelects({
  profile, setProfile, isEditing,
  roleTypes, roles, departments, workRegimes,
  rtOpts, regimeOpts, filteredRoles, filteredDeptsOpts,
}) {

  const handleRoleTypeChange = (e) => {
    const newType = e.target.value;
    setProfile(p => {
      const updated = { ...p, role_type_id: newType };
      if (newType !== ANY && p.role_id !== ANY) {
        const roleDef = roles[p.role_id];
        if (roleDef && String(roleDef.role_type_id) !== String(newType)) {
          updated.role_id = ANY;
        }
      }
      return updated;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      <div className="relative z-[60]">
        <Label>Nível</Label>
        {isEditing ? (
          <div className="mt-1.5">
            <Select value={profile.role_type_id} onChange={handleRoleTypeChange}>
              <option value={ANY}>-</option>
              {rtOpts.map(([id, n]) => (
                <option key={id} value={id}>{typeof n === 'string' ? n : n?.name}</option>
              ))}
            </Select>
          </div>
        ) : (
          <ReadOnlyText text={getLabel(roleTypes, profile.role_type_id)} fallback="Não informado" />
        )}
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
        ) : (
          <ReadOnlyText text={getLabel(roles, profile.role_id)} fallback="Não informado" />
        )}
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
        ) : (
          <ReadOnlyText text={getLabel(departments, profile.department_id)} fallback="Não informado" />
        )}
      </div>

      <div className="relative z-[30]">
        <Label>Regime</Label>
        {isEditing ? (
          <div className="mt-1.5">
            <Select
              value={profile.regime_id}
              onChange={e => setProfile(p => ({ ...p, regime_id: e.target.value }))}
            >
              <option value={ANY}>-</option>
              {regimeOpts.map(([id, n]) => (
                <option key={id} value={id}>{typeof n === 'string' ? n : n?.name}</option>
              ))}
            </Select>
          </div>
        ) : (
          <ReadOnlyText text={getLabel(workRegimes, profile.regime_id)} fallback="Não informado" />
        )}
      </div>
    </div>
  );
}

export default PerfilSelects;