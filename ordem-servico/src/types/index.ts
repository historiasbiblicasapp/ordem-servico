export interface User {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface Equipamento {
  id: string;
  nome: string;
  descricao: string;
}

export interface Setor {
  id: string;
  nome: string;
}

export interface TEM {
  id: string;
  codigo: string;
  descricao: string;
  createdAt: string;
}

export interface Revisao {
  id: string;
  numero: string;
  descricao: string;
}

export interface AtividadeTemplate {
  id: string;
  nome: string;
  descricao: string;
  itens: AtividadeItem[];
}

export interface AtividadeItem {
  id: string;
  nome: string;
}

export interface OSAtividade {
  templateId: string;
  itens: OSAtividadeItem[];
}

export interface OSAtividadeItem {
  itemId: string;
  concluido: boolean;
}

export interface OrdemServico {
  id: string;
  equipamentoId: string;
  setorId: string;
  data: string;
  atividadeDescricao: string;
  atividades: OSAtividade[];
  inicioManutencao: string;
  segurancaEquipamento: "" | "CONF" | "NAO_CONF";
  conclusaoManutencao: string;
  conclusaoSeguranca: "" | "CONF" | "NAO_CONF";
  substituicaoPecas: "sim" | "nao";
  substituicaoPecasDescricao: string;
  outraManutencao: "sim" | "nao";
  outraManutencaoDescricao: string;
  observacao: string;
  assinaturaResponsavel: string;
  assinatura: string;
  temId: string;
  revisaoId: string;
  criadorId: string;
  aprovador: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  concluido?: boolean;
  tipo?: "preventiva" | "corretiva";
  numero?: string;
}
