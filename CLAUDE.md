# Kit do Pet — guia para quem continuar este projeto (humano ou Claude Code)

Leia este arquivo inteiro antes de mexer no código. Ele resume o produto, as
decisões já tomadas e o que está pronto ou pendente. **Mantenha a seção
"Status" atualizada ao terminar cada tarefa.**

Leia também `AGENTS.md`: esta é a versão 16 do Next.js, com mudanças
importantes (ex.: `middleware` virou `src/proxy.ts`; `params`/`cookies()` são
assíncronos). A documentação da versão instalada está em
`node_modules/next/dist/docs/`.

## O produto

App web em português do Brasil, pensado primeiro para celular (PWA, sem loja
de apps). O tutor compra um **kit de documentos personalizados do pet em PDF**
e ganha uma **página pública do pet com QR code**. Venda única com order bumps,
paga na **Kiwify** (com troca fácil para a **Cakto** via adaptador de webhook).

### Produtos (chaves internas em `src/lib/products.ts`)
| chave | produto | preço | o que libera |
|---|---|---|---|
| `kit` | Kit do Pet (principal) | R$ 14,90 | 1 pet, RG, certidão, carteira de vacinação, página pública com QR |
| `reminders` | Lembretes no WhatsApp por 1 ano (bump) | R$ 19,90 | lembretes de vacina/vermífugo/antipulgas por 12 meses a partir da compra |
| `extra_pet` | Mais um pet (bump) | R$ 7,00 | +1 pet na conta |
| `guide_training` | Guia de adestramento básico (bump) | R$ 4,90 | PDF (versões cão e gato) |
| `guide_treats` | Guia de petiscos caseiros (bump) | R$ 4,90 | PDF (versões cão e gato) |

Os guias mostram a versão da espécie dos pets do cliente (as duas se tiver cão e gato).

### Regras que não podem ser quebradas
- Todo PDF tem, em letra pequena: **"Documento personalizado, sem valor oficial."**
- **Nada de brasões ou símbolos que imitem documentos do governo.**
- **Nunca usar a palavra "rastreio"/"rastreamento"**: é *identificação por QR code*.
- Página de vendas: **sem preço riscado, sem contador falso, sem "somente hoje", sem prometer rastreio.**
- LGPD: política de privacidade, termos de uso e consentimento explícito para mensagens no WhatsApp.
- Chaves sempre em variáveis de ambiente (`.env.example` lista todas). Nunca commitar `.env*`.
- Cada cliente só vê os próprios dados (RLS no Supabase). Código que usa a service
  role (`src/lib/supabase/admin.ts`) precisa validar antes quem está pedindo.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind 4 (classes utilitárias próprias via `@utility` em `globals.css`)
- `cacheComponents` desligado (modelo clássico: páginas com sessão são dinâmicas)
- Supabase: Postgres + RLS, Auth por link mágico, Storage (`pet-photos` e `guides`, ambos privados)
- Vercel (hospedagem + cron diário em `vercel.json`)
- Resend (e-mail), Evolution API (WhatsApp), `@react-pdf/renderer` (PDF no servidor)

## Mapa do código
```
CLAUDE.md                  este guia
supabase/migrations/       esquema, RLS, triggers (limite de pets, nº de registro), buckets
src/proxy.ts               renova sessão; protege /app e /admin
src/lib/env.ts             variáveis do servidor (server-only)
src/lib/public-env.ts      variáveis NEXT_PUBLIC_*
src/lib/products.ts        catálogo e mapeamento de IDs Kiwify/Cakto → chave interna
src/lib/supabase/          clientes: client.ts (navegador), server.ts (sessão), admin.ts (service role)
src/lib/auth.ts            usuário atual, requireUser, requireAdmin
src/lib/entitlements.ts    direitos ativos do usuário (kit, limite de pets, lembretes, guias)
src/lib/payments/          adaptadores de pagamento (types.ts, kiwify.ts, cakto.ts) + process.ts
src/lib/access-link.ts     link de acesso assinado (gera link mágico novo a cada clique)
src/lib/whatsapp.ts        Evolution API (texto e documento)
src/lib/email.ts           Resend
src/lib/pdf/               documentos em PDF (RG, certidão, carteira de vacinação)
src/app/(site)/            páginas públicas: vendas (/cao, /gato), privacidade, termos
src/app/app/               área do cliente
src/app/admin/             painel do administrador (ADMIN_EMAILS)
src/app/p/[code]/          página pública do pet (QR code)
src/app/api/               webhooks, PDFs, cron, "encontrei este pet"
```

## Decisões importantes
- **Direitos** ficam na tabela `entitlements` (um registro por item e por pedido).
  Reembolso/chargeback revoga só os direitos daquele pedido. Liberação manual do
  admin usa `source = 'manual'`. View `active_entitlements` = não revogado e no prazo.
- **Limite de pets** = soma de `kit` + `extra_pet` ativos; aplicado por trigger no banco.
- **Lembretes**: comprar de novo estende 12 meses a partir do maior vencimento atual.
- **Link de acesso** enviado por e-mail/WhatsApp: `/acesso/<token>` assinado com
  `APP_SECRET` (validade 30 dias). Ao clicar, o servidor gera um link mágico novo
  e já abre a sessão — o link do e-mail nunca "expira" antes da hora.
- **Webhook Kiwify**: valida `?signature=` (HMAC-SHA1 do corpo com o token) ou o
  token enviado direto; idempotência por (provider, provider_order_id) + status.
  O formato exato do corpo NÃO é oficialmente documentado: existe
  `/api/webhooks/kiwify/teste` que só grava o corpo bruto em `webhook_events`
  para ajustar o mapeamento em `src/lib/payments/kiwify.ts`.
- **Fotos**: corte quadrado no navegador (react-easy-crop), upload direto para
  `pet-photos/<user_id>/...` (RLS por pasta). Leitura pública via URL assinada.
- **PDFs** são gerados na hora com os dados atuais (segunda via ilimitada).
- **Página pública** `/p/<codigo>`: o tutor escolhe os campos em `pets.public_fields`.
  "Encontrei este pet" tem limite de envios (por pet e por IP com hash).
- **Cron** `/api/cron/lembretes` diário às 12:00 UTC (09:00 de Brasília), protegido por `CRON_SECRET`.
  Envia 3 dias antes e no dia; renovação 30 dias antes do vencimento; tudo registrado
  em `reminder_log` com chave única para não duplicar.

## Status
- [x] Etapa 1 — estrutura do projeto e banco
- [x] Etapa 2 — área do cliente e cadastro do pet
- [x] Etapa 3 — PDFs
- [x] Etapa 4 — página pública com QR
- [x] Etapa 5 — webhook Kiwify e liberação de acesso
- [x] Etapa 6 — páginas de vendas
- [x] Etapa 7 — painel do administrador
- [ ] Etapa 8 — lembretes no WhatsApp

### Pendências externas (dono do projeto)
Ver a seção "Configuração externa" do README.

## Como validar mudanças
```bash
npm run lint && npx tsc --noEmit && npm run build
```
A migração pode ser testada num Postgres local simulando os esquemas `auth` e
`storage` do Supabase (veja o histórico de commits da etapa 1).
