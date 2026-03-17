import { supabase } from '@/lib/supabase';
import type { SalesData } from '../types/forecast.types';

export interface SalesHistoryRecord {
  variant_id: string;
  date: string;
  quantity_sold: number;
}

export class SalesHistoryService {
  /**
   * Obtiene el historial de ventas para un variant específico
   */
  static async getSalesHistory(
    variantId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<SalesData[]> {
    if (!supabase) {
      return [];
    }

    try {
      let query = supabase
        .from('sales_history')
        .select('variant_id, date, quantity_sold')
        .eq('variant_id', variantId);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) {
        throw new Error(`Error al cargar historial de ventas: ${error.message}`);
      }

      return (data || []).map(record => ({
        date: record.date,
        quantity: record.quantity_sold,
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene estadísticas del historial de ventas
   */
  static async getSalesStats(variantId: string) {
    const history = await this.getSalesHistory(variantId);
    
    if (history.length === 0) {
      return null;
    }

    const quantities = history.map(h => h.quantity);
    const total = quantities.reduce((sum, q) => sum + q, 0);
    const avg = total / quantities.length;
    const max = Math.max(...quantities);
    const min = Math.min(...quantities);

    return {
      total,
      average: avg,
      max,
      min,
      recordCount: history.length,
    };
  }
}
