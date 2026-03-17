import { supabase } from '@/lib/supabase';

export interface ROPData {
  variant_id: string;
  date: string;
  reorder_point: number;
  safety_stock: number;
  recommended_restock: number;
}

export class ROPHistoryService {
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
