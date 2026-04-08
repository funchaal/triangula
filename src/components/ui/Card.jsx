const Card = ({ children, className = "", interactive = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 ${interactive ? 'hover:border-blue-500/30 transition-all cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export default Card;
