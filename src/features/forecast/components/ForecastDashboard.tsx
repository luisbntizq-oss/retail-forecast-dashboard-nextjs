'use client';

import { useState } from 'react';
import { TrendingUp, AlertCircle, Package } from 'lucide-react';
import { useForecast } from '../hooks/useForecast';
import { useSalesHistory } from '../hooks/useSalesHistory';
import { useROPHistory } from '../hooks/useROPHistory';
import { ForecastControls } from './ForecastControls';
import { ForecastChart } from './ForecastChart';
import { ImportInventory } from '@/components/ImportInventory';
import { KPICard } from '@/components/KPICard';

export function ForecastDashboard() {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const { data, isCalculating, error, calculateForecast, reset } = useForecast();
  const { salesHistory, isLoading: isLoadingHistory, error: historyError } = useSalesHistory(
    selectedVariantId,
    dateRange.startDate,
    dateRange.endDate
  );
  const { ropData, isLoading: isLoadingROP, error: ropError, reload: reloadROP } = useROPHistory(selectedVariantId);

  const handleVariantChange = (variantId: string | null) => {
    setSelectedVariantId(variantId);
    reset(); // Limpiar la predicción anterior al cambiar de SKU
  }

  const handleDatesChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  const handleCalculate = async (request: any) => {
    try {
      await calculateForecast(request);
      await reloadROP(); // Recargar los KPIs de la tabla rop_history después de generar la predicción
    } catch (error) {
      console.error('Error al calcular predicción:', error);
    }
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

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {historyError && (
          <div className="p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">⚠️ {historyError}</p>
          </div>
        )}

        {ropError && (
          <div className="p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">⚠️ {ropError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <ForecastControls 
              onCalculate={handleCalculate} 
              onVariantChange={handleVariantChange}
              onDatesChange={handleDatesChange}
              isCalculating={isCalculating} 
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            {data || salesHistory.length > 0 ? (
              <ForecastChart 
                data={data} 
                salesHistory={salesHistory}
                isLoadingHistory={isLoadingHistory}
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">
                  Selecciona un SKU para ver su historial de ventas
                </p>
              </div>
            )}

            {ropData && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                  <div className="p-2 bg-blue-600 rounded-lg mb-2">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Punto de Pedido (ROP)</p>
                  <p className="text-2xl font-bold text-gray-900">{ropData.reorder_point}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                  <div className="p-2 bg-emerald-600 rounded-lg mb-2">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Stock de Seguridad</p>
                  <p className="text-2xl font-bold text-gray-900">{ropData.safety_stock}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                  <div className="p-2 bg-amber-600 rounded-lg mb-2">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Unidades a Reponer</p>
                  <p className="text-2xl font-bold text-gray-900">{ropData.recommended_restock}</p>
                </div>
              </div>
            )}
          </div>
        </div>


      </main>
    </div>
  );
}
