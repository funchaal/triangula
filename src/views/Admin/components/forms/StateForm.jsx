import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import Input from "../../../../components/ui/Input";
import { ButtonPrimary, ButtonGhost } from "../../../../components/ui/Button";
import LoadingTriangle from "../../../../components/ui/LoadingTriangle";
import Field from "../Field";
import CoordPicker from "../CoordPicker";
import {
  useCreateAdminStateMutation,
  useUpdateAdminStateMutation,
} from "../../../../services/api";

export default function StateForm({ initial, onClose }) {
  const [form, setForm] = useState({ name: "", lat: null, lng: null, ...initial });
  const [createState, { isLoading: isCreating }] = useCreateAdminStateMutation();
  const [updateState, { isLoading: isUpdating }] = useUpdateAdminStateMutation();
  const saving = isCreating || isUpdating;
  const [error, setError] = useState(null);

  const isValid = form.name && form.lat && form.lng;

  const submit = async () => {
    if (!isValid) return setError("Preencha todos os campos e clique no mapa.");
    setError(null);
    try {
      if (initial?.id) await updateState(form).unwrap();
      else await createState(form).unwrap();
      onClose();
    } catch (e) { setError(e.data?.detail || e.message || "Erro ao salvar estado / bacia."); }
  };

  return (
    <div className="space-y-5">
      <Field label="Nome">
        <Input value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Ex: Rio de Janeiro" />
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