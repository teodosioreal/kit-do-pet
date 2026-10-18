# Kit do Pet

App web (PWA, pensado para celular) em português do Brasil. O tutor compra um
kit de documentos personalizados do pet em PDF (RG, certidão de nascimento e
carteira de vacinação) e ganha uma página pública do pet com QR code.

> Documentos personalizados, **sem valor oficial**. A página do pet é
> identificação por QR code, não rastreamento.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Supabase: Postgres com RLS, login por link mágico e Storage
- Vercel (hospedagem e cron diário)
- Resend (e-mail) e Evolution API (WhatsApp)
- `@react-pdf/renderer` para gerar os PDFs no servidor

## Estrutura

```
src/
  app/                 rotas (área do cliente em /app, admin em /admin, página pública em /p/[codigo])
  lib/
    env.ts             variáveis de ambiente do servidor
    products.ts        catálogo de produtos e mapeamento dos IDs da Kiwify/Cakto
    supabase/          clientes do Supabase (navegador, servidor e service role)
  proxy.ts             renova a sessão e protege /app e /admin
supabase/migrations/   esquema do banco, RLS e buckets
```

## Rodando localmente

1. Instale o Node.js 20.9 ou mais novo.
2. Crie um projeto no [Supabase](https://supabase.com) e rode a migração:
   - Pelo painel: **SQL Editor → New query**, cole o conteúdo de
     `supabase/migrations/20261018000000_init.sql` e clique em **Run**; ou
   - Pela CLI: `npx supabase link --project-ref SEU_REF` e `npx supabase db push`.
3. Copie as variáveis: `cp .env.example .env.local` e preencha.
4. Instale e rode:
   ```bash
   npm install
   npm run dev
   ```
5. Abra http://localhost:3000.

## Publicando na Vercel

_(em construção — será completado nas próximas etapas)_

## Webhook da Kiwify

_(em construção — será completado na etapa do webhook)_
