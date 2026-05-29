import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { OrdemServico, AtividadeTemplate, Equipamento, Setor, TEM, Revisao } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import SignaturePad from "@/components/SignaturePad";

interface OSAtividadeItem {
  itemId: string;
  concluido: boolean;
}

interface OSAtividade {
  templateId: string;
  itens: OSAtividadeItem[];
}

type Seguranca = "" | "CONF" | "NAO_CONF";

const initialState = {
  equipamentoId: "",
  setorId: "",
  data: new Date().toISOString().split("T")[0],
  atividadeDescricao: "",
  atividades: [] as OSAtividade[],
  inicioManutencao: "",
  segurancaEquipamento: "CONF" as Seguranca,
  conclusaoManutencao: "",
  conclusaoSeguranca: "CONF" as Seguranca,
  substituicaoPecas: "nao" as "sim" | "nao",
  substituicaoPecasDescricao: "",
  outraManutencao: "nao" as "sim" | "nao",
  outraManutencaoDescricao: "",
  observacao: "",
  assinaturaResponsavel: "",
  assinatura: "",
  temId: "",
  revisaoId: "",
  criadorId: "",
  aprovador: "Leandro",
};

export default function OSForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const isEditing = !!id;
  const isCorretiva = location.pathname === "/nova-corretiva";

  const [form, setForm] = useState(initialState);
  const [originalTipo, setOriginalTipo] = useState<"preventiva" | "corretiva" | undefined>(undefined);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [tems, setTems] = useState<TEM[]>([]);
  const [revisoes, setRevisoes] = useState<Revisao[]>([]);
  const [templates, setTemplates] = useState<AtividadeTemplate[]>([]);

  useEffect(() => {
    const eqs = db.list<Equipamento>("equipamentos");
    const sets = db.list<Setor>("setores");
    const t = db.list<TEM>("tems");
    const r = db.list<Revisao>("revisoes");
    const tmpls = db.list<AtividadeTemplate>("atividades");
    setEquipamentos(eqs);
    setSetores(sets);
    setTems(t);
    setRevisoes(r);
    setTemplates(tmpls);

    if (!id) {
      if (t.length > 0) setForm((prev) => ({ ...prev, temId: t[0].id }));
      if (r.length > 0) setForm((prev) => ({ ...prev, revisaoId: r[0].id }));
      const manutencao = sets.find((s) => s.nome.toLowerCase() === "manutenção");
      if (manutencao) setForm((prev) => ({ ...prev, setorId: manutencao.id }));
    }
  }, []);

  useEffect(() => {
    if (id) {
      const os = db.get<OrdemServico>("ordens", id);
      if (os) {
        setOriginalTipo(os.tipo);
        setForm({
          equipamentoId: os.equipamentoId,
          setorId: os.setorId,
          data: os.data,
          atividadeDescricao: os.atividadeDescricao,
          atividades: os.atividades,
          inicioManutencao: os.inicioManutencao,
          segurancaEquipamento: os.segurancaEquipamento,
          conclusaoManutencao: os.conclusaoManutencao || "",
          conclusaoSeguranca: os.conclusaoSeguranca || "",
          substituicaoPecas: os.substituicaoPecas,
          substituicaoPecasDescricao: os.substituicaoPecasDescricao,
          outraManutencao: os.outraManutencao,
          outraManutencaoDescricao: os.outraManutencaoDescricao,
          observacao: os.observacao,
          assinaturaResponsavel: os.assinaturaResponsavel,
          assinatura: os.assinatura,
          temId: os.temId,
          revisaoId: os.revisaoId,
          criadorId: os.criadorId,
          aprovador: os.aprovador,
        });
      }
    } else if (user) {
      setForm((prev) => ({ ...prev, criadorId: user.id }));
    }
  }, [id, user]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addAtividadeTemplate = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) return;
    const already = form.atividades.find((a) => a.templateId === templateId);
    if (already) return;

    setForm((prev) => ({
      ...prev,
      atividades: [
        ...prev.atividades,
        {
          templateId,
          itens: tmpl.itens.map((item) => ({ itemId: item.id, concluido: true })),
        },
      ],
    }));
  };

  const removeAtividade = (templateId: string) =>
    setForm((prev) => ({
      ...prev,
      atividades: prev.atividades.filter((a) => a.templateId !== templateId),
    }));

  const setItemStatus = (templateId: string, itemId: string, concluido: boolean) =>
    setForm((prev) => ({
      ...prev,
      atividades: prev.atividades.map((a) =>
        a.templateId === templateId
          ? { ...a, itens: a.itens.map((i) => (i.itemId === itemId ? { ...i, concluido } : i)) }
          : a
      ),
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.equipamentoId || !form.setorId) return;

    const now = new Date().toISOString();
    const tipo = isEditing && originalTipo ? originalTipo : (isCorretiva ? "corretiva" : "preventiva") as "preventiva" | "corretiva";
    const base: Partial<OrdemServico> = { ...form, tipo };
    if (tipo === "corretiva") base.atividades = [];

    if (isEditing && id) {
      db.update<OrdemServico>("ordens", id, base);
    } else {
      const ano = new Date().getFullYear();
      const todas = db.list<OrdemServico>("ordens").filter((o) => o.tipo === tipo && o.numero?.endsWith(`/${ano}`));
      const maxNum = todas.reduce((max, o) => {
        const n = parseInt(o.numero!.split("/")[0], 10);
        return n > max ? n : max;
      }, 0);
      base.numero = `${maxNum + 1}/${ano}`;
      db.create<OrdemServico>("ordens", { ...base as OrdemServico, userId: user?.id || "", createdAt: now, updatedAt: now });
    }
    navigate("/");
  };

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";
  const selectClass = inputClass;

  const availableTemplates = templates.filter(
    (t) => !form.atividades.find((a) => a.templateId === t.id)
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <button onClick={() => navigate("/")} className="p-2 rounded-md text-slate-500 hover:bg-slate-200 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg sm:text-2xl font-bold text-slate-800">
          {isEditing ? "Editar OS" : isCorretiva ? "Nova OS" : "Nova Preventiva"}
          {isEditing && id && db.get<OrdemServico>("ordens", id)?.numero && <span className="ml-2 text-sm sm:text-base font-normal text-slate-400">#{db.get<OrdemServico>("ordens", id)?.numero}</span>}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Dados da OS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Equipamento *</label>
              <select
                value={form.equipamentoId}
                onChange={(e) => {
                  const eqId = e.target.value;
                  set("equipamentoId", eqId);
                  if (isCorretiva) return;
                  const eq = equipamentos.find((eq) => eq.id === eqId);
                  if (eq) {
                    const eqNome = eq.nome.toLowerCase();
                    const tmpl = templates
                      .filter((t) => eqNome.startsWith(t.nome.toLowerCase()))
                      .sort((a, b) => b.nome.length - a.nome.length)[0];
                    if (tmpl && !form.atividades.find((a) => a.templateId === tmpl.id)) {
                      setForm((prev) => ({
                        ...prev,
                        equipamentoId: eqId,
                        atividades: [
                          ...prev.atividades,
                          {
                            templateId: tmpl.id,
                            itens: tmpl.itens.map((item) => ({ itemId: item.id, concluido: true })),
                          },
                        ],
                      }));
                      return;
                    }
                  }
                }}
                className={selectClass}
                required
              >
                <option value="">Selecione...</option>
                {equipamentos.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Setor *</label>
              <select value={form.setorId} onChange={(e) => set("setorId", e.target.value)} className={selectClass} required>
                <option value="">Selecione...</option>
                {setores.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Data</label>
              <input type="date" value={form.data} onChange={(e) => set("data", e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Atividade a realizar</label>
            <textarea
              value={form.atividadeDescricao}
              onChange={(e) => set("atividadeDescricao", e.target.value)}
              className={"w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"}
              placeholder="Descreva a atividade a ser realizada..."
            />
          </div>
        </div>

        {!isCorretiva && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold text-slate-800">Atividades</h2>
            {availableTemplates.length > 0 && (
              <select
                value=""
                onChange={(e) => { if (e.target.value) addAtividadeTemplate(e.target.value); }}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2.5 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-[36px]"
              >
                <option value="">Adicionar atividade...</option>
                {availableTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            )}
          </div>

          {form.atividades.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">Nenhuma atividade selecionada.</p>
          )}

          <div className="space-y-4">
            {form.atividades.map((osAtv) => {
              const tmpl = templates.find((t) => t.id === osAtv.templateId);
              if (!tmpl) return null;
              return (
                <div key={osAtv.templateId} className="border border-slate-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 text-sm">{tmpl.nome}</h3>
                    <button type="button" onClick={() => removeAtividade(osAtv.templateId)} className="p-2 rounded-md text-slate-400 hover:text-red-600 min-w-[36px] min-h-[36px] flex items-center justify-center">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {tmpl.descricao && <p className="text-xs text-slate-500 mb-3">{tmpl.descricao}</p>}
                  <div className="space-y-2">
                    {osAtv.itens.map((osItem) => {
                      const itemDef = tmpl.itens.find((i) => i.id === osItem.itemId);
                      const nome = itemDef?.nome || `Item ${osItem.itemId.slice(0, 6)}`;
                      const isOk = osItem.concluido === true;
                      return (
                        <div key={osItem.itemId} className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-700 flex-1">{nome}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setItemStatus(osAtv.templateId, osItem.itemId, true)}
                              className={`px-4 sm:px-3 py-2 sm:py-1.5 rounded text-xs font-semibold transition-colors min-w-[56px] sm:min-w-[50px] text-center min-h-[36px] flex items-center justify-center ${
                                isOk ? "bg-green-100 text-green-800 ring-1 ring-green-400" : "bg-slate-50 text-slate-400 hover:bg-green-50"
                              }`}
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemStatus(osAtv.templateId, osItem.itemId, false)}
                              className={`px-4 sm:px-3 py-2 sm:py-1.5 rounded text-xs font-semibold transition-colors min-w-[56px] sm:min-w-[50px] text-center min-h-[36px] flex items-center justify-center ${
                                !isOk ? "bg-red-100 text-red-800 ring-1 ring-red-400" : "bg-slate-50 text-slate-400 hover:bg-red-50"
                              }`}
                            >
                              NÃO OK
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Manutenção</h2>

          <h3 className="text-sm font-medium text-slate-700 mb-3">Início da Manutenção</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={labelClass}>Data / Hora</label>
              <input type="datetime-local" value={form.inicioManutencao} onChange={(e) => set("inicioManutencao", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Condição de Segurança do Equipamento</label>
              <div className="flex gap-3 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer min-h-[36px]">
                  <input type="radio" name="seguranca" checked={form.segurancaEquipamento === "CONF"} onChange={() => set("segurancaEquipamento", "CONF")} className="h-5 w-5 sm:h-4 sm:w-4 text-green-600 focus:ring-green-500" />
                  <span className="text-sm font-medium text-green-700">CONF.</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer min-h-[36px]">
                  <input type="radio" name="seguranca" checked={form.segurancaEquipamento === "NAO_CONF"} onChange={() => set("segurancaEquipamento", "NAO_CONF")} className="h-5 w-5 sm:h-4 sm:w-4 text-red-600 focus:ring-red-500" />
                  <span className="text-sm font-medium text-red-700">NÃO CONF.</span>
                </label>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 mb-4" />

          <h3 className="text-sm font-medium text-slate-700 mb-3">Conclusão da Manutenção</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Data / Hora</label>
              <input type="datetime-local" value={form.conclusaoManutencao} onChange={(e) => set("conclusaoManutencao", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Condição de Segurança do Equipamento</label>
              <div className="flex gap-3 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer min-h-[36px]">
                  <input type="radio" name="conclusaoSeguranca" checked={form.conclusaoSeguranca === "CONF"} onChange={() => set("conclusaoSeguranca", "CONF")} className="h-5 w-5 sm:h-4 sm:w-4 text-green-600 focus:ring-green-500" />
                  <span className="text-sm font-medium text-green-700">CONF.</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer min-h-[36px]">
                  <input type="radio" name="conclusaoSeguranca" checked={form.conclusaoSeguranca === "NAO_CONF"} onChange={() => set("conclusaoSeguranca", "NAO_CONF")} className="h-5 w-5 sm:h-4 sm:w-4 text-red-600 focus:ring-red-500" />
                  <span className="text-sm font-medium text-red-700">NÃO CONF.</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Substituição / Manutenção de Peças</h2>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-1.5 cursor-pointer min-h-[36px]">
              <input type="radio" name="substituicao" checked={form.substituicaoPecas === "sim"} onChange={() => set("substituicaoPecas", "sim")} className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium">Sim</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer min-h-[36px]">
              <input type="radio" name="substituicao" checked={form.substituicaoPecas === "nao"} onChange={() => set("substituicaoPecas", "nao")} className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium">Não</span>
            </label>
          </div>
          {form.substituicaoPecas === "sim" && (
            <textarea value={form.substituicaoPecasDescricao} onChange={(e) => set("substituicaoPecasDescricao", e.target.value)} className={"w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px]"} placeholder="Descreva as peças substituídas..." />
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Outra Manutenção Realizada?</h2>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-1.5 cursor-pointer min-h-[36px]">
              <input type="radio" name="outra" checked={form.outraManutencao === "sim"} onChange={() => set("outraManutencao", "sim")} className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium">Sim</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer min-h-[36px]">
              <input type="radio" name="outra" checked={form.outraManutencao === "nao"} onChange={() => set("outraManutencao", "nao")} className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium">Não</span>
            </label>
          </div>
          {form.outraManutencao === "sim" && (
            <textarea value={form.outraManutencaoDescricao} onChange={(e) => set("outraManutencaoDescricao", e.target.value)} className={"w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px]"} placeholder="Descreva a outra manutenção..." />
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Observação</h2>
          <textarea value={form.observacao} onChange={(e) => set("observacao", e.target.value)} className={"w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"} placeholder="Observações adicionais..." />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Assinaturas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SignaturePad label="Assinatura do Responsável" value={form.assinaturaResponsavel} onChange={(v) => set("assinaturaResponsavel", v)} />
            <SignaturePad label="Assinatura" value={form.assinatura} onChange={(v) => set("assinatura", v)} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Rodapé</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Código TEM</label>
              <select value={form.temId} onChange={(e) => set("temId", e.target.value)} className={selectClass}>
                <option value="">Selecione...</option>
                {tems.map((t) => (
                  <option key={t.id} value={t.id}>{t.codigo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Revisão</label>
              <input type="text" value={revisoes.find((r) => r.id === form.revisaoId) ? `Revisão ${revisoes.find((r) => r.id === form.revisaoId)!.numero}` : ""} className={inputClass + " bg-slate-50 text-slate-500"} disabled />
            </div>
            <div>
              <label className={labelClass}>Data (TEM)</label>
              <input type="date" value={tems.find((t) => t.id === form.temId)?.createdAt?.split("T")[0] || ""} className={inputClass + " bg-slate-50 text-slate-500"} disabled />
            </div>
            <div>
              <label className={labelClass}>Criador</label>
              <input type="text" value={user?.nome || ""} className={inputClass + " bg-slate-50 text-slate-500"} disabled />
            </div>
            <div>
              <label className={labelClass}>Aprovador</label>
              <input type="text" value={form.aprovador} onChange={(e) => set("aprovador", e.target.value)} className={inputClass} placeholder="Nome do aprovador" />
            </div>
            <div>
              <label className={labelClass}>Setor</label>
              <select value={form.setorId} onChange={(e) => set("setorId", e.target.value)} className={selectClass}>
                <option value="">Selecione...</option>
                {setores.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 sm:py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 min-h-[48px] sm:min-h-[44px]">
            <Save className="h-4 w-4" />
            {isEditing ? "Atualizar OS" : "Salvar OS"}
          </button>
        </div>
      </form>
    </div>
  );
}
