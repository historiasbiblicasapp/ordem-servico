import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, Printer, Pencil, Trash2, Search, CheckCircle2, Circle } from "lucide-react";
import { OrdemServico } from "@/types";
import { db } from "@/lib/db";
import { exportToPdf } from "@/lib/pdf";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";

function resolve(collection: string, id: string): string {
  const item = db.get<any>(collection, id);
  return item ? item.nome || item.codigo || item.numero || "-" : "-";
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [list, setList] = useState<OrdemServico[]>([]);
  const [search, setSearch] = useState("");

  const load = () => {
    const todas = db.list<OrdemServico>("ordens");
    setList(isAdmin ? todas : todas.filter((o) => o.userId === user?.id));
  };

  useEffect(() => { load(); }, [isAdmin, user?.id]);

  const filtered = list.filter((os) => {
    const q = search.toLowerCase();
    const equip = resolve("equipamentos", os.equipamentoId).toLowerCase();
    const setor = resolve("setores", os.setorId).toLowerCase();
    return equip.includes(q) || setor.includes(q);
  });

  const handleDelete = (id: string) => {
    if (!confirm("Excluir esta OS?")) return;
    db.remove("ordens", id);
    load();
  };

  const toggleConcluido = (os: OrdemServico) => {
    db.update<OrdemServico>("ordens", os.id, { concluido: !os.concluido });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Ordens de Serviço</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-400"></span> Não concluído</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-amber-400"></span> Não visto</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-green-400"></span> Concluído</span>
          </div>
          <Link
            to="/nova"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Nova OS
          </Link>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por equipamento ou setor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium">Nenhuma OS encontrada</p>
          <p className="text-sm mt-1">
            {search ? "Tente outros termos de busca" : "Crie sua primeira ordem de serviço"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((os) => (
            <div key={os.id} className={`bg-white rounded-lg border shadow-sm p-4 transition-colors ${os.concluido === true ? "border-green-300 bg-green-50/30" : os.concluido === false ? "border-red-300 bg-red-50/30" : "border-amber-300 bg-amber-50/30"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-800 truncate">
                    {resolve("equipamentos", os.equipamentoId)}
                    <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${os.tipo === "preventiva" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                      {os.tipo === "preventiva" ? "Preventiva" : "OS"}{os.numero && <span className="ml-1 font-normal">#{os.numero}</span>}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                    <span>Setor: {resolve("setores", os.setorId)}</span>
                    <span>Data: {formatDate(os.data)}</span>
                    <span className={`inline-flex items-center gap-1 ${os.segurancaEquipamento === "CONF" ? "text-green-600" : os.segurancaEquipamento === "NAO_CONF" ? "text-red-600" : "text-slate-400"}`}>
                      Seg.: {os.segurancaEquipamento === "CONF" ? "CONF." : os.segurancaEquipamento === "NAO_CONF" ? "NÃO CONF." : "-"}
                    </span>
                    <span>{os.atividades.length} atividade(s)</span>
                  </div>
                  {os.observacao && (
                    <p className="text-sm text-slate-500 mt-1 truncate">Obs: {os.observacao}</p>
                  )}
                  <div className="text-xs text-slate-400 mt-2">
                    TEM: {resolve("tems", os.temId)} | Rev: {resolve("revisoes", os.revisaoId)} | Criador: {db.get<any>("users", os.criadorId)?.nome || "-"} | Aprovador: {os.aprovador || "-"}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleConcluido(os)} className={`p-2 rounded-md transition-colors ${os.concluido === true ? "text-green-600 hover:bg-green-50" : os.concluido === false ? "text-red-500 hover:bg-red-50" : "text-amber-500 hover:bg-amber-50"}`} title={os.concluido === true ? "Concluído" : os.concluido === false ? "Não concluído" : "Não visto"}>
                    {os.concluido === true ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </button>
                  <button onClick={() => exportToPdf(os)} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Exportar PDF">
                    <Printer className="h-4 w-4" />
                  </button>
                  <Link to={`/editar/${os.id}`} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors" title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button onClick={() => handleDelete(os.id)} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-red-600 transition-colors" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
