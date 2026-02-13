import { supabase } from '@/lib/supabase';

export interface Variant {
  id: string;
  sku?: string;
}

export class VariantService {
  /**
   * Obtiene todas las variantes desde Supabase
   */
  static async getVariants(): Promise<Variant[]> {
    console.log('🔍 [VariantService] Iniciando carga de variantes...');
    
    if (!supabase) {
      console.error('❌ [VariantService] Supabase no está configurado');
      throw new Error('Supabase no está configurado. Verifica las variables de entorno.');
    }

    console.log('✅ [VariantService] Supabase configurado correctamente');

    try {
      console.log('📡 [VariantService] Haciendo petición a Supabase tabla "variant"...');
      
      const { data, error } = await supabase
        .from('variant')
        .select('id, sku')
        .order('id', { ascending: true });

      if (error) {
        console.error('❌ [VariantService] Error en petición Supabase:', error);
        throw new Error(`Error al cargar variantes: ${error.message}`);
      }

      console.log(`✅ [VariantService] Variantes cargadas exitosamente:`, data?.length || 0, 'registros');
      console.log('📊 [VariantService] IDs de variantes:', data?.map(v => v.id));
      console.log('📋 [VariantService] Datos completos:', data);

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
      throw new Error('Supabase no está configurado. Verifica las variables de entorno.');
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
