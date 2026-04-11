// ─────────────────────────────────────────────────────────────────────────────
// components/MapSidebar/SidebarUserList.jsx — Lista de usuários de um arco ou base
// ─────────────────────────────────────────────────────────────────────────────

import { Users, Loader2, FileText, Layers as LayersIcon } from "lucide-react";
import LoadingTriangle from "../../../../components/ui/LoadingTriangle";

/**
 * Retorna o nome/valor de um item do dicionário pelo id, ou null.
 */
function lbl(dict, id) {
  if (!id || id === '0') return null;
  return dict?.[String(id)] ?? null;
}

/**
 * @param {boolean} isFetching - True enquanto os dados estão carregando
 * @param {boolean} isBase     - True se a seleção é um nó (base/região/estado)
 * @param {Array}   users      - Lista de usuários retornados pela API
 * @param {object}  roles      - Dicionário de cargos
 * @param {object}  workRegimes- Dicionário de regimes de trabalho
 */
function SidebarUserList({ isFetching, isBase, users, roles, workRegimes }) {
  return (
    <>
      <div className="border-t border-white/5 mx-6 mb-4" />
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#A3AED0]/70 mb-3 mx-6">
        {isBase ? 'Pessoas nesta base' : 'Pessoas nesta rota'}
      </div>

      {/* Estado de carregamento */}
      {isFetching ? (
        <div className="flex justify-center py-8">
          <LoadingTriangle size={24} />
        </div>

      ) : users.length > 0 ? (
        <div className="px-6 pb-6 space-y-3">
          {users.map((u, i) => (
            <div key={u.username ?? i} className="bg-[#111C44] rounded-2xl p-4">

              {/* Avatar + nome + cargo */}
              <div className="flex items-start gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                  {u.username?.slice(0, 2).toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-[13px] font-bold text-white truncate">{u.name || u.username}</div>
                  {u.name && <div className="text-[11px] text-[#A3AED0] font-medium truncate">@{u.username}</div>}
                  {lbl(roles, u.role_id) && (
                    <div className="text-[11px] text-[#A3AED0]/80 truncate mt-0.5">
                      {lbl(roles, u.role_id)?.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Regime de trabalho */}
              {lbl(workRegimes, u.regime_id) && (
                <div className="text-[11px] font-medium text-[#A3AED0] mb-1.5 flex items-center gap-1.5">
                  <LayersIcon size={10} className="shrink-0 text-[#A3AED0]/50" />
                  {lbl(workRegimes, u.regime_id)}
                </div>
              )}

              {/* Contatos */}
              {(u.phone || u.email) && (
                <div className="text-[11px] text-white/90 mb-1 space-y-1 bg-[#0B1437] p-2.5 rounded-xl border border-white/5">
                  {u.phone && (
                    <div className="truncate">
                      <span className="text-[#A3AED0] font-medium mr-1.5">Tel</span>{u.phone}
                    </div>
                  )}
                  {u.email && (
                    <div className="truncate">
                      <span className="text-[#A3AED0] font-medium mr-1.5">Email</span>{u.email}
                    </div>
                  )}
                </div>
              )}

              {/* Observações */}
              {u.observacoes && (
                <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-white/5">
                  <FileText size={10} className="text-[#A3AED0]/50 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-[#A3AED0] leading-relaxed italic">"{u.observacoes}"</p>
                </div>
              )}
            </div>
          ))}
        </div>

      ) : (
        /* Estado vazio */
        <div className="text-center py-6 px-6">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users size={20} className="text-[#A3AED0]/50" />
          </div>
          <p className="text-[13px] font-medium text-[#A3AED0]">Nenhum usuário encontrado.</p>
        </div>
      )}
    </>
  );
}

export default SidebarUserList;