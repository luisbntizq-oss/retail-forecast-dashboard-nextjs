export interface InventoryParams {
  variantId: string;
  leadTime: number;
  serviceLevel: number;
  predictionHorizon: number;
  startDate?: string;
  endDate?: string;
  // Parámetros avanzados
  outlier_treatment?: 'none' | 'cap' | 'detect' | 'holidays' | 'remove';
  outlier_sensitivity?: number;
  test_mode?: boolean;
  weekly_seasonality?: number;
  yearly_seasonality?: number;
  seasonality_prior_scale?: number;
  changepoint_prior_scale?: number;
}

export interface DataPoint {
  date: string;
  sales: number;
  prediction?: number;
}

export interface KPIData {
  reorderPoint: number;
  safetyStock: number;
  unitsToReplenish: number;
}

export interface PredictionResponse {
  historical: DataPoint[];
  prediction: DataPoint[];
  kpis: KPIData;
}
