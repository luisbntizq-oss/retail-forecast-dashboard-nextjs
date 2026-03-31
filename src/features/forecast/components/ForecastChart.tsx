'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ForecastResponse, SalesData, Prediction } from '../types/forecast.types';

interface ForecastChartProps {
  data: ForecastResponse | null;
  salesHistory: SalesData[];
  isLoadingHistory: boolean;
  storedPredictions?: Prediction[];
}

export function ForecastChart({ data, salesHistory, isLoadingHistory, storedPredictions = [] }: ForecastChartProps) {
  // Dar absoluta prioridad a lo que acaba de calcular el backend en memoria principal (data). 
  // Si no hay cálculo activo en memoria, caemos a las predicciones de la BD recargadas.
  const activePredictions = (data?.predictions && data.predictions.length > 0) 
    ? data.predictions 
    : storedPredictions;

  // Combinar datos históricos y predicciones
  const chartData = [
    // Datos históricos
    ...salesHistory.map(history => ({
      date: new Date(history.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      ventasHistóricas: history.quantity,
      predicción: null,
      límiteInferior: null,
      límiteSuperior: null,
    })),
    // Predicciones (si existen)
    ...activePredictions.map(prediction => ({
      date: new Date(prediction.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      ventasHistóricas: null,
      predicción: prediction.predicted_quantity,
      límiteInferior: prediction.lower_bound,
      límiteSuperior: prediction.upper_bound,
    })),
  ];

  const hasData = salesHistory.length > 0 || activePredictions.length > 0;
  const showPredictions = activePredictions.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {salesHistory.length > 0 ? 'Historial de Ventas' : 'Predicción de Demanda'}
          {showPredictions && salesHistory.length > 0 && ' y Predicción'}
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {salesHistory.length > 0 && (
            <span>📊 {salesHistory.length} registros históricos</span>
          )}
          {data && data.precision !== undefined && (
            <span>🎯 Precisión: {data.precision.toFixed(2)}</span>
          )}
          {isLoadingHistory && (
            <span className="text-blue-600">⏳ Cargando historial...</span>
          )}
        </div>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />

            {/* Ventas Históricas */}
            {salesHistory.length > 0 && (
              <Line
                type="monotone"
                dataKey="ventasHistóricas"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                activeDot={false}
                animationDuration={1000}
                name="Ventas Históricas"
              />
            )}

            {/* Predicciones */}
            {showPredictions && (
              <>
                <Line
                  type="monotone"
                  dataKey="límiteInferior"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  animationDuration={1000}
                  name="Límite Inferior"
                />
                <Line
                  type="monotone"
                  dataKey="límiteSuperior"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  animationDuration={1000}
                  name="Límite Superior"
                />
                <Line
                  type="monotone"
                  dataKey="predicción"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={false}
                  animationDuration={1000}
                  name="Predicción"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay datos para mostrar</p>
        </div>
      )}
    </div>
  );
}
