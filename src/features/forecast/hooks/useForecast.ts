'use client';

import { useState, useCallback } from 'react';
import { ForecastService } from '../services/forecastService';
import type { ForecastRequest, ForecastResponse, ForecastState } from '../types/forecast.types';

export function useForecast() {
  const [state, setState] = useState<ForecastState>({
    isLoading: false,
    isCalculating: false,
    data: null,
    error: null,
  });

  const calculateForecast = useCallback(async (request: ForecastRequest): Promise<ForecastResponse> => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }));
    
    try {
      const data = await ForecastService.calculateForecast(request);
      setState({
        isLoading: false,
        isCalculating: false,
        data,
        error: null,
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al calcular predicción';
      setState(prev => ({
        ...prev,
        isCalculating: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const loadForecast = useCallback(async (id: string): Promise<ForecastResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await ForecastService.getForecastById(id);
      setState({
        isLoading: false,
        isCalculating: false,
        data,
        error: null,
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar predicción';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isCalculating: false,
      data: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    calculateForecast,
    loadForecast,
    reset,
  };
}
