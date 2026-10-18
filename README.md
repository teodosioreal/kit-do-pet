# Kit do Pet

App web (PWA, pensado para celular) em português do Brasil. O tutor compra na
**Kiwify** um kit de documentos personalizados do pet em PDF (RG, certidão de
nascimento e carteira de vacinação) e ganha uma página pública do pet com QR
code. Order bumps: lembretes no WhatsApp por 1 ano, mais um pet e dois guias.

> Documentos personalizados, **sem valor oficial**. A página do pet é
> **identificação por QR code**.

Quem for continuar o desenvolvimento (pessoa ou Claude Code): leia o `CLAUDE.md`.

## Sumário
1. [Como funciona](#como-funciona)
2. [Rodando localmente](#rodando-localmente)
3. [Configuração externa (passo a passo)](#configuração-externa-passo-a-passo)
   - [Supabase](#1-supabase)
   - [Resend (e-mail)](#2-resend-e-mail)
   - [Evolution API (WhatsApp)](#3-evolution-api-whatsapp)
   - [Hostinger (publicar)](#4-hostinger-publicar)
   - [Kiwify (produtos, order bumps e webhook)](#5-kiwify)
   - [Meta Pixel](#6-meta-pixel)
   - [Últimos ajustes](#7-últimos-ajustes)
4. [Variáveis de ambiente](#variáveis-de-ambiente)
5. [Endereços do app](#endereços-do-app)
6. [Trocar Kiwify por Cakto](#trocar-kiwify-por-cakto)

## Como funciona

1. O cliente compra na Kiwify (kit + order bumps).
2. A Kiwify chama `POST /api/webhooks/kiwify`. O app confere a assinatura, salva
   o pedido (sem processar duas vezes), cria o usuário pelo e-mail (ou usa o
   existente) e libera os direitos de cada item comprado.
3. O cliente recebe por **e-mail** e **WhatsApp** um link de acesso pessoal
   (vale 30 dias; depois ele entra em `/entrar` e recebe um link mágico).
4. Na área do cliente (`/app`) ele cadastra o pet, as vacinas e vermífugos, gera
   os PDFs (sempre atualizados), escolhe o que aparece na página pública e baixa os guias.
5. Reembolso ou chargeback na Kiwify revoga os direitos daquele pedido.
6. Todo dia às 9h (Brasília) o GitHub Actions chama a rotina que envia os lembretes de quem comprou o bump.

## Rodando localmente

Requisitos: Node.js 20.9+ e Docker (para o Supabase local).

```bash
npm install
npx supabase start          # sobe Postgres/Auth/Storage locais e aplica a migração
cp .env.example .env.local  # preencha com as chaves que o comando acima mostrou
npm run dev                 # http://localhost:3000
```

- E-mails de login do Supabase local aparecem no Mailpit: http://127.0.0.1:54324
- Para simular uma compra, envie um webhook assinado (troque `SEU_TOKEN` pelo
  valor de `KIWIFY_WEBHOOK_TOKEN` e `ID_DO_KIT` pelo valor de `KIWIFY_PRODUCT_KIT`):
  ```bash
  BODY='{"order_id":"teste-1","order_status":"paid","webhook_event_type":"order_approved","Product":{"product_id":"ID_DO_KIT"},"Customer":{"full_name":"Ana Teste","email":"ana@teste.com","mobile":"+5511999999999"}}'
  SIG=$(printf '%s' "$BODY" | openssl dgst -sha1 -hmac SEU_TOKEN | awk '{print $2}')
  curl -X POST "http://localhost:3000/api/webhooks/kiwify?signature=$SIG" -H 'Content-Type: application/json' -d "$BODY"
  ```
  Sem a Evolution API configurada, o link de acesso não é enviado por WhatsApp,
  mas dá para reenviar pelo painel admin (botão "Reenviar acesso").

Checagens antes de publicar: `npm run lint && npm run typecheck && npm run build`.

## Configuração externa (passo a passo)

Faça na ordem. Cada item diz quais variáveis preencher (veja `.env.example`).

### 1. Supabase
1. Crie uma conta em https://supabase.com e um projeto (região **South America (São Paulo)**).
2. **SQL Editor → New query**: cole todo o conteúdo de
   `supabase/migrations/20261018000000_init.sql` e clique em **Run**. Isso cria as
   tabelas, as regras de acesso (RLS) e as pastas de arquivos.
3. **Project Settings → API** (ou **API Keys**): copie
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - chave `anon` / publishable → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - chave `service_role` / secret → `SUPABASE_SERVICE_ROLE_KEY` (**secreta**: só nas variáveis da Hostinger)
4. **Authentication → Sign In / Providers → Email**: deixe o Email ligado e
   **desligue "Allow new users to sign up"** (só quem compra ganha conta; o webhook cria o usuário).
5. **Authentication → URL Configuration**:
   - Site URL: `https://SEU-DOMINIO`
   - Redirect URLs: `https://SEU-DOMINIO/**`
6. **Authentication → Email Templates → Magic Link**: troque o link do botão por
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/app
   ```
   e traduza o texto (ex.: assunto "Seu link de acesso ao Kit do Pet").
   Esse formato funciona mesmo se o cliente abrir o e-mail em outro navegador.
7. **Authentication → SMTP Settings**: ative SMTP próprio com o Resend (passo 2),
   senão o Supabase limita a poucos e-mails por hora:
   host `smtp.resend.com`, porta `465`, usuário `resend`, senha = sua API key do Resend,
   remetente igual ao `EMAIL_FROM`.

### 2. Resend (e-mail)
1. Crie a conta em https://resend.com.
2. **Domains → Add Domain**: adicione seu domínio e crie os registros DNS que ele mostrar.
3. **API Keys → Create API Key** → `RESEND_API_KEY`.
4. `EMAIL_FROM`, por exemplo: `Kit do Pet <ola@seudominio.com.br>`.

### 3. Evolution API (WhatsApp)
Use a sua instância já existente:
- `EVOLUTION_API_URL`: endereço base da API (ex.: `https://evolution.seudominio.com`)
- `EVOLUTION_API_KEY`: a API key (global ou da instância)
- `EVOLUTION_INSTANCE`: o nome da instância conectada

O app usa `POST /message/sendText/{instancia}` e `POST /message/sendMedia/{instancia}` (Evolution v2).

### 4. Hostinger (publicar)
Precisa do plano **Business** ou **Cloud** (eles rodam "Node.js web apps").
Na hospedagem Premium/Single não funciona, porque o app precisa de Node.js no servidor.

1. **hPanel → Sites → Adicionar site → Node.js web app → Importar repositório Git**.
   Clique em **Conectar com o GitHub**, autorize o acesso ao repositório `kit-do-pet`
   e escolha o branch `main`.
2. **Domínio**: escolha um subdomínio do seu domínio que já está na Hostinger
   (ex.: `pet.tudoemdia.blog.br`). O blog principal não é afetado. Se o DNS do domínio
   não estiver na Hostinger, crie lá o registro que o hPanel indicar.
3. **Configurações de build** (normalmente detectadas sozinhas):
   - Framework: Next.js · Node.js: 22
   - Comando de build: `npm run build` · Comando de início: `npm start`
4. **Variáveis de ambiente**: cadastre todas as do `.env.example` (dá para importar um
   arquivo `.env`). Alterou alguma depois? Faça um novo deploy para valer.
   - `NEXT_PUBLIC_SITE_URL`: o endereço final (ex.: `https://pet.tudoemdia.blog.br`)
   - `APP_SECRET` e `CRON_SECRET`: textos aleatórios longos (gere com `openssl rand -hex 32`
     ou num gerador de senhas, com 40+ caracteres)
   - `ADMIN_EMAILS`: seu e-mail (é o único que abre `/admin`)
5. **Deploy**. A cada `git push` no `main` a Hostinger publica de novo (se a opção de
   deploy automático estiver ligada no painel do app).
6. **Lembretes diários** (rotina que roda todo dia às 9h de Brasília): já está pronta em
   `.github/workflows/lembretes.yml`, usando o GitHub Actions. No GitHub, abra o repositório
   → **Settings → Secrets and variables → Actions → New repository secret** e crie:
   - `APP_URL` = `https://pet.tudoemdia.blog.br` (sem barra no final)
   - `CRON_SECRET` = o mesmo valor cadastrado na Hostinger

   Para testar na hora: aba **Actions → Lembretes diários → Run workflow**.
   (Alternativa: hPanel → Avançado → Cron Jobs com o comando
   `curl -H "Authorization: Bearer SEU_CRON_SECRET" https://SEU-DOMINIO/api/cron/lembretes`.)
7. Para entrar como admin a primeira vez: no Supabase, **Authentication → Users →
   Add user → Create new user**, com seu e-mail (marque "Auto Confirm User"). Depois
   entre em `/entrar` com esse e-mail e aceite os termos. O menu "Admin" aparece no topo.

### 5. Kiwify
A Kiwify vende e recebe o pagamento; o app entrega o acesso. Configure assim:

1. **Produtos**: crie 5 produtos digitais (pagamento único):
   | Produto | Preço | Variável com o ID |
   |---|---|---|
   | Kit do Pet | R$ 14,90 | `KIWIFY_PRODUCT_KIT` |
   | Lembretes no WhatsApp por 1 ano | R$ 19,90 | `KIWIFY_PRODUCT_REMINDERS` |
   | Mais um pet | R$ 7,00 | `KIWIFY_PRODUCT_EXTRA_PET` |
   | Guia de adestramento básico | R$ 4,90 | `KIWIFY_PRODUCT_GUIDE_TRAINING` |
   | Guia de petiscos caseiros | R$ 4,90 | `KIWIFY_PRODUCT_GUIDE_TREATS` |

   Na entrega de cada produto, escolha **área de membros externa / link externo** e
   coloque `https://SEU-DOMINIO/entrar`. Assim o e-mail da própria Kiwify também leva ao app.
2. **Order bumps**: no checkout do "Kit do Pet", adicione os outros 4 produtos como order bumps.
3. **IDs dos produtos**: o ID aparece no endereço da página do produto no painel da
   Kiwify. Se tiver dúvida, faça o teste do item 5 e veja os IDs em `/admin/webhooks`.
   Uma variável aceita vários IDs separados por vírgula.
4. **Webhook**: em **Apps → Webhooks → Criar webhook**:
   - URL: `https://SEU-DOMINIO/api/webhooks/kiwify`
   - Produtos: os 5 produtos acima
   - Eventos: **compra aprovada**, **reembolso** e **chargeback**
   - Copie o **token** → `KIWIFY_WEBHOOK_TOKEN` (e faça um novo deploy na Hostinger)
5. **Teste do formato** (recomendado antes de vender): o formato dos order bumps no
   webhook não é documentado oficialmente.
   1. Crie um webhook temporário apontando para `https://SEU-DOMINIO/api/webhooks/kiwify/teste`
      (ele só grava o corpo recebido, não libera nada).
   2. Faça uma compra de teste com o kit **e** os order bumps.
   3. Abra `/admin/webhooks`, clique no evento e em **Ver interpretação**. Confira se
      `email`, `providerOrderId`, `type` e todos os `providerProductIds` aparecem certos.
   4. Se algo estiver errado, ajuste os campos em `src/lib/payments/kiwify.ts`
      (ou peça ao Claude Code, colando o corpo do evento). Depois apague o webhook de teste.
   5. Com o webhook real configurado, o mesmo evento pode ser aplicado pelo botão
      **Reprocessar** em `/admin/webhooks`.
6. **Links de checkout**:
   - `NEXT_PUBLIC_CHECKOUT_URL`: checkout do Kit do Pet (botões das páginas de vendas)
   - `NEXT_PUBLIC_EXTRA_PET_CHECKOUT_URL`: checkout avulso do "Mais um pet"
   - `RENEWAL_CHECKOUT_URL`: checkout avulso dos "Lembretes" (enviado 30 dias antes de vencer)

   Compras avulsas desses produtos também chegam pelo webhook e são somadas à conta do
   mesmo e-mail (a renovação soma 12 meses ao vencimento atual).

### 6. Meta Pixel
No Gerenciador de Eventos da Meta, copie o ID do pixel → `NEXT_PUBLIC_META_PIXEL_ID`.
O app envia `PageView` nas páginas de vendas e `InitiateCheckout` ao clicar em comprar
(e repassa os parâmetros `utm_*` para o checkout).

### 7. Últimos ajustes
- **Guias**: envie os PDFs (versões cão e gato) em `/admin/guias`.
- **Depoimentos**: preencha a lista `testimonials` em `src/content/sales.ts`
  (a seção só aparece quando houver depoimentos).
- **Textos legais**: complete o e-mail de contato em `src/app/(site)/privacidade/page.tsx`
  e `src/app/(site)/termos/page.tsx` e revise com um profissional.
- **Suporte** (opcional): `NEXT_PUBLIC_SUPPORT_WHATSAPP`.

## Variáveis de ambiente
Todas estão comentadas em [`.env.example`](.env.example). Obrigatórias para o app
funcionar: as 3 do Supabase, `NEXT_PUBLIC_SITE_URL`, `APP_SECRET`, `ADMIN_EMAILS`,
`KIWIFY_WEBHOOK_TOKEN` + IDs dos produtos e `CRON_SECRET`. Sem Resend ou Evolution o
app funciona, mas não envia e-mails/WhatsApp.

## Endereços do app
| Endereço | O que é |
|---|---|
| `/cao`, `/gato` | páginas de vendas |
| `/entrar` | login por link mágico |
| `/app` | área do cliente |
| `/p/<codigo>` | página pública do pet (QR code) |
| `/admin` | painel do administrador |
| `/api/webhooks/kiwify` | webhook de compras |
| `/api/webhooks/kiwify/teste` | captura o corpo bruto para teste |
| `/api/cron/lembretes` | rotina diária (chamada pelo GitHub Actions) |

## Trocar Kiwify por Cakto
O pagamento é isolado em `src/lib/payments/`. Para a Cakto:
1. Preencha `CAKTO_WEBHOOK_SECRET` e `CAKTO_PRODUCT_*`.
2. Configure o webhook da Cakto para `https://SEU-DOMINIO/api/webhooks/cakto`
   (teste antes com `/api/webhooks/cakto/teste` e ajuste `src/lib/payments/cakto.ts` se preciso).
3. Troque os links de checkout. Nada mais muda.
