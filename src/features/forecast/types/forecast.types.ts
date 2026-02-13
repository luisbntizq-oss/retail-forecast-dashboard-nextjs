export interface ForecastRequest {
  productId: string;
  startDate: string;
  endDate: string;
  historicalData?: SalesData[];
  algorithm?: 'arima' | 'prophet' | 'lstm';
}

export interface SalesData {
  date: string;
  quantity: number;
  revenue?: number;
}

export interface ForecastResponse {
  forecastId: string;
  predictions: Prediction[];
  confidence: number;
  metrics: ForecastMetrics;
  createdAt: string;
}

export interface Prediction {
  date: string;
  predicted_quantity: number;
  lower_bound: number;
  upper_bound: number;
  confidence_interval: number;
}

export interface ForecastMetrics {
  mae: number;  // Mean Absolute Error
  rmse: number; // Root Mean Square Error
  mape: number; // Mean Absolute Percentage Error
}

export interface ForecastState {
  isLoading: boolean;
  isCalculating: boolean;
  data: ForecastResponse | null;
  error: string | null;
}
