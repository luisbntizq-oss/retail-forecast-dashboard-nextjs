'use client';

import { useState, useEffect } from 'react';
import { Package, Calendar, ChevronDown, Info } from 'lucide-react';
import { useVariants } from '../hooks/useVariants';
import type { ForecastRequest } from '../types/forecast.types';

interface ForecastControlsProps {
  selectedVariantIds: string[];
  onCalculate: (request: ForecastRequest) => Promise<void>;
  onVariantChange?: (variantId: string | null) => void;
  onVariantsChange?: (variantIds: string[]) => void;
  onDatesChange?: (startDate: string, endDate: string) => void;
  onParamsChange?: (params: ForecastRequest) => void;
  isCalculating: boolean;
}

export function ForecastControls({ selectedVariantIds, onCalculate, onVariantChange, onVariantsChange, onDatesChange, onParamsChange, isCalculating }: ForecastControlsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { variants, isLoading: isLoadingVariants, error: variantsError } = useVariants();

  const [params, setParams] = useState<ForecastRequest>({
    productId: '',
    leadTime: 15,
    serviceLevel: 95,
    predictionHorizon: 30,
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    algorithm: 'arima',
    // Valores por defecto de parámetros avanzados
    outlier_treatment: 'cap',
    outlier_sensitivity: 2.5,
    train_on_all_data: false,
    weekly_seasonality: 10.0,
    yearly_seasonality: 0.0,
    seasonality_prior_scale: 10.0,
    changepoint_prior_scale: 0.05
  });

  // Notificar cambios de estado
  useEffect(() => {
    if (params.startDate && params.endDate) {
      onDatesChange?.(params.startDate, params.endDate);
    }
  }, [params.startDate, params.endDate, onDatesChange]);

  useEffect(() => {
    onParamsChange?.(params);
  }, [params, onParamsChange]);

  const handleCheckboxChange = (value: string) => {
    let newSelected: string[];
    const idStr = value.toString();
    if (selectedVariantIds.includes(idStr)) {
      newSelected = selectedVariantIds.filter(id => id !== idStr);
    } else {
      newSelected = [...selectedVariantIds, idStr];
    }

    // Para simplificar y mantener compatibilidad, asignamos el primer SKU a params.
    const firstValue = newSelected.length > 0 ? newSelected[0] : '';
    setParams(prev => ({ ...prev, productId: firstValue }));
    onVariantChange?.(firstValue || null);
    onVariantsChange?.(newSelected);
  };

  // Obtener el stock actual del variant seleccionado
  const selectedVariant = variants.find(v =>
    v.id === params.productId || v.id.toString() === params.productId
  );

  const currentStock = selectedVariant?.current_stock ?? null;

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newParams = { ...params, [field]: value };
    setParams(newParams);
    // Notificar al padre cuando ambas fechas estén definidas
    if (newParams.startDate && newParams.endDate) {
      onDatesChange?.(newParams.startDate, newParams.endDate);
    }
  };


  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Package className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Parámetros de Análisis
        </h2>
      </div>

      <div className="space-y-5">
        <div className="relative">
          <label htmlFor="variantId" className="block text-sm font-medium text-gray-700 mb-2">
            Variant ID (SKUs)
          </label>

          {variantsError && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {variantsError}
            </div>
          )}

          <div className="relative">
            <button
              type="button"
              id="variantId"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoadingVariants || isCalculating}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-left flex items-center justify-between shadow-sm"
            >
              <span className="truncate">
                {isLoadingVariants
                  ? 'Cargando variantes...'
                  : selectedVariantIds.length === 0
                    ? 'Seleccionar SKUs'
                    : `${selectedVariantIds.length} SKU${selectedVariantIds.length > 1 ? 's' : ''} seleccionado${selectedVariantIds.length > 1 ? 's' : ''}`}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {isDropdownOpen && !isLoadingVariants && !isCalculating && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {variants.map((variant) => (
                    <label key={variant.id} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVariantIds.includes(variant.id?.toString() || '')}
                        onChange={() => handleCheckboxChange(variant.id?.toString() || '')}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm text-gray-700">
                        {variant.id}{variant.sku ? ` (${variant.sku})` : ''}
                      </span>
                    </label>
                  ))}
                  {variants.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500">No hay variantes disponibles</div>
                  )}
                </div>
              </>
            )}
          </div>

          {!isLoadingVariants && variants.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {variants.length} variante{variants.length !== 1 ? 's' : ''} disponible{variants.length !== 1 ? 's' : ''}
            </p>
          )}

          {!isLoadingVariants && variants.length === 0 && !variantsError && (
            <p className="mt-1 text-xs text-amber-600">
              ⚠️ No se encontraron variantes en la base de datos
            </p>
          )}
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Inicio
              </div>
            </label>
            <input
              type="date"
              id="startDate"
              value={params.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Fin
              </div>
            </label>
            <input
              type="date"
              id="endDate"
              value={params.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="leadTime" className="text-sm font-medium text-gray-700 mb-2 h-10 flex items-center gap-2">
              Lead Time (días)
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  Tiempo en días que tarda el proveedor en entregar el pedido desde que se realiza.
                </div>
              </div>
            </label>
            <input
              type="number"
              id="leadTime"
              value={params.leadTime}
              onChange={(e) => setParams({ ...params, leadTime: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center font-semibold"
              min="1"
            />
          </div>

          <div>
            <label htmlFor="predictionHorizon" className="text-sm font-medium text-gray-700 mb-2 h-10 flex items-center gap-2">
              Horizonte (días)
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  Cantidad de días a futuro para los cuales se generará la predicción de demanda de ventas.
                </div>
              </div>
            </label>
            <input
              type="number"
              id="predictionHorizon"
              value={params.predictionHorizon}
              onChange={(e) => setParams({ ...params, predictionHorizon: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center font-semibold"
              min="1"
            />
          </div>
        </div>

        {/* Parámetros Avanzados */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="train_on_all_data"
              checked={params.train_on_all_data}
              onChange={(e) => setParams({ ...params, train_on_all_data: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="train_on_all_data" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              Entrenar con todo (train_on_all_data)
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  Entrenar con el 100% de datos sin split de validación (Mejora precisión final)
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
