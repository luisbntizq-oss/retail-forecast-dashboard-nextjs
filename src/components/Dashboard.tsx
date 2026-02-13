'use client';

import { useState } from 'react';
import { TrendingUp, AlertCircle, Package } from 'lucide-react';
import { InventoryForm } from './InventoryForm';
import { DemandChart } from './DemandChart';
import { KPICard } from './KPICard';
import { ImportInventory } from './ImportInventory';
import { InventoryParams, PredictionResponse } from '../types/inventory';
import { generateMockData } from '../utils/mockData';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PredictionResponse | null>(generateMockData());

  const handleCalculate = async (params: InventoryParams) => {
    setLoading(true);

    try {
      // Si Supabase está configurado, intentar obtener datos reales
      if (supabase) {
        const { data: dbData, error } = await supabase
          .from('inventory_history')
          .select('*')
          .eq('variant_id', params.variantId)
          .order('date', { ascending: true });

        if (error) throw error;

        if (dbData && dbData.length > 0) {
          const historical = dbData.map((row: any) => ({
            date: new Date(row.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
            sales: row.sales,
          }));

          const prediction = generatePrediction(historical, params.predictionHorizon);
          const kpis = calculateKPIs(historical, params);

          setData({
            historical,
            prediction,
            kpis,
          });
          setLoading(false);
          return;
        }
      }
      
      // Si no hay Supabase o no hay datos, usar datos mock
      const mockData = generateMockData();
      setData(mockData);
    } catch (error) {
      console.error('Error al calcular predicción:', error);
      const mockData = generateMockData();
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generatePrediction = (historical: any[], horizon: number) => {
    const avgSales = historical.reduce((sum: number, d: any) => sum + d.sales, 0) / historical.length;
    const prediction = [];

    for (let i = 1; i <= horizon; i++) {
      const variance = (Math.random() - 0.5) * 20;
      prediction.push({
        date: `+${i}d`,
        sales: Math.max(0, Math.round(avgSales * (1 + variance / 100))),
      });
    }
    return prediction;
  };

  const calculateKPIs = (historical: any[], params: InventoryParams) => {
    const avgDemand = historical.reduce((sum: number, d: any) => sum + d.sales, 0) / historical.length;
    const stdDev = Math.sqrt(
      historical.reduce((sum: number, d: any) => sum + Math.pow(d.sales - avgDemand, 2), 0) /
        historical.length
    );
    const zScore = 1.645;

    const safetyStock = Math.round(zScore * stdDev * Math.sqrt(params.leadTime));
    const reorderPoint = Math.round(avgDemand * params.leadTime + safetyStock);
    const unitsToReplenish = Math.round(avgDemand * params.predictionHorizon + safetyStock);

    return { reorderPoint, safetyStock, unitsToReplenish };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Gestión de Inventario
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Predicción de demanda y optimización de stock
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <ImportInventory />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <InventoryForm onCalculate={handleCalculate} loading={loading} />
          </div>

          <div className="lg:col-span-2">
            {data && <DemandChart historical={data.historical} prediction={data.prediction} />}
          </div>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              title="Punto de Pedido (ROP)"
              value={data.kpis.reorderPoint}
              icon={AlertCircle}
              color="bg-blue-600"
            />
            <KPICard
              title="Stock de Seguridad"
              value={data.kpis.safetyStock}
              icon={Package}
              color="bg-emerald-600"
            />
            <KPICard
              title="Unidades a Reponer"
              value={data.kpis.unitsToReplenish}
              icon={TrendingUp}
              color="bg-amber-600"
            />
          </div>
        )}
      </main>
    </div>
  );
}
