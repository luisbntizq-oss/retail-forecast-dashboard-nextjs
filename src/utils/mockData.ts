import { PredictionResponse } from '../types/inventory';

export const generateMockData = (): PredictionResponse => {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const historical = months.map((month, index) => ({
    date: month,
    sales: Math.floor(100 + Math.random() * 50 + Math.sin(index / 2) * 20)
  }));

  const predictionMonths = ['Ene+1', 'Feb+1', 'Mar+1'];
  const prediction = predictionMonths.map((month, index) => ({
    date: month,
    sales: 0,
    prediction: Math.floor(130 + Math.random() * 30 + Math.sin(index / 2) * 15)
  }));

  return {
    historical,
    prediction,
    kpis: {
      reorderPoint: 245,
      safetyStock: 85,
      unitsToReplenish: 320
    }
  };
};
