'use client';

import { useState } from 'react';
import { AlertCircle, Package, TrendingUp, Loader2, AlertTriangle, CheckCircle2, Archive, Zap, XCircle, Trash2 } from 'lucide-react';
import { useMultiROPHistory } from '../hooks/useMultiROPHistory';
import { Variant } from '../services/variantService';
import { BatchForecastService } from '../services/batchForecastService';
import type { ForecastRequest } from '../types/forecast.types';

interface SKUGridProps {
  selectedIds: string[];
  variants: Variant[];
  onRemove?: (id: string) => void;
  onSelect?: (id: string) => void;
  selectedVariantId?: string | null;
  forecastParams: ForecastRequest | null;
}

function StatusBadge({ ropValue, restock }: { ropValue: number | undefined; restock: number | undefined }) {
  if (ropValue === undefined || restock === undefined) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <AlertTriangle className="w-3 h-3" />
        Sin datos
      </span>
    );
  }
  if (restock > ropValue) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <AlertTriangle className="w-3 h-3" />
        Reponer
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
      <CheckCircle2 className="w-3 h-3" />
      OK
    </span>
  );
}

export function SKUGrid({ selectedIds, variants, onRemove, onSelect, selectedVariantId, forecastParams }: SKUGridProps) {
  const { entries, isLoading, reload } = useMultiROPHistory(selectedIds);
  const [batchStatus, setBatchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [batchError, setBatchError] = useState<string | null>(null);

  const handleBatchPredict = async () => {
    if (!forecastParams) return;
    
    const selectedVariants = variants.filter(v =>
      selectedIds.includes(v.id?.toString() ?? '')
    );
    if (selectedVariants.length === 0) return;

    setBatchStatus('loading');
    setBatchError(null);
    try {
      const result = await BatchForecastService.runBatch(selectedVariants, forecastParams);
      console.log('✅ Batch predict result:', result);
      
      // Recargar la tabla con los nuevos datos devueltos/insertados
      await reload();

      setBatchStatus('success');
      // Reset to idle after 4 s
      setTimeout(() => setBatchStatus('idle'), 4000);
    } catch (err) {
      console.error('❌ Batch predict error:', err);
      setBatchError(err instanceof Error ? err.message : 'Error desconocido');
      setBatchStatus('error');
    }
  };

  if (selectedIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-28 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-sm text-gray-400">Selecciona uno o más SKUs para ver el resumen</p>
      </div>
    );
  }

  const variantMap = new Map(variants.map(v => [v.id?.toString(), v]));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <Package className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-800">
          Resumen de SKUs seleccionados
        </h3>
        <span className="ml-auto text-xs text-gray-400">
          {selectedIds.length} SKU{selectedIds.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span className="flex items-center justify-center gap-1">
                  <Archive className="w-3 h-3 text-purple-500" />
                  Stock Actual
                </span>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span className="flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3 text-blue-500" />
                  ROP
                </span>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span className="flex items-center justify-center gap-1">
                  <Package className="w-3 h-3 text-emerald-500" />
                  Stock Seguridad
                </span>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-500" />
                  Uds. a Reponer
                </span>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entries.map(entry => {
              const variant = variantMap.get(entry.variantId);
              const skuLabel = variant?.sku
                ? `${entry.variantId} (${variant.sku})`
                : entry.variantId;

              const isSelected = entry.variantId === selectedVariantId;
              const rowClasses = `transition-colors cursor-pointer ${
                isSelected ? 'bg-blue-50/60 ring-1 ring-blue-500/20' : 'hover:bg-gray-50/70'
              }`;

              if (entry.isLoading || isLoading) {
                return (
                  <tr 
                    key={entry.variantId} 
                    className={rowClasses}
                    onClick={() => onSelect?.(entry.variantId)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{skuLabel}</td>
                    <td colSpan={5} className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Cargando...
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemove?.(entry.variantId); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar SKU"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              }

              const rop = entry.ropData;

              return (
                <tr 
                  key={entry.variantId} 
                  className={rowClasses}
                  onClick={() => onSelect?.(entry.variantId)}
                >
                  <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5"></span>}
                    {skuLabel}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {variant?.current_stock !== undefined ? (
                      <span className="font-semibold text-purple-700">{variant.current_stock}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {rop ? (
                      <span className="font-semibold text-blue-700">{rop.reorder_point}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {rop ? (
                      <span className="font-semibold text-emerald-700">{rop.safety_stock}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {rop ? (
                      <span className="font-semibold text-amber-700">{rop.recommended_restock}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge
                      ropValue={rop?.reorder_point}
                      restock={rop?.recommended_restock}
                    />
                  </td>
                  <td className="px-4 py-3 text-center border-l border-gray-50">
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove?.(entry.variantId); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shadow-sm"
                      title="Eliminar SKU"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Batch predict button */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
        <button
          onClick={handleBatchPredict}
          disabled={selectedIds.length === 0 || batchStatus === 'loading'}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          {batchStatus === 'loading' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Calculando...</>
          ) : (
            <><Zap className="w-4 h-4" /> Predicción</>
          )}
        </button>

        {batchStatus === 'success' && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            Predicción enviada correctamente
          </span>
        )}

        {batchStatus === 'error' && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
            <XCircle className="w-4 h-4" />
            {batchError ?? 'Error al enviar la predicción'}
          </span>
        )}
      </div>
    </div>
  );
}
