// ─────────────────────────────────────────────────────────────────────────────
// AdminPanel.jsx — Painel de administração
// Tabs: Estados / Bacias · Regiões · Bases · Níveis · Cargos
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import {
  Map, Layers, GitBranch, Plus, AlertCircle, Search,
  ShieldAlert, ArrowLeft, Briefcase, Tag, Building2,
} from "lucide-react";

import { useAppSelector, selectIsLoggedIn, selectUser } from '../../store/hooks';
import { ButtonPrimary } from '../../components/ui/Button';
import LoadingTriangle from "../../components/ui/LoadingTriangle";

import {
  useGetAdminStatesQuery,    useDeleteAdminStateMutation,
  useGetAdminRegionsQuery,   useDeleteAdminRegionMutation,
  useGetAdminLocationsQuery, useDeleteAdminLocationMutation,
  useGetAdminRoleTypesQuery, useDeleteAdminRoleTypeMutation,
  useGetAdminRolesQuery,     useDeleteAdminRoleMutation,
  useGetAdminDepartmentsQuery, useDeleteAdminDepartmentMutation,
} from '../../services/api';

import Modal        from "./components/Modal";
import ItemRow      from "./components/ItemRow";
import TypeBadge    from "./components/TypeBadge";
import StateForm    from "./components/forms/StateForm";
import RegionForm   from "./components/forms/RegionForm";
import LocationForm from "./components/forms/LocationForm";
import RoleTypeForm from "./components/forms/RoleTypeForm";
import RoleForm     from "./components/forms/RoleForm";
import DepartmentForm from "./components/forms/DepartmentForm";

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "states",      label: "Estados / Bacias", Icon: Map        },
  { id: "regions",     label: "Regiões",           Icon: GitBranch  },
  { id: "locations",   label: "Bases",             Icon: Layers     },
  { id: "role_types",  label: "Níveis",            Icon: Tag        },
  { id: "roles",       label: "Cargos",            Icon: Briefcase  },
  { id: "departments", label: "Departamentos",     Icon: Building2  },
];

