export const ButtonPrimary = ({ children, onClick, className = "", disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 disabled:shadow-none ${className}`}>
    {children}
  </button>
);

export const ButtonSuccess = ({ children, onClick, className = "", disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500 disabled:shadow-none ${className}`}>
    {children}
  </button>
);

export const ButtonGhost = ({ children, onClick, className = "", disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 border border-white/10 text-[#A3AED0] hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#A3AED0] ${className}`}>
    {children}
  </button>
);