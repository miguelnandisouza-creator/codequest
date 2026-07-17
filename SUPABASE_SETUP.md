# Supabase setup

## 1. Criar projeto

Crie um projeto no Supabase e copie:

- Project URL
- anon/public key
- service role key

## 2. Configurar env

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` fica somente no servidor. Nao exponha essa chave no navegador.

## 3. Criar tabelas

Abra o SQL editor do Supabase e rode:

```txt
supabase/schema.sql
```

## 4. Como funciona agora

O app usa Supabase quando `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` existem.

Sem essas envs, continua usando `.data` localmente.

As contas ficam em:

```txt
public.codequest_users
public.profiles
```

O progresso inteiro fica em:

```txt
public.player_progress.player
```

Antes de cada mudanca real no progresso, o app salva uma copia em:

```txt
public.progress_snapshots
```

Cada resposta enviada pelo aluno fica em:

```txt
public.attempts
```

Mensagens de recados gerais e chats privados ficam em:

```txt
public.chat_messages
```

Videos enviados no chat ficam no Supabase Storage:

```txt
bucket: chat-videos
path: chat/*
```

Com a `SUPABASE_SERVICE_ROLE_KEY`, o app tenta criar esse bucket publico automaticamente no primeiro upload. Se preferir criar manualmente, crie um bucket publico chamado `chat-videos`.

As tabelas `player_inventory` e `surprise_exams` ja estao criadas para a proxima etapa, quando a gente separar os dados em estruturas menores.

## 5. Deploy na Vercel

Na Vercel, configure as mesmas variaveis do `.env.local` em Project Settings > Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Nunca envie `.env.local` para o GitHub.

## 6. Migrar dados locais

Depois de preencher `.env.local` e rodar o schema no Supabase, execute:

```bash
npm run migrate:supabase
```

Isso envia:

- `.data/users.json` para `public.codequest_users` e `public.profiles`
- `.data/progress/*.json` para `public.player_progress`
