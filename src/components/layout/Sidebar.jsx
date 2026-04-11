import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, MoreHorizontal, LogOut, Triangle } from 'lucide-react';
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
    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
      {NAV_ITEMS.map(item => {
        const IconComponent = item.icon;
        const isActive = location.pathname === item.to;
        
        const isMatchesItem = item.label === 'Meus Matches';
        const badgeValue = isMatchesItem ? matches.length : item.badge;

        return (
          <a
            key={item.id}
            href={item.to}
            className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-blue-500/20 text-white'
                : 'text-[#A3AED0] hover:bg-white/5 hover:text-white'
            }`}
            onClick={(e) => handleNavClick(e, item.to, item.requiresAuth)}
          >
            <IconComponent 
              size={20} 
              className={`transition-colors ${isActive ? 'text-blue-400' : 'text-[#A3AED0] group-hover:text-white'}`} 
            />
            <span className="truncate">{item.label}</span>
            
            {badgeValue > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 shadow-sm">
                {badgeValue}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );

  const UserProfile = () => (
    <div className="p-4 border-t border-white/10">
      {isLoggedIn && user ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg shadow-blue-500/20">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {user.username}
            </div>
            <div className="text-[12px] text-[#A3AED0] truncate">
              {user.email ?? ''}
            </div>
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="text-[#A3AED0] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            >
              <MoreHorizontal size={20} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute bottom-12 right-0 z-20 w-44 bg-[#1B254B] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
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
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[#A3AED0] hover:bg-white/5 hover:text-white transition-all border border-white/10"
        >
          <LogIn size={18} />
          Entrar na sua conta
        </button>
      )}
    </div>
  );

  const SidebarHeader = () => (
    <div className="h-20 px-6 border-b border-white/10 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Triangle className="text-white fill-white/20" size={18} />
        </div>
        <div>
          <div className="text-sm font-bold tracking-widest uppercase text-white">Triangula</div>
          <div className="text-[10px] text-[#A3AED0] tracking-widest uppercase mt-0.5">Sistema de Permuta</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Botão Hambúrguer Animado */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-8 right-6 z-40 md:hidden w-[25px] h-[14px] flex flex-col justify-center items-center cursor-pointer"
        title={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        <div className={`absolute w-[20px] min-h-[2px] rounded-[5px] transition-all duration-200 ${isSidebarOpen ? 'bg-white rotate-45 translate-y-0' : 'bg-[#cfdaff] -translate-y-[6px]'}`} />
        <div className={`absolute w-[20px] min-h-[2px] rounded-[5px] transition-all duration-200 ${isSidebarOpen ? 'bg-white scale-0' : 'bg-[#cfdaff] scale-100'}`} />
        <div className={`absolute w-[20px] min-h-[2px] rounded-[5px] transition-all duration-200 ${isSidebarOpen ? 'bg-white -rotate-45 translate-y-0' : 'bg-[#cfdaff] translate-y-[6px]'}`} />
      </button>

      {/* Sidebar - Agora abre pela direita no mobile */}
      <div
        className={`fixed inset-y-0 right-0 z-30 w-72 bg-[#111C44] flex flex-col transition-transform duration-300 ease-in-out md:left-0 md:right-auto md:relative md:translate-x-0 shadow-2xl md:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <SidebarHeader />
        <NavLinks />
        <UserProfile />
      </div>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden transition-all duration-300 ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
    </>
  );
};

export default Sidebar;