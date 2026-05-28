import { useState, useEffect } from "react";
import { ArrowLeft, Pencil, Trash2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Equipamento } from "@/types";
import { db } from "@/lib/db";

export default function EquipamentosPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<Equipamento[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", descricao: "" });

  const load = () => setList(db.list<Equipamento>("equipamentos"));
  useEffect(() => { load(); }, []);

  const reset = () => { setEditingId(null); setForm({ nome: "", descricao: "" }); };

  const edit = (item: Equipamento) => { setEditingId(item.id); setForm({ nome: item.nome, descricao: item.descricao }); };

  const save = () => {
    if (!form.nome.trim()) return;
    if (editingId) {
      db.update<Equipamento>("equipamentos", editingId, form);
    } else {
      db.create<Equipamento>("equipamentos", form);
    }
    reset(); load();
  };

  const remove = (id: string) => {
    if (!confirm("Excluir este equipamento?")) return;
    db.remove("equipamentos", id);
    if (editingId === id) reset();
    load();
  };

  const inp = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin")} className="p-2 rounded-md text-slate-500 hover:bg-slate-200 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Equipamentos</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
            <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inp} placeholder="Nome do equipamento" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <input type="text" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className={inp} placeholder="Descrição" />
          </div>
          <button onClick={save} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-1.5 h-[38px]">
            <Save className="h-4 w-4" /> {editingId ? "Atualizar" : "Adicionar"}
          </button>
          {editingId && <button onClick={reset} className="bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-300 h-[38px]"><X className="h-4 w-4" /></button>}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {list.map((item) => (
          <div key={item.id} className="p-4 border-b border-slate-100 last:border-0 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-slate-800">{item.nome}</h3>
              {item.descricao && <p className="text-sm text-slate-500">{item.descricao}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => edit(item)} className="p-1.5 rounded-md text-slate-400 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(item.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-center text-slate-500 py-8">Nenhum equipamento cadastrado</p>}
      </div>
    </div>
  );
}
