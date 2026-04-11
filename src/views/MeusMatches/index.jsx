// ─────────────────────────────────────────────────────────────────────────────
// index.jsx — View principal: Meus Matches
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch, selectMatches, selectSelectedMatch } from '../../store/hooks';
import { selectMatch } from '../../store/slices/authSlice';

import EstadoVazio from './components/EstadoVazio';
import ListaCiclos from './components/ListaCiclos';
import MapaFluxo   from './components/MapaFluxo';

function MeusMatches() {
  const dispatch = useAppDispatch();
  const matches  = useAppSelector(selectMatches);
  const selected = useAppSelector(selectSelectedMatch);

  useEffect(() => {
    if (matches.length > 0 && !selected) {
      dispatch(selectMatch(matches[0].id));
    }
  }, [matches.length, selected, dispatch]);

  useEffect(() => {
    if (matches.length === 0) {
      dispatch(selectMatch(null));
    }
  }, [matches.length, dispatch]);

  if (!matches.length) return <EstadoVazio />;

  return (
    // Fundo escuro principal do app
    <div className="h-full flex flex-col lg:flex-row bg-[#03072a] overflow-hidden">
      <ListaCiclos matches={matches} />
      <MapaFluxo   selected={selected} />
    </div>
  );
}

export default MeusMatches;