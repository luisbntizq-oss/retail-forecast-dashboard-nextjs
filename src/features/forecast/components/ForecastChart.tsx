'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ForecastResponse } from '../types/forecast.types';

interface ForecastChartProps {
  data: ForecastResponse;
}

export function ForecastChart({ data }: ForecastChartProps) {
  const chartData = data.predictions.map(prediction => ({
    date: new Date(prediction.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    predicción: prediction.predicted_quantity,
    límiteInferior: prediction.lower_bound,
    límiteSuperior: prediction.upper_bound,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Predicción de Demanda</h3>
        <p className="text-sm text-gray-600">
          Confianza: {(data.confidence * 100).toFixed(1)}%
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="límiteInferior"
            stroke="#d1d5db"
            strokeDasharray="3 3"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="límiteSuperior"
            stroke="#d1d5db"
            strokeDasharray="3 3"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="predicción"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
