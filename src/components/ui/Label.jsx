const Label = ({ children, className = "" }) => (
  <label className={`block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 ${className}`}>
    {children}
  </label>
);

export default Label;
