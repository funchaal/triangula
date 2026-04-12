// ─────────────────────────────────────────────────────────────────────────────
// helpers.js — Funções utilitárias e constantes para a view MeusDados
// ─────────────────────────────────────────────────────────────────────────────

import { validatePhoneNumber } from '../../components/ui/PhoneInput';

export const ANY = "0";

/** Estado inicial do perfil antes de carregar os dados do usuário */
export const EMPTY_PROFILE = {
  base_id:       ANY,
  region_id:     ANY,
  state_id:      ANY,
  role_id:       ANY,
  role_type_id:  ANY,
  department_id: ANY,
  regime_id:     ANY,
  observations:  "",
  phone:         "",
  email:         "",
  name:          "",
  user_key:      "",
  state:         "permuta",
};

/**
 * Constrói o payload de atualização contendo apenas os campos que mudaram,
 * comparando o estado atual do formulário com os dados originais do usuário.
 * @param {object} profile - Estado atual do formulário
 * @param {object} user    - Dados originais vindos da store
 * @returns {object} payload com somente os campos alterados
 */
export function buildDiffPayload(profile, user) {
  const payload = {};

  // Compara campos de texto simples
  const strChanged = (field, profileField = field) =>
    (profile[profileField] ?? "") !== (user[field] ?? "");

  // Compara campos de ID (numérico vs string)
  const idChanged = (field, profileField = field) =>
    String(profile[profileField] ?? ANY) !== String(user[field] ?? ANY);

  if (strChanged("phone"))        payload.phone        = profile.phone        || undefined;
  if (strChanged("email"))        payload.email        = profile.email        || undefined;
  if (strChanged("name"))         payload.name         = profile.name         || undefined;
  if (strChanged("user_key"))     payload.user_key     = profile.user_key     || undefined;
  if (strChanged("observations")) payload.observations = profile.observations || undefined;
  if (strChanged("state"))        payload.state        = profile.state        || undefined;

  if (idChanged("base_id"))      payload.base_id      = profile.base_id      !== ANY ? profile.base_id               : undefined;
  if (idChanged("region_id"))    payload.region_id    = profile.region_id    !== ANY ? parseInt(profile.region_id)   : undefined;
  if (idChanged("state_id"))     payload.state_id     = profile.state_id     !== ANY ? parseInt(profile.state_id)    : undefined;
  if (idChanged("role_id"))      payload.role_id      = profile.role_id      !== ANY ? parseInt(profile.role_id)     : undefined;
  if (idChanged("role_type_id")) payload.role_type_id = profile.role_type_id !== ANY ? parseInt(profile.role_type_id): undefined;
  if (idChanged("department_id"))payload.department_id= profile.department_id!== ANY ? parseInt(profile.department_id):undefined;
  if (idChanged("regime_id"))    payload.regime_id    = profile.regime_id    !== ANY ? parseInt(profile.regime_id)   : undefined;

  return payload;
}

/**
 * Monta o objeto de perfil populado a partir dos dados do usuário autenticado.
 * Usado ao carregar a view e ao cancelar edição.
 * @param {object} user - Dados do usuário vindos da store
 */
export function profileFromUser(user) {
  return {
    base_id:       user.base_id       ?? ANY,
    region_id:     user.region_id     ?? ANY,
    state_id:      user.state_id      ?? ANY,
    role_id:       user.role_id       ?? ANY,
    role_type_id:  user.role_type_id  ?? ANY,
    department_id: user.department_id ?? ANY,
    regime_id:     user.regime_id     ?? ANY,
    observations:  user.observations  ?? "",
    phone:         user.phone         ?? "",
    email:         user.email         ?? "",
    name:          user.name          ?? "",
    user_key:      user.user_key      ?? "",
    state:         user.state         ?? "permuta",
  };
}

/**
 * Valida se o perfil está completo para permitir o salvamento.
 * Todos os campos obrigatórios devem estar preenchidos.
 * @param {object} profile - Estado atual do formulário
 */
export function isProfileValid(profile) {
  return (
    profile.name.trim()     !== '' &&
    validatePhoneNumber(profile.phone) &&
    profile.email.trim()    !== '' &&
    profile.user_key.trim().length === 4 &&
    String(profile.state_id)      !== ANY &&
    String(profile.region_id)     !== ANY &&
    String(profile.base_id)       !== ANY &&
    String(profile.role_id)       !== ANY &&
    String(profile.role_type_id)  !== ANY &&
    String(profile.department_id) !== ANY &&
    String(profile.regime_id)     !== ANY
  );
}

/**
 * Retorna o nome de um item em um dicionário pelo id,
 * ou null se o id for indefinido ou igual a ANY.
 */
export function getLabel(dict, id) {
  if (!id || String(id) === ANY) return null;
  const entry = dict[String(id)];
  return entry?.name ?? entry ?? null;
}