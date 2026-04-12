import Label from '../../../../components/ui/Label';
import { PasswordInput } from '../PasswordInput';

export function FormReset({ formData, handleChange, showPassword, setShowPassword }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-1.5">
        <Label>Nova Senha</Label>
        <PasswordInput
          value={formData.password}
          onChange={handleChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showHint
        />
      </div>
    </div>
  );
}
