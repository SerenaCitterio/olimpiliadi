# Baby

Progetto Next.js con Tailwind CSS e shadcn/ui.

## Setup

```bash
npm install
```

## Avvio

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Aggiungere componenti shadcn

```bash
npx shadcn@latest add button
npx shadcn@latest add card
# ecc.
```

Poi importa da `@/components/ui`:

```tsx
import { Button } from "@/components/ui/button";
```

## Script

- `npm run dev` – dev server
- `npm run build` – build produzione
- `npm run start` – avvia build
- `npm run lint` – ESLint
