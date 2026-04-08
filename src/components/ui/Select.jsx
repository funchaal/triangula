const Select = (props) => (
  <select 
    {...props} 
    className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${props.className || ''}`}
  >
    {props.children}
  </select>
);

export default Select;
