import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import LoadingTriangle from "../../../components/ui/LoadingTriangle";
import { useLeaflet } from "../hooks/useLeaflet";

export default function CoordPicker({ lat, lng, onChange }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markerRef    = useRef(null);
  const leafletReady = useLeaflet();

  // Inicializa mapa
  useEffect(() => {
    if (!leafletReady || !containerRef.current || mapRef.current) return;
    const L   = window.L;
    const map = L.map(containerRef.current, { zoomControl: true }).setView(
      [lat || -15.77, lng || -47.93], lat ? 8 : 4
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="
        width:22px;height:22px;border-radius:50% 50% 50% 0;
        background:#3b82f6;border:3px solid #fff;
        transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.5)
      "></div>`,
      iconSize: [22, 22], iconAnchor: [11, 22], className: "",
    });

    if (lat && lng) {
      markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
    }

    map.on("click", (e) => {
      const { lat: la, lng: lo } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([la, lo]);
      } else {
        markerRef.current = L.marker([la, lo], { icon }).addTo(map);
      }
      onChange(parseFloat(la.toFixed(6)), parseFloat(lo.toFixed(6)));
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady]);

  // Atualiza marcador quando lat/lng mudam externamente
  useEffect(() => {
    if (!mapRef.current || !window.L || !lat || !lng) return;
    const L = window.L;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#3b82f6;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>`,
        iconSize: [22, 22], iconAnchor: [11, 22], className: "",
      });
      markerRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current);
    }
    mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 7));
  }, [lat, lng]);

  return (
    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 h-[200px] sm:h-[280px]">
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {!leafletReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0B1437]">
          <LoadingTriangle size={32} />
        </div>
      )}
      <div className="absolute bottom-2 left-2 z-[999] bg-[#0B1437]/90 text-[#A3AED0] text-xs px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
        <MapPin size={12} className="text-blue-400" />
        {lat && lng
          ? <span>{Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}</span>
          : <span>Clique no mapa para definir coordenadas</span>
        }
      </div>
    </div>
  );
}