import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Shield, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";
import { db } from "@/lib/db";

export default function UsuariosPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", role: "user" as "admin" | "user" });

  const load = () => setList(db.list<User>("users"));
  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditingId(null);
    setForm({ nome: "", email: "", senha: "", role: "user" });
  };

  const edit = (item: User) => {
    setEditingId(item.id);
    setForm({ nome: item.nome, email: item.email, senha: "", role: item.role });
  };

  const save = () => {
    if (!form.nome.trim() || !form.email.trim()) return;
    if (editingId) {
      const data: Partial<User> = { nome: form.nome, email: form.email, role: form.role };
      if (form.senha) data.senha = btoa(form.senha);
      db.update<User>("users", editingId, data);
    } else {
      if (!form.senha) return;
      db.create<User>("users", { nome: form.nome, email: form.email, senha: btoa(form.senha), role: form.role, createdAt: new Date().toISOString() } as any);
    }
    reset();
    load();
  };

  const remove = (id: string) => {
    const item = list.find((u) => u.id === id);
    if (item?.role === "admin") { alert("Não é possível excluir um admin"); return; }
    if (!confirm("Excluir este usuário?")) return;
    db.remove("users", id);
    load();
  };

  const inp = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin")} className="p-2 rounded-md text-slate-500 hover:bg-slate-200 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Usuários</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">{editingId ? "Editar" : "Novo"} Usuário</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inp} placeholder="Nome" />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} placeholder="E-mail" />
          <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} className={inp} placeholder={editingId ? "Nova senha (opcional)" : "Senha"} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "user" })} className={inp}>
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>
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

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">E-mail</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">{u.nome}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                    {u.role === "admin" ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                    {u.role === "admin" ? "Admin" : "Usuário"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => edit(u)} className="p-1.5 rounded-md text-slate-400 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(u.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="text-center text-slate-500 py-8">Nenhum usuário cadastrado</p>}
      </div>
    </div>
  );
}
