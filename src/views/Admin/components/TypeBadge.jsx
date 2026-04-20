export default function TypeBadge({ type }) {
  const isOff = type === "Offshore";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
      ${isOff ? "bg-cyan-500/15 text-cyan-400" : "bg-emerald-500/15 text-emerald-400"}`}>
      {type}
    </span>
  );
}