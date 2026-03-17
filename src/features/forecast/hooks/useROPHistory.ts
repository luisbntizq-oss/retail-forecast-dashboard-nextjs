import { useState, useEffect, useCallback } from 'react';
import { ROPHistoryService, ROPData } from '../services/ropHistoryService';

export function useROPHistory(variantId: string | null) {
  const [ropData, setROPData] = useState<ROPData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadROPHistory = useCallback(async () => {
    if (!variantId) {
      setROPData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await ROPHistoryService.getROPHistory(variantId);
      setROPData(data);
      
      if (!data) {
        setError('No se encontraron datos de ROP para este variant');
      }
    } catch (err) {
      console.error('Error al cargar ROP history:', err);
      setError('Error al cargar datos de ROP');
      setROPData(null);
    } finally {
      setIsLoading(false);
    }
  }, [variantId]);

  useEffect(() => {
    loadROPHistory();
  }, [loadROPHistory]);

  return { ropData, isLoading, error, reload: loadROPHistory };
}
