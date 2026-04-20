// ─────────────────────────────────────────────────────────────────────────────
// hooks/useAnimation.js — Loop de animação e gerenciamento dos ripples nos nós
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { CYCLE_DURATION, GROW_DURATION, HOLD_DURATION } from '../constants';

/**
 * Gerencia o requestAnimationFrame global e os pulsos (ripples) nos nós de destino.
 * Um ripple é disparado toda vez que um arco "chega" ao nó de destino (fase HOLD).
 *
 * @param {Array} arcData - Arcos processados pelo useArcData
 * @returns {{ time: number, rippleData: Array }}
 *   - time: tempo decorrido em ms desde o início da animação
 *   - ripples: mapa { nodeKey: [{ id, startTime }] } de pulsos ativos
 */
export function useAnimation(arcData) {
  const [time,    setTime]    = useState(0);
  const [ripples, setRipples] = useState({});

  const animRef       = useRef(null);
  const startRef      = useRef(null);
  const rippleIdRef   = useRef(0);
  const wasHoldingRef = useRef({});

  useEffect(() => {
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      setTime(elapsed);

      // ── Detecta entrada na fase HOLD e dispara ripple no nó de destino ──
      const newRipples = {};
      arcData.forEach(arc => {
        const ct  = (elapsed + arc.phaseOffset) % CYCLE_DURATION;
        const key = `${arc.from}-${arc.to}`;
        const isHolding = ct >= GROW_DURATION && ct < GROW_DURATION + HOLD_DURATION;

        if (isHolding && !wasHoldingRef.current[key]) {
          if (!newRipples[arc.to]) newRipples[arc.to] = [];
          newRipples[arc.to].push({ id: rippleIdRef.current++, startTime: elapsed });
        }
        wasHoldingRef.current[key] = isHolding;
      });

      // Acrescenta novos ripples ao estado / bacia
      if (Object.keys(newRipples).length > 0) {
        setRipples(prev => {
          const next = { ...prev };
          Object.entries(newRipples).forEach(([k, p]) => {
            next[k] = [...(prev[k] || []), ...p];
          });
          return next;
        });
      }

      // Remove ripples expirados (duração máxima: 2200ms)
      setRipples(prev => {
        let changed = false;
        const next = {};
        Object.entries(prev).forEach(([k, pulses]) => {
          const f = pulses.filter(r => elapsed - r.startTime < 2200);
          if (f.length !== pulses.length) changed = true;
          if (f.length > 0) next[k] = f;
        });
        return changed ? next : prev;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [arcData]);

  return { time, ripples };
}