'use client';

import { useState, useEffect } from 'react';
import { SalesHistoryService } from '../services/salesHistoryService';
import type { SalesData } from '../types/forecast.types';

interface UseSalesHistoryState {
  salesHistory: SalesData[];
  isLoading: boolean;
  error: string | null;
}

export function useSalesHistory(
  variantId: string | null,
  startDate?: string,
  endDate?: string
) {
  const [state, setState] = useState<UseSalesHistoryState>({
    salesHistory: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!variantId) {
      setState({
        salesHistory: [],
        isLoading: false,
        error: null,
      });
      return;
    }

    const loadSalesHistory = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const salesHistory = await SalesHistoryService.getSalesHistory(variantId, startDate, endDate);
        
        setState({
          salesHistory,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al cargar historial de ventas';
        console.error('❌ [useSalesHistory] Error:', errorMessage);
        
        setState({
          salesHistory: [],
          isLoading: false,
          error: errorMessage,
        });
      }
    };

    loadSalesHistory();
  }, [variantId, startDate ?? '', endDate ?? '']);

  return state;
}
