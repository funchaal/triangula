// ─────────────────────────────────────────────────────────────────────────────
// hooks/useUsernameCheck.js
// Debounce + verificação de disponibilidade de username via API.
//
// Uso:
//   const { usernameStatus, checkUsername } = useUsernameCheck()
//
//   // No onChange do input:
//   checkUsername(value)
//
//   // Para bloquear o botão de prosseguir:
//   const blocked = usernameStatus.state === 'taken' || usernameStatus.state === 'invalid'
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react';
import { USERNAME_REGEX } from '../components/forms/FormRegisterStep1';
import { useLazyCheckUsernameQuery } from '../../../services/api';

const DEBOUNCE_MS = 600;
const MIN_LENGTH  = 3;

/**
 * Estado possível do campo de username:
 *   idle      — campo vazio ou não verificado ainda
 *   checking  — aguardando resposta da API (spinner)
 *   available — username livre
 *   taken     — username já existe
 *   invalid   — contém caractere inválido
 */
export function useUsernameCheck() {
  const [usernameStatus, setUsernameStatus] = useState({ state: 'idle', message: '' });
  const debounceTimer = useRef(null);
  const lastChecked   = useRef('');
  const [triggerCheck] = useLazyCheckUsernameQuery();

  const checkUsername = useCallback((value) => {
    // Cancela timer anterior
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Campo vazio — reseta
    if (!value) {
      setUsernameStatus({ state: 'idle', message: '' });
      return;
    }

    // Caractere inválido — feedback imediato, sem aguardar debounce
    if (!USERNAME_REGEX.test(value)) {
      setUsernameStatus({
        state: 'invalid',
        message: 'Apenas letras, números, ponto (.), hífen (-) e underline (_)',
      });
      return;
    }

    // Muito curto — apenas hint, sem consultar API
    if (value.length < MIN_LENGTH) {
      setUsernameStatus({ state: 'idle', message: '' });
      return;
    }

    // Mesmo valor já verificado — não repete a consulta
    if (value === lastChecked.current && usernameStatus.state !== 'idle') return;

    // Debounce: só consulta após o usuário parar de digitar
    setUsernameStatus({ state: 'idle', message: '' });

    debounceTimer.current = setTimeout(async () => {
      lastChecked.current = value;
      setUsernameStatus({ state: 'checking', message: '' });

      try {
        const data = await triggerCheck(value).unwrap();

        setUsernameStatus(
          data.available
            ? { state: 'available', message: 'Username disponível' }
            : { state: 'taken',     message: 'Este username já está em uso' }
        );
      } catch {
        // Em caso de falha na rede, não bloqueia o usuário
        setUsernameStatus({ state: 'idle', message: '' });
      }
    }, DEBOUNCE_MS);
  }, [usernameStatus.state, triggerCheck]);

  /** True quando o estado atual deve bloquear o avanço do formulário */
  const usernameBlocked = usernameStatus.state === 'taken' || usernameStatus.state === 'invalid';

  return { usernameStatus, checkUsername, usernameBlocked };
}