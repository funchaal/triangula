export const ButtonPrimary = ({ children, onClick, className = "", disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 ${className}`}>
    {children}
  </button>
);

export const ButtonSuccess = ({ children, onClick, className = "", disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 ${className}`}>
    {children}
  </button>
);

export const ButtonGhost = ({ children, onClick, className = "", disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 bg-transparent hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-700 ${className}`}>
    {children}
  </button>
);
