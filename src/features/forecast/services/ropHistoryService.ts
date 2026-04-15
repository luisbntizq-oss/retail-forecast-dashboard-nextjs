import { supabase } from '@/lib/supabase';

export interface ROPData {
  variant_id: string;
  date: string;
  reorder_point: number;
  safety_stock: number;
  recommended_restock: number;
}

export class ROPHistoryService {
  /**
   * Obtiene el último ROP de múltiples variantes en una sola query.
   * Retorna un Map<variantId, ROPData>.
   */
  static async getBulkLatestROPs(variantIds: string[]): Promise<Map<string, ROPData>> {
    if (!supabase || variantIds.length === 0) return new Map();

    try {
      const { data, error } = await supabase
        .from('rop_history')
        .select('*')
        .in('variant_id', variantIds)
        .order('calculation_date', { ascending: false });

      if (error) {
        console.error('[getBulkLatestROPs] Supabase error:', error.message);
        return new Map();
      }
      if (!data) return new Map();

      const map = new Map<string, ROPData>();
      for (const row of data) {
        const key = row.variant_id?.toString() ?? '';
        if (!map.has(key)) {
          map.set(key, {
            variant_id: key,
            date: row.calculation_date || row.date || new Date().toISOString(),
            reorder_point: row.reorder_point ?? row.reorderPoint ?? 0,
            safety_stock: row.safety_stock ?? row.safetyStock ?? 0,
            recommended_restock: row.recommended_restock ?? row.recommendedRestock ?? 0,
          });
        }
      }
      return map;
    } catch {
      return new Map();
    }
  }

  static async getROPHistory(variantId: string): Promise<ROPData | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('rop_history')
        .select('*')
        .eq('variant_id', variantId)
        .order('calculation_date', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[ROPHistoryService] Error:', error.message || 'Unknown');
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const row = data[0];

      const ropData: ROPData = {
        variant_id: row.variant_id || variantId,
        date: row.date || new Date().toISOString(),
        reorder_point: row.reorder_point || row.reorderPoint || 0,
        safety_stock: row.safety_stock || row.safetyStock || 0,
        recommended_restock: row.recommended_restock || row.recommendedRestock || 0
      };

      return ropData;
    } catch (error) {
      console.error('❌ [ROPHistoryService] Error inesperado:', error);
      return null;
    }
  }
}
