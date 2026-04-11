// ─────────────────────────────────────────────────────────────────────────────
// helpers.js — Funções utilitárias para a view MeusMatches
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna os nomes das bases de um ciclo de permuta em ordem.
 * @param {Array}  chain     - Array de passos do ciclo
 * @param {object} locations - Dicionário de localidades { id: { name } }
 */
export function chainLabels(chain, locations) {
  return chain.map(step => locations[step.base_id]?.name ?? step.base_id);
}

/**
 * Retorna o rótulo descritivo do tipo de ciclo conforme o número de participantes.
 * @param {Array} chain - Array de passos do ciclo
 */
export function cycleType(chain) {
  if (chain.length === 2) return 'Permuta Direta';
  if (chain.length === 3) return 'Triangulação';
  return 'Ciclo Quádruplo';
}

/**
 * Verifica se todos os participantes do ciclo já aceitaram a permuta.
 * @param {Array} chain - Array de passos do ciclo
 */
export function allAccepted(chain) {
  return chain.every(s => s.aceite === true);
}