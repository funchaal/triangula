import { createSlice } from '@reduxjs/toolkit'
import { api } from '../../services/api'

const TOKEN_KEY = 'token'

const initialState = {
  token: localStorage.getItem(TOKEN_KEY) ?? null,
  user: null,
  interests: [],
  matches: [],
  selectedMatchId: null,
  isLoggedIn: false,
}

// Deduplica matches por id
function dedupeMatches(matches = []) {
  const seen = new Set()
  return matches.filter(m => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })
}

function hydrateAuth(state, payload) {
  state.user        = payload.user
  state.interests  = payload.interests  ?? []
  state.matches     = dedupeMatches(payload.matches ?? [])
  state.isLoggedIn  = true
  // Limpa seleção se o match já não existe mais
  if (state.selectedMatchId && !state.matches.find(m => m.id === state.selectedMatchId)) {
    state.selectedMatchId = null
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem(TOKEN_KEY)
      return { ...initialState, token: null, isLoggedIn: false}
    },
    selectMatch(state, action) {
      // Toggle: clicar no mesmo match fecha o painel
      state.selectedMatchId = state.selectedMatchId === action.payload
        ? null
        : action.payload
    },
  },
  extraReducers: (builder) => {

    // Login
    builder.addMatcher(
      api.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.token = payload.token
        localStorage.setItem(TOKEN_KEY, payload.token)
        hydrateAuth(state, payload)
      }
    )

    // Register
    builder.addMatcher(
      api.endpoints.register.matchFulfilled,
      (state, { payload }) => {
        state.token = payload.token
        localStorage.setItem(TOKEN_KEY, payload.token)
        hydrateAuth(state, payload)
      }
    )

    // Restauração de sessão
    builder.addMatcher(
      api.endpoints.restoreSession.matchFulfilled,
      (state, { payload }) => {
        hydrateAuth(state, payload)
      }
    )

    // Token expirado / inválido
    builder.addMatcher(
      api.endpoints.restoreSession.matchRejected,
      (state) => {
        localStorage.removeItem(TOKEN_KEY)
        return { ...initialState, token: null, isLoggedIn: false }
      }
    )

    // Atualiza perfil
    builder.addMatcher(
      api.endpoints.updateMe.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user
        if (payload.matches !== undefined) {
          state.matches = dedupeMatches(payload.matches)
          if (state.selectedMatchId && !state.matches.find(m => m.id === state.selectedMatchId)) {
            state.selectedMatchId = null
          }
        }
      }
    )

    // Cria interesse
    builder.addMatcher(
      api.endpoints.createinterest.matchFulfilled,
      (state, { payload }) => {
        if (payload?.interests !== undefined) {
          state.interests = payload.interests ?? []
        }
        if (payload?.matches !== undefined) {
          state.matches = payload.matches ?? []
        }
        if (state.selectedMatchId && !state.matches.find(m => m.id === state.selectedMatchId)) {
          state.selectedMatchId = null
        }
      }
    )

    // Deleta interesse — servidor agora retorna { interest_id, interests, matches }
    builder.addMatcher(
      api.endpoints.deleteinterest.matchFulfilled,
      (state, { payload, meta }) => {
          if (payload?.interests !== undefined) {
            state.interests = payload.interests ?? []
          }
          if (payload?.matches !== undefined) {
            state.matches = payload.matches ?? []
            if (state.selectedMatchId && !state.matches.find(m => m.id === state.selectedMatchId)) {
              state.selectedMatchId = null
            }
          }
      }
    )
  },
})

export const { logout, selectMatch } = authSlice.actions

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn
export const selectUser       = (state) => state.auth.user

export default authSlice.reducer