import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, MoreHorizontal, LogOut, Menu, X, Triangle } from 'lucide-react';
import { NAV_ITEMS } from '../../constants';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectIsLoggedIn, selectUser, selectMatches } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user = useAppSelector(selectUser);
  const matches = useAppSelector(selectMatches) || [];

  const [menuOpen, setMenuOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleNavClick = (e, to, requiresAuth) => {
    e.preventDefault();
    if (requiresAuth && !isLoggedIn) {
      navigate('/login');
    } else {
      navigate(to);
    }
    closeSidebar();
  };

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    navigate('/login');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '?';

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV_ITEMS.map(item => {
        const IconComponent = item.icon;
        const isActive = location.pathname === item.to;
        
        // Define o valor do badge: se for a rota de matches, usa o length do array do Redux
        const isMatchesItem = item.label === 'Meus Matches';
        const badgeValue = isMatchesItem ? matches.length : item.badge;

        return (
          <a
            key={item.id}
            href={item.to}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-500/10 text-blue-400'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
            onClick={(e) => handleNavClick(e, item.to, item.requiresAuth)}
          >
            <IconComponent size={18} className={isActive ? 'text-blue-500' : 'text-slate-500'} />
            <span className="truncate">{item.label}</span>
            
            {badgeValue > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0">
                {badgeValue}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );

  const UserProfile = () => (
    <div className="p-4 border-t border-slate-800">
      {isLoggedIn && user ? (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <div className="text-sm font-semibold text-slate-200 truncate">
              {user.username}
            </div>
            <div className="text-[11px] text-slate-500 font-mono truncate">
              {user.email ?? ''}
            </div>
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-800"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute bottom-10 right-0 z-20 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Sair da conta
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all border border-slate-800"
        >
          <LogIn size={16} className="text-slate-500" />
          Entrar na sua conta
        </button>
      )}
    </div>
  );

  const SidebarHeader = () => (
    <div className="h-16 px-4 border-slate-800 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.2)]">
          <Triangle className="text-white fill-white/20" size={16} />
        </div>
        <div>
          <div className="text-xs font-bold tracking-widest uppercase text-blue-500">Triangula</div>
          <div className="text-[10px] text-slate-500 tracking-widest uppercase">Sistema de Permuta</div>
        </div>
      </div>
      <button
        onClick={() => setSidebarOpen(false)}
        className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        title="Fechar menu"
      >
        <X size={20} />
      </button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-20 md:hidden p-2 rounded-md bg-slate-800/50 text-white hover:bg-slate-700/50 transition-all"
        title={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        <Menu size={20} />
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarHeader />
        <NavLinks />
        <UserProfile />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;