// ── Badge de nível ─────────────────────────────────────────────────────────────
function LevelBadge({ name }) {
  const isSup = name?.toLowerCase().includes("superior");
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0
      ${isSup
        ? "bg-violet-500/15 text-violet-400"
        : "bg-amber-500/15 text-amber-400"
      }`}>
      {name || "—"}
    </span>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminPanel() {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user       = useAppSelector(selectUser);
  const location   = useLocation();

  const [tab,         setTab]         = useState("states");
  const [modal,       setModal]       = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Queries ────────────────────────────────────────────────────────────────
  const skip = !user?.is_admin;
  const { data: statesData    = [], isLoading: lStates,    isError: eStates    } = useGetAdminStatesQuery(undefined,    { skip });
  const { data: regionsData   = [], isLoading: lRegions,   isError: eRegions   } = useGetAdminRegionsQuery(undefined,   { skip });
  const { data: locationsData = [], isLoading: lLocations, isError: eLocations } = useGetAdminLocationsQuery(undefined, { skip });
  const { data: roleTypesData = [], isLoading: lRoleTypes, isError: eRoleTypes } = useGetAdminRoleTypesQuery(undefined, { skip });
  const { data: rolesData     = [], isLoading: lRoles,     isError: eRoles     } = useGetAdminRolesQuery(undefined,     { skip });
  const { data: deptsData     = [], isLoading: lDepts,     isError: eDepts     } = useGetAdminDepartmentsQuery(undefined, { skip });

  const [deleteState]      = useDeleteAdminStateMutation();
  const [deleteRegion]     = useDeleteAdminRegionMutation();
  const [deleteLocation]   = useDeleteAdminLocationMutation();
  const [deleteRoleType]   = useDeleteAdminRoleTypeMutation();
  const [deleteRole]       = useDeleteAdminRoleMutation();
  const [deleteDepartment] = useDeleteAdminDepartmentMutation();

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!user?.is_admin) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#03072a] p-4">
        <div className="bg-[#13204c] p-6 sm:p-8 rounded-3xl border border-red-500/20 flex flex-col items-center gap-4 text-center max-w-sm shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-2">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-white font-bold text-xl">Acesso Restrito</h2>
          <p className="text-[#A3AED0] text-sm">
            Esta área é reservada para administradores do sistema.
          </p>
          <Link to="/" className="w-full mt-4">
            <ButtonPrimary className="w-full justify-center bg-white/5 hover:bg-white/10 border-none text-white">
              <ArrowLeft size={16} /> Voltar ao Início
            </ButtonPrimary>
          </Link>
        </div>
      </div>
    );
  }

  // ── Dados ordenados ────────────────────────────────────────────────────────
  const states    = [...statesData].sort((a, b) => a.name.localeCompare(b.name));
  const regions   = [...regionsData].sort((a, b) => a.name.localeCompare(b.name));
  const locations = [...locationsData].sort((a, b) => a.name.localeCompare(b.name));
  const roleTypes = [...roleTypesData].sort((a, b) => a.name.localeCompare(b.name));
  const roles     = [...rolesData].sort((a, b) => a.name.localeCompare(b.name));
  const depts     = [...deptsData].sort((a, b) => a.name.localeCompare(b.name));

  const loading  = lStates || lRegions || lLocations || lRoleTypes || lRoles || lDepts;
  const hasError = eStates || eRegions || eLocations || eRoleTypes || eRoles || eDepts;

  const stateMap    = Object.fromEntries(states.map(s => [s.id, s.name]));
  const regionMap   = Object.fromEntries(regions.map(r => [r.id, r.name]));
  const roleTypeMap = Object.fromEntries(roleTypes.map(rt => [rt.id, rt.name]));

  // ── Filtro ─────────────────────────────────────────────────────────────────
  const filterList = (list, getSub = () => "") => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(item =>
      item.name.toLowerCase().includes(q) || getSub(item).toLowerCase().includes(q)
    );
  };

  const filteredStates    = filterList(states);
  const filteredRegions   = filterList(regions,   r => stateMap[r.state_id] || "");
  const filteredLocations = filterList(locations, l => `${regionMap[l.region_id] || ""} ${stateMap[l.state_id] || ""}`);
  const filteredRoleTypes = filterList(roleTypes);
  const filteredRoles     = filterList(roles,     r => roleTypeMap[r.role_type_id] || "");
  const filteredDepts     = filterList(depts);

  const currentList = {
    states: filteredStates, regions: filteredRegions, locations: filteredLocations,
    role_types: filteredRoleTypes, roles: filteredRoles, departments: filteredDepts,
  }[tab] ?? [];

  const counts = {
    states: states.length, regions: regions.length, locations: locations.length,
    role_types: roleTypes.length, roles: roles.length, departments: depts.length,
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (type, id) => {
    setDeletingId(id);
    try {
      const map = {
        states: deleteState, regions: deleteRegion, locations: deleteLocation,
        role_types: deleteRoleType, roles: deleteRole, departments: deleteDepartment,
      };
      await map[type](id).unwrap();
    } catch (e) {
      alert(e.data?.detail || e.message || "Erro ao deletar");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-full flex flex-col bg-[#03072a] overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div className="pt-6 pb-4 px-4 lg:px-8 shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white leading-none tracking-wide">
                Administração
              </h1>
              <div className="text-xs lg:text-sm text-[#A3AED0] mt-0.5 font-medium">
                Gerencie estados / bacias, regiões, bases, níveis e cargos
              </div>
            </div>
            <div className="hidden sm:flex">
              <ButtonPrimary onClick={() => setModal({ type: tab })}>
                <Plus size={18} /> Novo
              </ButtonPrimary>
            </div>
          </div>
        </div>

        {/* Tabs — scroll horizontal silencioso no mobile */}
        <div className="px-4 lg:px-8 shrink-0 pb-4">
        <div className="flex gap-1 bg-[#13204c] rounded-xl p-1 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full sm:[&::-webkit-scrollbar]:hidden">
            {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { setTab(id); setSearchQuery(""); }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap
                ${tab === id
                    ? "bg-blue-500 text-white"
                    : "text-[#A3AED0] hover:text-white hover:bg-white/5"
                }`}>
                <Icon size={15} />
                {/* Desktop: label completo; Mobile: primeira palavra */}
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                ${tab === id ? "bg-white/20" : "bg-white/10"}`}>
                {counts[id]}
                </span>
            </button>
            ))}
        </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24 sm:pb-8
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          
          {/* Ajuste: pl-4/lg:pl-8 originais mantidos. pr-[10px] e lg:pr-[26px] compensam os 6px da barra */}
          <div className="pl-4 pr-[10px] lg:pl-8 lg:pr-[26px] pb-8 space-y-6">

            {loading && (
              <div className="flex items-center justify-center h-40">
                <LoadingTriangle size={48} />
              </div>
            )}

            {hasError && !loading && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> Erro ao carregar dados do servidor.
              </div>
            )}

            {!loading && !hasError && (
              <div className="bg-[#13204c] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-white/5 bg-[#0B1437]/50">
                  <div className="flex items-center justify-between w-full sm:w-auto">
                    <span className="text-[#A3AED0] text-sm font-medium">
                      {currentList.length} {TABS.find(t => t.id === tab)?.label.toLowerCase()}
                    </span>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3AED0]" size={16} />
                    <input
                      type="text"
                      placeholder={`Buscar ${TABS.find(t => t.id === tab)?.label.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-[#03072a] border border-white/10 rounded-xl pl-9 pr-4 py-2
                                 text-sm text-white placeholder:text-[#A3AED0]/50
                                 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Lista */}
                <div className="flex flex-col">
                  {tab === "states" && filteredStates.map(s => (
                    <ItemRow key={s.id} name={s.name} sub={`${s.lat}, ${s.lng}`}
                      onEdit={() => setModal({ type: "states", item: s })}
                      onDelete={() => handleDelete("states", s.id)}
                      deleting={deletingId === s.id} />
                  ))}

                  {tab === "regions" && filteredRegions.map(r => (
                    <ItemRow key={r.id} name={r.name} sub={stateMap[r.state_id] || r.state_id}
                      onEdit={() => setModal({ type: "regions", item: r })}
                      onDelete={() => handleDelete("regions", r.id)}
                      deleting={deletingId === r.id} />
                  ))}

                  {tab === "locations" && filteredLocations.map(l => (
                    <ItemRow key={l.id} name={l.name}
                      sub={`${regionMap[l.region_id] || l.region_id} · ${stateMap[l.state_id] || l.state_id}`}
                      badge={<TypeBadge type={l.type} />}
                      onEdit={() => setModal({ type: "locations", item: l })}
                      onDelete={() => handleDelete("locations", l.id)}
                      deleting={deletingId === l.id} />
                  ))}

                  {tab === "role_types" && filteredRoleTypes.map(rt => (
                    <ItemRow key={rt.id} name={rt.name}
                      sub={`${roles.filter(r => r.role_type_id === rt.id).length} cargo(s) vinculado(s)`}
                      onEdit={() => setModal({ type: "role_types", item: rt })}
                      onDelete={() => handleDelete("role_types", rt.id)}
                      deleting={deletingId === rt.id} />
                  ))}

                  {tab === "roles" && filteredRoles.map(r => (
                    <ItemRow key={r.id} name={r.name}
                      sub=""
                      badge={<LevelBadge name={roleTypeMap[r.role_type_id]} />}
                      onEdit={() => setModal({ type: "roles", item: r })}
                      onDelete={() => handleDelete("roles", r.id)}
                      deleting={deletingId === r.id} />
                  ))}

                  {tab === "departments" && filteredDepts.map(d => (
                    <ItemRow key={d.id} name={d.name}
                      onEdit={() => setModal({ type: "departments", item: d })}
                      onDelete={() => handleDelete("departments", d.id)}
                      deleting={deletingId === d.id} />
                  ))}

                  {currentList.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-[#A3AED0]">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        {TABS.filter(t => t.id === tab).map(t => (
                          <t.Icon key={t.id} size={24} className="opacity-50" />
                        ))}
                      </div>
                      <p className="text-sm font-medium">Nenhum registro encontrado</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão flutuante mobile */}
      <button onClick={() => setModal({ type: tab })}
        className="fixed bottom-6 right-6 z-50 md:hidden flex items-center justify-center
                   w-14 h-14 bg-blue-500 hover:bg-blue-400 text-white rounded-full shadow-lg
                   transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/50"
        aria-label="Novo">
        <Plus size={24} />
      </button>

      {/* Modais */}
      {modal?.type === "states" && (
        <Modal title={modal.item ? "Editar Estado / Bacia" : "Novo Estado / Bacia"} onClose={() => setModal(null)}>
          <StateForm initial={modal.item} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "regions" && (
        <Modal title={modal.item ? "Editar Região" : "Nova Região"} onClose={() => setModal(null)}>
          <RegionForm initial={modal.item} states={states} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "locations" && (
        <Modal title={modal.item ? "Editar Base" : "Nova Base"} onClose={() => setModal(null)}>
          <LocationForm initial={modal.item} regions={regions} states={states} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "role_types" && (
        <Modal title={modal.item ? "Editar Nível" : "Novo Nível"} onClose={() => setModal(null)}>
          <RoleTypeForm initial={modal.item} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "roles" && (
        <Modal title={modal.item ? "Editar Cargo" : "Novo Cargo"} onClose={() => setModal(null)}>
          <RoleForm initial={modal.item} roleTypes={roleTypes} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "departments" && (
        <Modal title={modal.item ? "Editar Departamento" : "Novo Departamento"} onClose={() => setModal(null)}>
          <DepartmentForm initial={modal.item} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}