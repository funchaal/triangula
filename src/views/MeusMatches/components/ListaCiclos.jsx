// ─────────────────────────────────────────────────────────────────────────────
// ListaCiclos.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useAppDispatch, useAppSelector, selectSelectedMatch, selectLocations } from '../../../store/hooks';
import { selectMatch } from '../../../store/slices/authSlice';
import MatchCard from './MatchCard';
import { chainLabels, cycleType, allAccepted } from '../helpers';

function ListaCiclos({ matches }) {
  const dispatch  = useAppDispatch();
  const selected  = useAppSelector(selectSelectedMatch);
  const locations = useAppSelector(selectLocations);

  return (
    // Painel lateral com a cor secundária para destacar do mapa
    <div className="lg:w-[450px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 z-10 shadow-[5px_0_30px_rgba(0,0,0,0.3)] lg:shadow-none">

      {/* Cabeçalho App-Style */}
      <div className="pt-6 sm:pt-6 sm:pb-5 pl-5 pr-6 lg:pl-8 shrink-0 flex flex-col justify-center">
        <h1 className="text-2xl lg:text-2xl font-bold text-white leading-none tracking-wide">Possíveis Matches</h1>
        <div className="text-xs lg:text-sm text-[#A3AED0] mt-0 font-medium">
          {matches.length} ciclo{matches.length !== 1 ? 's' : ''} encontrado{matches.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="
        lg:flex-1 lg:overflow-y-auto lg:px-6 lg:pb-8 lg:pt-2 lg:space-y-4
        flex lg:flex lg:flex-col
        overflow-x-auto overflow-y-hidden lg:overflow-x-hidden
        px-4 py-5
        gap-4 lg:gap-0
        snap-x snap-mandatory lg:snap-none
        [&::-webkit-scrollbar]:hidden
        lg:[&::-webkit-scrollbar]:w-1.5
        lg:[&::-webkit-scrollbar]:block
        lg:[&::-webkit-scrollbar-track]:bg-transparent
        lg:[&::-webkit-scrollbar-thumb]:bg-white/10
        lg:[&::-webkit-scrollbar-thumb]:rounded-full
        hover:lg:[&::-webkit-scrollbar-thumb]:bg-white/20
      ">
        {matches.map(m => (
          <MatchCard
            key={m.id}
            match={m}
            isActive={selected?.id === m.id}
            labels={chainLabels(m.chain, locations)}
            tipo={cycleType(m.chain)}
            confirmed={allAccepted(m.chain)}
            onClick={() => dispatch(selectMatch(m.id))}
          />
        ))}

        <div className="shrink-0 w-2 lg:hidden" />
      </div>
    </div>
  );
}

export default ListaCiclos;