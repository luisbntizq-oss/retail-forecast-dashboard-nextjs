# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install --legacy-peer-deps   # Required flag — React 19 peer dep conflicts
npm run dev                      # Dev server at http://localhost:3000
npm run build                    # Production build
npm run typecheck                # tsc --noEmit (no test suite exists)
npm run lint                     # ESLint
```

## Architecture

### Stack
- **Next.js 16 App Router** + React 19 + TypeScript (strict)
- **Tailwind CSS 4**, Recharts, Lucide React
- **Supabase** (direct client from browser — no server-side queries)
- **Python backend** at `http://127.0.0.1:8000` — Next.js API routes act as proxies

### Path alias
`@/*` → `src/*`

### Request flow

```
Browser → Next.js API route (/api/predict, /api/predict/batch)
        → Python backend (http://127.0.0.1:8000/api/v1/...)
        → Python backend writes results to Supabase
        → Frontend reads results from Supabase directly
```

The frontend never writes prediction results — only reads them from Supabase after the Python backend processes them.

### Key Supabase tables

| Table | Purpose |
|-------|---------|
| `sales_history` | Historical daily sales per `variant_id` |
| `demand_prediction` | Forecast output — `batch_id`, `variant_id`, `prediction_date`, `predicted_quantity`, `lower_bound`, `upper_bound`, `calculated_at` |
| `rop_history` | Reorder point calculations — `variant_id`, `calculation_date`, `reorder_point`, `safety_stock`, `recommended_restock` |
| `variant` | Product catalog — `id`, `sku`, `current_stock` |

`src/lib/supabase.ts` exports a nullable client — always guard with `if (!supabase)` before use.

### Feature structure: `src/features/forecast/`

This is the only active feature. Its internal flow:

1. **`ForecastDashboard`** — root component, owns all state (`selectedVariantId`, `selectedVariantIds`, `dateRange`, `forecastParams`)
2. **`ForecastControls`** — parameter panel; emits `onCalculate`, `onVariantsChange`, `onDatesChange`, `onParamsChange`
3. **`SKUGrid`** — table of selected SKUs with ROP KPIs; has its own batch predict button; emits `onBatchComplete(batchId)` after the chunk containing the selected variant finishes
4. **`ForecastChart`** — renders historical sales + predictions; uses `storedPredictions` (from Supabase) when no fresh API `data` is present

### Batch prediction pattern

SKUs are processed in **chunks of 2** (`BATCH_CHUNK_SIZE`) via `Promise.allSettled`. Each chunk is an independent API call with its own `batch_id` (UUID generated locally in `BatchForecastService.runBatch` and echoed back in the response). After each chunk:
- `reloadSome(chunkIds)` refreshes ROP data for that chunk
- If the chunk contains `selectedVariantId`, `onBatchComplete(batch_id)` triggers `loadByBatchId` to update the chart

### Demand prediction loading — two paths

| Trigger | Method | How it finds the batch |
|---------|--------|----------------------|
| User selects a SKU | `getLatestPredictions(variantId)` | Latest `batch_id` by `calculated_at DESC` |
| Batch API response arrives | `getByBatchId(variantId, batchId)` | Exact `batch_id` from API response |

### `ForecastChart` data priority

```typescript
const activePredictions = (data?.predictions?.length > 0)
  ? data.predictions        // fresh single-SKU API result (useForecast hook)
  : storedPredictions;      // loaded from demand_prediction table
```
