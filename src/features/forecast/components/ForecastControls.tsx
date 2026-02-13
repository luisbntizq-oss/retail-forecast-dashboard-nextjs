'use client';

import { useState } from 'react';
import { useVariants } from '../hooks/useVariants';
import { Select } from '@/components/ui/select';
import type { ForecastRequest } from '../types/forecast.types';

interface ForecastControlsProps {
  onCalculate: (request: ForecastRequest) => Promise<void>;
  isCalculating: boolean;
}

export function ForecastControls({ onCalculate, isCalculating }: ForecastControlsProps) {
  const [productId, setProductId] = useState('');
  const [algorithm, setAlgorithm] = useState<ForecastRequest['algorithm']>('arima');
  
  const { variants, isLoading: isLoadingVariants, error: variantsError } = useVariants();

  console.log('🎨 [ForecastControls] Renderizando componente');
  console.log('📊 [ForecastControls] Estado:', { 
    variantsCount: variants.length,
    variantIds: variants.map(v => v.id),
    isLoadingVariants,
    hasError: !!variantsError 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const request: ForecastRequest = {
      productId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      algorithm,
    };

    await onCalculate(request);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow">
      {/* SKU/Variant Selector */}
      <Select
        label="SKU / Variant ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        disabled={isLoadingVariants || isCalculating}
        error={variantsError || undefined}
        helperText={
          !isLoadingVariants && variants.length > 0
            ? `${variants.length} variante${variants.length !== 1 ? 's' : ''} disponible${variants.length !== 1 ? 's' : ''}`
            : undefined
        }
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
      </Select>

      {/* Mensaje si no hay variantes */}
      {!isLoadingVariants && variants.length === 0 && !variantsError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            ⚠️ No se encontraron variantes en la base de datos
          </p>
        </div>
      )}

      {/* Algorithm Selector */}
      <Select
        label="Algoritmo de Predicción"
        value={algorithm}
        onChange={(e) => setAlgorithm(e.target.value as ForecastRequest['algorithm'])}
        disabled={isCalculating}
      >
        <option value="arima">ARIMA (Time Series)</option>
        <option value="prophet">Prophet (Facebook)</option>
        <option value="lstm">LSTM (Deep Learning)</option>
      </Select>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isCalculating || !productId || isLoadingVariants}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isCalculating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Calculando predicción...
          </span>
        ) : (
          'Calcular Predicción'
        )}
      </button>
    </form>
  );
}
