import { useState, useEffect } from "react";
import { ArrowLeft, Pencil, Trash2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Setor } from "@/types";
import { db } from "@/lib/db";

export default function SetoresPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<Setor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");

  const load = () => setList(db.list<Setor>("setores"));
  useEffect(() => { load(); }, []);

  const reset = () => { setEditingId(null); setNome(""); };

  const edit = (item: Setor) => { setEditingId(item.id); setNome(item.nome); };

  const save = () => {
    if (!nome.trim()) return;
    if (editingId) {
      db.update<Setor>("setores", editingId, { nome });
    } else {
      db.create<Setor>("setores", { nome });
    }
    reset(); load();
  };

  const remove = (id: string) => {
    if (!confirm("Excluir este setor?")) return;
    db.remove("setores", id);
    if (editingId === id) reset();
    load();
  };

  const inp = "w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[44px]";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin")} className="p-2 rounded-md text-slate-500 hover:bg-slate-200 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Setores</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className={inp} placeholder="Nome do setor" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="bg-amber-600 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-1.5 min-h-[44px]">
              <Save className="h-4 w-4" /> {editingId ? "Atualizar" : "Adicionar"}
            </button>
            {editingId && <button onClick={reset} className="bg-slate-200 text-slate-700 px-3 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-slate-300 min-h-[44px]"><X className="h-4 w-4" /></button>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {list.map((item) => (
          <div key={item.id} className="p-3 sm:p-4 border-b border-slate-100 last:border-0 flex items-center justify-between gap-3">
            <span className="font-medium text-slate-800 truncate">{item.nome}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => edit(item)} className="p-2 rounded-md text-slate-400 hover:text-blue-600 min-w-[36px] min-h-[36px] flex items-center justify-center"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(item.id)} className="p-2 rounded-md text-slate-400 hover:text-red-600 min-w-[36px] min-h-[36px] flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-center text-slate-500 py-8">Nenhum setor cadastrado</p>}
      </div>
    </div>
  );
}
