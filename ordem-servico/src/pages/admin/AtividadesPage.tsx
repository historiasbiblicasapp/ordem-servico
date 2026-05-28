import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AtividadeTemplate, AtividadeItem } from "@/types";
import { db } from "@/lib/db";

const emptyItem = (): AtividadeItem => ({
  id: "",
  nome: "",
});

export default function AtividadesPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<AtividadeTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [itens, setItens] = useState<AtividadeItem[]>([]);

  const load = () => setList(db.list<AtividadeTemplate>("atividades"));
  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditingId(null);
    setForm({ nome: "", descricao: "" });
    setItens([]);
  };

  const edit = (item: AtividadeTemplate) => {
    setEditingId(item.id);
    setForm({ nome: item.nome, descricao: item.descricao });
    setItens(item.itens);
  };

  const save = () => {
    if (!form.nome.trim()) return;
    const data = { ...form, itens: itens.filter((i) => i.nome.trim()) };
    if (editingId) {
      db.update<AtividadeTemplate>("atividades", editingId, data);
    } else {
      db.create<AtividadeTemplate>("atividades", data);
    }
    reset();
    load();
  };

  const remove = (id: string) => {
    if (!confirm("Excluir esta atividade?")) return;
    db.remove("atividades", id);
    if (editingId === id) reset();
    load();
  };

  const addItem = () => setItens((prev) => [...prev, { ...emptyItem(), id: Date.now().toString(36) }]);
  const updItem = (idx: number, data: Partial<AtividadeItem>) =>
    setItens((prev) => prev.map((i, k) => (k === idx ? { ...i, ...data } : i)));
  const delItem = (idx: number) => setItens((prev) => prev.filter((_, k) => k !== idx));
  const moveItem = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= itens.length) return;
    setItens((prev) => {
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const inp = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin")} className="p-2 rounded-md text-slate-500 hover:bg-slate-200 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Atividades</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">{editingId ? "Editar" : "Nova"} Atividade</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inp} placeholder="Nome da atividade" />
          <input type="text" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className={inp} placeholder="Descrição (opcional)" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-700">Itens</h3>
          <button type="button" onClick={addItem} className="text-sm text-amber-600 hover:text-amber-800 flex items-center gap-1 font-medium">
            <Plus className="h-3.5 w-3.5" /> Adicionar item
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {itens.map((item, idx) => (
            <div key={item.id || idx} className="flex items-center gap-1">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="p-0.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed"><ArrowUp className="h-3 w-3" /></button>
                <button onClick={() => moveItem(idx, 1)} disabled={idx === itens.length - 1} className="p-0.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed"><ArrowDown className="h-3 w-3" /></button>
              </div>
              <input type="text" value={item.nome} onChange={(e) => updItem(idx, { nome: e.target.value })} className={inp} placeholder="Nome do item" />
              <button onClick={() => delItem(idx)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 shrink-0"><X className="h-4 w-4" /></button>
            </div>
          ))}
          {itens.length === 0 && <p className="text-sm text-slate-400 text-center py-2">Nenhum item cadastrado</p>}
        </div>

        <div className="flex gap-2">
          <button onClick={save} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-1.5">
            <Save className="h-4 w-4" /> Salvar
          </button>
          {editingId && (
            <button onClick={reset} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors">
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {list.map((a) => (
          <div key={a.id} className="p-4 border-b border-slate-100 last:border-0 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-slate-800">{a.nome}</h3>
              {a.descricao && <p className="text-sm text-slate-500">{a.descricao}</p>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {a.itens.map((item) => (
                  <span key={item.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    {item.nome}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => edit(a)} className="p-1.5 rounded-md text-slate-400 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(a.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-center text-slate-500 py-8">Nenhuma atividade cadastrada</p>}
      </div>
    </div>
  );
}
