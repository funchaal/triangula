import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    // Injeta Bearer Token automaticamente em toda requisição
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),

  endpoints: (builder) => ({
    // ── Público ───────────────────────────────────────────────────────────────

    /**
     * GET /api/init
     * Bootstrap público — metadados + dados do mapa em uma única chamada.
     * Chamado assim que o app abre, antes de qualquer autenticação.
     *
     * Response: { metadata: { roles, departments, locations, work_regimes }, map_interests: [...] }
     */
    init: builder.query({
      query: () => '/init',
    }),

    getArcUsers: builder.query({
      query: (params) => ({
        url: '/map/arc', 
        method: 'GET',
        params: {
          from_key: params.from,
          to_key: params.to
        }
      }),
    }),

    getBaseUsers: builder.query({
      query: (params) => ({
        url: '/map/base', 
        method: 'GET',
        params: params
      }),
    }),

    /**
     * POST /api/auth/session
     * Valida o token existente no localStorage e recupera os dados do usuário.
     * 
     * Response: { user, interests, matches }
     */
    restoreSession: builder.mutation({
        query: () => ({
            url: '/auth/session',
            method: 'POST',
        }),
    }),

    /**
     * POST /api/auth/login (ou register)
     * Bootstrap do usuário autenticado.
     *
     * Payload: { email, password } | { email, password, name, key, role_id, base_id }
     * Response: { token, user, interests, matches }
     */
    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),

    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),

    // ── Privado (requer Bearer Token) ─────────────────────────────────────────

    /**
     * PUT /api/users/me
     * Atualiza o "Cartão Você".
     * Se cargo ou status mudarem, o servidor reavalia e devolve matches.
     *
     * Payload: { role_id?, phone?, email?, status? }
     * Response: { user, matches? }
     */
    updateMe: builder.mutation({
      query: (body) => ({
        url: '/users/me',
        method: 'PUT',
        body,
      }),
    }),

    /**
     * POST /api/interests
     * Cria uma novo interesse de permuta.
     * Dispara o algoritmo de busca por ciclos em background.
     * Se um ciclo fechar, a resposta inclui matches atualizados + BCC de e-mail.
     *
     * Payload: { target_base_id, target_department_id?, target_work_regime_id? }
     * Response: { interest, matches? }
     */
    createinterest: builder.mutation({
      query: (body) => ({
        url: '/interests',
        method: 'POST',
        body,
      }),
    }),

    deleteinterest: builder.mutation({
        query: (interestId) => ({
            url: `/interests/${interestId}`,
            method: 'DELETE',
        }),
    }),

    forgotPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    /**
     * POST /api/config/add-metadata  (Admin only)
     * Adiciona um novo item ao dicionário de metadados.
     *
     * Payload: { category: 'roles'|'departments'|'locations'|'work_regimes', value: string }
     * Response: { category, key, value }
     */
    addMetadata: builder.mutation({
      query: (body) => ({
        url: '/config/add-metadata',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useInitQuery,
  useGetArcUsersQuery, 
  useGetBaseUsersQuery, 
  useLoginMutation,
  useUpdateMeMutation,
  useCreateinterestMutation,
  useAddMetadataMutation,
  useRestoreSessionMutation,
  useRegisterMutation,
  useDeleteinterestMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = api