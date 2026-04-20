import { Pencil, Trash2 } from "lucide-react";
import LoadingTriangle from "../../../components/ui/LoadingTriangle";

export default function ItemRow({ name, sub, badge, onEdit, onDelete, deleting }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 md:px-6 hover:bg-white/5 group transition-colors border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm md:text-base text-white font-medium truncate">{name}</div>
        {sub && <div className="text-xs text-[#A3AED0] truncate mt-0.5">{sub}</div>}
      </div>
      {badge}
      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onEdit}
          className="p-2 rounded-lg text-[#A3AED0] hover:text-white hover:bg-white/10 transition-all">
          <Pencil size={16} />
        </button>
        <button onClick={onDelete} disabled={deleting}
          className="p-2 rounded-lg text-[#A3AED0] hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
          {deleting ? <LoadingTriangle size={16} /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  );
}