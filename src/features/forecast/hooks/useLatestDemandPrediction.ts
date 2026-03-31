import { useState, useEffect, useCallback } from 'react';
import { DemandPredictionService } from '../services/demandPredictionService';
import type { Prediction } from '../types/forecast.types';

export function useLatestDemandPrediction(variantId: string | null) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial y al cambiar de SKU: busca el último batch por calculated_at
  const load = useCallback(async () => {
    if (!variantId) {
      setPredictions([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await DemandPredictionService.getLatestPredictions(variantId);
      setPredictions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar predicciones');
    } finally {
      setIsLoading(false);
    }
  }, [variantId]);

  // Tras recibir respuesta del API: usa el batch_id concreto de la respuesta
  const loadByBatchId = useCallback(async (batchId: string) => {
    if (!variantId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await DemandPredictionService.getByBatchId(variantId, batchId);
      setPredictions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar predicciones');
    } finally {
      setIsLoading(false);
    }
  }, [variantId]);

  useEffect(() => {
    load();
  }, [load]);

  return { predictions, isLoading, error, reload: load, loadByBatchId };
}
