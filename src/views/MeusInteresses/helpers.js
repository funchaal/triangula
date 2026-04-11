// ─────────────────────────────────────────────────────────────────────────────
// helpers.js — Funções utilitárias para a view MeusInteresses
// ─────────────────────────────────────────────────────────────────────────────

export const ANY = "0";

/** Estado inicial vazio para o formulário de interesse */
export const EMPTY_INTEREST = {
  target_base_id:       ANY,
  target_region_id:     ANY,
  target_state_id:      ANY,
  target_role_id:       ANY,
  target_role_type_id:  ANY,
  target_department_id: ANY,
  target_regime_id:     ANY,
  observacoes:          "",
};

/**
 * Retorna o nome de um item de um dicionário (por id),
 * ou null se o id for indefinido ou igual a ANY.
 * @param {object} dict   - Dicionário { id: { name } | string }
 * @param {string} id     - ID a buscar
 */
export function lbl(dict, id) {
  if (!id || String(id) === ANY) return null;
  const entry = dict[String(id)];
  return entry?.name ?? entry ?? null;
}

/**
 * Retorna o label de destino principal de um interesse.
 * Prioridade: base > região > estado > genérico.
 */
export function destLabel(interest, { locations, regions, states }) {
  if (interest.target_base_id && interest.target_base_id !== ANY)
    return locations[interest.target_base_id]?.name ?? interest.target_base_id;

  if (interest.target_region_id && interest.target_region_id !== ANY)
    return `Região ${regions[interest.target_region_id]?.name ?? interest.target_region_id}`;

  if (interest.target_state_id && interest.target_state_id !== ANY)
    return `Estado ${states[interest.target_state_id]?.name ?? interest.target_state_id}`;

  return 'Qualquer localidade';
}

/**
 * Retorna o sublabel de destino (região/estado pai) de um interesse.
 */
export function destSub(interest, { locations, regions, states }) {
  if (interest.target_base_id && interest.target_base_id !== ANY)
    return regions[locations[interest.target_base_id]?.region_id]?.name ?? null;

  if (
    interest.target_region_id && interest.target_region_id !== ANY &&
    interest.target_state_id  !== ANY
  ) return states[interest.target_state_id]?.name;

  return null;
}