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
    return apiClient.post<ForecastResponse>(
      API_ENDPOINTS.forecast.calculate,
      request
    );
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
