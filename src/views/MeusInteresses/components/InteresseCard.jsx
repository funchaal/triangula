// ─────────────────────────────────────────────────────────────────────────────
// InteresseCard.jsx — Card que representa um interesse cadastrado pelo usuário
// ─────────────────────────────────────────────────────────────────────────────

import { MapPin, Loader2, Trash2 } from "lucide-react";
import Badge  from '../../../components/ui/Badge';
import Label  from '../../../components/ui/Label';
import { lbl, destLabel, destSub } from '../helpers';

function InteresseCard({ interest, dicts, onDelete, isDeleting }) {
  const { locations, regions, states, roles, roleTypes, workRegimes, departments } = dicts;

  const chips = [
    lbl(roleTypes,   interest.target_role_type_id),
    lbl(roles,       interest.target_role_id),
    lbl(workRegimes, interest.target_regime_id),
    lbl(departments, interest.target_department_id),
  ].filter(Boolean);

  const titulo    = destLabel(interest, { locations, regions, states });
  const subtitulo = destSub(interest,   { locations, regions, states });

  return (
    <div className="bg-[#13204c] rounded-2xl p-5 md:p-6 relative animate-in fade-in duration-300 group hover:border-white/10 transition-all">
      <div className="flex gap-4 md:gap-5 w-full min-w-0">

        {/* Ícone de localização */}
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
          <MapPin size={24} className="md:w-[26px] md:h-[26px]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-start gap-3">

            {/* Título e subtítulo do destino */}
            <div className="min-w-0 mt-0.5">
              <h3 className="text-lg md:text-xl font-bold text-white truncate leading-tight">
                {titulo}
              </h3>
              <p className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-[#A3AED0] flex items-center gap-1.5 mt-1.5">
                {subtitulo || 'Localidade Ampla'}
              </p>
            </div>

            {/* Botão de exclusão */}
            <button
              onClick={() => onDelete(interest.id)}
              disabled={isDeleting}
              className="p-2.5 md:p-3 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/80 rounded-xl disabled:opacity-40 transition-all shrink-0"
              title="Excluir Interesse"
            >
              {isDeleting
                ? <Loader2 size={18} className="animate-spin" />
                : <Trash2  size={18} />
              }
            </button>
          </div>

          {/* Chips de perfil */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 md:mt-5">
              {chips.map((c, i) => (
                <Badge
                  key={i}
                  variant={i === 0 || i === 1 ? 'primary' : 'default'}
                  className={`text-[11px] md:text-xs px-2.5 py-1 rounded-lg border-none ${
                    i === 0 || i === 1 ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-[#A3AED0]'
                  }`}
                >
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Observações adicionais */}
      {interest.observacoes && (
        <div className="mt-5 md:mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
          <Label className="text-[11px] md:text-xs text-[#A3AED0] uppercase tracking-wider">Observações</Label>
          <p className="text-xs md:text-sm text-white/80 italic leading-relaxed mt-1.5">
            "{interest.observacoes}"
          </p>
        </div>
      )}

      {/* Indicador de radar ativo */}
      <div className="mt-5 md:mt-6 pt-4 border-t border-white/5 flex items-center gap-3 text-[11px] md:text-xs font-bold uppercase tracking-widest text-emerald-400">
        <span className="flex h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
        Radar de Match Ativo
      </div>
    </div>
  );
}

export default InteresseCard;