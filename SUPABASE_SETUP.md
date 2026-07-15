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

Sem essas envs, continua usando `.data/progress` localmente.

Nesta primeira etapa, o progresso inteiro fica em:

```txt
public.player_progress.player
```

As tabelas `player_inventory`, `surprise_exams` e `attempts` ja estao criadas para a proxima etapa, quando a gente separar os dados e migrar auth.
