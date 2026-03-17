import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { ForecastRequest, ForecastResponse } from '../types/forecast.types';

export class ForecastService {
  /**
   * Calcula una nueva predicción de demanda
   */
  static async calculateForecast(
    request: ForecastRequest
  ): Promise<ForecastResponse> {
    // Construir el payload en el formato esperado por el API de predicción
    const payload = {
      variant_id: request.productId,
      start_date: request.startDate,
      end_date: request.endDate,
      periods: request.predictionHorizon || 30,
      lead_time_days: request.leadTime || 15,
      current_stock: request.currentStock || 0,
      service_level: (request.serviceLevel || 95) / 100, // Convertir porcentaje a decimal
      outlier_treatment: request.outlier_treatment || 'cap',
      outlier_sensitivity: request.outlier_sensitivity || 2.5,
      test_mode: request.test_mode || false,
      weekly_seasonality: request.weekly_seasonality || 10.0,
      yearly_seasonality: request.yearly_seasonality || 0.0,
      seasonality_prior_scale: request.seasonality_prior_scale || 10.0,
      changepoint_prior_scale: request.changepoint_prior_scale || 0.05
    };

    // Llamar directamente al API de predicción local
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar API Key si está configurada
    const apiKey = process.env.NEXT_PUBLIC_PREDICTION_API_KEY;
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch('/api/predict', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Error en la predicción: ${response.status} ${response.statusText}`
      );
    }

    const apiResponse = await response.json();
    console.log('📊 Respuesta del API de predicción:', apiResponse);

    // Transformar la respuesta del API al formato esperado por la interfaz
    const transformedResponse: ForecastResponse = {
      forecastId: new Date().toISOString(),
      predictions: [],
      precision: apiResponse.mae || 0,
      metrics: {
        mae: apiResponse.mae || 0,
        rmse: apiResponse.rmse || 0,
        mape: apiResponse.mape || 0
      },
      createdAt: new Date().toISOString()
    };

    // Transformar el array forecast a predictions
    if (apiResponse.forecast && Array.isArray(apiResponse.forecast)) {
      transformedResponse.predictions = apiResponse.forecast.map((item: any) => ({
        date: item.date,
        predicted_quantity: item.predicted_sales,
        lower_bound: item.lower_bound,
        upper_bound: item.upper_bound,
        confidence_interval: 0.95
      }));
    }

    console.log('✅ Predicciones transformadas:', transformedResponse.predictions.length, 'días');

    return transformedResponse;
  }

  /**
   * Obtiene el historial de predicciones
   */
  static async getForecastHistory(productId?: string): Promise<ForecastResponse[]> {
    return apiClient.get<ForecastResponse[]>(
      API_ENDPOINTS.forecast.history,
      productId ? { productId } : undefined
    );
  }

  /**
   * Obtiene una predicción específica por ID
   */
  static async getForecastById(id: string): Promise<ForecastResponse> {
    return apiClient.get<ForecastResponse>(
      API_ENDPOINTS.forecast.byId(id)
    );
  }
}
