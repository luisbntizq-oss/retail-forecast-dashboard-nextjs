'use client';

import { useState } from 'react';
import { Calculator, Package, Calendar, ChevronDown, Info } from 'lucide-react';
import { InventoryParams } from '../types/inventory';
import { useVariants } from '../features/forecast/hooks/useVariants';

interface InventoryFormProps {
  onCalculate: (params: InventoryParams) => void;
  loading: boolean;
}

export function InventoryForm({ onCalculate, loading }: InventoryFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { variants, isLoading: isLoadingVariants, error: variantsError } = useVariants();
  
  const [params, setParams] = useState<InventoryParams>({
    variantId: '',
    leadTime: 15,
    serviceLevel: 95,
    predictionHorizon: 30,
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    // Valores por defecto de parámetros avanzados
    outlier_treatment: 'cap',
    outlier_sensitivity: 2.5,
    train_on_all_data: false,
    weekly_seasonality: 10.0,
    yearly_seasonality: 0.0,
    seasonality_prior_scale: 10.0,
    changepoint_prior_scale: 0.05
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(params);
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="variantId" className="block text-sm font-medium text-gray-700 mb-2">
            Variant ID (SKU)
          </label>
          
          {variantsError && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {variantsError}
            </div>
          )}
          
          <select
            id="variantId"
            value={params.variantId}
            onChange={(e) => setParams({ ...params, variantId: e.target.value })}
            disabled={isLoadingVariants || loading}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            <option value="">
              {isLoadingVariants ? 'Cargando variantes...' : 'Selecciona un SKU'}
            </option>
            
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.id}{variant.sku ? ` (${variant.sku})` : ''}
              </option>
            ))}
          </select>
          
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
              onChange={(e) => setParams({ ...params, startDate: e.target.value })}
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
              onChange={(e) => setParams({ ...params, endDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="leadTime" className="block text-sm font-medium text-gray-700 mb-2">
              Lead Time (días)
            </label>
            <input
              type="number"
              id="leadTime"
              value={params.leadTime}
              onChange={(e) => setParams({ ...params, leadTime: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              min="1"
            />
          </div>

          <div>
            <label htmlFor="serviceLevel" className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Servicio (%)
            </label>
            <input
              type="number"
              id="serviceLevel"
              value={params.serviceLevel}
              onChange={(e) => setParams({ ...params, serviceLevel: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              min="1"
              max="100"
            />
          </div>

          <div>
            <label htmlFor="predictionHorizon" className="block text-sm font-medium text-gray-700 mb-2">
              Horizonte (días)
            </label>
            <input
              type="number"
              id="predictionHorizon"
              value={params.predictionHorizon}
              onChange={(e) => setParams({ ...params, predictionHorizon: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              min="1"
            />
          </div>
        </div>

        {/* Parámetros Avanzados */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>Parámetros Avanzados (Opcionales)</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
              {/* Outlier Treatment */}
              <div>
                <label htmlFor="outlier_treatment" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Tratamiento de Outliers
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                      <strong>Opciones:</strong><br/>
                      • none: Sin tratamiento<br/>
                      • cap: Limitar valores extremos (recomendado)<br/>
                      • detect: Solo detectar sin modificar<br/>
                      • holidays: Tratar como eventos no recurrentes<br/>
                      • remove: Eliminar outliers extremos
                    </div>
                  </div>
                </label>
                <select
                  id="outlier_treatment"
                  value={params.outlier_treatment}
                  onChange={(e) => setParams({ ...params, outlier_treatment: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="none">Sin tratamiento</option>
                  <option value="cap">Limitar valores (cap)</option>
                  <option value="detect">Solo detectar</option>
                  <option value="holidays">Eventos no recurrentes</option>
                  <option value="remove">Eliminar outliers</option>
                </select>
              </div>

              {/* Outlier Sensitivity */}
              <div>
                <label htmlFor="outlier_sensitivity" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Sensibilidad de Detección
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                      • 1.5: Muy sensible (detecta más outliers)<br/>
                      • 2.5: Equilibrado (recomendado)<br/>
                      • 3.0: Estándar estadístico<br/>
                      • 4.0: Conservador (solo extremos)
                    </div>
                  </div>
                </label>
                <input
                  type="number"
                  id="outlier_sensitivity"
                  value={params.outlier_sensitivity}
                  onChange={(e) => setParams({ ...params, outlier_sensitivity: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="1.5"
                  max="4.0"
                  step="0.1"
                />
              </div>

              {/* Test Mode */}
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

              {/* Seasonality Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="weekly_seasonality" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Estacionalidad Semanal
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                        • 0.0: Sin estacionalidad<br/>
                        • 10.0: Estándar (recomendado)<br/>
                        • 20.0: Fuerte (fin de semana marcado)
                      </div>
                    </div>
                  </label>
                  <input
                    type="number"
                    id="weekly_seasonality"
                    value={params.weekly_seasonality}
                    onChange={(e) => setParams({ ...params, weekly_seasonality: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0.0"
                    max="30.0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label htmlFor="yearly_seasonality" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Estacionalidad Anual
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                        Requiere &gt;365 días de datos<br/>
                        • 0.0: Sin estacionalidad<br/>
                        • 20.0-25.0: Productos estacionales
                      </div>
                    </div>
                  </label>
                  <input
                    type="number"
                    id="yearly_seasonality"
                    value={params.yearly_seasonality}
                    onChange={(e) => setParams({ ...params, yearly_seasonality: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0.0"
                    max="30.0"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Prior Scales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="seasonality_prior_scale" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Flexibilidad Estacional
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                        • 1.0-5.0: Patrones rígidos<br/>
                        • 10.0-15.0: Equilibrado<br/>
                        • 20.0-30.0: Mayor flexibilidad
                      </div>
                    </div>
                  </label>
                  <input
                    type="number"
                    id="seasonality_prior_scale"
                    value={params.seasonality_prior_scale}
                    onChange={(e) => setParams({ ...params, seasonality_prior_scale: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="1.0"
                    max="30.0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label htmlFor="changepoint_prior_scale" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Sensibilidad a Cambios
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                        • 0.001-0.01: Tendencia estable<br/>
                        • 0.05: Equilibrado (recomendado)<br/>
                        • 0.1-0.5: Mayor flexibilidad
                      </div>
                    </div>
                  </label>
                  <input
                    type="number"
                    id="changepoint_prior_scale"
                    value={params.changepoint_prior_scale}
                    onChange={(e) => setParams({ ...params, changepoint_prior_scale: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0.001"
                    max="0.5"
                    step="0.001"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Calculator className="w-5 h-5" />
          {loading ? 'Calculando...' : 'Calcular Predicción'}
        </button>
      </form>
    </div>
  );
}
