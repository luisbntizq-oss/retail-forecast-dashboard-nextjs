'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingUp, AlertCircle, Package } from 'lucide-react';
import type { ROPData } from '../services/ropHistoryService';
import { useForecast } from '../hooks/useForecast';
import { useSalesHistory } from '../hooks/useSalesHistory';
import { useROPHistory } from '../hooks/useROPHistory';
import { useVariants } from '../hooks/useVariants';
import { useLatestDemandPrediction } from '../hooks/useLatestDemandPrediction';
import { ForecastControls } from './ForecastControls';
import { ForecastChart } from './ForecastChart';
import { SKUGrid } from './SKUGrid';
import { ImportInventory } from '@/components/ImportInventory';
import type { ForecastRequest } from '../types/forecast.types';
import { BatchForecastService } from '../services/batchForecastService';
import { ROPHistoryService } from '../services/ropHistoryService';

export function ForecastDashboard() {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [forecastParams, setForecastParams] = useState<ForecastRequest | null>(null);
  const [cachedRopMap, setCachedRopMap] = useState<Map<string, ROPData>>(new Map());
  const [activeFilter, setActiveFilter] = useState<'critical' | 'alert' | 'ok'>('critical');
  const { variants } = useVariants();
  const { data, isCalculating, error, calculateForecast, reset } = useForecast();
  const { salesHistory, isLoading: isLoadingHistory, error: historyError } = useSalesHistory(
    selectedVariantId,
    dateRange.startDate,
    dateRange.endDate
  );
  const { ropData, isLoading: isLoadingROP, error: ropError, reload: reloadROP } = useROPHistory(selectedVariantId);
  const { predictions: storedPredictions, reload: reloadPredictions, loadByBatchId } = useLatestDemandPrediction(selectedVariantId);

  // Clasifica todos los variants en grupos según su estado
  const filterGroups = useMemo(() => {
    const groups = { critical: [] as string[], alert: [] as string[], ok: [] as string[] };
    for (const v of variants) {
      const id = v.id?.toString() ?? '';
      const rop = cachedRopMap.get(id);
      const stock = v.current_stock ?? null;
      if (!rop || stock === null) continue;
      if (stock <= rop.reorder_point) groups.critical.push(id);
      else if (stock <= rop.reorder_point + rop.safety_stock) groups.alert.push(id);
      else groups.ok.push(id);
    }
    return groups;
  }, [variants, cachedRopMap]);

  // Auto-load: carga el mapa ROP una sola vez y activa el filtro críticos
  const autoLoadedRef = useRef(false);
  useEffect(() => {
    if (autoLoadedRef.current || variants.length === 0) return;
    autoLoadedRef.current = true;

    const ids = variants.map(v => v.id?.toString() ?? '').filter(Boolean);
    ROPHistoryService.getBulkLatestROPs(ids).then(ropMap => {
      setCachedRopMap(ropMap);
      // Calcular críticos inline (filterGroups aún no se ha actualizado)
      const criticalIds = variants
        .filter(v => {
          const id = v.id?.toString() ?? '';
          const rop = ropMap.get(id);
          const stock = v.current_stock ?? null;
          return rop && stock !== null && stock <= rop.reorder_point;
        })
        .map(v => v.id?.toString() ?? '');

      setSelectedVariantIds(criticalIds);
      setSelectedVariantId(criticalIds[0] ?? null);
    });
  }, [variants]);

  const handleFilterChange = (filter: 'critical' | 'alert' | 'ok') => {
    setActiveFilter(filter);
    const ids = filterGroups[filter];
    setSelectedVariantIds(ids);
    handleVariantChange(ids[0] ?? null);
  };

  const handleVariantChange = (variantId: string | null) => {
    setSelectedVariantId(variantId);
    reset();
  };

  const handleVariantsChange = (ids: string[]) => {
    setSelectedVariantIds(ids);
  };

  const handleRemoveVariant = (idToRemove: string) => {
    const newIds = selectedVariantIds.filter(id => id !== idToRemove);
    setSelectedVariantIds(newIds);

    // Si era el seleccionado principal, cambiarlo
    if (selectedVariantId === idToRemove) {
      const nextId = newIds.length > 0 ? newIds[0] : null;
      setSelectedVariantId(nextId);
      if (!nextId) reset();
    }
  };

  const handleDatesChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  const handleBatchComplete = async (batchId: string) => {
    await reloadROP();
    await loadByBatchId(batchId);
  };

  const handleCalculate = async (request: any) => {
    try {
      if (selectedVariantIds.length > 1) {
        const selectedVariants = variants.filter(v =>
          selectedVariantIds.includes(v.id?.toString() ?? '')
        );
        await BatchForecastService.runBatch(selectedVariants, request);
        await reloadROP();
        await reloadPredictions();
      } else {
        await calculateForecast(request);
        await reloadROP();
      }
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


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <ForecastControls
              selectedVariantIds={selectedVariantIds}
              onCalculate={handleCalculate}
              onVariantChange={handleVariantChange}
              onVariantsChange={handleVariantsChange}
              onDatesChange={handleDatesChange}
              onParamsChange={setForecastParams}
              isCalculating={isCalculating}
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            {/* SKU Grid — siempre visible cuando hay IDs seleccionados */}
            <SKUGrid
              selectedIds={selectedVariantIds}
              variants={variants}
              onRemove={handleRemoveVariant}
              onSelect={handleVariantChange}
              selectedVariantId={selectedVariantId}
              forecastParams={forecastParams}
              onBatchComplete={handleBatchComplete}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              filterCounts={{
                critical: filterGroups.critical.length,
                alert: filterGroups.alert.length,
                ok: filterGroups.ok.length,
              }}
              activeGroupIds={filterGroups[activeFilter]}
            />

            {/* Gráfico de ventas — se desplaza debajo del grid */}
            {data || salesHistory.length > 0 ? (
              <ForecastChart
                data={data}
                salesHistory={salesHistory}
                isLoadingHistory={isLoadingHistory}
                storedPredictions={storedPredictions}
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">
                  Selecciona un SKU para ver su historial de ventas
                </p>
              </div>
            )}


          </div>
        </div>


      </main>
    </div>
  );
}
