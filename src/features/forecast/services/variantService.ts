import { supabase } from '@/lib/supabase';

export interface Variant {
  id: string;
  sku?: string;
  current_stock?: number;
}

// Mock data for development when Supabase is not configured
const mockVariants: Variant[] = [
  { id: '1', sku: 'VAR-001' },
  { id: '2', sku: 'VAR-002' },
  { id: '3', sku: 'VAR-003' },
  { id: '4', sku: 'VAR-004' },
  { id: '5', sku: 'VAR-005' },
];

export class VariantService {
  /**
   * Obtiene todas las variantes desde Supabase o mock data
   */
  static async getVariants(): Promise<Variant[]> {
    if (!supabase) {
      console.warn('[VariantService] Supabase no configurado');
      return mockVariants;
    }

    try {
      const { data, error } = await supabase
        .from('variant')
        .select('id, sku, current_stock')
        .order('id', { ascending: true });

      if (error) {
        console.error('[VariantService] Error:', error.message);
        throw new Error(`Error al cargar variantes: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ [VariantService] Error general:', error);
      throw error;
    }
  }

  /**
   * Obtiene una variante específica por ID
   */
  static async getVariantById(id: string): Promise<Variant | null> {
    if (!supabase) {
      console.warn('⚠️ [VariantService] Supabase no está configurado, usando datos mock');
      return mockVariants.find(v => v.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('variant')
        .select('id, sku')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching variant:', error);
        throw new Error(`Error al cargar variante: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getVariantById:', error);
      throw error;
    }
  }
}
