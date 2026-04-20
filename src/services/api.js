import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  reducerPath: 'api',
  tagTypes: ['AdminStates', 'AdminRegions', 'AdminLocations'],
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

        /**
     * GET /api/auth/check-username?username=rafael
     * Verifica se um username está disponível antes do registro.
     * Endpoint público — não requer token.
     *
     * Response: { available: boolean }
     */
    checkUsername: builder.query({
      query: (username) => ({
        url: '/auth/check-username',
        params: { username },
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

    // ── Admin ─────────────────────────────────────────────────────────────────

    getAdminStates: builder.query({
      query: () => '/admin/states',
      providesTags: ['AdminStates'],
    }),
    createAdminState: builder.mutation({
      query: (body) => ({ url: '/admin/states', method: 'POST', body }),
      invalidatesTags: ['AdminStates'],
    }),
    updateAdminState: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/states/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminStates'],
    }),
    deleteAdminState: builder.mutation({
      query: (id) => ({ url: `/admin/states/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminStates'],
    }),

    getAdminRegions: builder.query({
      query: () => '/admin/regions',
      providesTags: ['AdminRegions'],
    }),
    createAdminRegion: builder.mutation({
      query: (body) => ({ url: '/admin/regions', method: 'POST', body }),
      invalidatesTags: ['AdminRegions'],
    }),
    updateAdminRegion: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/regions/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminRegions'],
    }),
    deleteAdminRegion: builder.mutation({
      query: (id) => ({ url: `/admin/regions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminRegions'],
    }),

    getAdminLocations: builder.query({
      query: () => '/admin/locations',
      providesTags: ['AdminLocations'],
    }),
    createAdminLocation: builder.mutation({
      query: (body) => ({ url: '/admin/locations', method: 'POST', body }),
      invalidatesTags: ['AdminLocations'],
    }),
    updateAdminLocation: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/locations/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminLocations'],
    }),
    deleteAdminLocation: builder.mutation({
      query: (id) => ({ url: `/admin/locations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminLocations'],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
    // Adicione estes endpoints ao seu createApi existente em services/api.js
    // (dentro do bloco `endpoints: (builder) => ({  ...  })`)
    // ─────────────────────────────────────────────────────────────────────────────

    // ── Tipos de Cargo (role_types) ───────────────────────────────────────────────
    getAdminRoleTypes: builder.query({
      query: () => "/admin/role-types",
      providesTags: ["AdminRoleTypes"],
    }),
    createAdminRoleType: builder.mutation({
      query: (body) => ({ url: "/admin/role-types", method: "POST", body }),
      invalidatesTags: ["AdminRoleTypes"],
    }),
    updateAdminRoleType: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/role-types/${id}`, method: "PUT", body }),
      invalidatesTags: ["AdminRoleTypes"],
    }),
    deleteAdminRoleType: builder.mutation({
      query: (id) => ({ url: `/admin/role-types/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminRoleTypes", "AdminRoles"],
    }),

    // ── Cargos (roles) ────────────────────────────────────────────────────────────
    getAdminRoles: builder.query({
      query: () => "/admin/roles",
      providesTags: ["AdminRoles"],
    }),
    createAdminRole: builder.mutation({
      query: (body) => ({ url: "/admin/roles", method: "POST", body }),
      invalidatesTags: ["AdminRoles"],
    }),
    updateAdminRole: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/roles/${id}`, method: "PUT", body }),
      invalidatesTags: ["AdminRoles"],
    }),
    deleteAdminRole: builder.mutation({
      query: (id) => ({ url: `/admin/roles/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminRoles"],
    }),

    // ─────────────────────────────────────────────────────────────────────────────
// Adicione estes endpoints ao seu createApi existente em services/api.js
// (dentro do bloco `endpoints: (builder) => ({  ...  })`)
// ─────────────────────────────────────────────────────────────────────────────

// ── Tipos de Cargo (role_types) ───────────────────────────────────────────────
getAdminRoleTypes: builder.query({
  query: () => "/admin/role-types",
  providesTags: ["AdminRoleTypes"],
}),
createAdminRoleType: builder.mutation({
  query: (body) => ({ url: "/admin/role-types", method: "POST", body }),
  invalidatesTags: ["AdminRoleTypes"],
}),
updateAdminRoleType: builder.mutation({
  query: ({ id, ...body }) => ({ url: `/admin/role-types/${id}`, method: "PUT", body }),
  invalidatesTags: ["AdminRoleTypes"],
}),
deleteAdminRoleType: builder.mutation({
  query: (id) => ({ url: `/admin/role-types/${id}`, method: "DELETE" }),
  invalidatesTags: ["AdminRoleTypes", "AdminRoles"],
}),

// ── Cargos (roles) ────────────────────────────────────────────────────────────
getAdminRoles: builder.query({
  query: () => "/admin/roles",
  providesTags: ["AdminRoles"],
}),
createAdminRole: builder.mutation({
  query: (body) => ({ url: "/admin/roles", method: "POST", body }),
  invalidatesTags: ["AdminRoles"],
}),
updateAdminRole: builder.mutation({
  query: ({ id, ...body }) => ({ url: `/admin/roles/${id}`, method: "PUT", body }),
  invalidatesTags: ["AdminRoles"],
}),
deleteAdminRole: builder.mutation({
  query: (id) => ({ url: `/admin/roles/${id}`, method: "DELETE" }),
  invalidatesTags: ["AdminRoles"],
}),

// ── Departamentos ─────────────────────────────────────────────────────────────
getAdminDepartments: builder.query({
  query: () => "/admin/departments",
  providesTags: ["AdminDepartments"],
}),
createAdminDepartment: builder.mutation({
  query: (body) => ({ url: "/admin/departments", method: "POST", body }),
  invalidatesTags: ["AdminDepartments"],
}),
updateAdminDepartment: builder.mutation({
  query: ({ id, ...body }) => ({ url: `/admin/departments/${id}`, method: "PUT", body }),
  invalidatesTags: ["AdminDepartments"],
}),
deleteAdminDepartment: builder.mutation({
  query: (id) => ({ url: `/admin/departments/${id}`, method: "DELETE" }),
  invalidatesTags: ["AdminDepartments"],
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
  useLazyCheckUsernameQuery,
  useDeleteinterestMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetAdminStatesQuery,
  useCreateAdminStateMutation,
  useUpdateAdminStateMutation,
  useDeleteAdminStateMutation,
  useGetAdminRegionsQuery,
  useCreateAdminRegionMutation,
  useUpdateAdminRegionMutation,
  useDeleteAdminRegionMutation,
  useGetAdminLocationsQuery,
  useCreateAdminLocationMutation,
  useUpdateAdminLocationMutation,
  useDeleteAdminLocationMutation,
  useGetAdminRoleTypesQuery,
  useCreateAdminRoleTypeMutation,
  useUpdateAdminRoleTypeMutation,
  useDeleteAdminRoleTypeMutation,
  useGetAdminRolesQuery,
  useCreateAdminRoleMutation,
  useUpdateAdminRoleMutation,
  useDeleteAdminRoleMutation, 
  useGetAdminDepartmentsQuery,
  useCreateAdminDepartmentMutation,
  useUpdateAdminDepartmentMutation,
  useDeleteAdminDepartmentMutation
} = api