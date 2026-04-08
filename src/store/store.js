import { configureStore } from '@reduxjs/toolkit'
import { api } from '../services/api'
import globalReducer from './slices/globalSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    global: globalReducer,
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})