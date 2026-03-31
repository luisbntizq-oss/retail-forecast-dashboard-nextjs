import { supabase } from '@/lib/supabase';
import type { Prediction } from '../types/forecast.types';

export class DemandPredictionService {
  /** Obtiene predicciones usando el batch_id concreto devuelto por el API. */
  static async getByBatchId(variantId: string, batchId: string): Promise<Prediction[]> {
    if (!supabase) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase
      .from('demand_prediction')
      .select('prediction_date, predicted_quantity, lower_bound, upper_bound')
      .eq('variant_id', variantId)
      .eq('batch_id', batchId)
      .order('prediction_date', { ascending: true });

    if (error || !data) {
      console.error('[DemandPrediction] Error al obtener predicciones por batch_id:', error?.message);
      return [];
    }

    console.log(`[DemandPrediction] ${data.length} predicciones por batch_id=${batchId} variant_id=${variantId}`);
    return data.map(row => ({
      date: row.prediction_date,
      predicted_quantity: Number(row.predicted_quantity),
      lower_bound: Number(row.lower_bound),
      upper_bound: Number(row.upper_bound),
      confidence_interval: 0,
    }));
  }

  /**
   * Obtiene las predicciones del último batch para un variant_id dado.
   * Agrupa por batch_id y toma el de prediction_date más reciente.
   */
  static async getLatestPredictions(variantId: string): Promise<Prediction[]> {
    if (!supabase) throw new Error('Supabase no está configurado');

    // Paso 1: encontrar el batch_id más reciente (no nulo) para este variant_id
    const { data: latestBatch, error: batchError } = await supabase
      .from('demand_prediction')
      .select('batch_id, calculated_at')
      .eq('variant_id', variantId)
      .not('batch_id', 'is', null)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (batchError || !latestBatch) {
      console.warn('[DemandPrediction] No se encontró batch válido para variant_id:', variantId, batchError?.message);
      return [];
    }

    console.log(`[DemandPrediction] variant_id=${variantId} → batch_id=${latestBatch.batch_id} (calculated_at=${latestBatch.calculated_at})`);

    // Paso 2: obtener todas las predicciones de ese batch para este variant_id
    const { data: predictions, error: predError } = await supabase
      .from('demand_prediction')
      .select('prediction_date, predicted_quantity, lower_bound, upper_bound')
      .eq('variant_id', variantId)
      .eq('batch_id', latestBatch.batch_id)
      .order('prediction_date', { ascending: true });

    if (predError || !predictions) {
      console.error('[DemandPrediction] Error al obtener predicciones:', predError?.message);
      return [];
    }

    console.log(`[DemandPrediction] ${predictions.length} predicciones cargadas para batch_id=${latestBatch.batch_id}`);

    return predictions.map(row => ({
      date: row.prediction_date,
      predicted_quantity: Number(row.predicted_quantity),
      lower_bound: Number(row.lower_bound),
      upper_bound: Number(row.upper_bound),
      confidence_interval: 0,
    }));
  }
}
