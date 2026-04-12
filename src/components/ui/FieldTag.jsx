import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

/**
 * Tag de feedback exibida abaixo de um input.
 * type: 'error' | 'success' | 'loading' | 'hint'
 */
export default function FieldTag({ type, message, className = '' }) {
  if (!message) return null;

  const styles = {
    error:   'text-red-400',
    success: 'text-emerald-400',
    loading: 'text-[#A3AED0]',
    hint:    'text-[#A3AED0]',
  };

  const icons = {
    error:   <XCircle size={13} className="shrink-0 mt-px" />,
    success: <CheckCircle2 size={13} className="shrink-0 mt-px" />,
    loading: <Loader2 size={13} className="shrink-0 mt-px animate-spin" />,
    hint:    null,
  };

  return (
    <div className={`flex items-start gap-1.5 text-xs font-medium ${styles[type]} animate-in fade-in duration-200 ${className}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}
