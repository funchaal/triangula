// ─────────────────────────────────────────────────────────────────────────────
// components/MapSidebar/SidebarUserList.jsx — Lista de usuários de um arco ou base
// ─────────────────────────────────────────────────────────────────────────────

import { Users, Loader2, FileText, Layers as LayersIcon, Briefcase, Building2 } from "lucide-react";
import LoadingTriangle from "../../../../components/ui/LoadingTriangle";
import { nodeType } from '../../helpers';

/**
 * Retorna o nome/valor de um item do dicionário pelo id, ou null.
 */
function lbl(dict, id) {
  if (!id || id === '0') return null;
  return dict?.[String(id)] ?? null;
}

/**
 * @param {boolean} isFetching - True enquanto os dados estão carregando
 * @param {boolean} isBase     - True se a seleção é um nó (base/região/estado / bacia)
 * @param {object}  selection  - A seleção atual do mapa
 * @param {Array}   users      - Lista de usuários retornados pela API
 * @param {object}  roles      - Dicionário de cargos
 * @param {object}  roleTypes  - Dicionário de tipos de cargo (técnico/superior)
 * @param {object}  workRegimes- Dicionário de regimes de trabalho
 * @param {object}  departments- Dicionário de gerências/departamentos
 */
function SidebarUserList({ isFetching, isBase, selection, users, roles, roleTypes, workRegimes, departments }) {
  const nType = isBase && selection?.key ? nodeType(selection.key) : null;
  const baseLabel = nType === 'region' ? 'Pessoas nesta região' : nType === 'state' ? 'Pessoas neste(a) estado / bacia' : 'Pessoas nesta base';

  return (
    <>
      <div className="border-t border-white/5 mx-6 mb-4" />
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#A3AED0]/70 mb-3 mx-6">
        {isBase ? baseLabel : 'Pessoas nesta rota'}
      </div>

      {/* Estado de carregamento */}
      {isFetching ? (
        <div className="flex justify-center py-8">
          <LoadingTriangle size={24} />
        </div>

      ) : users.length > 0 ? (
        <div className="px-6 pb-6 space-y-3">
          {users.map((u, i) => {
            const roleName = lbl(roles, u.role_id);
            const roleLabel = typeof roleName === 'object' ? roleName?.name : roleName;
            const typeLabel = lbl(roleTypes, u.role_type_id);
            const deptLabel = lbl(departments, u.department_id);
            const regimeLabel = lbl(workRegimes, u.regime_id);

            // Combina Cargo e Tipo de Cargo (ex: "Engenheiro • Superior")
            const fullRole = [roleLabel, typeLabel].filter(Boolean).join(' • ');

            return (
              <div key={u.username ?? i} className="bg-[#13204c] rounded-2xl p-4">

                {/* Avatar + Nome + Username */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0">
                    {(u.name || u.username)?.slice(0, 2).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-white truncate">{u.name || 'Sem nome'}</div>
                    {u.username && (
                      <div className="text-[11px] text-[#A3AED0] font-medium truncate mt-0.5">@{u.username}</div>
                    )}
                  </div>
                </div>

                {/* Informações Profissionais */}
                <div className="space-y-1.5 mb-4">
                  {fullRole && (
                    <div className="flex items-center gap-2 text-[11px] text-[#A3AED0]">
                      <Briefcase size={12} className="shrink-0 text-blue-400/50" />
                      <span className="truncate" title={fullRole}>{fullRole}</span>
                    </div>
                  )}

                  {regimeLabel && (
                    <div className="flex items-center gap-2 text-[11px] text-[#A3AED0]">
                      <LayersIcon size={12} className="shrink-0 text-blue-400/50" />
                      <span className="truncate" title={regimeLabel}>{regimeLabel}</span>
                    </div>
                  )}

                  {deptLabel && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 px-2 py-1 rounded-md max-w-full">
                      <Building2 size={10} className="shrink-0" />
                      <span className="truncate" title={deptLabel}>{deptLabel}</span>
                    </div>
                  )}
                </div>

                {/* Contatos */}
                {(u.phone || u.email) && (
                  <div className="text-[11px] text-white/90 mb-1 space-y-1 bg-[#0f193d] p-2.5 rounded-xl border border-white/5">
                    {u.phone && (
                      <div className="truncate">
                        <span className="text-[#A3AED0] font-medium mr-1.5">Tel:</span>{u.phone}
                      </div>
                    )}
                    {u.email && (
                      <div className="truncate">
                        <span className="text-[#A3AED0] font-medium mr-1.5">E-mail:</span>{u.email}
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
            );
          })}
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