import Label from '../../../../components/ui/Label';
import Input from '../../../../components/ui/Input';

export function FormForgot({ formData, handleChange }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <p className="text-sm text-[#A3AED0] mb-2 leading-relaxed">
        Digite seu nome de usuário abaixo. Enviaremos um link de recuperação para o seu e-mail cadastrado.
      </p>
      <div className="space-y-1.5">
        <Label>Nome de usuário</Label>
        <Input
          required
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Ex: rafael.funchal"
        />
      </div>
    </div>
  );
}
