// components/forms/RoleForm.jsx
import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import { ButtonPrimary, ButtonGhost } from "../../../../components/ui/Button";
import LoadingTriangle from "../../../../components/ui/LoadingTriangle";
import Field from "../Field";
import {
  useCreateAdminRoleMutation,
  useUpdateAdminRoleMutation,
} from "../../../../services/api";

export default function RoleForm({ initial, roleTypes, onClose }) {
  const [form, setForm] = useState({ name: "", role_type_id: "", ...initial });
  const [createRole, { isLoading: isCreating }] = useCreateAdminRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateAdminRoleMutation();
  const saving = isCreating || isUpdating;
  const [error, setError] = useState(null);

  const isValid = form.name.trim().length > 0 && form.role_type_id !== "";

  const submit = async () => {
    if (!isValid) return setError("Preencha o nome e selecione o nível.");
    setError(null);
    try {
      if (initial?.id) await updateRole(form).unwrap();
      else await createRole(form).unwrap();
      onClose();
    } catch (e) {
      setError(e.data?.detail || e.message || "Erro ao salvar cargo.");
    }
  };

  return (
    <div className="space-y-5">
      <Field label="Nome do Cargo">
        <Input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Ex: Engenheiro de Petróleo"
        />
      </Field>

      <Field label="Nível">
        <Select
          value={form.role_type_id}
          onChange={e => setForm(f => ({ ...f, role_type_id: e.target.value }))}
        >
          <option value="">Selecione o nível...</option>
          {roleTypes.map(rt => (
            <option key={rt.id} value={rt.id}>{rt.name}</option>
          ))}
        </Select>
      </Field>

      {error && (
        <p className="text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={14} />{error}
        </p>
      )}

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