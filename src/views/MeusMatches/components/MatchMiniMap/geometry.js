// ─────────────────────────────────────────────────────────────────────────────
// geometry.js — Utilitários de geometria esférica para traçar arcos no mapa
// ─────────────────────────────────────────────────────────────────────────────

/** Converte graus para radianos */
export function toRad(d) {
  return d * Math.PI / 180;
}

/**
 * Gera uma sequência de pontos 3D ao longo de um grande círculo entre dois pontos,
 * com altitude máxima no meio do arco para efeito visual de voo.
 * @param {[number, number]} src   - Coordenadas [lng, lat] da origem
 * @param {[number, number]} tgt   - Coordenadas [lng, lat] do destino
 * @param {number}           steps - Número de pontos intermediários (padrão: 80)
 * @returns {Array<[number, number, number]>} Array de [lng, lat, altitude]
 */
export function greatCirclePoints(src, tgt, steps = 80) {
  const lat1 = toRad(src[1]), lon1 = toRad(src[0]);
  const lat2 = toRad(tgt[1]), lon2 = toRad(tgt[0]);

  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
  ));

  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    // Pontos muito próximos: interpolação linear simples
    if (d < 0.0001) {
      pts.push([src[0] + (tgt[0] - src[0]) * t, src[1] + (tgt[1] - src[1]) * t, 0]);
      continue;
    }

    const A = Math.sin((1 - t) * d) / Math.sin(d);
    const B = Math.sin(t * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);

    // Altitude máxima no ponto médio do arco (efeito de parábola)
    const alt = Math.sin(t * Math.PI) * (d * 180 / Math.PI) * 40000;

    pts.push([lon * 180 / Math.PI, lat * 180 / Math.PI, alt]);
  }

  return pts;
}

/**
 * Calcula o viewState inicial do mapa para enquadrar todas as coordenadas do ciclo.
 * @param {Array<[number, number]>} coords - Lista de coordenadas [lng, lat]
 * @returns {object} ViewState com longitude, latitude, zoom, pitch e bearing
 */
export function calcViewState(coords) {
  const lngs = coords.map(c => c[0]);
  const lats  = coords.map(c => c[1]);
  const span  = Math.max(
    Math.max(...lats) - Math.min(...lats),
    Math.max(...lngs) - Math.min(...lngs)
  );

  return {
    longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    // Deslocamento para o Norte proporcional à área visível (span)
    latitude:  ((Math.min(...lats) + Math.max(...lats)) / 2) + (span * 1),
    zoom:      span < 1 ? 7.5 : span < 4 ? 5.5 : span < 8 ? 4.5 : 3.5,
    pitch:     45,
    bearing:   0,
  };
}