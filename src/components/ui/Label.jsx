const Label = ({ children, className = "" }) => (
  <label className={`block text-[11px] font-bold uppercase tracking-wider text-[#A3AED0] mb-2 ${className}`}>
    {children}
  </label>
);

export default Label;