import { MapIcon, Target, LinkIcon, Unlock } from "lucide-react";

// ─── MAPA: ESTILO GRATUITO ────────────────────────────────────────────────────
export const MAP_STYLE = "https://tiles.openfreemap.org/styles/dark";

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { id: "mapa",      label: "Início",             icon: MapIcon,  badge: null, to: "/", requiresAuth: false },
  { id: "interests", label: "Meus Interesses",   icon: Target,   badge: null, to: "/interests", requiresAuth: true },
  { id: "matches",   label: "Meus Matches",       icon: LinkIcon, badge: null,  to: "/matches", requiresAuth: true },
  { id: "meus-dados", label: "Meus Dados", icon: Unlock,   badge: null, to: "/meus-dados", requiresAuth: true },
];

export const TOKEN_KEY = 'token'