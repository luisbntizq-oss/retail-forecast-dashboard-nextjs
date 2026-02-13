'use client';

import { useState, useEffect, useCallback } from 'react';
import { VariantService, type Variant } from '../services/variantService';

interface UseVariantsState {
  variants: Variant[];
  isLoading: boolean;
  error: string | null;
}

export function useVariants() {
  const [state, setState] = useState<UseVariantsState>({
    variants: [],
    isLoading: true,
    error: null,
  });

  const loadVariants = useCallback(async () => {
    console.log('🎣 [useVariants] Iniciando carga de variantes...');
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const variants = await VariantService.getVariants();
      console.log('✅ [useVariants] Variantes cargadas:', variants.length);
      console.log('🆔 [useVariants] IDs obtenidos:', variants.map(v => v.id));
      setState({
        variants,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al cargar variantes';
      console.error('❌ [useVariants] Error:', errorMessage);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  return {
    ...state,
    reload: loadVariants,
  };
}
