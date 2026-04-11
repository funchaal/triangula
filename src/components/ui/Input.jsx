const Input = (props) => (
  <input 
    {...props} 
    className={`w-full bg-[#0B1437] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#A3AED0]/50 focus:outline-none focus:border-blue-500 focus:bg-[#111C44] transition-all ${props.className || ''}`}
  />
);

export default Input;