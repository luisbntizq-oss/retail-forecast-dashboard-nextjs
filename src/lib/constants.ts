/**
 * Constantes globales de la aplicación
 */

export const APP_NAME = 'Retail Forecast Dashboard';

export const DATE_FORMATS = {
  SHORT: 'short',
  LONG: 'long',
} as const;

export const ALGORITHMS = {
  ARIMA: 'arima',
  PROPHET: 'prophet',
  LSTM: 'lstm',
} as const;

export const DEFAULT_PREDICTION_HORIZON = 30; // días

export const DEFAULT_SERVICE_LEVEL = 95; // porcentaje

export const COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
} as const;
