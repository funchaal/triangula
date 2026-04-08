import { useDispatch, useSelector } from 'react-redux'

export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector

// ─── Global ───────────────────────────────────────────────────────────────────

export const selectConfig       = (s) => s.global.config
export const selectMapData      = (s) => s.global.mapData
export const selectUi           = (s) => s.global.ui
export const selectMapSelection = (s) => s.global.ui.selection
export const selectHoveredArc   = (s) => s.global.ui.hoveredArc

// Objeto constante para garantir a mesma referência de memória e evitar avisos
const EMPTY_DICT = {}

export const selectLocations    = (s) => s.global.config?.locations    ?? EMPTY_DICT
export const selectRoles        = (s) => s.global.config?.roles        ?? EMPTY_DICT
export const selectDepartments  = (s) => s.global.config?.departments  ?? EMPTY_DICT
export const selectWorkRegimes  = (s) => s.global.config?.work_regimes ?? EMPTY_DICT
export const selectRoleTypes    = (s) => s.global.config?.role_types   ?? EMPTY_DICT
export const selectRegions      = (s) => s.global.config?.regions      ?? EMPTY_DICT
export const selectStates       = (s) => s.global.config?.states       ?? EMPTY_DICT

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const selectToken         = (s) => s.auth.token
export const selectIsLoggedIn    = (s) => s.auth.isLoggedIn
export const selectUser          = (s) => s.auth.user
export const selectinterests    = (s) => s.auth.interests
export const selectMatches       = (s) => s.auth.matches
export const selectSelectedMatch = (s) =>
  s.auth.matches.find((m) => m.id === s.auth.selectedMatchId) ?? null