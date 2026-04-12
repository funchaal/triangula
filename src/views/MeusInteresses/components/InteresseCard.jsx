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
    // Redução do padding geral de p-5/md:p-6 para p-4/md:p-5
    <div className="bg-[#13204c] rounded-2xl p-4 md:p-5 relative animate-in fade-in duration-300 group hover:border-white/10 transition-all">
      {/* Redução do gap de gap-4/md:gap-5 para gap-3/md:gap-4 */}
      <div className="flex gap-3 md:gap-4 w-full min-w-0">

        {/* Ícone de localização ligeiramente menor (w-10/h-10) */}
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
          <MapPin size={20} className="md:w-6 md:h-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-start gap-3">

            {/* Título e subtítulo do destino */}
            <div className="min-w-0">
              {/* Título ajustado para base/lg */}
              <h3 className="text-base md:text-lg font-bold text-white truncate leading-tight">
                {titulo}
              </h3>
              <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[#A3AED0] flex items-center gap-1.5 mt-1">
                {subtitulo || 'Localidade Ampla'}
              </p>
            </div>

            {/* Botão de exclusão com padding reduzido */}
            <button
              onClick={() => onDelete(interest.id)}
              disabled={isDeleting}
              className="p-2 md:p-2.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/80 rounded-xl disabled:opacity-40 transition-all shrink-0"
              title="Excluir Interesse"
            >
              {isDeleting
                ? <Loader2 size={16} className="animate-spin" />
                : <Trash2  size={16} />
              }
            </button>
          </div>

          {/* Chips de perfil (margem reduzida para mt-3) */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 md:mt-3.5">
              {chips.map((c, i) => (
                <Badge
                  key={i}
                  variant={i === 0 || i === 1 ? 'primary' : 'default'}
                  className={`text-[10px] md:text-[11px] px-2 py-0.5 rounded-md border-none ${
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

      {/* Observações adicionais (margens e paddings reduzidos) */}
      {interest.observacoes && (
        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
          <Label className="text-[10px] md:text-[11px] text-[#A3AED0] uppercase tracking-wider">Observações</Label>
          <p className="text-xs text-white/80 italic leading-relaxed mt-1">
            "{interest.observacoes}"
          </p>
        </div>
      )}

      {/* Indicador de radar ativo (margem superior reduzida) */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-emerald-400">
        <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
        Radar de Match Ativo
      </div>
    </div>
  );
}

export default InteresseCard;