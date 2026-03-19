'use client';

import { useState, useEffect, useCallback } from 'react';
import { ROPHistoryService, ROPData } from '../services/ropHistoryService';

export interface MultiROPEntry {
  variantId: string;
  ropData: ROPData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Carga los datos de ROP para múltiples variantIds en paralelo.
 */
export function useMultiROPHistory(variantIds: string[]) {
  const [entries, setEntries] = useState<MultiROPEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (variantIds.length === 0) {
      setEntries([]);
      return;
    }

    setIsLoading(true);

    // Inicializar con state de carga
    setEntries(variantIds.map(id => ({
      variantId: id,
      ropData: null,
      isLoading: true,
      error: null,
    })));

    // Cargar en paralelo
    const results = await Promise.allSettled(
      variantIds.map(id => ROPHistoryService.getROPHistory(id))
    );

    const newEntries: MultiROPEntry[] = variantIds.map((id, i) => {
      const result = results[i];
      if (result.status === 'fulfilled') {
        return {
          variantId: id,
          ropData: result.value,
          isLoading: false,
          error: result.value ? null : 'Sin datos de ROP',
        };
      } else {
        return {
          variantId: id,
          ropData: null,
          isLoading: false,
          error: 'Error al cargar ROP',
        };
      }
    });

    setEntries(newEntries);
    setIsLoading(false);
  }, [variantIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  return { entries, isLoading, reload: load };
}
