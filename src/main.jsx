import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import MapaGlobal from './views/MapaGlobal/index.jsx'
import MeusInteresses from './views/MeusInteresses/index.jsx'
import MeusMatches from './views/MeusMatches/index.jsx'
import MeusDados from './views/MeusDados/index.jsx'
import Login from './views/Login/index.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.js'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <MapaGlobal />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/interests',
            element: <MeusInteresses />,
          },
          {
            path: '/matches',
            element: <MeusMatches />,
          },
          {
            path: '/meus-dados',
            element: <MeusDados />,
          },
        ]
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
)
