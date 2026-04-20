// components/forms/RoleTypeForm.jsx
import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import Input from "../../../../components/ui/Input";
import { ButtonPrimary, ButtonGhost } from "../../../../components/ui/Button";
import LoadingTriangle from "../../../../components/ui/LoadingTriangle";
import Field from "../Field";
import {
  useCreateAdminRoleTypeMutation,
  useUpdateAdminRoleTypeMutation,
} from "../../../../services/api";

export default function RoleTypeForm({ initial, onClose }) {
  const [form, setForm] = useState({ name: "", ...initial });
  const [createRoleType, { isLoading: isCreating }] = useCreateAdminRoleTypeMutation();
  const [updateRoleType, { isLoading: isUpdating }] = useUpdateAdminRoleTypeMutation();
  const saving = isCreating || isUpdating;
  const [error, setError] = useState(null);

  const isValid = form.name.trim().length > 0;

  const submit = async () => {
    if (!isValid) return setError("Informe o nome do nível.");
    setError(null);
    try {
      if (initial?.id) await updateRoleType(form).unwrap();
      else await createRoleType(form).unwrap();
      onClose();
    } catch (e) {
      setError(e.data?.detail || e.message || "Erro ao salvar nível.");
    }
  };

  return (
    <div className="space-y-5">
      <Field label="Nome do Nível">
        <Input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Ex: Nível Técnico"
          onKeyDown={e => e.key === "Enter" && submit()}
        />
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