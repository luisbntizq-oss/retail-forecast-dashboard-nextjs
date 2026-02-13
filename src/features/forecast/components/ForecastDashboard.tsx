'use client';

import { useForecast } from '../hooks/useForecast';
import { ForecastControls } from './ForecastControls';
import { ForecastChart } from './ForecastChart';

export function ForecastDashboard() {
  const { data, isCalculating, error, calculateForecast, reset } = useForecast();

  const handleCalculate = async (request: any) => {
    try {
      await calculateForecast(request);
    } catch (error) {
      console.error('Error al calcular predicción:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Predicción de Demanda</h2>
        {data && (
          <button
            onClick={reset}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Limpiar
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ForecastControls onCalculate={handleCalculate} isCalculating={isCalculating} />
        </div>

        <div className="lg:col-span-2">
          {data ? (
            <ForecastChart data={data} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">
                Configura los parámetros y calcula una predicción
              </p>
            </div>
          )}
        </div>
      </div>

      {data && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Métricas de Precisión</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">MAE</p>
              <p className="text-2xl font-bold">{data.metrics.mae.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">RMSE</p>
              <p className="text-2xl font-bold">{data.metrics.rmse.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">MAPE</p>
              <p className="text-2xl font-bold">{data.metrics.mape.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
