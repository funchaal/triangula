const Badge = ({ children, color = "blue", className = "" }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    slate: "bg-slate-800/50 text-slate-400 border-slate-700/50"
  };
  return (
    <span className={`border px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${colors[color] || colors.slate} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
