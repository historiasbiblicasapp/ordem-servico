import { useState, useMemo } from "react";
import { ArrowLeft, CalendarDays, Calendar, Clock, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { OrdemServico, Equipamento } from "@/types";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const VIEWS = [
  { key: "mensal", label: "Mensal", icon: CalendarDays },
  { key: "semanal", label: "Semanal", icon: Calendar },
  { key: "diario", label: "Diário", icon: Clock },
];
type ViewMode = "mensal" | "semanal" | "diario";

function getWeeksInMonth(year: number, month: number): { label: string; days: number[] }[] {
  const weeks: { label: string; days: number[] }[] = [];
  let weekDays: number[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    weekDays.push(d);
    const dow = new Date(year, month - 1, d).getDay();
    if (dow === 6 || d === daysInMonth) {
      weeks.push({ label: `${weekDays[0]}-${weekDays[weekDays.length - 1]}`, days: weekDays });
      weekDays = [];
    }
  }
  return weeks;
}

export default function PreventivasCalendar() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [ano, setAno] = useState(currentYear);
  const [mes, setMes] = useState(currentMonth);
  const [view, setView] = useState<ViewMode>("mensal");

  const years = useMemo(() => {
    const ordens = db.list<OrdemServico>("ordens").filter((o) => o.tipo === "preventiva" && o.data);
    const ySet = new Set<number>();
    ordens.forEach((o) => { const y = parseInt(o.data.split("-")[0], 10); if (!isNaN(y)) ySet.add(y); });
    ySet.add(currentYear);
    return Array.from(ySet).sort((a, b) => b - a);
  }, []);

  const columns = useMemo(() => {
    if (view === "mensal") return MONTHS.map((m, i) => ({ id: String(i), label: m }));
    if (view === "semanal") {
      return getWeeksInMonth(ano, mes).map((w) => ({ id: w.label, label: w.label }));
    }
    const daysInMonth = new Date(ano, mes, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({ id: String(i + 1), label: String(i + 1) }));
  }, [view, ano, mes]);

  const data = useMemo(() => {
    const prefix = String(ano);
    const ordens = db.list<OrdemServico>("ordens").filter((o) => o.tipo === "preventiva" && o.data?.startsWith(prefix));
    const equipamentos = db.list<Equipamento>("equipamentos");

    const equipMap = new Map<string, { equip: Equipamento; cells: { status: "realizado" | "planejado" | ""; dia: string }[] }>();
    for (const eq of equipamentos) {
      equipMap.set(eq.id, { equip: eq, cells: columns.map(() => ({ status: "" as const, dia: "" })) });
    }

    const hoje = new Date();
    const limite = new Date(hoje);
    limite.setDate(hoje.getDate() + 30);

    for (const os of ordens) {
      const eq = equipMap.get(os.equipamentoId);
      if (!eq) continue;
      const [y, m, d] = os.data.split("-").map(Number);

      const getIdx = () => {
        if (view === "mensal") return m - 1;
        if (m !== mes) return -1;
        if (view === "semanal") {
          const weeks = getWeeksInMonth(ano, mes);
          return weeks.findIndex((w) => w.days.includes(d));
        }
        return d - 1;
      };

      const idx = getIdx();
      if (idx < 0 || idx >= columns.length) continue;

      if (os.concluido === true) {
        eq.cells[idx] = { status: "realizado", dia: String(d) };
      } else {
        const osDate = new Date(y, m - 1, d);
        if (osDate > limite) {
          eq.cells[idx] = { status: "planejado", dia: String(d) };
        }
      }
    }

    return Array.from(equipMap.values()).sort((a, b) => a.equip.nome.localeCompare(b.equip.nome));
  }, [ano, mes, view, columns]);

  const exportPdf = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const margin = 10;
    const pageW = 297;
    let y = 20;

    const mesStr = String(mes).padStart(2, "0");
    const diasNoMes = new Date(ano, mes, 0).getDate();
    const colunas = Array.from({ length: diasNoMes }, (_, i) => ({ id: String(i + 1), label: String(i + 1) }));

    const ordens = db.list<OrdemServico>("ordens").filter((o) => o.tipo === "preventiva" && o.data?.startsWith(`${ano}-${mesStr}`));
    const equipamentos = db.list<Equipamento>("equipamentos");
    const equipMap = new Map<string, { equip: Equipamento; cells: { status: "realizado" | "planejado" | ""; dia: string }[] }>();
    for (const eq of equipamentos) {
      equipMap.set(eq.id, { equip: eq, cells: colunas.map(() => ({ status: "" as const, dia: "" })) });
    }
    const hoje = new Date();
    const limite = new Date(hoje);
    limite.setDate(hoje.getDate() + 30);
    for (const os of ordens) {
      const eq = equipMap.get(os.equipamentoId);
      if (!eq) continue;
      const d = parseInt(os.data.split("-")[2], 10);
      const idx = d - 1;
      if (idx < 0 || idx >= colunas.length) continue;
      if (os.concluido === true) {
        eq.cells[idx] = { status: "realizado", dia: String(d) };
      } else {
        const osDate = new Date(ano, mes - 1, d);
        if (osDate > limite) {
          eq.cells[idx] = { status: "planejado", dia: String(d) };
        }
      }
    }
    const pdfData = Array.from(equipMap.values()).sort((a, b) => a.equip.nome.localeCompare(b.equip.nome));

    const viewLabel = `${MONTHS[mes - 1]} de ${ano}`;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Controle de Preventivas - ${viewLabel}`, pageW / 2, y, { align: "center" });
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Período: ${viewLabel}`, pageW / 2, y, { align: "center" });
    y += 10;

    const colW = 7;
    const firstColW = 50;
    const headerH = 8;
    const rowH = 5;
    const tableW = firstColW + colunas.length * colW;
    const startX = (pageW - tableW) / 2;

    doc.setDrawColor(180);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");

    doc.setTextColor(50);
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, y, firstColW, headerH, "F");
    doc.rect(startX, y, tableW, headerH, "D");
    doc.text("Equipamento", startX + 2, y + 5);

    colunas.forEach((col, i) => {
      const cx = startX + firstColW + i * colW;
      doc.setFillColor(240, 240, 240);
      doc.rect(cx, y, colW, headerH, "F");
      doc.rect(cx, y, colW, headerH, "D");
      doc.text(String(col.label), cx + colW / 2, y + 5, { align: "center" });
    });

    y += headerH;
    doc.setFont("helvetica", "normal");

    for (const row of pdfData) {
      if (y > 190) { doc.addPage(); y = 20; }
      doc.setFillColor(255, 255, 255);
      doc.rect(startX, y, firstColW, rowH, "F");
      doc.rect(startX, y, tableW, rowH, "D");
      doc.setTextColor(50);
      doc.setFontSize(5);
      doc.text(row.equip.nome, startX + 1, y + 4);

      row.cells.forEach((cell, i) => {
        const cx = startX + firstColW + i * colW;
        doc.rect(cx, y, colW, rowH, "D");
        if (cell.dia) {
          if (cell.status === "realizado") {
            doc.setFillColor(220, 252, 231);
            doc.setTextColor(21, 128, 61);
          } else {
            doc.setFillColor(254, 243, 199);
            doc.setTextColor(180, 83, 9);
          }
          doc.rect(cx + 0.3, y + 0.3, colW - 0.6, rowH - 0.6, "F");
          doc.setFontSize(4);
          const label = cell.status === "realizado" ? "R" : "P";
          doc.text(label, cx + colW / 2 - 1.5, y + 3.5);
        } else {
          doc.setTextColor(200);
          doc.setFontSize(4);
          doc.text("-", cx + colW / 2 - 1, y + 3.5);
        }
      });
      y += rowH;
    }

    doc.save(`Preventivas_${MONTHS[mes - 1]}_${ano}.pdf`);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin")} className="p-2 rounded-md text-slate-500 hover:bg-slate-200 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Controle de Preventivas</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {VIEWS.map((v) => (
              <button key={v.key} onClick={() => setView(v.key as ViewMode)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === v.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <v.icon className="h-3.5 w-3.5 inline mr-1" />{v.label}
              </button>
            ))}
          </div>
          <select value={ano} onChange={(e) => setAno(parseInt(e.target.value, 10))} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={mes} onChange={(e) => setMes(parseInt(e.target.value, 10))} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <span className="text-xs text-slate-400">Legenda: <span className="inline-block px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold text-xs ml-1">R</span> Realizado <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-xs ml-3">P</span> Programado</span>
          <button onClick={exportPdf} disabled={data.length === 0} className="ml-auto bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
            <Printer className="h-3.5 w-3.5" /> Exportar PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 bg-slate-50 border border-slate-200 font-medium text-slate-700 sticky left-0 bg-slate-50 min-w-[160px]">Equipamento</th>
                {columns.map((col) => (
                  <th key={col.id} className="px-3 py-2 bg-slate-50 border border-slate-200 font-medium text-slate-700 text-center w-12 text-xs">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.equip.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 border border-slate-200 text-slate-700 font-medium sticky left-0 bg-white text-sm">{row.equip.nome}</td>
                  {row.cells.map((cell, idx) => (
                    <td key={idx} className={`px-3 py-2 border border-slate-200 text-center text-xs font-bold ${cell.status === "realizado" ? "bg-green-50 text-green-700" : cell.status === "planejado" ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-300"}`}
                      title={cell.dia ? `${formatDate(`${ano}-${String(view === "mensal" ? idx + 1 : mes).padStart(2, "0")}-${cell.dia}`)} - ${cell.status === "realizado" ? "Realizado" : cell.status === "planejado" ? "Planejado" : ""}` : ""}>
                      {cell.dia ? <>{cell.status === "realizado" ? "R" : "P"}</> : "-"}
                    </td>
                  ))}
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-8 text-slate-400">
                    Nenhuma preventiva encontrada {view === "mensal" ? `para ${ano}` : `em ${MONTHS[mes - 1]} de ${ano}`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
