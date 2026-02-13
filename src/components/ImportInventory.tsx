'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ImportStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export function ImportInventory() {
  const [status, setStatus] = useState<ImportStatus>({ type: 'idle', message: '' });
  const [isOpen, setIsOpen] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus({ type: 'loading', message: 'Procesando archivo...' });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: Papa.ParseResult<Record<string, unknown>>) => {
        try {
          const rows = results.data as Record<string, unknown>[];

          if (rows.length === 0) {
            setStatus({ type: 'error', message: 'El archivo está vacío' });
            return;
          }

          const variantId = (rows[0]?.variant_id || rows[0]?.sku || rows[0]?.id || 'unknown') as string;
          const inventoryData = rows
            .filter((row) => row.date && row.sales)
            .map((row) => ({
              variant_id: (row.variant_id || row.sku || row.id || variantId) as string,
              date: new Date(row.date as string).toISOString().split('T')[0],
              sales: parseFloat(row.sales as string),
            }));

          if (inventoryData.length === 0) {
            setStatus({
              type: 'error',
              message: 'No se encontraron filas válidas. Asegúrate de tener columnas: date, sales (y opcionalmente variant_id)',
            });
            return;
          }

          if (!supabase) {
            throw new Error('Supabase no está configurado');
          }

          const { error: deleteError } = await supabase
            .from('inventory_history')
            .delete()
            .eq('variant_id', variantId);

          if (deleteError) throw deleteError;

          const { error: insertError } = await supabase
            .from('inventory_history')
            .insert(inventoryData);

          if (insertError) throw insertError;

          setStatus({
            type: 'success',
            message: `Se importaron exitosamente ${inventoryData.length} registros para SKU: ${variantId}`,
          });
          setIsOpen(false);

          setTimeout(() => {
            setStatus({ type: 'idle', message: '' });
          }, 3000);
        } catch (error) {
          setStatus({
            type: 'error',
            message: `Error al importar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          });
        }
      },
      error: (error: Error) => {
        setStatus({ type: 'error', message: `Error al procesar CSV: ${error.message}` });
      },
    });

    event.target.value = '';
  };

  const downloadTemplate = () => {
    const csv = 'date,sales,variant_id\n2024-01-01,150,SKU001\n2024-01-02,160,SKU001\n2024-01-03,145,SKU001';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_inventario.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload size={18} />
          Importar Histórico CSV
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Importar Histórico de Ventas</h2>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">Selecciona archivo CSV</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={status.type === 'loading'}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-xs text-gray-500">
                Formato esperado: columnas de "date", "sales" y opcionalmente "variant_id" o "sku"
              </p>
            </div>

            {status.type !== 'idle' && (
              <div
                className={`mb-4 p-3 rounded-lg flex gap-3 ${
                  status.type === 'loading'
                    ? 'bg-blue-50 text-blue-800'
                    : status.type === 'success'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                }`}
              >
                {status.type === 'loading' && <Loader size={18} className="animate-spin flex-shrink-0" />}
                {status.type === 'success' && <CheckCircle size={18} className="flex-shrink-0" />}
                {status.type === 'error' && <AlertCircle size={18} className="flex-shrink-0" />}
                <span className="text-sm">{status.message}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={downloadTemplate}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Descargar Plantilla
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
