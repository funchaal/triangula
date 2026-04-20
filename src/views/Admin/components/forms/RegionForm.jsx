import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import { ButtonPrimary, ButtonGhost } from "../../../../components/ui/Button";
import LoadingTriangle from "../../../../components/ui/LoadingTriangle";
import Field from "../Field";
import CoordPicker from "../CoordPicker";
import {
  useCreateAdminRegionMutation,
  useUpdateAdminRegionMutation,
} from "../../../../services/api";

export default function RegionForm({ initial, states, onClose }) {
  const [form, setForm] = useState({ name: "", state_id: "", lat: null, lng: null, ...initial });
  const [createRegion, { isLoading: isCreating }] = useCreateAdminRegionMutation();
  const [updateRegion, { isLoading: isUpdating }] = useUpdateAdminRegionMutation();
  const saving = isCreating || isUpdating;
  const [error, setError] = useState(null);

  const isValid = form.name && form.state_id && form.lat && form.lng;

  const submit = async () => {
    if (!isValid) return setError("Preencha todos os campos e clique no mapa.");
    setError(null);
    try {
      if (initial?.id) await updateRegion(form).unwrap();
      else await createRegion(form).unwrap();
      onClose();
    } catch (e) { setError(e.data?.detail || e.message || "Erro ao salvar região."); }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome">
          <Input value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Macaé" />
        </Field>
        <Field label="Estado / Bacia">
          <Select value={form.state_id}
            onChange={e => setForm(f => ({ ...f, state_id: e.target.value }))}>
            <option value="">Selecione...</option>
            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
      </div>
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