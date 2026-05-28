import { useState, useMemo } from "react";
import { CalendarDays, FileText, Loader2, Printer } from "lucide-react";
import { OrdemServico } from "@/types";
import { db } from "@/lib/db";
import { gerarRelatorioPdf } from "@/lib/pdf";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";

function resolve(collection: string, id: string): string {
  const item = db.get<any>(collection, id);
  return item ? item.nome || item.codigo || item.numero || "-" : "-";
}

const statusLabels: Record<string, string> = {
  todas: "Todas",
  concluidas: "Concluídas",
  nao_concluidas: "Não concluídas",
  nao_vistas: "Não vistas",
};

export default function Reports() {
  const { user, isAdmin } = useAuth();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<"todas" | "concluidas" | "nao_concluidas" | "nao_vistas">("todas");
  const [gerando, setGerando] = useState(false);

  const filtradas = useMemo(() => {
    if (!dataInicio || !dataFim) return [];
    let todas = db.list<OrdemServico>("ordens");
    if (!isAdmin) todas = todas.filter((o) => o.userId === user?.id);
    let resultado = todas.filter((os) => os.data >= dataInicio && os.data <= dataFim);
    if (statusFiltro === "concluidas") resultado = resultado.filter((os) => os.concluido === true);
    else if (statusFiltro === "nao_concluidas") resultado = resultado.filter((os) => os.concluido === false);
    else if (statusFiltro === "nao_vistas") resultado = resultado.filter((os) => os.concluido === undefined);
    resultado.sort((a, b) => a.data.localeCompare(b.data) || a.createdAt.localeCompare(b.createdAt));
    return resultado;
  }, [dataInicio, dataFim, statusFiltro, isAdmin, user?.id]);

  const handleGerarPdf = async () => {
    if (filtradas.length === 0) return;
    setGerando(true);
    await gerarRelatorioPdf(filtradas, dataInicio, dataFim, statusLabels[statusFiltro]);
    setGerando(false);
  };

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FileText className="h-6 w-6 text-blue-600" />
        Relatórios
      </h1>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">Filtrar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className={labelClass}>Data Inicial</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Data Final</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value as typeof statusFiltro)} className={inputClass}>
              <option value="todas">Todas</option>
              <option value="concluidas">Concluídas</option>
              <option value="nao_concluidas">Não concluídas</option>
              <option value="nao_vistas">Não vistas</option>
            </select>
          </div>
        </div>

        {filtradas.length > 0 && (
          <button
            onClick={handleGerarPdf}
            disabled={gerando}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            {gerando ? "Gerando..." : "Gerar Relatório PDF"}
          </button>
        )}
      </div>

      {filtradas.length === 0 && dataInicio && dataFim ? (
        <div className="text-center py-12 text-slate-500">
          <FileText className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>Nenhuma OS encontrada para este filtro.</p>
        </div>
      ) : filtradas.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">{filtradas.length} OS encontrada(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Nº</th>
                  <th className="text-left px-4 py-2 font-medium">Data</th>
                  <th className="text-left px-4 py-2 font-medium">Equipamento</th>
                  <th className="text-left px-4 py-2 font-medium">Setor</th>
                  <th className="text-left px-4 py-2 font-medium">Tipo</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtradas.map((os) => (
                  <tr key={os.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-500 whitespace-nowrap text-xs">{os.numero || "-"}</td>
                    <td className="px-4 py-2 text-slate-700 whitespace-nowrap">{formatDate(os.data)}</td>
                    <td className="px-4 py-2 text-slate-700">{resolve("equipamentos", os.equipamentoId)}</td>
                    <td className="px-4 py-2 text-slate-700">{resolve("setores", os.setorId)}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${os.tipo === "preventiva" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                        {os.tipo === "preventiva" ? "Preventiva" : "OS"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        os.concluido === true ? "bg-green-100 text-green-700" :
                        os.concluido === false ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {os.concluido === true ? "Concluído" : os.concluido === false ? "Não concluído" : "Não visto"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
