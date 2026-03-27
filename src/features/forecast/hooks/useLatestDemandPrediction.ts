import { useState, useEffect } from 'react';
import { DemandPredictionService } from '../services/demandPredictionService';
import type { Prediction } from '../types/forecast.types';

export function useLatestDemandPrediction(variantId: string | null) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!variantId) {
      setPredictions([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await DemandPredictionService.getLatestPredictions(variantId);
        if (!cancelled) setPredictions(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar predicciones');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [variantId]);

  return { predictions, isLoading, error };
}
