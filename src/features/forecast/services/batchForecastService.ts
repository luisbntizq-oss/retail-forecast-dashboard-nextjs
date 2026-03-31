import { Variant } from './variantService';
import type { ForecastRequest } from '../types/forecast.types';

export interface BatchForecastItem {
  variant_id: number | string;
  current_stock: number;
  lead_time_days: number;
  config_override: null;
}

export interface BatchForecastPayload {
  batch_metadata: {
    batch_id: string;
    execution_mode: string;
  };
  defaults: {
    start_date: string;
    end_date: string;
    periods: number;
    service_level: number;
    outlier_treatment: string;
    outlier_sensitivity: number;
    seasonality_prior_scale: number;
    weekly_seasonality: number;
    yearly_seasonality: number;
    changepoint_prior_scale: number;
    train_on_all_data: boolean;
  };
  items: BatchForecastItem[];
}

export interface BatchForecastResponse {
  batch_id: string;
  results?: unknown[];
  [key: string]: unknown;
}

function generateUUIDv4(): string {
  // Simple UUID v4 generator compatible with all environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class BatchForecastService {
  /**
   * Sends a batch prediction request for the given variants using defaults from control parameters.
   */
  static async runBatch(variants: Variant[], params: ForecastRequest): Promise<BatchForecastResponse> {
    const items: BatchForecastItem[] = variants.map((v) => ({
      variant_id: isNaN(Number(v.id)) ? v.id : Number(v.id),
      current_stock: v.current_stock ?? 0,
      lead_time_days: params.leadTime ?? 7,
      config_override: null,
    }));

    // Guardamos el batch_id generado localmente — es el que el backend usará para persistir en demand_prediction
    const localBatchId = generateUUIDv4();

    const payload: BatchForecastPayload = {
      batch_metadata: {
        batch_id: localBatchId,
        execution_mode: 'high_precision',
      },
      defaults: {
        start_date: params.startDate,
        end_date: params.endDate,
        periods: params.predictionHorizon ?? 30,
        service_level: (params.serviceLevel ?? 95) / 100, // Safe default division
        outlier_treatment: params.outlier_treatment ?? 'cap',
        outlier_sensitivity: params.outlier_sensitivity ?? 2.5,
        seasonality_prior_scale: params.seasonality_prior_scale ?? 10.0,
        weekly_seasonality: params.weekly_seasonality ?? 10.0,
        yearly_seasonality: params.yearly_seasonality ?? 0.0,
        changepoint_prior_scale: params.changepoint_prior_scale ?? 0.05,
        train_on_all_data: params.train_on_all_data ?? false,
      },
      items,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    console.log('>>> PAYLOAD ENVIADO AL BACKEND BATCH:', JSON.stringify(payload, null, 2));

    const apiKey = process.env.NEXT_PUBLIC_PREDICTION_API_KEY;
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch('/api/predict/batch', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          `Error en la predicción batch: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log('>>> RESPUESTA DEL BACKEND BATCH:', JSON.stringify(result, null, 2));

    // Garantizamos que batch_id siempre esté presente usando el que enviamos como fuente de verdad
    return { ...result, batch_id: result.batch_id ?? localBatchId };
  }
}
