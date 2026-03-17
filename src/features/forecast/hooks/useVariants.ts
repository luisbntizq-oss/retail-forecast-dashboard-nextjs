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
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const variants = await VariantService.getVariants();
      setState({
        variants,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al cargar variantes';
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
