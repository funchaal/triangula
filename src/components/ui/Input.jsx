const Input = (props) => (
  <input 
    {...props} 
    className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${props.className || ''}`}
  />
);

export default Input;
