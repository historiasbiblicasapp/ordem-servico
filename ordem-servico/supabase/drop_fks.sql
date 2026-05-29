-- Remove FK constraints da tabela ordens (o app já valida na interface)
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_equipamento_id_fkey;
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_setor_id_fkey;
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_tem_id_fkey;
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_revisao_id_fkey;
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_criador_id_fkey;
ALTER TABLE IF EXISTS public.ordens DROP CONSTRAINT IF EXISTS ordens_user_id_fkey;
