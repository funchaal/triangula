import { useState, useEffect } from "react";

const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS  = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

export function useLeaflet() {
  const [ready, setReady] = useState(!!window.L);
  useEffect(() => {
    if (window.L) {
      setTimeout(() => setReady(true), 0);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = LEAFLET_CSS;
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = LEAFLET_JS; script.async = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);
  return ready;
}
