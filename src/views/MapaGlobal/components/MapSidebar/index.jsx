// ─────────────────────────────────────────────────────────────────────────────
// components/MapSidebar/index.jsx — Sidebar lateral do mapa global
// Orquestra as queries de API e compõe os sub-componentes de stats e usuários
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useGetArcUsersQuery, useGetBaseUsersQuery } from '../../../../services/api';
import SidebarHeader    from './SidebarHeader';
import SidebarArcStats  from './SidebarArcStats';
import SidebarBaseStats from './SidebarBaseStats';
import SidebarUserList  from './SidebarUserList';

/**
 * @param {object|null} selection   - Seleção atual { type: 'arc'|'base', ... }
 * @param {Array}       mapData     - Todos os arcos do mapa
 * @param {object}      locations   - Dicionário de bases
 * @param {object}      regions     - Dicionário de regiões
 * @param {object}      states      - Dicionário de estados
 * @param {object}      roles       - Dicionário de cargos
 * @param {object}      workRegimes - Dicionário de regimes de trabalho
 * @param {function}    onClose     - Callback para fechar a sidebar
 */
function MapSidebar({ selection, mapData, locations, regions, states, roles, workRegimes, onClose }) {
  const [activeSelection, setActiveSelection] = useState(selection);

  useEffect(() => {
    if (selection) {
      setActiveSelection(selection);
    }
  }, [selection]);

  const currentSelection = selection || activeSelection;

  const isArc  = currentSelection?.type === 'arc';
  const isBase = currentSelection?.type === 'base';

  // ── Queries condicionais por tipo de seleção ──────────────────────────────
  const { data: arcUsers,  isFetching: isArcFetching  } = useGetArcUsersQuery(
    { from: currentSelection?.from, to: currentSelection?.to },
    { skip: !isArc }
  );
  const { data: baseUsers, isFetching: isBaseFetching } = useGetBaseUsersQuery(
    { key: currentSelection?.key },
    { skip: !isBase }
  );

  const isFetching = isArc ? isArcFetching : isBaseFetching;
  const users      = isArc ? (arcUsers?.users ?? []) : (baseUsers?.users ?? []);

  // ── Dados derivados para arco ─────────────────────────────────────────────
  const arcInfo = isArc
    ? mapData.find(a => a.from === currentSelection?.from && a.to === currentSelection?.to)
    : null;

  // ── Dados derivados para base ─────────────────────────────────────────────
  const baseArcsOut = isBase ? mapData.filter(a => a.from === currentSelection?.key) : [];
  const baseArcsIn  = isBase ? mapData.filter(a => a.to   === currentSelection?.key) : [];

  const sidebarClasses = `absolute top-0 right-0 h-full w-80 lg:w-[360px] bg-[#03072a] backdrop-blur-xl border-l border-white/5 flex flex-col z-50 shadow-[-5px_0_10px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-in-out ${
    selection ? 'translate-x-0' : 'translate-x-full'
  }`;

  return (
    <div className={sidebarClasses}>
      {currentSelection && (
        <>
          <SidebarHeader
            selection={currentSelection}
            locations={locations}
            regions={regions}
            states={states}
            onClose={onClose}
          />

          {/* Área de conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">

            {isArc && <SidebarArcStats arcInfo={arcInfo} />}

            {isBase && (
              <SidebarBaseStats
                baseArcsOut={baseArcsOut}
                baseArcsIn={baseArcsIn}
                locations={locations}
                regions={regions}
                states={states}
              />
            )}

            <SidebarUserList
              isFetching={isFetching}
              isBase={isBase}
              users={users}
              roles={roles}
              workRegimes={workRegimes}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default MapSidebar;