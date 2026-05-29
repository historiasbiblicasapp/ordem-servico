-- Tabela de usuários (perfil)
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Equipamentos
CREATE TABLE public.equipamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT ''
);

-- Setores
CREATE TABLE public.setores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL
);

-- TEMs
CREATE TABLE public.tems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Revisoes
CREATE TABLE public.revisoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  descricao TEXT DEFAULT ''
);

-- Atividades (templates)
CREATE TABLE public.atividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  itens JSONB DEFAULT '[]'::jsonb
);

-- Ordens de Serviço
CREATE TABLE public.ordens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipamento_id UUID REFERENCES public.equipamentos(id),
  setor_id UUID REFERENCES public.setores(id),
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
  tem_id UUID REFERENCES public.tems(id),
  revisao_id UUID REFERENCES public.revisoes(id),
  criador_id UUID REFERENCES public.users(id),
  aprovador TEXT DEFAULT 'Leandro',
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  concluido BOOLEAN DEFAULT NULL,
  tipo TEXT DEFAULT 'preventiva' CHECK (tipo IN ('preventiva', 'corretiva')),
  numero TEXT DEFAULT ''
);

-- Desabilitar RLS para todas as tabelas (MVP)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.setores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tems DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens DISABLE ROW LEVEL SECURITY;

-- Seed de usuários
INSERT INTO public.users (nome, email, senha, role) VALUES
  ('Administrador', 'admin@admin.com', encode(sha256('admin123'::bytea), 'hex'), 'admin'),
  ('Leandro', 'leandro@raitz.com', encode(sha256('leandro123'::bytea), 'hex'), 'user'),
  ('Carlos', 'carlos@raitz.com', encode(sha256('carlos123'::bytea), 'hex'), 'user'),
  ('Marcos', 'marcos@raitz.com', encode(sha256('marcos123'::bytea), 'hex'), 'user'),
  ('Diego', 'diego@raitz.com', encode(sha256('diego123'::bytea), 'hex'), 'user');
