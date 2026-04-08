import { createSlice } from '@reduxjs/toolkit'
import { api } from '../../services/api'

const initialState = {
  config: null,
  mapData: [],
  ui: {
    // Atualizado no comentário: 'base' agora usa 'key'
    selection: null,        // { type: 'arc', from, to } | { type: 'base', key: string } | null
    hoveredArc: null,       
  },
}

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    selectArc(state, action) {
      const s = state.ui.selection
      const same = s?.type === 'arc' && s.from === action.payload.from && s.to === action.payload.to
      state.ui.selection = same ? null : { type: 'arc', ...action.payload }
    },
    selectBase(state, action) {
      // action.payload: baseId string
      const s = state.ui.selection
      // Correção: alterado de s.id para s.key
      const same = s?.type === 'base' && s.key === action.payload
      // Correção: alterado de { type: 'base', id: action.payload } para key
      state.ui.selection = same ? null : { type: 'base', key: action.payload }
    },
    clearSelection(state) {
      state.ui.selection = null
    },
    setHoveredArc(state, action) {
      state.ui.hoveredArc = action.payload  
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.init.matchFulfilled,
      (state, { payload }) => {
        state.config   = payload.metadata
        state.mapData  = payload.map_interests
      }
    )
    builder.addMatcher(
      api.endpoints.addMetadata.matchFulfilled,
      (state, { payload }) => {
        if (state.config) {
          state.config[payload.category][payload.key] = payload.value
        }
      }
    )
  },
})

export const { selectArc, selectBase, clearSelection, setHoveredArc } = globalSlice.actions
export default globalSlice.reducer