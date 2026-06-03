CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.equipamentos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.setores (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tems (
  id TEXT PRIMARY KEY,
  codigo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.revisoes (
  id TEXT PRIMARY KEY,
  numero TEXT NOT NULL,
  descricao TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.atividades (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  itens JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.ordens (
  id TEXT PRIMARY KEY,
  equipamento_id TEXT,
  setor_id TEXT,
  data TEXT NOT NULL,
  atividade_descricao TEXT DEFAULT '',
  atividades JSONB DEFAULT '[]'::jsonb,
  inicio_manutencao TEXT DEFAULT '',
  seguranca_equipamento TEXT DEFAULT '',
  conclusao_manutencao TEXT DEFAULT '',
  conclusao_seguranca TEXT DEFAULT '',
  substituicao_pecas TEXT DEFAULT 'nao',
  substituicao_pecas_descricao TEXT DEFAULT '',
  outra_manutencao TEXT DEFAULT 'nao',
  outra_manutencao_descricao TEXT DEFAULT '',
  observacao TEXT DEFAULT '',
  assinatura_responsavel TEXT DEFAULT '',
  assinatura TEXT DEFAULT '',
  tem_id TEXT,
  revisao_id TEXT,
  criador_id TEXT,
  aprovador TEXT DEFAULT 'Leandro',
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  concluido BOOLEAN DEFAULT NULL,
  tipo TEXT DEFAULT 'preventiva' CHECK (tipo IN ('preventiva', 'corretiva')),
  numero TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.config (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.equipamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.setores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tems DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.revisoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.atividades DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ordens DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.config DISABLE ROW LEVEL SECURITY;
