import { ForecastDashboard } from '@/features/forecast';

/**
 * Ejemplo de uso del feature Forecast
 * 
 * Este componente muestra cómo integrar el dashboard de predicción
 * de demanda en tu aplicación.
 */
export function ForecastExample() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Predicción de Demanda
          </h1>
          <p className="mt-2 text-gray-600">
            Calcula predicciones usando algoritmos de Machine Learning
          </p>
        </header>

        <ForecastDashboard />
      </div>
    </div>
  );
}

/**
 * Ejemplo de uso avanzado con hook personalizado
 */
import { useForecast } from '@/features/forecast/hooks/useForecast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ForecastAdvancedExample() {
  const {
    data,
    isCalculating,
    error,
    calculateForecast,
    reset,
  } = useForecast();

  const handleCalculate = async () => {
    try {
      await calculateForecast({
        productId: 'PROD-001',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        algorithm: 'arima',
      });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="p-8">
      <Card>
        <h2 className="text-xl font-bold mb-4">Control Manual</h2>

        <div className="space-y-4">
          <Button
            onClick={handleCalculate}
            disabled={isCalculating}
            isLoading={isCalculating}
          >
            Calcular Predicción
          </Button>

          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded">
              Error: {error}
            </div>
          )}

          {data && (
            <div>
              <h3 className="font-semibold mb-2">Resultados:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
              <Button onClick={reset} variant="secondary" className="mt-4">
                Limpiar
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/**
 * Ejemplo de uso del servicio directo (sin hook)
 */
import { ForecastService } from '@/features/forecast/services/forecastService';

export async function directServiceExample() {
  try {
    // Calcular una predicción
    const forecast = await ForecastService.calculateForecast({
      productId: 'PROD-001',
      startDate: '2026-02-01',
      endDate: '2026-03-01',
      algorithm: 'prophet',
    });

    console.log('Predicción calculada:', forecast);

    // Obtener historial de predicciones
    const history = await ForecastService.getForecastHistory('PROD-001');
    console.log('Historial:', history);

    // Obtener una predicción específica
    const specific = await ForecastService.getForecastById(forecast.forecastId);
    console.log('Predicción específica:', specific);

    return forecast;
  } catch (error) {
    console.error('Error al usar el servicio:', error);
    throw error;
  }
}
