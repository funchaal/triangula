const Select = (props) => (
  <select 
    {...props} 
    className={`w-full bg-[#0B1437] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer ${props.className || ''}`}
    // Adicionando um SVG inline para manter a setinha padrão mas com a cor customizada, já que usamos appearance-none para customizar o input
    style={{
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23A3AED0' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.75rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5em 1.5em',
      paddingRight: '2.5rem'
    }}
  >
    {props.children}
  </select>
);

export default Select;