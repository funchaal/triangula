// ─────────────────────────────────────────────────────────────────────────────
// LotacaoSelects.jsx
// ─────────────────────────────────────────────────────────────────────────────

import Select           from '../../../components/ui/Select';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import Label            from '../../../components/ui/Label';
import ReadOnlyText from './ReadOnlyText';
import { ANY, getLabel } from '../helpers';

function LotacaoSelects({
  profile, setProfile, isEditing,
  states, regions, locations,
  stateOpts, filteredRegionsOpts, filteredBasesOpts,
}) {

  const handleProfileState = (e) =>
    setProfile(f => ({ ...f, base_id: ANY, region_id: ANY, state_id: e.target.value }));

  const handleProfileRegion = (val) => {
    const reg = regions?.[val];
    setProfile(f => ({
      ...f,
      base_id: ANY,
      region_id: val,
      state_id: val !== ANY && reg?.state_id != null ? String(reg.state_id) : ANY,
    }));
  };

  const handleProfileBase = (val) => {
    const loc = locations?.[val];
    setProfile(f => ({
      ...f,
      base_id: val,
      region_id: val !== ANY && loc?.region_id != null ? String(loc.region_id) : ANY,
      state_id: val !== ANY && loc?.state_id != null ? String(loc.state_id) : ANY,
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
      <div className="relative">
        <Label>Estado / Bacia</Label>
        {isEditing ? (
          <div className="mt-1.5">
            <Select
              value={profile.state_id}
              onChange={handleProfileState}
              disabled={profile.base_id !== ANY || profile.region_id !== ANY}
            >
              <option value={ANY}>-</option>
              {stateOpts
                .sort((a, b) => a[1].name.localeCompare(b[1].name))
                .map(([id, s]) => <option key={id} value={id}>{s.name}</option>)
              }
            </Select>
          </div>
        ) : (
          <ReadOnlyText text={getLabel(states, profile.state_id)} fallback="Não informado" />
        )}
      </div>

      <div className="relative">
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
        ) : (
          <ReadOnlyText text={getLabel(regions, profile.region_id)} fallback="Não informado" />
        )}
      </div>

      <div className="relative">
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
        ) : (
          <ReadOnlyText text={getLabel(locations, profile.base_id)} fallback="Não informado" />
        )}
      </div>
    </div>
  );
}

export default LotacaoSelects;