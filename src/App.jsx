import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import { useInitQuery, useRestoreSessionMutation } from "./services/api";
import { useAppSelector } from "./store/hooks";
import { selectIsLoggedIn } from "./store/hooks";
import { TOKEN_KEY } from "./constants";
import LoadingTriangle from './components/ui/LoadingTriangle'; // <-- Importando o novo loader

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const { isLoading: initLoading, isError: initError } = useInitQuery();
  const [restoreSession, { isLoading: sessionLoading }] = useRestoreSessionMutation();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      
      // Se já está logado, não faz nada
      if (isLoggedIn) return;

      if (storedToken) {
        try {
          // Tenta restaurar a sessão usando o token existente
          await restoreSession().unwrap();
        } catch (error) {
          // SE O TOKEN FOR INVÁLIDO OU EXPIRADO:
          // Limpa o lixo do localStorage e joga pro login
          localStorage.removeItem(TOKEN_KEY);
          if (location.pathname !== '/') {
            navigate('/login');
          }
        }
      } else if (location.pathname !== '/') {
        // Se não tem token e tentou acessar rota interna, vai pro login
        navigate('/login');
      }
    };

    initAuth();
  }, [isLoggedIn, restoreSession, navigate, location.pathname]);

  if (sessionLoading || initLoading) {
    return (
      <div className="h-screen w-full bg-[#0B1437] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          {/* Usando o LoadingTriangle grande para a tela inicial */}
          <LoadingTriangle size={36} />
          <div className="text-[#A3AED0] text-sm font-bold uppercase tracking-widest animate-pulse mt-2">
            Iniciando Triangula...
          </div>
        </div>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="h-screen w-full bg-[#0B1437] flex items-center justify-center">
        <div className="text-red-400 text-sm font-semibold tracking-wide">
          Falha ao conectar com o servidor.
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0B1437] text-white font-sans flex flex-col md:flex-row overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-hidden h-full relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}