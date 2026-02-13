export const API_ENDPOINTS = {
  // Forecast endpoints
  forecast: {
    calculate: '/api/forecast/calculate',
    history: '/api/forecast/history',
    byId: (id: string) => `/api/forecast/${id}`,
  },
  
  // Sales endpoints
  sales: {
    list: '/api/sales',
    upload: '/api/sales/upload',
  },
  
  // Inventory endpoints
  inventory: {
    list: '/api/inventory',
    update: '/api/inventory/update',
  },
} as const;
