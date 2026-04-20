import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import { ButtonPrimary, ButtonGhost } from "../../../../components/ui/Button";
import LoadingTriangle from "../../../../components/ui/LoadingTriangle";
import Field from "../Field";
import CoordPicker from "../CoordPicker";
import {
  useCreateAdminLocationMutation,
  useUpdateAdminLocationMutation,
} from "../../../../services/api";

export default function LocationForm({ initial, regions, states, onClose }) {
  const [form, setForm] = useState({
    name: "", region_id: "", state_id: "", type: "Onshore", lat: null, lng: null, ...initial
  });
  const [createLocation, { isLoading: isCreating }] = useCreateAdminLocationMutation();
  const [updateLocation, { isLoading: isUpdating }] = useUpdateAdminLocationMutation();
  const saving = isCreating || isUpdating;
  const [error, setError] = useState(null);

  const isValid = form.name && form.region_id && form.state_id && form.lat && form.lng;

  const filteredRegions = form.state_id
    ? regions.filter(r => r.state_id === form.state_id)
    : regions;

  const submit = async () => {
    if (!isValid) return setError("Preencha todos os campos e clique no mapa.");
    setError(null);
    try {
      if (initial?.id) await updateLocation(form).unwrap();
      else await createLocation(form).unwrap();
      onClose();
    } catch (e) { setError(e.data?.detail || e.message || "Erro ao salvar base."); }
  };

  return (
    <div className="space-y-5">
      <Field label="Nome da Base">
        <Input value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Ex: Base de Imbetiba" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Estado / Bacia">
          <Select value={form.state_id}
            onChange={e => setForm(f => ({ ...f, state_id: e.target.value, region_id: "" }))}>
            <option value="">Selecione...</option>
            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Região">
          <Select value={form.region_id}
            onChange={e => {
              const val = e.target.value;
              const reg = regions.find(r => String(r.id) === String(val));
              setForm(f => ({ 
                ...f, 
                region_id: val, 
                ...(reg ? { state_id: reg.state_id } : {})
              }));
            }}>
            <option value="">Selecione...</option>
            {filteredRegions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Tipo">
        <Select value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          <option value="Onshore">Onshore</option>
          <option value="Offshore">Offshore</option>
        </Select>
      </Field>
      <Field label="Coordenadas — clique no mapa">
        <CoordPicker lat={form.lat} lng={form.lng}
          onChange={(lat, lng) => setForm(f => ({ ...f, lat, lng }))} />
      </Field>
      {error && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={14}/>{error}</p>}
      <div className="flex gap-3 justify-end pt-2">
        <ButtonGhost onClick={onClose}>Cancelar</ButtonGhost>
        <ButtonPrimary onClick={submit} disabled={saving || !isValid} className="disabled:opacity-40">
          {saving ? <LoadingTriangle size={18} /> : <Check size={18} />}
          {initial?.id ? "Atualizar" : "Criar"}
        </ButtonPrimary>
      </div>
    </div>
  );
}