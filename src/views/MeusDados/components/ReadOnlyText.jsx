// ─────────────────────────────────────────────────────────────────────────────
// ReadOnlyText.jsx
// ─────────────────────────────────────────────────────────────────────────────

function ReadOnlyText({ text, fallback = "—" }) {
  return (
    <div className="w-full bg-[#0B1437] border border-white/10 rounded-xl px-4 py-3 flex items-center min-h-[46px] mt-1.5 transition-colors">
      {text
        ? <span className="text-sm text-white font-medium">{text}</span>
        : <span className="text-sm text-[#A3AED0]/50 italic">{fallback}</span>
      }
    </div>
  );
}

export default ReadOnlyText;