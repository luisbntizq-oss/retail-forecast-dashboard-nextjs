#  Retail Forecast Dashboard (Next.js)

Dashboard de predicción de demanda y gestión de inventario para retail, migrado de Vite a Next.js.

##  Migración Completada

 De: Vite + React 18  
 A: Next.js 16 + React 19 + App Router  
 Todas las funcionalidades migradas

##  Stack Tecnológico

- Next.js 16
- React 19  
- TypeScript
- Tailwind CSS 4
- Recharts
- Supabase
- Papa Parse
- Lucide React

##  Instalación

```bash
npm install --legacy-peer-deps
cp .env.example .env
# Edita .env con tus credenciales
```

##  Configuración

Variables de entorno en `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
```

##  Desarrollo

```bash
npm run dev      # http://localhost:3000
npm run build    # Build producción
npm start        # Servidor producción
npm run typecheck # Type checking
npm run lint     # Linting
```

##  Estructura

```
src/
 app/              # Next.js App Router
 components/       # Componentes React
 features/         # Features por dominio
 services/         # Servicios API
 lib/             # Utilidades
 types/           # Types TypeScript
 hooks/           # Hooks globales
```

##  Cambios en la Migración

### Variables de Entorno
- Vite: `import.meta.env.VITE_*`
- Next.js: `process.env.NEXT_PUBLIC_*`

### Componentes Client
Componentes con hooks o eventos requieren:
```typescript
'use client';
```

### Path Aliases
```typescript
import { Dashboard } from '@/components/Dashboard';
```

##  Servidor Corriendo

El servidor de desarrollo está en: **http://localhost:3000**

---

**Migrado de Vite a Next.js** - Febrero 2026
