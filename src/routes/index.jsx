import { createBrowserRouter } from 'react-router-dom';
import { MapIcon, Target, LinkIcon, Unlock } from 'lucide-react';

import App from '../App.jsx';
import MapaGlobal from '../views/MapaGlobal/index.jsx';
import MeusInteresses from '../views/MeusInteresses/index.jsx';
import MeusMatches from '../views/MeusMatches/index.jsx';
import MeusDados from '../views/MeusDados/index.jsx';
import Login from '../views/Login/index.jsx';
import Admin from '../views/Admin/index.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

export const appRoutes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <MapaGlobal />,
        handle: {
          sidebar: { id: "mapa", label: "Início", icon: MapIcon, requiresAuth: false, badge: null }
        }
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/interests',
            element: <MeusInteresses />,
            handle: {
              sidebar: { id: "interests", label: "Meus Interesses", icon: Target, requiresAuth: true, badge: null }
            }
          },
          {
            path: '/matches',
            element: <MeusMatches />,
            handle: {
              sidebar: { id: "matches", label: "Meus Matches", icon: LinkIcon, requiresAuth: true, badge: null }
            }
          },
          {
            path: '/meus-dados',
            element: <MeusDados />,
            handle: {
              sidebar: { id: "meus-dados", label: "Meus Dados", icon: Unlock, requiresAuth: true, badge: null }
            }
          },
        ]
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <Admin />,
  }
];

export const router = createBrowserRouter(appRoutes);

export const getNavItems = () => {
  const items = [];
  const extractSidebar = (r) => {
    if (r.handle?.sidebar) {
      items.push({ ...r.handle.sidebar, to: r.path });
    }
    if (r.children) {
      r.children.forEach(extractSidebar);
    }
  };
  appRoutes.forEach(extractSidebar);
  return items;
};

export const navItems = getNavItems();
