// ─────────────────────────────────────────────────────────────────────────────
// SectionTitle.jsx
// ─────────────────────────────────────────────────────────────────────────────

function SectionTitle({ icon, label }) {
  return (
    <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-[#A3AED0]">
      <span className="text-blue-400">{icon}</span>
      {label}
    </div>
  );
}

export default SectionTitle;