import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import { useInitQuery, useRestoreSessionMutation } from "./services/api";
import { useAppSelector } from "./store/hooks";
import { selectIsLoggedIn } from "./store/hooks";
import { TOKEN_KEY } from "./constants";
import { Loader2 } from 'lucide-react';

export default function PermuteApp() {
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
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <div className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">Iniciando Triangula...</div>
        </div>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
        <div className="text-red-400 text-sm">Falha ao conectar com o servidor.</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans flex flex-col md:flex-row overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-hidden h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}