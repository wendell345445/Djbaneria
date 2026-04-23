# DJ Banner AI Starter

Base inicial para um SaaS de criação de banners profissionais para DJs, com geração 100% por IA e sistema de créditos por assinatura.

## Stack
- Next.js App Router
- TypeScript
- Prisma + Postgres
- Stripe Billing
- OpenAI Image API
- Cloudflare R2

## Fluxo do produto
1. Usuário cria banner em `/dashboard/banners/new`
2. API valida créditos do plano
3. API monta prompt somente com os dados do formulário
4. OpenAI gera o banner final
5. Banner é salvo no banco e no storage
6. Usuário visualiza e faz download

## Planos sugeridos
- FREE: 3 banners/mês
- PRO: 30 banners/mês
- STUDIO: 100 banners/mês

## Rotas iniciais
- `/dashboard`
- `/dashboard/banners/new`
- `/dashboard/billing`
- `POST /api/banners/generate`
- `POST /api/billing/create-checkout`
- `POST /api/billing/webhook`

## Passos para iniciar
1. Copie `.env.example` para `.env.local`
2. Configure `DATABASE_URL`, `OPENAI_API_KEY` e Stripe
3. Rode:
   - `npm install`
   - `npx prisma generate`
   - `npx prisma migrate dev`
   - `npm run dev`

## Observações
- O MVP já nasce sem editor manual.
- Cada geração consome 1 crédito.
- O saldo mensal é calculado por `Subscription + UsageEvent`.
