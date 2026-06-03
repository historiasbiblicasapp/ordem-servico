-- 1. Remove FK constraints da tabela ordens
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_equipamento_id_fkey;
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_setor_id_fkey;
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_tem_id_fkey;
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_revisao_id_fkey;
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_criador_id_fkey;
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_user_id_fkey;

-- 2. Remove CHECK constraint antiga e adiciona suporte a 'super_admin'
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE IF EXISTS public.users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'admin', 'user'));

-- 3. Cria tabela de config se não existir
CREATE TABLE IF NOT EXISTS public.config (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
ALTER TABLE IF EXISTS public.config DISABLE ROW LEVEL SECURITY;
